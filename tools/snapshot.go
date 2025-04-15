package tools

import (
	"context"
	"fmt"
	"github.com/charmbracelet/log"
	"github.com/go-rod/rod"
	"github.com/go-rod/rod-mcp/types"
	"github.com/go-rod/rod-mcp/utils"
	"github.com/go-rod/rod/lib/input"
	"github.com/go-rod/rod/lib/proto"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/pkg/errors"
)

const (
	SnapshotToolKey = "rod_snapshot"
	ClickToolKey    = "rod_click"
	FillToolKey     = "rod_fill"
	SelectorToolKey = "rod_selector"
)

var (
	Snapshot = mcp.NewTool("rod_snapshot",
		mcp.WithDescription("Capture accessibility snapshot of the current page, this is better than screenshot"),
	)

	Click = mcp.NewTool(ClickToolKey,
		mcp.WithDescription("Perform click on a web page"),
		mcp.WithString("element", mcp.Description("Human-readable element description used to obtain permission to interact with the element"), mcp.Required()),
		mcp.WithString("ref", mcp.Description("Exact target element reference from the page snapshot"), mcp.Required()),
	)

	Fill = mcp.NewTool(FillToolKey,
		mcp.WithDescription("Type text into editable element"),
		mcp.WithString("element", mcp.Description("Human-readable element description used to obtain permission to interact with the element"), mcp.Required()),
		mcp.WithString("value", mcp.Description("Text to type into the element"), mcp.Required()),
		mcp.WithString("ref", mcp.Description("Exact target element reference from the page snapshot"), mcp.Required()),
		mcp.WithBoolean("submit", mcp.Description("Whether to type one character at a time. Useful for triggering key handlers in the page. By default entire text is filled in at once."), mcp.Required()),
	)
	Selector = mcp.NewTool(SelectorToolKey,
		mcp.WithDescription("Select an option in a dropdown"),
		mcp.WithString("element", mcp.Description("Human-readable element description used to obtain permission to interact with the element"), mcp.Required()),
		mcp.WithString("ref", mcp.Description("Exact target element reference from the page snapshot"), mcp.Required()),
		mcp.WithArray("values", mcp.Description("Array of values to select in the dropdown. This can be a single value or multiple values."), mcp.Items(map[string]interface{}{"type": "string", "required": true}), mcp.Required()),
	)
)

var (
	SnapshotHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			snapshot, err := rodCtx.BuildSnapshot()
			if err != nil {
				return nil, errors.Wrapf(err, "Failed to capture snapshoot")
			}

			return mcp.NewToolResultText(snapshot), nil

		}
	}

	ClickHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			_, err := rodCtx.ControlledPage()
			ele := request.Params.Arguments["element"].(string)
			if err != nil {
				log.Errorf("Failed to click element: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to click element %s: %s", ele, err.Error()))
			}

			snapshot, err := rodCtx.LatestSnapshot()
			if err != nil {
				log.Errorf("Failed to get snapshot: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to click element %s: %s", ele, err.Error()))
			}

			ref := request.Params.Arguments["ref"].(string)
			element, err := snapshot.LocatorInFrame(ref)
			if err != nil {
				log.Errorf("Failed to find frame %s: %s", ele, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to click element %s: %s", ele, err.Error()))
			}
			err = element.Click(proto.InputMouseButtonLeft, 1)
			if err != nil {
				log.Errorf("Failed to click element %s: %s", ele, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to click element %s: %s", ele, err.Error()))
			}
			return mcp.NewToolResultText(fmt.Sprintf("Click element %s successfully", ele)), nil
		}
	}

	FillHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			_, err := rodCtx.ControlledPage()
			ele := request.Params.Arguments["element"].(string)
			if err != nil {
				log.Errorf("Failed to fill out element %s: %s", ele, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to fill out element %s : %s", ele, err.Error()))
			}

			snapshot, err := rodCtx.LatestSnapshot()
			if err != nil {
				log.Errorf("Failed to get snapshot: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to fill out element %s : %s", ele, err.Error()))
			}

			ref := request.Params.Arguments["ref"].(string)
			element, err := snapshot.LocatorInFrame(ref)
			if err != nil {
				log.Errorf("Failed to find frame %s: %s", ele, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to fill out element %s: %s", ele, err.Error()))
			}

			value := request.Params.Arguments["value"].(string)
			err = element.Input(value)

			if err != nil {
				log.Errorf("Failed to fill out element %s: %s", ele, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to fill out element %s: %s", ele, err.Error()))
			}
			if submit, ok := request.Params.Arguments["submit"].(bool); ok && submit {
				err = element.Page().Keyboard.Press(input.Enter)
				if err != nil {
					log.Errorf("Failed to submit element %s: %s", ele, err.Error())
					return nil, errors.New(fmt.Sprintf("Failed to submit element %s: %s", ele, err.Error()))
				}
			}
			return mcp.NewToolResultText(fmt.Sprintf("Fill out element %s successfully", ele)), nil
		}
	}

	SelectorHandler = func(rodCtx *types.Context) func(context.Context, mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			_, err := rodCtx.ControlledPage()
			ele := request.Params.Arguments["element"].(string)
			if err != nil {
				log.Errorf("Failed to select option in element %s: %s", ele, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to select option(s) in element %s : %s", ele, err.Error()))
			}

			snapshot, err := rodCtx.LatestSnapshot()
			if err != nil {
				log.Errorf("Failed to get snapshot: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to select option(s) in element %s : %s", ele, err.Error()))
			}

			ref := request.Params.Arguments["ref"].(string)
			element, err := snapshot.LocatorInFrame(ref)
			if err != nil {
				log.Errorf("Failed to find frame %s: %s", ele, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to select option(s) in element %s: %s", ele, err.Error()))
			}
			values, err := utils.OptionalStringArrayParam(request, "values")
			if err != nil {
				log.Errorf("Failed to get values: %s", err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to select option(s) in element %s: %s", ele, err.Error()))
			}
			err = element.Select(values, true, rod.SelectorTypeText)
			if err != nil {
				log.Errorf("Failed to select option(s) in element %s: %s", ref, err.Error())
				return nil, errors.New(fmt.Sprintf("Failed to select option(s) in element %s: %s", ele, err.Error()))
			}
			return mcp.NewToolResultText(fmt.Sprintf("Select option(s) in element %s successfully", ele)), nil
		}
	}
)

var (
	SnapshotToolHandlers = map[string]ToolHandler{
		SnapshotToolKey: SnapshotHandler,
		ClickToolKey:    ClickHandler,
		FillToolKey:     FillHandler,
		SelectorToolKey: SelectorHandler,
	}
)
