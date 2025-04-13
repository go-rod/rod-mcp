package utils

import (
	"github.com/go-rod/rod"
	"github.com/go-rod/rod-mcp/types/js"
)

func QueryEleByAria(frame *rod.Page, selector string) (*rod.Element, error) {
	return frame.ElementByJS(
		rod.Eval(js.QueryEleByAria, selector),
	)
}
