package tools

import "github.com/mark3labs/mcp-go/mcp"

var (
	navigation = mcp.NewTool("rod_navigate",
		mcp.WithDescription("Navigate to a URL"),
		mcp.WithString("url", mcp.Description("URL to navigate to"), mcp.Required()),
	)
	goBack = mcp.NewTool("rod_go_back",
		mcp.WithDescription("Go back in the browser history, go back to the previous page"),
	)
	goForward = mcp.NewTool("rod_go_forward",
		mcp.WithDescription("Go forward in the browser history, go to the next page"),
	)
	reLoad = mcp.NewTool("rod_reload",
		mcp.WithDescription("Reload the current page"),
	)
	pressKey = mcp.NewTool("rod_press_key",
		mcp.WithDescription("Press a key on the keyboard"),
		mcp.WithString("key", mcp.Description("Name of the key to press or a character to generate, such as `ArrowLeft` or `a`"), mcp.Required()),
	)
	pdf = mcp.NewTool("rod_pdf",
		mcp.WithDescription("Generate a PDF from the current page"),
		mcp.WithString("file_path", mcp.Description("Path to save the PDF file"), mcp.Required()),
		mcp.WithString("file_name", mcp.Description("Name of the PDF file"), mcp.Required()),
	)
	closeBrowser = mcp.NewTool("rod_close",
		mcp.WithDescription("Close the browser"),
	)
	screenshot = mcp.NewTool("rod_screenshot",
		mcp.WithDescription("Take a screenshot of the current page or a specific element"),
		mcp.WithString("name", mcp.Description("Name of the screenshot"), mcp.Required()),
		mcp.WithString("selector", mcp.Description("CSS selector of the element to take a screenshot of")),
		mcp.WithNumber("width", mcp.Description("Width in pixels (default: 800)")),
		mcp.WithNumber("height", mcp.Description("Height in pixels (default: 600)")),
	)
	click = mcp.NewTool("rod_click",
		mcp.WithDescription("Click an element on the page"),
		mcp.WithString("selector", mcp.Description("CSS selector of the element to click"), mcp.Required()),
	)
	fill = mcp.NewTool("rod_fill",
		mcp.WithDescription("Fill out an input field"),
		mcp.WithString("selector", mcp.Description("CSS selector of the element to type into"), mcp.Required()),
		mcp.WithString("value", mcp.Description("Value to fill"), mcp.Required()),
	)
	selector = mcp.NewTool("rod_selector",
		mcp.WithDescription("Select an element on the page with Select tag"),
		mcp.WithString("selector", mcp.Description("CSS selector for element to select"), mcp.Required()),
		mcp.WithString("value", mcp.Description("Value to select"), mcp.Required()),
	)
	evaluate = mcp.NewTool("rod_evaluate",
		mcp.WithDescription("Execute JavaScript in the browser console"),
		mcp.WithString("script", mcp.Description("JavaScript code to execute"), mcp.Required()),
	)
)
