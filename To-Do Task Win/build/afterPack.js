const path = require('path');
const fs = require('fs');

exports.default = async function(context) {
    const appOutDir = context.appOutDir;

    // Remove heavy non-essential Chromium documentation / license files (saves ~20MB uncompressed)
    const candidates = [
        path.join(appOutDir, 'LICENSES.chromium.html'),
        path.join(appOutDir, 'LICENSE.electron.txt')
    ];

    for (const filePath of candidates) {
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`[afterPack] Removed non-essential file: ${path.basename(filePath)}`);
            } catch (err) {
                console.warn(`[afterPack] Could not remove ${filePath}:`, err.message);
            }
        }
    }
};
