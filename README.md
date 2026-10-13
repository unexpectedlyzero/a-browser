<div align="center">

# 🌐 a-browser

### A lightweight, minimal desktop web browser built with Electron.

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-informational)
![Built with](https://img.shields.io/badge/built%20with-Electron-47848F?logo=electron&logoColor=white)
![Styled with](https://img.shields.io/badge/styled%20with-TailwindCSS-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## ✨ About a-browser

**a-browser** is a custom desktop browser built from scratch using **Electron** and `WebContentsView`. It features a clean, minimal, frameless window design — complete with tab management, bookmarks, history, and in-page search (find in page), all wrapped in a UI built with **Tailwind CSS**.

This project is a great starting point for anyone who wants to build their own custom browser, learn Electron's multi-view architecture, or simply have a lightweight, fully customizable personal browser.

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| 🪟 **Frameless Window** | Custom title bar with its own minimize, maximize, and close controls |
| 📑 **Multi-Tab Browsing** | Open, switch, and close multiple tabs powered by `WebContentsView` |
| 🔍 **Smart Address Bar** | Type a URL directly or a keyword — automatically falls back to Google search |
| ⬅️➡️🔄 **Standard Navigation** | Back, forward, and reload, just like any regular browser |
| 🔎 **Find in Page** | Search text within a page using `Ctrl+F`, with live match-count highlighting |
| ⭐ **Bookmarks** | Save and manage favorite pages with a single star click |
| 🕘 **History** | Browsing history is automatically recorded and stored locally |
| 🔐 **Secure DNS (DoH)** | DNS resolution routed through Cloudflare DNS-over-HTTPS |
| 🎨 **Tailwind UI** | Modern, lightweight interface styled with Tailwind CDN |

---

## 🖼️ Preview

> 
>
> 
> ![a-browser screenshot](./assets/abcd.png)
>

---

## 🛠️ Tech Stack

- **[Electron](https://www.electronjs.org/)** — Core framework for the desktop app
- **`WebContentsView`** — Electron API used to render each tab independently from the main UI
- **Tailwind CSS (CDN)** — UI styling
- **Node.js `fs`** — Local storage for history and bookmarks in JSON format

---

## 📁 Project Structure

```
a-browser/
├── main.js          # Electron main process (window, tabs, IPC handlers)
├── index.html         # Browser UI (toolbar, tab bar, find bar, drawer)
├── package.json
└── assets/            # (optional) icons & screenshots
```

---

## ⚙️ Installation

Make sure **Node.js** and **npm** are installed on your system.

```bash
# 1. Clone the repository
git clone https://github.com/username/a-browser.git
cd a-browser

# 2. Install dependencies
npm install

# 3. Run the app
npm start
```

---

## 🎮 Usage

| Action | Shortcut / How |
|---|---|
| New tab | Click the `+` button next to the tab list |
| Close tab | Click the `×` on the active tab |
| Find in page | `Ctrl + F` |
| Back / Forward navigation | `Alt + ←` / `Alt + →` |
| Save bookmark | Click the `☆` icon in the toolbar |
| View history / bookmarks | Click the **History** / **Bookmarks** button in the toolbar |

---

## 🗺️ Roadmap

- [ ] Dark mode
- [ ] Extension / add-ons support
- [ ] Built-in ad-blocker
- [ ] Cloud bookmark sync
- [ ] Multi-window support
- [ ] Download manager

---

## ⚠️ Security Note

The app currently runs with `nodeIntegration: true` and `contextIsolation: false` on `BrowserWindow`, and ignores SSL certificate errors (`ignore-certificate-errors`). These settings make development easier but are **not recommended for a production release**, as they can introduce security vulnerabilities. Consider enabling `contextIsolation` and using a `preload script` with `contextBridge` before shipping the app publicly.

---

## 🤝 Contributing

Pull requests are very welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork this repository
2. Create a new branch (`git checkout -b new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin new-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

<div align="center">

Built with ❤️ using Electron

</div>
