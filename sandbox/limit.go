package main

import (
	"github.com/seccomp/libseccomp-golang"
	"syscall"
)

func SetLimits() error {
	// CPU 限制（秒）
	rlimCPU := &syscall.Rlimit{Cur: sandboxCPUTimeLimit, Max: sandboxCPUTimeLimit}
	if err := syscall.Setrlimit(syscall.RLIMIT_CPU, rlimCPU); err != nil {
		return err
	}
	// 内存限制（字节），调高至 1GB
	rlimMem := &syscall.Rlimit{Cur: sandboxMemoryLimit, Max: sandboxMemoryLimit}
	if err := syscall.Setrlimit(syscall.RLIMIT_AS, rlimMem); err != nil {
		return err
	}

	return nil
}

// SetupSeccomp loads a minimal seccomp filter that only allows basic I/O and exit-related syscalls
func SetupSeccomp() error {
	// allow all system calls by default
	filter, err := seccomp.NewFilter(seccomp.ActAllow)
	if err != nil {
		return err
	}

	// the list of syscalls to deny
	disallowed := []string{
		// should allow them in order to run and access http server on localhost in the sandbox
		// "socket", "bind", "listen", "accept", "accept4", "connect",
		// should disallow them in order to prevent network access
		"socketpair", "sendto", "recvfrom", "sendmsg", "recvmsg",
		"unlink", "unlinkat", // File removal syscalls
		"rename", // File renaming syscall
	}

	for _, call := range disallowed {
		var sc seccomp.ScmpSyscall
		sc, err = seccomp.GetSyscallFromName(call)
		if err != nil {
			continue
		}
		if err = filter.AddRule(sc, seccomp.ActErrno.SetReturnCode(int16(syscall.EPERM))); err != nil {
			// 如果提示“requested action matches default action”，可忽略
			if err.Error() == "requested action matches default action of filter" {
				continue
			}
			return err
		}
	}

	return filter.Load()
}
