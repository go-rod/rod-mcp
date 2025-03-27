package utils

import "time"

const (
	DefaultTimeFormat = "2006/01/02 15:04:05"
	DefaultDateFormat = "2006-01-02"
)

func GetChinaZoneTime(timeStr string) string {
	t, _ := time.Parse(time.RFC3339, timeStr)

	cst := t.In(time.FixedZone("CST", 8*3600))
	return cst.Format("2006-01-02 15:04:05")
}
