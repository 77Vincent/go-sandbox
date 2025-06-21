package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

const (
	timeoutExitCode     = 124
	sandboxCPUTimeLimit = 7                      // seconds
	sandboxMemoryLimit  = 2 * 1024 * 1024 * 1024 // bytes
	tmpFileName         = "main.go"
	tmpTestFileName     = "main_test.go"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatalf("Usage: %s <code-file>", os.Args[0])
	}
	var (
		codeFile   = os.Args[1]
		arr        = strings.Split(codeFile, "/")
		fileName   = tmpFileName
		isTestFlow = strings.Contains(codeFile, tmpTestFileName)
		moduleDir  = fmt.Sprintf("%s/%s", arr[0], arr[1])
	)
	if isTestFlow {
		fileName = tmpTestFileName
	}

	// normal code flow
	// 1. compile user code, generate an executable file
	tmpDir, err := os.MkdirTemp("", "sandbox-build-")
	if err != nil {
		log.Fatalf("Failed to create temp directory: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// init module if not exists
	if _, err = os.Stat(fmt.Sprintf("%s/go.mod", moduleDir)); os.IsNotExist(err) {
		// init module
		cmd := exec.Command("go", "mod", "init", "sandbox")
		cmd.Dir = moduleDir
		if err = cmd.Run(); err != nil {
			log.Fatalf("Failed to init module: %v", err)
		}
	}

	// move the source code to the module dir
	if err = os.Rename(codeFile, filepath.Join(moduleDir, fileName)); err != nil {
		log.Fatalf("Failed to move code file: %v", err)
	}

	// run go mod tidy
	cmd := exec.Command("go", "mod", "tidy")
	cmd.Dir = moduleDir
	if err = cmd.Run(); err != nil {
		log.Fatalf("Failed to tidy module: %v", err)
	}

	// test file flow
	if isTestFlow {
		cmd = exec.Command("go", "test", ".")
		cmd.Dir = moduleDir
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		// first set seccomp filter rules (must be done before setting memory limits)
		if err = SetupSeccomp(); err != nil {
			log.Fatalf("Failed to setup seccomp: %v", err)
		}

		// then set resource limits (CPU and memory)
		if err = SetLimits(); err != nil {
			log.Fatalf("Failed to set resource limits: %v", err)
		}

		if err = cmd.Run(); err != nil {
			// handle test failures or build errors
			os.Exit(1)
		}
	}

	// build the code
	binPath := filepath.Join(tmpDir, "userprog")
	cmd = exec.Command("go", "build", "-o", binPath, ".")
	cmd.Dir = moduleDir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err = cmd.Run(); err != nil {
		log.Fatalf("Build error: %v", err)
	}

	if err = SetupSeccomp(); err != nil {
		log.Fatalf("Failed to setup seccomp: %v", err)
	}

	if err = SetLimits(); err != nil {
		log.Fatalf("Failed to set resource limits: %v", err)
	}
	if err := syscall.Setuid(65534); err != nil { // 65534 is typically 'nobody'
		log.Fatalf("Failed to drop privileges: %v", err)
	}

	// the execution timeout is same as the CPU timeout limit
	ctx, cancel := context.WithTimeout(context.Background(), sandboxCPUTimeLimit*time.Second)
	defer cancel()

	// execute the built program
	cmd = exec.CommandContext(ctx, binPath)
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

	// get the resource usage of the child process
	if ps := cmd.ProcessState; ps != nil {
		if ru, ok := ps.SysUsage().(*syscall.Rusage); ok {
			if _, err = fmt.Fprintf(os.Stderr, "STATS_INFO:%s;%d", duration, ru.Maxrss); err != nil {
				log.Printf("Failed to write execution stats: %v", err)
				os.Exit(1)
			}
		}
	}
}
