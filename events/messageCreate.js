const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // Load database
        const SETTINGS_FILE = './serverSettings.json';
        let settings = {};
        if (fs.existsSync(SETTINGS_FILE)) {
            settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        }
        
        const guildId = message.guild.id;
        const badWords = settings[guildId]?.badWords || [];
        const content = message.content.toLowerCase();

        // ==== FUNGSI PENGIRIM LOG AUTOMOD ====
        const sendAutoModLog = async (reason, originalContent) => {
            let logChannel;
            // Cari channel dari setingan modLogChannelId
            if (settings[guildId]?.modLogChannelId) {
                logChannel = message.guild.channels.cache.get(settings[guildId].modLogChannelId);
            }
            // Jika belum di-set, cari manual
            if (!logChannel) {
                logChannel = message.guild.channels.cache.find(c => c.name === 'haven-moderation' || c.name === 'moderation-logs' || c.name === 'mod-logs');
            }

            if (logChannel) {
                const now = new Date();
                const dateStr = `${now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

                // Buat ID Kasus
                if (!settings[guildId].caseCount) settings[guildId].caseCount = 0;
                settings[guildId].caseCount += 1;
                const caseId = settings[guildId].caseCount.toString().padStart(6, '0');
                fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));

                const logEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setAuthor({ name: `${message.author.username} | AutoMod`, iconURL: message.author.displayAvatarURL() })
                    .setDescription(
                        `**USER**\n${message.author} | ${message.author.username}\n` +
                        `**STAFF**\nAutoMod\n` +
                        `**REASON**\n${reason}\n` +
                        `**MESSAGE CONTENT**\n${originalContent}\n\n` +
                        `CASE ID: ${caseId} | ${dateStr}`
                    );

                await logChannel.send({ embeds: [logEmbed] });
            }
        };
        // =====================================
        
        // 1. Filter Kata Dinamis (Berdasarkan Database)
        if (badWords.length > 0) {
            const hasBadWord = badWords.some(word => content.includes(word.toLowerCase()));
            if (hasBadWord) {
                await message.delete().catch(() => {});
                const warningMsg = await message.channel.send(`⚠️ ${message.author}, please mind your language!`);
                setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
                
                // Kirim log ke channel moderation
                await sendAutoModLog('Triggered Word Filter', message.content);
                return; 
            }
        }

        // 2. Filter Link Spam
        const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        if (linkRegex.test(content) && !message.member.permissions.has('ManageMessages')) {
            await message.delete().catch(() => {});
            const warningMsg = await message.channel.send(`🔗 ${message.author}, sending links is not allowed in this server!`);
            setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
            
            // Kirim log ke channel moderation
            await sendAutoModLog('Posted a Link', message.content);
            return;
        }

        // 3. Filter Caps Lock Berlebihan
        if (message.content.length > 15) {
            const capsCount = message.content.replace(/[^A-Z]/g, '').length;
            const capsPercentage = (capsCount / message.content.length) * 100;
            if (capsPercentage > 70 && !message.member.permissions.has('ManageMessages')) {
                await message.delete().catch(() => {});
                const warningMsg = await message.channel.send(`🔠 ${message.author}, please turn off your Caps Lock!`);
                setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
                
                // Kirim log ke channel moderation
                await sendAutoModLog('Excessive Caps Lock', message.content);
                return;
            }
        }
    },
};
