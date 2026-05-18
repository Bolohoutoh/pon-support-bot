const path = require('path');

module.exports = {
    PREFIX: 'pon',
    SETTINGS_FILE: path.join(__dirname, 'serverSettings.json'),
    AFK_FILE: path.join(__dirname, 'afk.json'),
    EMOJIS_FILE: path.join(__dirname, 'emojis.json')
};
