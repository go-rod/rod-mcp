package tools

import (
	"context"
	"github.com/go-rod/rod-mcp/types"
	"github.com/mark3labs/mcp-go/mcp"
)

type ToolHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error)

var (
	SnapshotTools = append(CommonTools, Snapshot)
)
