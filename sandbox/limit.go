package main

import (
	"fmt"
	"syscall"

	seccomp "github.com/seccomp/libseccomp-golang"
)

// SetLimits applies CPU and memory resource limits to the current process.
func SetLimits() error {
	// CPU limit (seconds)
	rlimCPU := &syscall.Rlimit{Cur: sandboxCPUTimeLimit, Max: sandboxCPUTimeLimit}
	if err := syscall.Setrlimit(syscall.RLIMIT_CPU, rlimCPU); err != nil {
		return fmt.Errorf("failed to set RLIMIT_CPU: %w", err)
	}

	// Memory limit (bytes)
	rlimMem := &syscall.Rlimit{Cur: sandboxMemoryLimit, Max: sandboxMemoryLimit}
	if err := syscall.Setrlimit(syscall.RLIMIT_AS, rlimMem); err != nil {
		return fmt.Errorf("failed to set RLIMIT_AS: %w", err)
	}

	return nil
}

// SetupSeccomp configures a seccomp filter that default-denies all syscalls
// and then whitelists only the minimal set needed for Go's runtime, process
// creation, and controlled file I/O within the sandbox.
func SetupSeccomp() error {
	// Default-deny: any non-whitelisted syscall returns EPERM
	filter, err := seccomp.NewFilter(seccomp.ActErrno.SetReturnCode(int16(syscall.EPERM)))
	if err != nil {
		return fmt.Errorf("seccomp.NewFilter: %w", err)
	}

	// Unified whitelist of syscalls to allow
	allowList := []string{
		// Basic I/O and process control
		"read", "write", "exit", "exit_group",
		// Signals
		"rt_sigreturn", "rt_sigaction", "sigaction", "rt_sigprocmask", "sigaltstack",
		// Memory and timing
		"futex", "nanosleep", "clock_gettime",
		"mmap", "munmap", "mprotect", "brk", "arch_prctl",
		// File descriptor operations
		"close", "fstat", "lseek",
		// Process info and limits
		"getpid", "gettid", "prlimit64",
		// Polling and events
		"epoll_create1", "epoll_ctl", "epoll_pwait", "eventfd2", "eventfd",
		// Process spawning and reaping
		"clone", "clone3", "execve", "execveat", "wait4", "waitid",
		// fcntl and pipes for os/exec
		"fcntl", "pipe", "pipe2", "dup", "dup2", "dup3",
		// stats and lookup variants
		"openat2", "statx", "fstatx", "fstatat", "fstatat64",
		// Networking for HTTP server
		"socket", "bind", "listen", "accept", "accept4", "connect",
		"getsockopt", "setsockopt", "getsockname", "getpeername",
	}
	for _, name := range allowList {
		if sc, e := seccomp.GetSyscallFromName(name); e == nil {
			if err = filter.AddRule(sc, seccomp.ActAllow); err != nil {
				return fmt.Errorf("allow syscall %s: %w", name, err)
			}
		}
	}

	// Controlled file I/O: allow only safe open flags (mask-based)
	const mask = syscall.O_ACCMODE | syscall.O_CREAT
	allowedFlags := []uint64{
		syscall.O_RDONLY,
		syscall.O_WRONLY,
		syscall.O_RDWR,
		syscall.O_CREAT | syscall.O_WRONLY,
	}
	for _, name := range []string{"open", "openat"} {
		sc, e := seccomp.GetSyscallFromName(name)
		if e != nil {
			continue
		}
		for _, want := range allowedFlags {
			cond := seccomp.ScmpCondition{
				Argument: 1,
				Op:       seccomp.CompareMaskedEqual,
				Operand1: want,
				Operand2: mask,
			}
			if err = filter.AddRuleConditional(sc, seccomp.ActAllow, []seccomp.ScmpCondition{cond}); err != nil {
				return fmt.Errorf("allow %s flags %#x: %w", name, want, err)
			}
		}
	}

	// 8) Load the filter into the kernel
	if err = filter.Load(); err != nil {
		return fmt.Errorf("seccomp.Load: %w", err)
	}
	return nil
}
