const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png')
  });

  // 加载HTML文件
  mainWindow.loadFile('mypdfreader.html');

  // 创建菜单
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '打开PDF',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('open-file-dialog');
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '全屏',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggledevtools' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: 'PDF阅读器 v1.0.0',
              detail: '一个简洁高效的PDF阅读器，支持云端同步。',
              buttons: ['确定']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // 打开开发者工具
  // mainWindow.webContents.openDevTools();
}

// 应用准备就绪
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 所有窗口关闭时退出
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC通信处理
// 选择文件夹
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 保存阅读历史
ipcMain.handle('save-reading-history', async (event, storagePath, data) => {
  try {
    const filePath = path.join(storagePath, 'reading-history.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error('保存阅读历史失败:', error);
    return { success: false, error: error.message };
  }
});

// 加载阅读历史
ipcMain.handle('load-reading-history', async (event, storagePath) => {
  try {
    const filePath = path.join(storagePath, 'reading-history.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('加载阅读历史失败:', error);
    return {};
  }
});
