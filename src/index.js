// Main File for Wisp

// OS operations go exclusively here.

const { app, BrowserWindow } = require('electron');

// electron-forge shanannigan
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}
let mainWindow = null;

app.on('ready', () => {
  mainWindow = new BrowserWindow({

    webPreferences: {
      // This enables require on HTML file.
      nodeIntegration: true
    },
    width: 700, height: 860,
    show: false,

    // Fix blurry fonts on electron, known limitation.
    backgroundColor: '#FFF'
  });

  // Tells the window to take up all desktop space:
  //mainWindow.maximize()

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Trick to avoid showing blank screen at start-up:
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
