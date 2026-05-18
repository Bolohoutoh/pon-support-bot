const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'cat',
    async executePrefix(message, args) {
        return this.sendCat(message, 'PREFIX');
    },
    async executeSlash(interaction) {
        return this.sendCat(interaction, 'SLASH');
    },

    async sendCat(ctx, type) {
        try {
            // Mengambil gambar dari API gratis TheCatAPI
            const response = await fetch('https://api.thecatapi.com/v1/images/search');
            const data = await response.json();
            const imageUrl = data[0].url;

            const embed = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle('🐱 Meow!')
                .setImage(imageUrl)
                .setFooter({ text: 'Pon Cutes' });

            if (type === 'SLASH') {
                return ctx.reply({ embeds: [embed] });
            } else {
                return ctx.channel.send({ embeds: [embed] }); // Mengirim pesan biasa tanpa reply
            }
        } catch (error) {
            console.error(error);
            const errorMsg = '❌ Waduh, sistem gagal menangkap gambar kucing. Coba lagi nanti wak!';
            if (type === 'SLASH') return ctx.reply({ content: errorMsg, ephemeral: true });
            else return ctx.channel.send({ content: errorMsg });
        }
    }
};
