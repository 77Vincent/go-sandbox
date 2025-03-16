// 文件 sandbox-runner/main.go
package main

import (
	"log"
	"os"
	"os/exec"
	"syscall"
	"time"

	"github.com/seccomp/libseccomp-golang"
)

// setLimits 限制 CPU 时间和内存（这里 CPU 限制为 2 秒，内存限制为 256MB）
func setLimits() error {
	// CPU 限制（秒）
	rlimCPU := &syscall.Rlimit{Cur: 2, Max: 2}
	if err := syscall.Setrlimit(syscall.RLIMIT_CPU, rlimCPU); err != nil {
		return err
	}
	// 内存限制（字节），调高至 256MB
	rlimMem := &syscall.Rlimit{Cur: 256 * 1024 * 1024, Max: 256 * 1024 * 1024}
	if err := syscall.Setrlimit(syscall.RLIMIT_AS, rlimMem); err != nil {
		return err
	}
	return nil
}

// setupSeccomp 加载一个最小的 seccomp 筛选规则，只允许基本的 I/O 和退出相关系统调用
func setupSeccomp() error {
	// 默认拒绝所有调用，返回 EPERM
	filter, err := seccomp.NewFilter(seccomp.ActErrno.SetReturnCode(int16(syscall.EPERM)))
	if err != nil {
		return err
	}
	// 允许以下系统调用
	allowed := []string{
		"read", "write", "exit", "exit_group", "rt_sigreturn",
		// 根据需要添加其它允许的系统调用
	}
	for _, call := range allowed {
		sc, err := seccomp.GetSyscallFromName(call)
		if err != nil {
			return err
		}
		if err := filter.AddRule(sc, seccomp.ActAllow); err != nil {
			return err
		}
	}
	return filter.Load()
}

func main() {
	if len(os.Args) < 2 {
		log.Fatalf("Usage: %s <code-file>", os.Args[0])
	}
	codeFile := os.Args[1]

	// 先设置 seccomp 筛选规则（必须在设置内存限制之前完成）
	//if err := setupSeccomp(); err != nil {
	//	log.Fatalf("Failed to setup seccomp: %v", err)
	//}
	//
	//// 然后设置资源限制（CPU 和内存）
	//if err := setLimits(); err != nil {
	//	log.Fatalf("Failed to set resource limits: %v", err)
	//}

	// 设定一个硬性超时保护（防止 go run 执行时间过长）
	timeout := time.AfterFunc(5*time.Second, func() {
		log.Fatalf("Execution timed out")
	})
	defer timeout.Stop()

	// 执行 "go run <codeFile>"
	cmd := exec.Command("go", "run", codeFile)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		log.Fatalf("Execution error: %v", err)
	}
}
