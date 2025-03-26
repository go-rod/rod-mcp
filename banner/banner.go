package banner

import (
	"fmt"
	"github.com/charmbracelet/lipgloss"
	"github.com/go-rod/rod-mcp/utils"
	"runtime"
)

var banner = fmt.Sprintf(`
██████╗  ██████╗ ██████╗     ███╗   ███╗ ██████╗██████╗ 
██╔══██╗██╔═══██╗██╔══██╗    ████╗ ████║██╔════╝██╔══██╗
██████╔╝██║   ██║██║  ██║    ██╔████╔██║██║     ██████╔╝
██╔══██╗██║   ██║██║  ██║    ██║╚██╔╝██║██║     ██╔═══╝ 
██║  ██║╚██████╔╝██████╔╝    ██║ ╚═╝ ██║╚██████╗██║     
╚═╝  ╚═╝ ╚═════╝ ╚═════╝     ╚═╝     ╚═╝ ╚═════╝╚═╝     

[Rod MCP %s Release]
Go Rod Team
Build: [%s] [%s]

`, Version, Build, localTime)

var (
	Version   = ""
	BuildTime = ""
	localTime = utils.GetChinaZoneTime(BuildTime)
	style     = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#30c3e6"))
	Build = fmt.Sprintf("%s/%s", runtime.GOOS, runtime.GOARCH)
)

func ShowBanner() string {
	return style.Render(banner)
}
