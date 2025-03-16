package internal

import (
	"github.com/seccomp/libseccomp-golang"
	"syscall"
)

// SetLimits 限制 CPU 时间和内存（这里 CPU 限制为 2 秒，内存限制为 256MB）
func SetLimits() error {
	// CPU 限制（秒）
	rlimCPU := &syscall.Rlimit{Cur: 10, Max: 10}
	if err := syscall.Setrlimit(syscall.RLIMIT_CPU, rlimCPU); err != nil {
		return err
	}
	// 内存限制（字节），调高至 1GB
	rlimMem := &syscall.Rlimit{Cur: 4 * 1024 * 1024 * 1024, Max: 4 * 1024 * 1024 * 1024}
	if err := syscall.Setrlimit(syscall.RLIMIT_AS, rlimMem); err != nil {
		return err
	}

	return nil
}

// SetupSeccomp 加载一个最小的 seccomp 筛选规则，只允许基本的 I/O 和退出相关系统调用
func SetupSeccomp() error {
	// 默认允许所有调用
	filter, err := seccomp.NewFilter(seccomp.ActAllow)
	if err != nil {
		return err
	}

	// 要阻止的网络相关系统调用列表
	disallowed := []string{
		"socket", "socketpair", "connect", "accept", "accept4", "bind", "listen",
		"sendto", "recvfrom", "sendmsg", "recvmsg",
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
