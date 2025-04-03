package tools

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/charmbracelet/log"
	"github.com/go-rod/rod-mcp/types"
	"github.com/go-rod/rod-mcp/utils"
	"github.com/go-rod/rod/lib/input"
	"github.com/go-rod/rod/lib/proto"
	"github.com/mark3labs/mcp-go/mcp"
)

const (
	defaultWaitStableDur = 1 * time.Second
	defaultDomDiff       = 0.2
)

const (
	CreateTabToolKey    = "rod_create_tab"
	NavigationToolKey   = "rod_navigate"
	GoBackToolKey       = "rod_go_back"
	GoForwardToolKey    = "rod_go_forward"
	ReloadToolKey       = "rod_reload"
	PressKeyToolKey     = "rod_press"
	ClickToolKey        = "rod_click"
	FillToolKey         = "rod_fill"
	PdfToolKey          = "rod_pdf"
	ScreenshotToolKey   = "rod_screenshot"
	EvaluateToolKey     = "rod_evaluate"
	CloseBrowserToolKey = "rod_close_browser"
	SelectorToolKey     = "rod_selector"
)

var (
	CreateTab = mcp.NewTool(CreateTabToolKey,
		mcp.WithDescription("Create a new tab default about:blank"),
		mcp.WithString("url", mcp.Description("URL to navigate in new tab")),
	)
	Navigation = mcp.NewTool(NavigationToolKey,
		mcp.WithDescription("Navigate to a URL"),
		mcp.WithString("url", mcp.Description("URL to navigate to"), mcp.Required()),
	)
	GoBack = mcp.NewTool(GoBackToolKey,
		mcp.WithDescription("Go back in the browser history, go back to the previous page"),
	)
	GoForward = mcp.NewTool(GoForwardToolKey,
		mcp.WithDescription("Go forward in the browser history, go to the next page"),
	)
	ReLoad = mcp.NewTool(ReloadToolKey,
		mcp.WithDescription("Reload the current page"),
	)
	PressKey = mcp.NewTool(PressKeyToolKey,
		mcp.WithDescription("Press a key on the keyboard"),
		mcp.WithString("key", mcp.Description("Name of the key to press or a character to generate, such as `ArrowLeft` or `a`"), mcp.Required()),
	)
	Pdf = mcp.NewTool(PdfToolKey,
		mcp.WithDescription("Generate a PDF from the current page"),
		mcp.WithString("file_path", mcp.Description("Path to save the PDF file"), mcp.Required()),
		mcp.WithString("file_name", mcp.Description("Name of the PDF file"), mcp.Required()),
	)
	CloseBrowser = mcp.NewTool(CloseBrowserToolKey,
		mcp.WithDescription("Close the browser"),
	)
	Screenshot = mcp.NewTool(ScreenshotToolKey,
		mcp.WithDescription("Take a screenshot of the current page or a specific element"),
		mcp.WithString("name", mcp.Description("Name of the screenshot"), mcp.Required()),
		mcp.WithString("selector", mcp.Description("CSS selector of the element to take a screenshot of")),
		mcp.WithNumber("width", mcp.Description("Width in pixels (default: 800)")),
		mcp.WithNumber("height", mcp.Description("Height in pixels (default: 600)")),
	)
	Click = mcp.NewTool(ClickToolKey,
		mcp.WithDescription("Click an element on the page"),
		mcp.WithString("selector", mcp.Description("CSS selector of the element to click"), mcp.Required()),
	)
	Fill = mcp.NewTool(FillToolKey,
		mcp.WithDescription("Fill out an input field"),
		mcp.WithString("selector", mcp.Description("CSS selector of the element to type into"), mcp.Required()),
		mcp.WithString("value", mcp.Description("Value to fill"), mcp.Required()),
	)
	Selector = mcp.NewTool(SelectorToolKey,
		mcp.WithDescription("Select an element on the page with Select tag"),
		mcp.WithString("selector", mcp.Description("CSS selector for element to select"), mcp.Required()),
		mcp.WithString("value", mcp.Description("Value to select"), mcp.Required()),
	)
	Evaluate = mcp.NewTool(EvaluateToolKey,
		mcp.WithDescription("Execute JavaScript in the browser console"),
		mcp.WithString("script", mcp.Description("A function name or an unnamed function definition"), mcp.Required()),
	)
)

type ToolHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error)

var (
	CreateTabHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			url := request.Params.Arguments["url"].(string)
			if url != "" && !utils.IsHttp(url) {
				log.Errorf("Invalid URL: %s", url)
				return nil, errors.New("invalid URL")
			}
			page, err := rodCtx.EnsureNewPage(url)
			if err != nil {
				log.Errorf("Failed to navigate to %s: %s", url, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to navigate to %s: %s", url, err.Error()))
			}
			page.WaitDOMStable(defaultWaitStableDur, defaultDomDiff)
			return mcp.NewToolResultText(fmt.Sprintf("New tab created with url: %s", url)), nil
		}
	}
	NavigationHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			url := request.Params.Arguments["url"].(string)
			if !utils.IsHttp(url) {
				log.Errorf("Invalid URL: %s", url)
				return nil, errors.New("invalid URL")
			}

			page, err := rodCtx.EnsurePage()
			if err != nil {
				log.Errorf("Failed to navigate to %s: %s", url, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to navigate to %s: %s", url, err.Error()))
			}
			err = page.Navigate(url)
			if err != nil {
				log.Errorf("Failed to navigate to %s: %s", url, err.Error())
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
				log.Errorf("Failed to go back: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to go back: %s", err.Error()))
			}
			err = page.NavigateBack()
			if err != nil {
				log.Errorf("Failed to go back: %s", err.Error())
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
				log.Errorf("Failed to go forward: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to go forward: %s", err.Error()))
			}
			err = page.NavigateForward()
			if err != nil {
				log.Errorf("Failed to go forward: %s", err.Error())
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
				log.Errorf("Failed to reload current page: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to reload current page: %s", err.Error()))
			}
			err = page.Reload()
			if err != nil {
				log.Errorf("Failed to reload current page: %s", err.Error())
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
				log.Errorf("Failed to press key: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to press key: %s", err.Error()))
			}
			key := request.Params.Arguments["key"].(rune)
			err = page.Keyboard.Type(input.Key(key))
			if err != nil {
				log.Errorf("Failed to press key %s: %s", string(key), err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to press key %s: %s", string(key), err.Error()))
			}
			return mcp.NewToolResultText(fmt.Sprintf("Press key %s successfully", string(key))), nil
		}
	}

	ClickHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			page, err := rodCtx.EnsurePage()
			if err != nil {
				log.Errorf("Failed to click element: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to click element: %s", err.Error()))
			}
			selector := request.Params.Arguments["selector"].(string)
			element, err := page.Element(selector)
			if err != nil {
				log.Errorf("Failed to find element %s: %s", selector, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to find element %s: %s", selector, err.Error()))
			}
			if element == nil || element.Object == nil {
				return nil, errors.New(fmt.Sprintf("Failed to find element: %s", selector))
			}
			err = element.Click(proto.InputMouseButtonLeft, 1)
			if err != nil {
				log.Errorf("Failed to click element %s: %s", selector, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to click element %s: %s", selector, err.Error()))
			}
			return mcp.NewToolResultText(fmt.Sprintf("Click element %s successfully", selector)), nil
		}
	}

	FillHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			page, err := rodCtx.EnsurePage()
			if err != nil {
				log.Errorf("Failed to fill out element: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to fill out element: %s", err.Error()))
			}
			selector := request.Params.Arguments["selector"].(string)
			value := request.Params.Arguments["value"].(string)
			element, err := page.Element(selector)
			if err != nil {
				log.Errorf("Failed to find element %s: %s", selector, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to find element %s: %s", selector, err.Error()))
			}
			if element == nil || element.Object == nil {
				return nil, errors.New(fmt.Sprintf("Failed to find element %s: %s", selector, err.Error()))
			}
			err = element.Input(value)
			if err != nil {
				log.Errorf("Failed to fill out element %s: %s", selector, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to fill out element %s: %s", selector, err.Error()))
			}
			return mcp.NewToolResultText(fmt.Sprintf("Fill out element %s successfully", selector)), nil
		}
	}
	CloseBrowserHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			err := rodCtx.CloseBrowser()
			if err != nil {
				log.Errorf("Failed to close browser: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to close browser: %s", err.Error()))
			}
			return mcp.NewToolResultText("Close browser successfully"), nil
		}
	}
	EvaluateHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			page, err := rodCtx.EnsurePage()
			if err != nil {
				log.Errorf("Failed to evaluate: %s", err.Error())
			}
			script := request.Params.Arguments["script"].(string)
			r, err := proto.RuntimeEvaluate{
				Expression:            script,
				ObjectGroup:           "console",
				IncludeCommandLineAPI: true,
			}.Call(page)
			if err != nil {
				log.Errorf("Failed to evaluate code: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to evaluate code: %s", err.Error()))
			}
			return mcp.NewToolResultText(fmt.Sprintf("Evaluate code successfully with result: %s", r.Result.Value.String())), nil
		}
	}
	SelectorHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			page, err := rodCtx.EnsurePage()
			if err != nil {
				log.Errorf("Failed to select: %s", err.Error())
			}
			res, err := page.Element(request.Params.Arguments["selector"].(string))
			if err != nil {
				log.Errorf("Failed to select: %s", err.Error())
			}
			return mcp.NewToolResultText(fmt.Sprintf("The object's id matched: %s, plain text is: %s", res.Object.ObjectID, res.String())), nil
		}
	}
	ScreenshotHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			page, err := rodCtx.EnsurePage()
			if err != nil {
				log.Errorf("Failed to screenshot: %s", err.Error())
			}
			req := &proto.PageCaptureScreenshot{
				Format: proto.PageCaptureScreenshotFormatPng,
			}
			bin, err := page.Screenshot(false, req)
			if err != nil {
				log.Errorf("Failed to screenshot: %s", err.Error())
			}
			fileName := request.Params.Arguments["name"].(string)
			toFile := []string{"tmp", "screenshots", fileName + ".png"}
			filePath := filepath.Join(toFile...)
			err = os.WriteFile(filePath, bin, 0o664)
			if err != nil {
				log.Errorf("Failed to screenshot: %s", err.Error())
			}
			return mcp.NewToolResultText(fmt.Sprintf("Save to %s", filePath)), nil
		}
	}
)

var (
	CommonTools = []mcp.Tool{
		CreateTab,
		Navigation,
		GoBack,
		GoForward,
		ReLoad,
		PressKey,
		Click,
		Fill,
		CloseBrowser,
		Pdf,
		Screenshot,
		Selector,
		Evaluate,
	}
	CommonToolHandlers = map[string]ToolHandler{
		CreateTabToolKey:  CreateTabHandler,
		NavigationToolKey: NavigationHandler,
		GoBackToolKey:     GoBackHandler,
		GoForwardToolKey:  GoForwardHandler,
		ReloadToolKey:     ReLoadHandler,
		PressKeyToolKey:   PressKeyHandler,
		ClickToolKey:      ClickHandler,
		FillToolKey:       FillHandler,
		//PdfToolKey:          PdfHandler,
		ScreenshotToolKey:   ScreenshotHandler,
		EvaluateToolKey:     EvaluateHandler,
		CloseBrowserToolKey: CloseBrowserHandler,
		SelectorToolKey:     SelectorHandler,
	}
)
