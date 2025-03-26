package types

type Config struct {
	ServerName     string `yaml:"serverName" json:"serverName"`
	ServerVersion  string
	BrowserBinPath string `yaml:"browserBinPath" json:"browserBinPath"`
	Headless       bool   `yaml:"headless" json:"headless"`
	BrowserTempDir string `yaml:"browserTempDir" json:"browserTempDir"`
	NoSandbox      bool   `yaml:"noSandbox" json:"noSandbox"`
	Proxy          string `yaml:"proxy" json:"proxy"`
}

var (
	DefaultBrowserTempDir = "./rod/browser"
	DefaultServerName     = "Rod Server"

	DefaultConfig = Config{
		BrowserBinPath: "",
		Headless:       false,
		BrowserTempDir: DefaultBrowserTempDir,
		NoSandbox:      false,
		Proxy:          "",
		ServerName:     DefaultServerName,
	}
)
