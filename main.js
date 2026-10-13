const { app, BrowserWindow, WebContentsView, ipcMain, session } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let views = {};
let activeTabId = null;
let isDrawerOpen = false;
let isFindBarOpen = false;

const TOOLBAR_HEIGHT = 100;
const FIND_BAR_HEIGHT = 42;
const DRAWER_WIDTH = 320;

// Bypass SSL and set Google/Cloudflare Secure DNS
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('dns-over-https-templates', 'https://cloudflare-dns.com/dns-query');
app.commandLine.appendSwitch('resolver-mode', 'secure');

const dataFile = path.join(app.getPath('userData'), 'browser-data.json');

function loadData() {
  if (fs.existsSync(dataFile)) {
    try {
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch {
      return { history: [], bookmarks: [] };
    }
  }
  return { history: [], bookmarks: [] };
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  // Window Controls
  ipcMain.on('window-min', () => mainWindow.minimize());
  ipcMain.on('window-max', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.on('window-close', () => mainWindow.close());

  // Data Handlers
  ipcMain.handle('get-data', () => loadData());

  ipcMain.on('add-history', (event, { url, title }) => {
    const data = loadData();
    // Avoid duplicate consecutive history entries
    if (data.history.length === 0 || data.history[0].url !== url) {
      data.history.unshift({ url, title, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      if (data.history.length > 150) data.history.pop();
      saveData(data);
    }
  });

  ipcMain.handle('toggle-bookmark', (event, { url, title }) => {
    const data = loadData();
    const index = data.bookmarks.findIndex(b => b.url === url);
    if (index >= 0) {
      data.bookmarks.splice(index, 1);
    } else {
      data.bookmarks.push({ url, title });
    }
    saveData(data);
    return index < 0;
  });

  // Tabs & Navigation
  ipcMain.on('create-tab', (event, { tabId, url }) => {
    const view = new WebContentsView();
    mainWindow.contentView.addChildView(view);
    views[tabId] = view;

    updateViewBounds(view);

    view.webContents.on('did-navigate', (e, navigationUrl) => {
      mainWindow.webContents.send('url-updated', { tabId, url: navigationUrl });
    });
    view.webContents.on('did-navigate-in-page', (e, navigationUrl) => {
      mainWindow.webContents.send('url-updated', { tabId, url: navigationUrl });
    });
    view.webContents.on('found-in-page', (e, result) => {
      mainWindow.webContents.send('find-result', { tabId, ...result });
    });

    let targetURL = url || 'https://www.google.com';
    if (!targetURL.startsWith('http://') && !targetURL.startsWith('https://')) {
      targetURL = 'https://' + targetURL;
    }
    view.webContents.loadURL(targetURL);
    setActiveTab(tabId);
  });

  ipcMain.on('switch-tab', (event, tabId) => setActiveTab(tabId));

  ipcMain.on('drawer-toggle', (event, isOpen) => {
    isDrawerOpen = Boolean(isOpen);
    if (activeTabId && views[activeTabId]) updateViewBounds(views[activeTabId]);
  });

  ipcMain.on('find-bar-toggle', (event, isOpen) => {
    isFindBarOpen = Boolean(isOpen);
    if (activeTabId && views[activeTabId]) updateViewBounds(views[activeTabId]);
  });

  ipcMain.on('find-in-page', (event, { tabId, text, forward = true, findNext = false }) => {
    const view = views[tabId];
    if (!view) return;
    if (!text) {
      view.webContents.stopFindInPage('clearSelection');
      mainWindow.webContents.send('find-result', { tabId, activeMatchOrdinal: 0, matches: 0 });
      return;
    }
    view.webContents.findInPage(text, { forward, findNext });
  });

  ipcMain.on('stop-find-in-page', (event, tabId) => {
    const view = views[tabId];
    if (view) view.webContents.stopFindInPage('clearSelection');
  });

  ipcMain.on('close-tab', (event, tabId) => {
    if (views[tabId]) {
      mainWindow.contentView.removeChildView(views[tabId]);
      views[tabId].webContents.destroy?.();
      delete views[tabId];
    }
  });

  ipcMain.on('navigate', (event, { tabId, url }) => {
    const view = views[tabId];
    if (view) {
      let targetURL = url;
      if (!targetURL.startsWith('http://') && !targetURL.startsWith('https://')) {
        if (!targetURL.includes('.') || targetURL.includes(' ')) {
          targetURL = `https://www.google.com/search?q=${encodeURIComponent(targetURL)}`;
        } else {
          targetURL = 'https://' + targetURL;
        }
      }
      view.webContents.loadURL(targetURL);
    }
  });

  ipcMain.on('nav-action', (event, { tabId, action }) => {
    const view = views[tabId];
    if (!view) return;
    if (action === 'back' && view.webContents.canGoBack()) view.webContents.goBack();
    if (action === 'forward' && view.webContents.canGoForward()) view.webContents.goForward();
    if (action === 'reload') view.webContents.reload();
  });

  mainWindow.on('resize', () => {
    if (activeTabId && views[activeTabId]) updateViewBounds(views[activeTabId]);
  });
});

function setActiveTab(tabId) {
  activeTabId = tabId;
  for (const id in views) {
    if (id === tabId) {
      mainWindow.contentView.addChildView(views[id]);
      updateViewBounds(views[id]);
    } else {
      mainWindow.contentView.removeChildView(views[id]);
    }
  }
}

function updateViewBounds(view) {
  const bounds = mainWindow.getBounds();
  const toolbarHeight = TOOLBAR_HEIGHT + (isFindBarOpen ? FIND_BAR_HEIGHT : 0);
  view.setBounds({
    x: 0,
    y: toolbarHeight,
    width: Math.max(0, bounds.width - (isDrawerOpen ? DRAWER_WIDTH : 0)),
    height: Math.max(0, bounds.height - toolbarHeight)
  });
}