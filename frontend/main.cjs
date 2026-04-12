// grabbing the tools needed to make a desktop window
const { app, BrowserWindow } = require('electron');

// setting up the actual app window
function createWindow() {
  const win = new BrowserWindow({
    // keeping it small and widget-like
    width: 380,       
    height: 700,      
    // the magic trick: keeps the cat floating over your other apps
    alwaysOnTop: true, 
    // hiding the ugly system menu (file, edit, view, etc.)
    autoHideMenuBar: true, 
    // locking the size so it doesn't get messed up
    resizable: false,  
  });

  // stuffing our react app into this desktop window
  win.loadURL('http://localhost:5173'); 
}

// boot it up when electron says it's ready
app.whenReady().then(createWindow);

// quit completely when all windows are closed (except on macs, because they're weird)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});