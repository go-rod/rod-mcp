package main

import (
	"context"
	"github.com/charmbracelet/log"
	"github.com/go-rod/rod-mcp/tools"
	"github.com/go-rod/rod-mcp/types"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

const VERSION = "1.0.0"

type Server struct {
	ctx       *types.Context
	mcpServer *server.MCPServer
}

func NewServer(stdCtx context.Context, cfg types.Config) *Server {
	ctx := types.NewContext(stdCtx, cfg)
	mcpServer := server.NewMCPServer(cfg.ServerName, VERSION)
	ser := &Server{
		ctx:       ctx,
		mcpServer: mcpServer,
	}
	switch ctx.CurrentMode() {
	case types.Text:
		ser.registerTools(tools.TextTools, tools.TextToolHandlers)
	case types.Vision:
	}
	return ser

}

func (s *Server) registerTools(mcpTools []mcp.Tool, handlers map[string]tools.ToolHandler) *Server {
	for _, mt := range mcpTools {
		if handlerFunc, ok := handlers[mt.Name]; ok {
			log.Debugf("register tool: %s", mt.Name)
			s.mcpServer.AddTool(mt, handlerFunc(s.ctx))
		}

	}
	return s

}

func (s *Server) Start() error {
	if err := server.ServeStdio(s.mcpServer); err != nil {
		return err
	}
	return nil
}

func (s *Server) Close() error {
	return s.ctx.Close()
}
