package types

type Config struct {
	BrowserBinPath string `yaml:"browserBinPath" json:"browserBinPath"`
	Headless       bool   `yaml:"headless" json:"headless"`
	BrowserTempDir string `yaml:"browserTempDir" json:"browserTempDir"`
	NoSandbox      bool   `yaml:"noSandbox" json:"noSandbox"`
	Proxy          string `yaml:"proxy" json:"proxy"`
}

var (
	DefaultBrowserTempDir = "./rod/browser"

	DefaultConfig = Config{
		BrowserBinPath: "",
		Headless:       false,
		BrowserTempDir: DefaultBrowserTempDir,
		NoSandbox:      false,
		Proxy:          "",
	}
)
