package utils

import (
	"bytes"
	"math/rand"
	"text/template"
	"time"
)

func RandomString(length int) string {
	rand.Seed(time.Now().UnixNano())
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
	result := make([]rune, length)
	for i := range result {
		result[i] = letters[rand.Intn(len(letters))]
	}
	return string(result)
}

func ExecuteTemple(temple string, res any) (string, error) {
	var out bytes.Buffer
	tmpl, err := template.New("tpl").Parse(temple)
	if err != nil {
		return "", err
	}

	err = tmpl.Execute(&out, res)
	return out.String(), err
}
