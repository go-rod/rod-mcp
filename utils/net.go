package utils

import "strings"

func IsHttp(raw string) bool {
	return strings.HasPrefix(strings.TrimSpace(raw), "http://") || strings.HasPrefix(strings.TrimSpace(raw), "https://")
}
