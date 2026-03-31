const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 380,       
    height: 700,      
    alwaysOnTop: true, 
    autoHideMenuBar: true, 
    resizable: false,  
  });

  win.loadURL('http://localhost:5173'); 
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});