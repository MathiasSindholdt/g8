const fs = require('fs');
module.exports ={
dmUser: async function sendDMToUsers(client, message, user ) {
    try {  
            const dmUser = await client.users.fetch(user);
            console.log(`Sending DM to ${dmUser.tag}`);
           await dmUser.send(message)
    } catch (error) {
        console.error(error);
    }
},

dmRole: async function sendDMRole(client, guildID, message, role) {
    const fetchedguild = await client.guilds.fetch(guildID);
    
    await fetchedguild.members.fetch()
    console.log(fetchedguild.members.cache.map(m=>m.user.tag))
    try {
        const roleToDM = fetchedguild.roles.cache.get(role);
        roleToDM.members.forEach(async member => {
            try {
                console.log(`Sending DM to ${member.user.tag}`);
                await member.send(message);
            } catch (dmError) {
                console.error(`Failed to send DM to ${member.user.tag}: ${dmError}`);
            }
        });

    } catch (error) {
        console.error(error);
    }

}
}

