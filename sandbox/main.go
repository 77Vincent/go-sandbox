package main

import (
	"context"
	"errors"
	"fmt"
	"github.com/tianqi-wen_frgr/best-go-playground/config"
	"github.com/tianqi-wen_frgr/best-go-playground/sandbox/internal"
	"log"
	"os"
	"os/exec"
	"syscall"
	"time"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatalf("Usage: %s <code-file>", os.Args[0])
	}
	codeFile := os.Args[1]

	// 先设置 seccomp 筛选规则（必须在设置内存限制之前完成）
	if err := internal.SetupSeccomp(); err != nil {
		log.Fatalf("Failed to setup seccomp: %v", err)
	}

	// 然后设置资源限制（CPU 和内存）
	if err := internal.SetLimits(); err != nil {
		log.Fatalf("Failed to set resource limits: %v", err)
	}

	// 使用 Context 控制超时，这里设定 10 秒超时
	ctx, cancel := context.WithTimeout(context.Background(), config.SandboxTimeout*time.Second)
	defer cancel()

	// 执行 "go run <codeFile>"
	cmd := exec.CommandContext(ctx, "go", "run", codeFile)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	start := time.Now()
	err := cmd.Run()
	duration := time.Since(start)

	if err != nil {
		// the program in the sandbox has to be ended due to the timeout
		if errors.Is(ctx.Err(), context.DeadlineExceeded) {
			log.Printf("Execution timed out")
		} else {
			log.Printf("Execution error: %v", err)
		}
		os.Exit(1)
	}

	// 获取子进程的资源使用情况
	if ps := cmd.ProcessState; ps != nil {
		if ru, ok := ps.SysUsage().(*syscall.Rusage); ok {
			if _, err = fmt.Fprintf(os.Stderr, "STATS_INFO:%s;%d", duration, ru.Maxrss); err != nil {
				log.Printf("Failed to write execution stats: %v", err)
			}
		}
	}
}
