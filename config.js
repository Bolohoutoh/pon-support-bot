const path = require('path');

module.exports = {
    PREFIX: 'pon',
    SETTINGS_FILE: path.join(__dirname, 'serverSettings.json'),
    AFK_FILE: path.join(__dirname, 'afk.json'),
    EMOJIS_FILE: path.join(__dirname, 'emojis.json'),
    COLORS: {
        default: '#2F3136',
        error: '#ED4245',
        success: '#77B255',
        warning: '#FEE75C'
    }
};
