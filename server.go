package rod_mcp

import (
	"github.com/go-rod/rod-mcp/tools"
	"github.com/go-rod/rod-mcp/types"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

type Server struct {
	ctx       *types.Context
	mcpServer *server.MCPServer
}

func (s *Server) RegisterTools(mcpTools ...mcp.Tool) {
	for _, mt := range mcpTools {
		if handlerFunc, ok := tools.CommonToolHandlers[mt.Name]; ok {
			s.mcpServer.AddTool(mt, handlerFunc(s.ctx))
		}

	}

}
