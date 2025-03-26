package main

import (
	"context"
	"github.com/go-rod/rod-mcp/tools"
	"github.com/go-rod/rod-mcp/types"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

type Server struct {
	ctx       *types.Context
	mcpServer *server.MCPServer
}

func NewServer(stdCtx context.Context, cfg types.Config) *Server {
	ctx := types.NewContext(stdCtx, cfg)
	mcpServer := server.NewMCPServer(cfg.ServerName, cfg.ServerVersion)
	ser := &Server{
		ctx:       ctx,
		mcpServer: mcpServer,
	}
	ser.registerTools(tools.CommonTools...)
	return ser

}

func (s *Server) registerTools(mcpTools ...mcp.Tool) *Server {
	for _, mt := range mcpTools {
		if handlerFunc, ok := tools.CommonToolHandlers[mt.Name]; ok {
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
