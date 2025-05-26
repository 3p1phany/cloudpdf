const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API到渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 选择文件夹
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  // 保存阅读历史
  saveReadingHistory: (storagePath, data) => 
    ipcRenderer.invoke('save-reading-history', storagePath, data),
  
  // 加载阅读历史
  loadReadingHistory: (storagePath) => 
    ipcRenderer.invoke('load-reading-history', storagePath),
  
  // 监听打开文件对话框
  onOpenFileDialog: (callback) => {
    ipcRenderer.on('open-file-dialog', callback);
  }
});
