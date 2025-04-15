package main

import (
	"fmt"
	"github.com/go-rod/rod-mcp/banner"
	"github.com/go-rod/rod-mcp/types"
	"github.com/pkg/errors"
	"github.com/urfave/cli/v2"
	"os"
)

type SubCfg struct {
	Headless    bool
	ConfigPath  string
	Mode        types.Mode
	CDPEndpoint string
}

func RunCmd() (*SubCfg, error) {
	subConfig := SubCfg{}
	cmd := &cli.App{
		Name:        "Rod MCP Server",
		Description: "Model Context Protocol Server of Rod",
		Usage:       "rod-mcp is a rod mcp server",
		Version:     banner.Version,
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:        "config",
				Aliases:     []string{"c"},
				Usage:       "use to set Rod MCP Server's config file path, file name is `rod-mcp.yaml`",
				Destination: &subConfig.ConfigPath,
			}, &cli.StringFlag{
				Name:        "cdp-endpoint",
				Aliases:     []string{"cdp"},
				Usage:       "use to control running browser by cdp",
				Destination: &subConfig.CDPEndpoint,
			},
			&cli.BoolFlag{
				Name:        "headless",
				Aliases:     []string{"hl"},
				Value:       false,
				Usage:       "use to enable headless,if false browser will shown window",
				Destination: &subConfig.Headless,
			},
			&cli.BoolFlag{
				Name:    "no-banner",
				Aliases: []string{"nb"},
				Usage:   "use to disable show banner",
			},
			&cli.BoolFlag{
				Name:    "vision",
				Aliases: []string{"vs"},
				Usage:   "use to support vision LLM will load  vision tools",
			},
		},
		Before: func(c *cli.Context) error {
			if !c.Bool("no-banner") {
				fmt.Println(banner.ShowBanner())
			}

			return nil
		},
		Action: func(c *cli.Context) error {
			if c.Bool("headless") {
				subConfig.Headless = true
			}

			if c.Bool("vision") {
				subConfig.Mode = types.Vision
			}
			return nil
		},
	}
	err := cmd.Run(os.Args)
	if err != nil {
		return nil, errors.Wrapf(err, "run cmd error")
	}
	return &subConfig, nil
}
