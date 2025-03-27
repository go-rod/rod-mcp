package main

import (
	"context"
	"github.com/charmbracelet/log"
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
		log.Errorf("Server start error: %s", err)
	}
}

func (r *Runner) Close() error {
	return r.server.Close()
}
