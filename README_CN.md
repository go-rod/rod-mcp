# Rod MCP Server

<div align="center">

<img src="assets/logo2.png" alt="logo" width="400" height="400">


<strong>太棒了! 现在你可以使用 Rod 的 MCP 服务器了!🚀</strong>

<br>

<strong>Rod-MCP 通过使用 [Rod](https://github.com/go-rod/rod) 为您的应用程序提供浏览器自动化功能。该服务器提供了许多有用的 MCP 工具，使 LLMs 能够与网页进行交互，比如点击、截图、将页面保存为 PDF 等。</strong>

</div>

## 功能特性

- 🚀 基于 Rod 的浏览器自动化能力
- 🎯 支持多种网页交互操作
  - 点击元素
  - 截图
  - 保存页面为 PDF
  - 更多...
- 🎨 支持有头/无头模式运行
- ⚡ 高性能和稳定性
- 🔧 易于配置和扩展
- 🤖 专为 LLMs 设计的交互接口

## 安装

### 前置要求

- Go 1.23 或更高版本
- Chrome/Chromium 浏览器

### 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/go-rod/rod-mcp.git
cd rod-mcp
```

2. 安装依赖：
```bash
go mod tidy
```

3. 编译项目：
```bash
go build
```

## 使用方法

### 基本使用

1. 克隆仓库自行编译 或 [去直接下载二进制文件](https://github.com/go-rod/rod-mcp/releases)
2. 配置 MCP：
```json
{
    "mcpServers": {
        "rod-mcp": {
            "command": "rod-mcp",
            "args": [
                "-c", "rod-mcp.yaml"
            ]
        }
    }
}
```

### 配置说明

配置文件支持以下选项：
- serverName: 服务器名称，默认为 "Rod Server"
- browserBinPath: 浏览器可执行文件路径，留空使用系统默认浏览器
- headless: 是否使用无头模式运行浏览器，默认为 false
- browserTempDir: 浏览器临时文件目录，默认为 "./rod/browser"
- noSandbox: 是否禁用沙箱模式，默认为 false
- proxy: 代理服务器设置，支持 socks5 代理

## 项目结构

```
rod-mcp/
├── assets/          # 静态资源
├── banner/          # 横幅资源
├── cmd.go           # 命令行处理
├── main.go          # 程序入口
├── resources/       # 资源文件
├── server.go        # 服务器实现
├── tools/           # 工具实现
├── types/           # 类型定义
└── utils/           # 工具函数
```

## 贡献指南

欢迎提交 Pull Request 或创建 Issue！

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件
