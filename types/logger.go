package types

import (
	"github.com/charmbracelet/log"
	"github.com/go-rod/rod-mcp/utils"
	"gopkg.in/natefinch/lumberjack.v2"
)

// LoggerConfig represents the configuration of the logger
type LoggerConfig struct {
	// Available logger level：
	// "fatal"
	// "error"
	// "warn"
	// "info"
	// "debug"
	LoggerLevel          string `yaml:"loggerLevel" json:"loggerLevel"`
	LoggerFileName       string `yaml:"loggerFileName" json:"loggerFileName"`
	LoggerFileMaxSize    int    `yaml:"LoggerFileMaxSize" json:"loggerFileMaxSize"`
	LoggerFileMaxBackups int    `yaml:"LoggerFileMaxBackups" json:"loggerFileMaxBackups"`
	LoggerFileMaxAge     int    `yaml:"LoggerFileMaxAge" json:"loggerFileMaxAge"`
	LoggerPrefix         string `yaml:"loggerPrefix" json:"loggerPrefix"`
}

var DefaultLoggerConfig = LoggerConfig{
	LoggerLevel:          "info",
	LoggerFileName:       "./log/server.log",
	LoggerFileMaxBackups: 5,
	LoggerFileMaxSize:    50,
	LoggerFileMaxAge:     30,
	LoggerPrefix:         "RodMCP 🦅",
}

// InitLogger init logger
func InitLogger(config LoggerConfig) {
	level, _ := log.ParseLevel(config.LoggerLevel)
	if config.LoggerLevel != "" {
		log.SetLevel(level)
	}
	log.SetTimeFormat(utils.DefaultTimeFormat)
	log.SetReportCaller(true)

	if config.LoggerFileName != "" {
		loggerFile := lumberjack.Logger{
			Filename:   config.LoggerFileName,
			MaxSize:    config.LoggerFileMaxSize,
			MaxAge:     config.LoggerFileMaxAge,
			MaxBackups: config.LoggerFileMaxBackups,
		}

		log.SetOutput(&loggerFile)

	}

	if config.LoggerPrefix != "" {
		log.SetPrefix(config.LoggerPrefix)
	} else {
		log.SetPrefix(DefaultLoggerConfig.LoggerPrefix)
	}
}
