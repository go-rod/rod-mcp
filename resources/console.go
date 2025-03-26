package resources

import "github.com/mark3labs/mcp-go/mcp"

var Console = mcp.NewResource(
	"rod://console",
	"Page console",
	mcp.WithMIMEType("text/plain"),
)
