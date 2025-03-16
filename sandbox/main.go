// 文件 sandbox-runner/main.go
package main

import (
	"context"
	"errors"
	"github.com/tianqi-wen_frgr/best-go-playground/sandbox/internal"
	"log"
	"os"
	"os/exec"
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 执行 "go run <codeFile>"
	cmd := exec.CommandContext(ctx, "go", "run", codeFile)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		// 判断是否因超时取消
		if errors.Is(ctx.Err(), context.DeadlineExceeded) {
			log.Printf("Execution timed out")
		} else {
			log.Printf("Execution error: %v", err)
		}
		os.Exit(1)
	}
}
