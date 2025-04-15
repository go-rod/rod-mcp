package main

import (
	"context"
	"github.com/charmbracelet/log"
	"github.com/go-rod/rod-mcp/types"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	subCfg, err := RunCmd()
	if err != nil {
		log.Error(err)
		return
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cfg, err := types.LoadConfig(subCfg.ConfigPath)
	if err != nil {
		log.Errorf("Load config error: %s", err)
		return
	}
	// init logger
	types.InitLogger(cfg.LoggerConfig)

	if subCfg.Headless {
		cfg.Headless = true
	}

	if subCfg.Mode != "" {
		cfg.Mode = subCfg.Mode
	}

	if subCfg.CDPEndpoint != "" {
		cfg.CDPEndpoint = subCfg.CDPEndpoint
	}

	runner := NewRunner(ctx, *cfg)
	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, syscall.SIGTERM, syscall.SIGINT, syscall.SIGKILL)
		defer signal.Stop(c)

		for {
			select {
			case <-c:
				log.Info("Received signal, exiting...")
				cancel()
				return
			}
		}
	}()
	runner.Run()

	defer func() {
		err := runner.Close()
		if err != nil {
			log.Errorf("Server close error: %s", err)
		}
	}()
	return
}
