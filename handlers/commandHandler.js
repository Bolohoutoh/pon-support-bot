const fs = require('fs');
const path = require('path');

/**
 * Memuat semua command secara rekursif dari folder commands/ (termasuk subfolder).
 * Setiap file harus mengekspor object dengan property `name`.
 */
function loadCommands(client) {
    const commandsPath = path.join(__dirname, '..', 'commands');
    if (!fs.existsSync(commandsPath)) return;

    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                const command = require(fullPath);
                if (command && 'name' in command) {
                    client.commands.set(command.name, command);
                }
            }
        }
    };

    walk(commandsPath);
}

module.exports = { loadCommands };
