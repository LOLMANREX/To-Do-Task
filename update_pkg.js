const fs = require('fs');

const updatePackage = (pathStr, buildConfig, startScript) => {
    const pkg = JSON.parse(fs.readFileSync(pathStr));
    pkg.build = buildConfig;
    pkg.scripts.start = "electron .";
    pkg.scripts.pack = "electron-builder --dir";
    pkg.scripts.dist = "electron-builder";
    fs.writeFileSync(pathStr, JSON.stringify(pkg, null, 2));
};

updatePackage('./TO-Do Win/package.json', {
    "appId": "com.todo.win",
    "mac": { "category": "your.app.category.type" },
    "win": {
        "target": ["nsis"]
    },
    "files": [
        "index.js",
        "backend/**/*",
        "frontend/dist/**/*"
    ]
});

updatePackage('./To-Do linux/package.json', {
    "appId": "com.todo.linux",
    "linux": {
        "target": ["AppImage", "deb"]
    },
    "files": [
        "index.js",
        "backend/**/*",
        "frontend/dist/**/*"
    ]
});
