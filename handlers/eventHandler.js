const fs = require('fs');
const path = require('path');

/**
 * Memuat semua event handler dari folder events/.
 * Setiap file harus mengekspor { name, once?, execute }.
 */
function loadEvents(client) {
    const eventsPath = path.join(__dirname, '..', 'events');
    if (!fs.existsSync(eventsPath)) return;

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (!event || !event.name) continue;

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

module.exports = { loadEvents };
