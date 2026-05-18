const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'meme',
    async executePrefix(message, args) {
        return this.sendMeme(message, 'PREFIX');
    },
    async executeSlash(interaction) {
        return this.sendMeme(interaction, 'SLASH');
    },

    async sendMeme(ctx, type) {
        try {
            // Mengambil meme acak dari Meme API (sumber: Reddit)
            const response = await fetch('https://meme-api.com/gimme', { signal: AbortSignal.timeout(8000) });
            const data = await response.json();

            const embed = new EmbedBuilder()
                .setColor('#2F3136') // Warna transparan dark mode
                .setTitle(data.title || '🤣 Random Meme')
                .setURL(data.postLink || 'https://reddit.com')
                .setImage(data.url)
                .setFooter({ text: `Dari r/${data.subreddit} • 👍 ${data.ups || 0} Upvotes` });

            if (type === 'SLASH') {
                return ctx.reply({ embeds: [embed] });
            } else {
                return ctx.channel.send({ embeds: [embed] }); // Kirim tanpa reply
            }
        } catch (error) {
            console.error(error);
            const errorMsg = '❌ Waduh, sistem gagal menangkap meme kocak. Coba lagi nanti wak!';
            if (type === 'SLASH') return ctx.reply({ content: errorMsg, ephemeral: true });
            else return ctx.channel.send({ content: errorMsg });
        }
    }
};
