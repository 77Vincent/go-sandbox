package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"syscall"
	"time"
)

const (
	timeoutExitCode     = 124
	sandboxCPUTimeLimit = 5                      // seconds
	sandboxMemoryLimit  = 2 * 1024 * 1024 * 1024 // bytes
)

var (
	testCodeRegex = regexp.MustCompile(`(?i)code-.*_test\.go`)
)

func main() {
	if len(os.Args) < 2 {
		log.Fatalf("Usage: %s <code-file>", os.Args[0])
	}
	codeFile := os.Args[1]

	// 0. 检查代码文件是否是测试文件
	// test file flow
	if testCodeRegex.MatchString(codeFile) {
		cmd := exec.Command("go", "test", codeFile)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		// 先设置 seccomp 筛选规则（必须在设置内存限制之前完成）
		if err := SetupSeccomp(); err != nil {
			log.Fatalf("Failed to setup seccomp: %v", err)
		}

		// 然后设置资源限制（CPU 和内存）
		if err := SetLimits(); err != nil {
			log.Fatalf("Failed to set resource limits: %v", err)
		}

		if err := cmd.Run(); err != nil {
			// handle test failures or build errors
			os.Exit(1)
		}
	}

	// normal code flow
	// 1. 编译用户代码，生成可执行文件
	tmpDir, err := os.MkdirTemp("", "sandbox-build-")
	if err != nil {
		log.Fatalf("Failed to create temp directory: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	binPath := filepath.Join(tmpDir, "userprog")
	buildCmd := exec.Command("go", "build", "-o", binPath, codeFile)
	buildCmd.Stdout = os.Stdout
	buildCmd.Stderr = os.Stderr
	if err = buildCmd.Run(); err != nil {
		log.Fatalf("Build error: %v", err)
	}

	// 先设置 seccomp 筛选规则（必须在设置内存限制之前完成）
	if err = SetupSeccomp(); err != nil {
		log.Fatalf("Failed to setup seccomp: %v", err)
	}

	// 然后设置资源限制（CPU 和内存）
	if err = SetLimits(); err != nil {
		log.Fatalf("Failed to set resource limits: %v", err)
	}

	// the execution timeout is same as the CPU timeout limit
	ctx, cancel := context.WithTimeout(context.Background(), sandboxCPUTimeLimit*time.Second)
	defer cancel()

	// 执行 "go run <codeFile>"
	cmd := exec.CommandContext(ctx, binPath)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	start := time.Now()
	if err = cmd.Run(); err != nil {
		// the program in the sandbox has to be ended due to the timeout
		if errors.Is(ctx.Err(), context.DeadlineExceeded) {
			os.Exit(timeoutExitCode)
		}

		log.Printf("Execution error: %s", err)
		os.Exit(1)
	}

	duration := time.Since(start)

	// 获取子进程的资源使用情况
	if ps := cmd.ProcessState; ps != nil {
		if ru, ok := ps.SysUsage().(*syscall.Rusage); ok {
			if _, err = fmt.Fprintf(os.Stderr, "STATS_INFO:%s;%d", duration, ru.Maxrss); err != nil {
				log.Printf("Failed to write execution stats: %v", err)
				os.Exit(1)
			}
		}
	}
}
