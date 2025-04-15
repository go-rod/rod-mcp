package types

import (
	"context"
	"fmt"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod-mcp/types/js"
	"github.com/go-rod/rod-mcp/utils"
	"github.com/go-rod/rod/lib/launcher"
	"github.com/go-rod/rod/lib/proto"
	"github.com/pkg/errors"
)

func launchBrowser(ctx context.Context, cfg Config) (*rod.Browser, error) {
	if cfg.BrowserTempDir == "" {
		cfg.BrowserTempDir = DefaultBrowserTempDir
	}

	// browser must own a unique temp dir
	cfg.BrowserTempDir = fmt.Sprintf("%s/%s", cfg.BrowserTempDir, utils.RandomString(10))
	browserLauncher := launcher.New().
		Context(ctx).
		Headless(cfg.Headless).
		NoSandbox(cfg.NoSandbox).
		Set("no-gpu").
		Set("--no-first-run").
		Set("ignore-certificate-errors", "true").
		Set("disable-xss-auditor", "true").
		Set("disable-popup-blocking").
		Set("mute-audio", "true").
		Set("use-mock-keychain").
		//Set("--disable-permissions-api").
		Set("--remote-allow-origins", "*").
		Set("--disable-dev-shm-usage").
		Set("--disable-features", "HttpsUpgrades").
		UserDataDir(cfg.BrowserTempDir)

	if cfg.BrowserBinPath != "" {
		browserLauncher.Bin(cfg.BrowserBinPath)
	} else {
		if browserPath, has := launcher.LookPath(); has {
			browserLauncher.Bin(browserPath)
		} else {
			return nil, errors.New("the machine does not have Chrome installed,please set the executable_path or installed a chrome")
		}
	}

	if cfg.Proxy != "" {
		browserLauncher.Proxy(cfg.Proxy)
	}

	browser := rod.New().Context(ctx)

	controlUrl, err := browserLauncher.Launch()
	if err != nil {
		return nil, errors.Wrap(err, "launch local browser failed")
	}

	err = browser.ControlURL(controlUrl).Connect()
	if err != nil {
		err := browser.Close()
		if err != nil {
			return nil, errors.Wrap(err, "in connect local browser stage to close browser happened err")
		}
		return nil, errors.Wrap(err, "Error connecting to local browser")
	}
	return browser, nil
}

// Mode is the model type, indicates the model type of the tool
type Mode string

const (
	// Vision mode indicates the vision ll model,will load the vision tools
	Vision Mode = "vision"

	// Text mode indicates the no vision ll model,will load the text tools
	Text Mode = "text"
)

type Context struct {
	stdContext context.Context
	config     Config
	browser    *rod.Browser
	page       *rod.Page
	stateLock  sync.Mutex
	isInitial  atomic.Bool
	snapshot   *Snapshot
	mode       Mode
}

func NewContext(ctx context.Context, cfg Config) *Context {
	return &Context{
		stdContext: ctx,
		config:     cfg,
		mode:       cfg.Mode,
	}
}

func (ctx *Context) EnsurePage() (*rod.Page, error) {
	if err := ctx.initial(); err != nil {
		return nil, err
	}
	return ctx.page, nil
}

func (ctx *Context) ControlledPage() (*rod.Page, error) {
	ctx.stateLock.Lock()
	defer ctx.stateLock.Unlock()
	if ctx.page == nil {
		return nil, errors.New("No tab to used, call rod_navigate first")
	}
	return ctx.page, nil
}

func (ctx *Context) initial() error {
	ctx.stateLock.Lock()
	defer ctx.stateLock.Unlock()

	var err error
	if ctx.browser == nil {
		ctx.browser, err = launchBrowser(ctx.stdContext, ctx.config)
		if err != nil {
			return err
		}
		ctx.page, err = ctx.createPage()
		if err != nil {
			return err
		}
		return nil
	}
	if ctx.page == nil {
		ctx.page, err = ctx.createPage()
		if err != nil {
			return err
		}
	}

	return err

}

func (ctx *Context) CurrentMode() Mode {
	return ctx.mode
}

func (ctx *Context) ClosePage() error {
	ctx.stateLock.Lock()
	defer ctx.stateLock.Unlock()
	return ctx.closePage()
}

func (ctx *Context) Execute(handlerFunc server.ToolHandlerFunc, handlerCallOpts ToolHandlerCallOpts) server.ToolHandlerFunc {
	return func(stdCtx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		result, err := handlerFunc(stdCtx, request)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		if handlerCallOpts.WitSnapshot {
			snapshot, _ := ctx.BuildSnapshot()
			result.Content = append(result.Content, mcp.TextContent{
				Type: "text",
				Text: snapshot,
			})
		}
		return result, nil
	}
}

func (ctx *Context) BuildSnapshot() (string, error) {
	ctx.stateLock.Lock()
	defer ctx.stateLock.Unlock()
	if ctx.page == nil {
		return "", errors.New("No tab to capture snapshot, call rod_navigate first")
	}
	snapshot, err := BuildSnapshot(ctx.page)
	if err != nil {
		return "", err
	}
	ctx.snapshot = snapshot
	return snapshot.String(), nil
}

func (ctx *Context) LatestSnapshot() (*Snapshot, error) {
	ctx.stateLock.Lock()
	defer ctx.stateLock.Unlock()
	if ctx.snapshot == nil {
		return nil, errors.New("No snapshot to used, call rod_snapshot first")
	}
	return ctx.snapshot, nil

}

func (ctx *Context) CloseBrowser() error {
	ctx.stateLock.Lock()
	defer ctx.stateLock.Unlock()
	return ctx.closeBrowser()

}

func (ctx *Context) closePage() error {
	if ctx.page == nil {
		return nil
	}
	err := ctx.page.Close()
	if err != nil {
		return errors.Wrap(err, "close page failed")
	}
	ctx.page = nil
	return err
}
func (ctx *Context) closeBrowser() error {
	err := ctx.closePage()
	if err != nil {
		return err
	}

	if ctx.browser == nil {
		return nil
	}

	err = ctx.browser.Close()
	if err != nil {
		return errors.Wrap(err, "close browser failed")
	}
	ctx.browser = nil
	return nil
}

func (ctx *Context) createPage(urls ...string) (*rod.Page, error) {
	page, err := ctx.browser.Page(proto.TargetCreateTarget{URL: strings.Join(urls, "/")})
	page.EvalOnNewDocument(js.InjectedSnapShot)
	if err != nil {
		return nil, errors.Wrap(err, "create page failed")
	}
	return page, nil
}

// Close the browser
// PS: This method only used because of server exit
func (ctx *Context) Close() error {
	ctx.stateLock.Lock()
	defer ctx.stateLock.Unlock()
	ctx.closeBrowser()
	return nil
}
