const { Events } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // Load database untuk mengambil list filter kata
        const SETTINGS_FILE = './serverSettings.json';
        let settings = {};
        if (fs.existsSync(SETTINGS_FILE)) {
            settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        }
        
        // Ambil badWords dari database (jika belum ada, jadikan array kosong)
        const badWords = settings[message.guild.id]?.badWords || [];
        const content = message.content.toLowerCase();
        
        // 1. Filter Kata Dinamis (Berdasarkan Database)
        if (badWords.length > 0) {
            // Mengecek apakah pesan mengandung salah satu kata di database
            const hasBadWord = badWords.some(word => content.includes(word.toLowerCase()));
            if (hasBadWord) {
                await message.delete().catch(() => {});
                const warningMsg = await message.channel.send(`⚠️ ${message.author}, please mind your language!`);
                // Hilangkan pesan bot setelah 5 detik
                setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
                return; // Stop eksekusi agar tidak mendeteksi filter lain
            }
        }

        // 2. Filter Link Spam
        const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        if (linkRegex.test(content) && !message.member.permissions.has('ManageMessages')) {
            await message.delete().catch(() => {});
            const warningMsg = await message.channel.send(`🔗 ${message.author}, sending links is not allowed in this server!`);
            setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
            return;
        }

        // 3. Filter Caps Lock Berlebihan
        if (message.content.length > 15) {
            const capsCount = message.content.replace(/[^A-Z]/g, '').length;
            const capsPercentage = (capsCount / message.content.length) * 100;
            if (capsPercentage > 70) {
                await message.delete().catch(() => {});
                const warningMsg = await message.channel.send(`🔠 ${message.author}, please turn off your Caps Lock!`);
                setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
                return;
            }
        }
    },
};
