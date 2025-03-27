package tools

import (
	"context"
	"errors"
	"fmt"
	"github.com/go-rod/rod-mcp/types"
	"github.com/go-rod/rod-mcp/utils"
	"github.com/go-rod/rod/lib/input"
	"github.com/go-rod/rod/lib/proto"
	"github.com/mark3labs/mcp-go/mcp"
	"time"
)

const (
	defaultWaitStableDur = 1 * time.Second
	defaultDomDiff       = 0.2
)

var (
	Navigation = mcp.NewTool("rod_navigate",
		mcp.WithDescription("Navigate to a URL"),
		mcp.WithString("url", mcp.Description("URL to navigate to"), mcp.Required()),
	)
	GoBack = mcp.NewTool("rod_go_back",
		mcp.WithDescription("Go back in the browser history, go back to the previous page"),
	)
	GoForward = mcp.NewTool("rod_go_forward",
		mcp.WithDescription("Go forward in the browser history, go to the next page"),
	)
	ReLoad = mcp.NewTool("rod_reload",
		mcp.WithDescription("Reload the current page"),
	)
	PressKey = mcp.NewTool("rod_press_key",
		mcp.WithDescription("Press a key on the keyboard"),
		mcp.WithString("key", mcp.Description("Name of the key to press or a character to generate, such as `ArrowLeft` or `a`"), mcp.Required()),
	)
	Pdf = mcp.NewTool("rod_pdf",
		mcp.WithDescription("Generate a PDF from the current page"),
		mcp.WithString("file_path", mcp.Description("Path to save the PDF file"), mcp.Required()),
		mcp.WithString("file_name", mcp.Description("Name of the PDF file"), mcp.Required()),
	)
	CloseBrowser = mcp.NewTool("rod_close",
		mcp.WithDescription("Close the browser"),
	)
	Screenshot = mcp.NewTool("rod_screenshot",
		mcp.WithDescription("Take a screenshot of the current page or a specific element"),
		mcp.WithString("name", mcp.Description("Name of the screenshot"), mcp.Required()),
		mcp.WithString("selector", mcp.Description("CSS selector of the element to take a screenshot of")),
		mcp.WithNumber("width", mcp.Description("Width in pixels (default: 800)")),
		mcp.WithNumber("height", mcp.Description("Height in pixels (default: 600)")),
	)
	Click = mcp.NewTool("rod_click",
		mcp.WithDescription("Click an element on the page"),
		mcp.WithString("selector", mcp.Description("CSS selector of the element to click"), mcp.Required()),
	)
	Fill = mcp.NewTool("rod_fill",
		mcp.WithDescription("Fill out an input field"),
		mcp.WithString("selector", mcp.Description("CSS selector of the element to type into"), mcp.Required()),
		mcp.WithString("value", mcp.Description("Value to fill"), mcp.Required()),
	)
	Selector = mcp.NewTool("rod_selector",
		mcp.WithDescription("Select an element on the page with Select tag"),
		mcp.WithString("selector", mcp.Description("CSS selector for element to select"), mcp.Required()),
		mcp.WithString("value", mcp.Description("Value to select"), mcp.Required()),
	)
	Evaluate = mcp.NewTool("rod_evaluate",
		mcp.WithDescription("Execute JavaScript in the browser console"),
		mcp.WithString("script", mcp.Description("JavaScript code to execute"), mcp.Required()),
	)
)

type ToolHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error)

var (
	NavigationHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			url := request.Params.Arguments["url"].(string)
			if !utils.IsHttp(url) {
				return nil, errors.New("invalid URL")
			}

			page, err := rodCtx.EnsurePage()
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to navigate to %s: %s", url, err.Error()))
			}
			err = page.Navigate(url)
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to navigate to %s: %s", url, err.Error()))
			}
			page.WaitDOMStable(defaultWaitStableDur, defaultDomDiff)
			return mcp.NewToolResultText(fmt.Sprintf("Navigated to %s", url)), nil
		}
	}

	GoBackHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			page, err := rodCtx.EnsurePage()
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to go back: %s", err.Error()))
			}
			err = page.NavigateBack()
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to go back: %s", err.Error()))
			}
			page.WaitDOMStable(defaultWaitStableDur, defaultDomDiff)
			return mcp.NewToolResultText("Go back successfully"), nil
		}
	}

	GoForwardHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			page, err := rodCtx.EnsurePage()
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to go forward: %s", err.Error()))
			}
			err = page.NavigateForward()
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to go forward: %s", err.Error()))
			}
			page.WaitDOMStable(defaultWaitStableDur, defaultDomDiff)
			return mcp.NewToolResultText("Go forward successfully"), nil
		}
	}

	ReLoadHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			page, err := rodCtx.EnsurePage()
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to reload current page: %s", err.Error()))
			}
			err = page.Reload()
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to reload current page: %s", err.Error()))
			}
			page.WaitDOMStable(defaultWaitStableDur, defaultDomDiff)
			return mcp.NewToolResultText("Reload current page successfully"), nil
		}
	}

	PressKeyHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			page, err := rodCtx.EnsurePage()
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to press key: %s", err.Error()))
			}
			key := request.Params.Arguments["key"].(rune)
			err = page.Keyboard.Type(input.Key(key))
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to press key %s: %s", string(key), err.Error()))
			}
			return mcp.NewToolResultText(fmt.Sprintf("Press key %s successfully", string(key))), nil
		}
	}

	ClickHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			page, err := rodCtx.EnsurePage()
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to click element: %s", err.Error()))
			}
			selector := request.Params.Arguments["selector"].(string)
			element, err := page.Element(selector)
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to find element %s: %s", selector, err.Error()))
			}
			err = element.Click(proto.InputMouseButtonLeft, 1)
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to click element %s: %s", selector, err.Error()))
			}
			return mcp.NewToolResultText(fmt.Sprintf("Click element %s successfully", selector)), nil
		}
	}

	FillHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			page, err := rodCtx.EnsurePage()
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to fill out element: %s", err.Error()))
			}
			selector := request.Params.Arguments["selector"].(string)
			value := request.Params.Arguments["value"].(string)
			element, err := page.Element(selector)
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to find element %s: %s", selector, err.Error()))
			}
			err = element.Input(value)
			if err != nil {
				return nil, errors.New(fmt.Sprintf("Failed to fill out element %s: %s", selector, err.Error()))
			}
			return mcp.NewToolResultText(fmt.Sprintf("Fill out element %s successfully", selector)), nil
		}
	}
)

var (
	CommonTools = []mcp.Tool{
		Navigation,
		GoBack,
		GoForward,
		ReLoad,
		PressKey,
		Click,
		Fill,
	}
	CommonToolHandlers = map[string]ToolHandler{
		"rod_navigate":   NavigationHandler,
		"rod_go_back":    GoBackHandler,
		"rod_go_forward": GoForwardHandler,
		"rod_reload":     ReLoadHandler,
		"rod_press_key":  PressKeyHandler,
		"rod_click":      ClickHandler,
		"rod_fill":       FillHandler,
	}
)
