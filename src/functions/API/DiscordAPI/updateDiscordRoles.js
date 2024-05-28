
const fs = require('fs');
const filePath = '../config/discordRoles.json';

async function updateDiscordRoles(guild){
    try {
    const rolesInGuild = await guild.roles.fetch();
    const rolesData = rolesInGuild.map(role => {
        return { roleId: role.id, roleName: role.name };
    });
    await fs.promises.writeFile(filePath, JSON.stringify(rolesData, null, 2), 'utf8')
    rolesInGuild.forEach(role => console.log(role.name));
    } catch (error) {
    console.error('Failed to fetch roles:', error);
    }
}

module.exports = updateDiscordRoles;