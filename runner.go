package main

import (
	"context"
	"fmt"
	"github.com/go-rod/rod-mcp/types"
)

type Runner struct {
	ctx    context.Context
	rodCtx *types.Context
	server *Server
}

func NewRunner(ctx context.Context, cfg types.Config) *Runner {
	rodCtx := types.NewContext(ctx, cfg)
	server := NewServer(ctx, cfg)
	return &Runner{
		ctx:    ctx,
		rodCtx: rodCtx,
		server: server,
	}
}

func (r *Runner) Run() {
	err := r.server.Start()
	if err != nil {
		fmt.Println("Rod MCP Server start error:", err)
	}
}
