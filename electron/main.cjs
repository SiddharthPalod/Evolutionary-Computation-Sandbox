const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 850,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // In development, load the Vite dev server
    // In production, load the built index.html
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        win.loadURL("http://localhost:5173");
    } else {
        win.loadFile(path.join(__dirname, "../dist/index.html"));
    }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
