<div align="center">

<h1>📋 WebToWord Copier</h1>

<h3>Select web content → Click → Paste into Word, perfectly formatted</h3>

<p>Math formulas · Code blocks · Tables · Headings — all rendered as native Word elements, no file download needed</p>

<img src="https://img.shields.io/badge/status-WIP%20🚧-orange?style=flat-square"/>
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square"/>
<img src="https://img.shields.io/github/stars/ZaraSheven/webtoword-copier?style=flat-square&color=yellow"/>
<img src="https://img.shields.io/github/license/ZaraSheven/webtoword-copier?style=flat-square"/>
<img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white"/>

<br/><br/>

<a href="./README.md">中文</a> · <a href="./README_EN.md">English</a>

</div>

---

> ⚠️ **This project is a work in progress. The core framework is implemented, but several important features are still missing.​**
>
> Due to limited personal time and capacity, I'm looking for developers to help complete it.
>
> If you find this project interesting, please consider giving it a ⭐

---

## 🤔 A Problem You've Definitely Faced

```
Copy from webpage  →  Paste into Word  →  💀 Everything breaks
```

- Math formulas become garbled text or blurry screenshots (which can't be edited)
- Code blocks lose monospace font and syntax highlight colors
- Tables collapse into scattered plain text
- Font sizes and line spacing are completely wrong

Existing tools either require downloading a `.docx` file (clunky) or rely on screenshots (not editable).

**None of them convert math formulas into native, editable Word equations.​**

**WebToWord Copier is trying to solve this.​**

---

## 💡 The Solution

WebToWord Copier is a Chrome extension with this core flow:

1. Detects text selection and shows a **floating action button**
2. Sends selected HTML to an **LLM API** for intelligent conversion
3. Writes the result as `text/html` to the system clipboard
4. `Ctrl+V` in Word renders everything natively — including **double-clickable OMML math formulas**

---

## ✅ What's Already Working

- [x] Floating button on text selection, one-click conversion
- [x] LLM-powered HTML → Word-friendly HTML conversion
- [x] Inline CSS styles (font, size, line spacing)
- [x] Code block syntax highlighting (VS Code Dark+ color scheme)
- [x] Tables with borders and padding
- [x] Math formulas → OMML (native Word equations, editable, not images)
- [x] 6 providers supported (OpenAI, DeepSeek, Gemini, Groq, OpenRouter, Custom)
- [x] Commercial-grade settings UI (provider cards, model chips, connection test)

---

## 🚧 What's Missing — We Need Your Help!

The following features are planned but not yet implemented. Feel free to claim one!

| Priority | Feature | Difficulty |
|:---:|---|:---:|
| 🔴 High | Mermaid / ECharts diagram → PNG embed | Medium |
| 🔴 High | Selected image → Base64 embed in Word | Easy |
| 🔴 High | Complex formula OMML conversion accuracy | Hard |
| 🟡 Med | Firefox & Edge port | Medium |
| 🟡 Med | Chrome Web Store packaging & submission | Easy |
| 🟡 Med | Dark mode for popup UI | Easy |
| 🟢 Low | Keyboard shortcut trigger (no mouse needed) | Easy |
| 🟢 Low | History panel (view past conversions) | Hard |
| 🟢 Low | Export to Google Docs support | Hard |

> 💬 Have other ideas? Feel free to [open a new Issue](../../issues/new)!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Chrome Extension               │
│                                             │
│  ┌─────────────────┐   ┌─────────────────┐  │
│  │ content_script  │   │  background.js  │  │
│  │                 │──▶│  (Service Worker)│  │
│  │ • Watch select  │   │  • Call LLM API │  │
│  │ • Show button   │◀──│  • Build Prompt │  │
│  │ • Write clipboard│  │  • Parse result │  │
│  └─────────────────┘   └─────────────────┘  │
│                                             │
│              ┌─────────────────┐            │
│              │  popup.html/js  │            │
│              │ • Pick provider │            │
│              │ • Pick model    │            │
│              │ • Enter API Key │            │
│              └─────────────────┘            │
└─────────────────────────────────────────────┘
         │ fetch()
         ▼
┌─────────────────────┐
│   LLM Provider API  │
│ OpenAI / DeepSeek   │
│ Gemini / Groq / ... │
└─────────────────────┘
         │ Word-friendly HTML (with OMML)
         ▼
┌─────────────────────┐
│   System Clipboard  │
│  (text/html MIME)   │
└─────────────────────┘
         │ Ctrl+V
         ▼
┌─────────────────────┐
│   Microsoft Word    │
│   Native rendering  │
└─────────────────────┘
```

---

## 📦 Installation (Developer Mode)

```bash
git clone https://github.com/ZaraSheven/webtoword-copier.git
```

Then in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked** → select the project folder
4. Click the **W** icon → enter your API Key → **Save**

---

## ⚙️ Supported Providers

| Provider | Base URL | Recommended Model |
|---|---|---|
| ⚡ OpenCode Zen | `https://opencode.ai/zen/go/v1` | `deepseek-v4-flash` |
| 🤖 OpenAI | `https://api.openai.com/v1` | `gpt-4o` |
| 🔍 DeepSeek | `https://api.deepseek.com/v1` | `deepseek-v4-flash` |
| ✨ Google Gemini | `https://generativelanguage.googleapis.com/v1beta` | `gemini-2.5-flash` |
| 🚀 Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| 🔀 OpenRouter | `https://openrouter.ai/api/v1` | `openai/gpt-4o` |
| 🔧 Custom | Your endpoint URL | Any OpenAI-compatible model |

---

## 📁 Project Structure

```
webtoword-copier/
├── manifest.json          # Chrome Extension config (Manifest V3)
├── background.js          # Service Worker — LLM API calls & prompt
├── content_script.js      # Page injection — selection & clipboard write
├── tooltip.css            # Floating button & toast styles
├── popup.html             # Settings UI (provider / model / API key)
├── popup.js               # Settings logic
├── CONTRIBUTING.md        # Contributor guide
├── LICENSE                # MIT License
├── README.md              # Chinese README
└── README_EN.md           # English README (this file)
```

---

## 🤝 Contributing

**I genuinely need help — this is not just a formality.​**

Whether you're an experienced Chrome extension developer, just starting with JavaScript, or a vibe coder, there's something in the task table for you.

### How to Contribute

```bash
# Step 1: Fork the repo, then clone your copy
git clone https://github.com/YOUR_USERNAME/webtoword-copier.git
cd webtoword-copier

# Step 2: Create a feature branch
git checkout -b feat/your-feature-name

# Step 3: Push and open a Pull Request
git push origin feat/your-feature-name
```

### Guidelines

- Comment "I'll take this" on an Issue before starting
- One feature or fix per PR
- Briefly describe what you changed and why in the PR body
- Attach a screenshot or GIF if you changed the UI

### Questions?

Post in [Discussions](../../discussions) or comment on any Issue — I'll reply as soon as I can.

---

## 🗺️ Roadmap

```
v0.1  ✅  Core copy-paste + LLM conversion
v0.2  ✅  Multi-provider support + commercial UI
v0.3  🔨  Diagram support + image embedding     ← current progress
v0.4  📋  OMML formula accuracy improvements
v0.5  📋  Firefox / Edge port
v1.0  📋  Chrome Web Store release
```

---

## 🙋 Looking for Co-maintainers

If you're interested in this project and have already contributed at least one PR,
feel free to reach out about becoming a Co-maintainer.

---

## 📄 License

[MIT](./LICENSE) © 2026 ZaraSheven

---

<div align="center">

**If this project is useful or interesting to you, please give it a ⭐​**<br/>
It helps more people discover the project and keeps me motivated to keep building.

<br/>

<a href="../../issues">🐛 Report Bug</a> ·
<a href="../../issues/new">✨ Request Feature</a> ·
<a href="../../discussions">💬 Discussions</a>

</div>
