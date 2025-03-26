package utils

import (
	"os"
	"path/filepath"
)

func PathExists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

func FileName(path string) string {
	_, file := filepath.Split(path)
	if file != "" {
		return file
	}
	return ""
}
