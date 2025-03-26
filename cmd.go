package main

import (
	"fmt"
	"github.com/go-rod/rod-mcp/banner"
	"github.com/pkg/errors"
	"github.com/urfave/cli/v2"
	"os"
)

type SubCfg struct {
	Headless   bool
	ConfigPath string
}

func RunCmd() (*SubCfg, error) {
	subConfig := SubCfg{}
	cli.AppHelpTemplate = fmt.Sprintf("%s\n%s", banner.ShowBanner(), cli.AppHelpTemplate)
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
			},
			&cli.BoolFlag{
				Name:        "headless",
				Aliases:     []string{"hl"},
				Value:       false,
				Usage:       "use to enable headless,if false browser will shown window",
				Destination: &subConfig.Headless,
			},
		},
		Action: func(c *cli.Context) error {
			if c.Bool("headless") {
				subConfig.Headless = true
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
