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

    const fs = require('fs');
    const distIndex = path.join(__dirname, "../dist/index.html");

    // If built, load local index.html directly; otherwise connect to dev server
    if (fs.existsSync(distIndex)) {
        win.loadFile(distIndex);
    } else {
        win.loadURL("http://localhost:5173");
    }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
