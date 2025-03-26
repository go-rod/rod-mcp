package resources

import "github.com/mark3labs/mcp-go/mcp"

var Network = mcp.NewResource(
	"rod://network",
	"Page network",
	mcp.WithMIMEType("text/plain"),
)
