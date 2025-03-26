package types

import (
	"context"
	"fmt"
	"github.com/go-rod/rod"
	"github.com/go-rod/rod-mcp/utils"
	"github.com/go-rod/rod/lib/launcher"
	"github.com/go-rod/rod/lib/proto"
	"github.com/pkg/errors"
	"strings"
	"sync"
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

type Context struct {
	stdContext  context.Context
	config      Config
	browser     *rod.Browser
	Page        *rod.Page
	initialOnce sync.Once
}

func NewContext(ctx context.Context, cfg Config) *Context {
	return &Context{
		stdContext: ctx,
		config:     cfg,
	}
}

func (ctx *Context) EnsurePage() (*rod.Page, error) {
	if err := ctx.initial(); err != nil {
		return nil, err
	}
	return ctx.Page, nil

}

func (ctx *Context) initial() error {
	var err error
	ctx.initialOnce.Do(func() {
		ctx.browser, err = launchBrowser(ctx.stdContext, ctx.config)
		if err != nil {
			return
		}
		ctx.Page, err = ctx.createPage()
		if err != nil {
			return
		}
	})
	return err

}

func (ctx *Context) createPage(urls ...string) (*rod.Page, error) {
	page, err := ctx.browser.Page(proto.TargetCreateTarget{URL: strings.Join(urls, "/")})
	if err != nil {
		return nil, errors.Wrap(err, "create page failed")
	}
	return page, nil
}
