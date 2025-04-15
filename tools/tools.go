package tools

import (
	"github.com/go-rod/rod-mcp/types"
	"github.com/go-rod/rod-mcp/utils"
	"github.com/mark3labs/mcp-go/server"
)

type ToolHandler = func(rodCtx *types.Context) server.ToolHandlerFunc

var (
	TextTools        = append(CommonTools, Snapshots...)
	TextToolHandlers = utils.MergeMaps(CommonToolHandlers, SnapshotToolHandlers)
)
