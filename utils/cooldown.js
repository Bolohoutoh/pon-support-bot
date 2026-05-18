/**
 * Cooldown manager sederhana berbasis Map.
 * Mencegah spam command per user.
 */
const cooldowns = new Map();

/**
 * Cek apakah user sedang dalam cooldown.
 * @param {string} userId
 * @param {string} commandName
 * @param {number} seconds - durasi cooldown dalam detik
 * @returns {number|false} - sisa detik cooldown, atau false jika tidak dalam cooldown
 */
function checkCooldown(userId, commandName, seconds = 3) {
    const key = `${userId}-${commandName}`;
    const now = Date.now();
    const expiry = cooldowns.get(key);

    if (expiry && now < expiry) {
        return Math.ceil((expiry - now) / 1000);
    }

    cooldowns.set(key, now + (seconds * 1000));

    // Cleanup lama (setiap 100 entries, hapus yang expired)
    if (cooldowns.size > 100) {
        for (const [k, v] of cooldowns) {
            if (now > v) cooldowns.delete(k);
        }
    }

    return false;
}

module.exports = { checkCooldown };
