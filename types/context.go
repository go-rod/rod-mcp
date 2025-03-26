package types

import (
	"context"
	"github.com/go-rod/rod"
)

type Context struct {
	StdContext context.Context
	Browser    *rod.Browser
	Page       *rod.Page
}
