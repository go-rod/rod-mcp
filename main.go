package main

import (
	"context"
	"fmt"
	"github.com/go-rod/rod-mcp/types"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	subCfg, err := RunCmd()
	if err != nil {
		fmt.Println(err)
		return
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cfg, err := types.LoadConfig(subCfg.ConfigPath)
	if err != nil {
		fmt.Println(err)
		return
	}
	if subCfg.Headless {
		cfg.Headless = true
	}
	runner := NewRunner(ctx, *cfg)
	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, syscall.SIGTERM, syscall.SIGINT, syscall.SIGKILL)
		defer signal.Stop(c)

		for {
			select {
			case <-c:
				fmt.Println("Rod MCP Server Interrupted by CTRL+C")
				cancel()
				return
			}
		}
	}()
	runner.Run()

	defer func() {
		err := runner.Close()
		if err != nil {
			fmt.Println("Rod MCP Server Close error:", err)
		}
	}()
	return
}
