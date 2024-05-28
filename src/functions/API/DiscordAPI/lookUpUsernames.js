const fs = require('fs').promises;
const path = require('path');
async function lookUpUsernames(client, guildId, users) {
    try {
        const guild = await client.guilds.fetch(guildId); 
        if (!guild) {
            console.error('Guild not found!');
            return users; 
        }
        for (const user of users) {
            const userId = user.discord;
            try {
                const member = await guild.members.fetch({ user: userId, force: true });
                user.DISCORD = member.user.username;
                user.roles = member.roles.cache.map(role => ({ id: role.id, name: role.name }));
            } catch (error) {
                console.error(`Failed to look up username and roles for user ID ${userId}:`, error);
                user.DISCORD = "Username fetch failed";
                user.roles = [];
            }
        }
    } catch (error) {
        console.error('Error occurred while fetching user data:', error);
    }
    return users;
}

module.exports = lookUpUsernames;
