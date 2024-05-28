require('./../.env')
const express = require('express');
const cron = require('node-cron');
const app = express();
app.use(express.json());
const { Client, Intents, Collection, GatewayIntentBits } = require("discord.js");
const fs = require('fs');
const lookUpUsernames = require('./functions/API/DiscordAPI/lookUpUsernames.js');
const sendDM = require('./functions/API/DiscordAPI/sendDM.js');
const trelloApi = require('./functions/API/Trello/trelloAPI.js');
const path = require('path');
const createRole = require('./functions/API/DiscordAPI/discordRoleFunction.js')
let guild;
const server = require("./../server.js");
const updateDiscordRole = require("./functions/API/DiscordAPI/updateDiscordRoles.js");
const { type } = require('os');
// Create a new client instance with guilds intent
const client = new Client({   intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers

] });

// Initialize commands as a new collection
client.commands = new Collection();

// Initialize commandsArray as an empty array
client.commandsArray = [];

// Read all the directories in the ./src/functions folder
const functionFolders = fs.readdirSync(__dirname + `/functions`);

// Loop through each folder in the functionFolders
for (const folder of functionFolders) {
    // Read all the .js files in the current folder
    const functionFiles = fs.readdirSync(__dirname + `/functions/${folder}`).filter(file => file.endsWith(".js"));
    
    // Loop through each file in the functionFiles
    for (const file of functionFiles)
    // Require (import) the file and call it as a function with client as an argument
require(__dirname + `/functions/${folder}/${file}`)(client);
}
client.once('ready', async() => {
    console.log('Bot is ready.');
    console.log('Guilds:', client.guilds.cache.map(guild => `${guild.name} (${guild.id})`));
    guild = client.guilds.cache.get(guildID);
    updateDiscordRole(guild);

    sourceChannel = client.channels.cache.get(sourceChannelQOTD);
    if (!sourceChannel) {
        console.error(`Source channel with ID ${sourceChannelQOTD} not found.`);
    }
    
    destinationChannel = client.channels.cache.get(destinationChannelQOTD);
    if (!destinationChannel) {
        console.error(`Destination channel with ID ${destinationChannelQOTD} not found.`);
    }    

    const filePath = '../config/discordRoles.json'; 

});


client.handleEvents();
client.handleCommands();
console.log(token); // remove before release
let updatedUserlist
module.exports = {
    userLookup: async function userLookup(users) {
        try {
            updatedUserlist = await lookUpUsernames(client, guildID, users);
        } catch (error) {
            console.error("Error during user lookup:", error);
            throw error;
        }
        return updatedUserlist;
    },
    roleCreate: async function roleCreate(roleName) {
        try {
            await createRole(roleName, client, guild);
        } catch (error) {
            console.error("Error during creating role:", error);
            throw error; 
        }
    },

    assignUserRole: async function assignUserRole(userId, roleId) {
        try {
            const role = await guild.roles.fetch(roleId);
            const member = await guild.members.fetch(userId);
            await member.roles.add(roleId);
            console.log(`Assigned role ${role.name} to user ${member}`);
        } catch (error) {
            console.error('Error assigning role:', error);
            throw error; 
        }
    },

    updateDiscordRoleInfo: async function updateDiscordRoleInfo() {
        try {
            await updateDiscordRole(guild);
        } catch (error) {
            console.error("Error updating role info:", error);
            throw error; 
        }
    },
    
    sendDiscMessage: function sendDiscMessage(message) {  
      destinationChannel.send(message);
    },
    sendDMUser: async function sendDMUser(message, user) {
        for (const userToDM of user) {
            await sendDM.dmUser(client, message, userToDM);
        }
    },
    
    sendDMRole: async function sendDMRole(message, role) {
        for(const roleToDM of role){
                console.log("sendDMRole" + roleToDM)
               await sendDM.dmRole(client, guildID, message, roleToDM)
        }
    },
    
    
}
client.login(token);


