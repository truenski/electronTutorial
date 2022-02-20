const { app, BrowserWindow, ipcMain, Menu, globalShortcut } = require('electron')
const path = require('path')
const os = require('os')

const isDev = process.env.NODE_ENV !== undefined &&
    process.env.NODE_ENV === "development" ?
    true : false;


const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        backgroundColor: "#aa97",
        icon: path.join(__dirname, 'assets/icons/icon.jpg'),

        //get preload.js
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),

            // apply node to front-end
            nodeIntegration: true,
            contextIsolation: false,
        },
    });


    win.loadFile('./src/index.html');
    if (isDev) {
        win.webContents.openDevTools();
    }

    //once = First time
    win.once('ready-to-show', () => {
        win.show();
        //send message to front-end
        win.webContents.send("cpu_name", os.cpus()[0].model);

        //empty array = empty menu
        const menuTemplate = [
            //pre-defined menu = role
            { role: 'fileMenu' },

            //creating Custom menu
            {
                label: "Window",
                submenu: [{
                    label: "New Window",
                    click: () => { createWindow() }
                }, { type: 'separator' }, {
                    label: 'Close all windows',
                    accelerator: 'CmdOrCtrl+e',
                    click: () => {
                        BrowserWindow.getAllWindows()
                            .forEach(window => window.close())
                    }
                }],
            }
        ];
        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);

    });
}



app.whenReady().then(() => {
    createWindow();

    //Shortcut to apply out of the window
    globalShortcut.register('CmdOrCtrl+d', () => {
        console.log('Bring window shortcut executed succesfully');
        BrowserWindow.getAllWindows()[0].setAlwaysOnTop(true);
        BrowserWindow.getAllWindows()[0].setAlwaysOnTop(false);

    })
})

//Important to unregister the global shortcuts before quit
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
})



//Terminate app when all windows closed (Windows & Linux)
//call app.quit() if the user is not on macOS (darwin)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// Open a window by clicking('activate') if none are open 
// macOS apps generally continue running even without any windows open, 
// and activating the app when no windows are available should open a new one.
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
});

//Main receiving message from front
ipcMain.on("open_new_window", () => { createWindow(); })