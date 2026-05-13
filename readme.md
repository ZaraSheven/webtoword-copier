<div align="center"> 
<h1>? WebToWord Copier</h1>

<h3>选中网页内容 → 点击 → 粘贴到 Word，格式完美保留</h3>
<p>数学公式 · 代码块 · 表格 · 标题 — 全部渲染为 Word 原生元素，无需下载文件</p>


> ?? **本项目正在开发中，核心框架已实现，但仍有若干重要特性尚未完成。?**  
> **WebToWord Copier** 仍然处于开发阶段，如果你对这个项目感兴趣，请不要吝啬你的 star ??。
> 由于鄙人能力有限，且目前时间上有冲突，但是这个功能对于我们friends非常有价值意义。
> 我正在寻找感兴趣的开发者一起把它做完！  
> 如果你想参与，请看下方的[贡献指南](#-参与贡献)。


---

## ? 这个问题你一定遇到过

```
从网页复制内容  →  粘贴到 Word  →  ? 格式全崩了，这就头大难绷住了。
```

- 数学公式变成乱码，或者只能截图（截图还不能编辑）
- 代码块丢失等宽字体和语法高亮颜色
- 表格变成一行行散乱的文字
- 字体大小和行间距完全错乱

现有工具要么需要下载 `.docx` 文件（操作繁琐），要么基于截图（无法编辑）。
**没有一个能把数学公式转成 Word 原生可编辑公式。?**
**符号块丢失格式，无法复制。?**
**原本的格式出现错误，或者格式无法完全保留，或者格式丢失。**
**WebToWord Copier** 尝试解决这个问题。

---

## ? 解决方案

WebToWord Copier 是一个 Chrome 扩展，核心流程：

1. 检测到文字选中后，自动显示**悬浮操作按钮**
2. 将选中的 HTML 发送给 **LLM API** 进行智能转换
3. 将结果以 **?`text/html`?** 写入系统剪贴板
4. 在 Word 中 `Ctrl+V`，所有内容原生渲染——包括**可双击编辑的 OMML 数学公式**

---

##  相关功能，已实现框架

- [??] 选中文字后显示悬浮按钮，点击一键转换
- [x] LLM 驱动的 HTML → Word 友好 HTML 转换
- [x] 内联 CSS 样式（字体、大小、行间距）
- [x] 代码块语法高亮（VS Code Dark+ 配色方案）
- [x] 表格带边框和内边距
- [x] 数学公式 → OMML（Word 原生公式，可编辑，不是图片）
- [x] 支持 6 家供应商（OpenAI、DeepSeek、Gemini、Groq、OpenRouter、自定义）
- [x] 商业级设置界面（供应商卡片、模型选择、连接测试）

---

## ? 还没做完的功能 — 需要你的帮助！

下面这些扩展功能我规划好了但还没实现。

| 优先级 | 功能描述 | 难度 |  |
|:---:|---|:---:|:---:|
| ? 高 | Mermaid / ECharts 图表 → PNG 内嵌 | 中 | |
| ? 高 | 选中图片 → Base64 内嵌到 Word | 低 |  |
| ? 高 | 复杂公式 OMML 转换精度提升 | 高 | |
| ? 中 | Firefox & Edge 移植 | |
| ? 中 | Chrome Web Store 打包上架 | 低 |  |
| ? 中 | 弹窗界面暗色模式 | 低 |  |
| ? 低 | 键盘快捷键触发（不用鼠标点击） |
| ? 低 | 历史记录面板（查看过去的转换） |
| ? 低 | 支持导出到 Google Docs | 高 |  |

> ? 有其他想法？欢迎[新建 Issue](../../issues/new) 来讨论！

---

## ?? 项目架构

```
┌─────────────────────────────────────────────┐
│               Chrome 扩展                   │
│                                             │
│  ┌─────────────────┐   ┌─────────────────┐  │
│  │ content_script  │   │  background.js  │  │
│  │                 │──?│  (Service Worker)│  │
│  │ ? 监听文字选中  │   │  ? 调用LLM API  │  │
│  │ ? 显示悬浮按钮  │?──│  ? 构建 Prompt  │  │
│  │ ? 写入剪贴板    │   │  ? 解析响应     │  │
│  └─────────────────┘   └─────────────────┘  │
│                                             │
│              ┌─────────────────┐            │
│              │  popup.html/js  │            │
│              │ ? 选择供应商    │            │
│              │ ? 选择模型      │            │
│              │ ? 填写 API Key  │            │
│              └─────────────────┘            │
└─────────────────────────────────────────────┘
         │ fetch()
         ▼
┌─────────────────────┐
│    LLM 供应商 API   │
│ OpenAI / DeepSeek   │
│ Gemini / Groq / ... │
└─────────────────────┘
         │ 返回 Word 友好 HTML（含 OMML）
         ▼
┌─────────────────────┐
│    系统剪贴板        │
│  (text/html MIME)   │
└─────────────────────┘
         │ Ctrl+V
         ▼
┌─────────────────────┐
│   Microsoft Word    │
│   原生格式渲染       │
└─────────────────────┘
```

---

## ? 安装方法（开发者模式）

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/webtoword-copier.git
```

然后在 Chrome 中：

1. 打开 `chrome://extensions`
2. 右上角开启**开发者模式**
3. 点击**加载已解压的扩展程序** → 选择项目文件夹
4. 点击工具栏的 **W** 图标 → 填入 API Key → **保存**

---

## ?? 支持的供应商，鄙人简单添加的还不够全面

| 供应商 | Base URL | 推荐模型 |
|---|---|---|
| ? OpenCode Zen | `https://opencode.ai/zen/go/v1` | `deepseek-v4-flash` |
| ? OpenAI | `https://api.openai.com/v1` | `gpt-4o` |
| ? DeepSeek | `https://api.deepseek.com/v1` | `deepseek-v4-flash` |
| ? Google Gemini | `https://generativelanguage.googleapis.com/v1beta` | `gemini-2.5-flash` |
| ? Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| ? OpenRouter | `https://openrouter.ai/api/v1` | `openai/gpt-4o` |
| ? 自定义 | 你的端点地址 | 任何 OpenAI 兼容模型 |

---

## ? 项目结构

```
webtoword-copier/
├── manifest.json          # Chrome 扩展配置（Manifest V3）
├── background.js          # Service Worker — LLM API 调用与 Prompt
├── content_script.js      # 页面注入 — 选区提取与剪贴板写入
├── tooltip.css            # 悬浮按钮与 Toast 提示样式
├── popup.html             # 设置界面（供应商 / 模型 / API Key）
├── popup.js               # 设置逻辑
├── CONTRIBUTING.md        # 贡献者指南
├── LICENSE                # MIT 开源协议
└── README.md
```

---

## ? 参与贡献

**我真的需要帮助——不是客套话。?**

无论你是经验丰富的 Chrome 插件开发者，还是刚开始学 JavaScript，亦或是vibe coding大家，上面的任务表里都有适合你的内容。

### 贡献流程

```bash
# 第一步：在 GitHub 上点击 Fork 按钮，然后克隆你的副本
git clone https://github.com/你的用户名/webtoword-copier.git
cd webtoword-copier


### 有问题？

在 [Discussions](../../discussions) 发帖，或在任意 Issue 下留言，我会尽快回复。

---

## ?? 版本路线图

```
v0.1  ?  核心复制粘贴 + LLM 转换
v0.2  ?  多供应商支持 + UI
v0.3  ?  图表支持 + 图片内嵌         ← 当前进度
v0.4  ?  OMML 公式精度优化
v0.5  ?  Firefox / Edge 移植
……

```

---

## ? 开源协议

[MIT](./LICENSE) ? 2026 YOUR_NAME

---

<div align="center">

**如果这个项目对你有帮助或者让你觉得有意思，请点一个 ??**  
这能帮助更多人发现这个项目，也是继续做下去最大的动力。
## ? 寻找共同维护者

如果你对这个项目感兴趣、并且已经贡献过至少一个 PR，
欢迎联系我成为共同维护者（Co-maintainer）。

