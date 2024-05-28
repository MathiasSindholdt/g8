const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
require('../../../.env')
const fs = require ('fs');
const path = require('path')
str = __dirname;

srcdir = str.replace("/functions/handlers","");
module.exports = (client) => {
    client.handleCommands = async (message) => {
        // Read all the directories in the ./src/commands folder
        const commandFolders = fs.readdirSync(srcdir + `/commands`);
        
        // Loop through each folder in the commandFolders
        for (const folder of commandFolders) {
            // Read all the .js files in the current folder
            const commandFiles = fs.readdirSync(srcdir + `/commands/${folder}`).filter(file=>file.endsWith(".js"));

            // Destructure commands and commandsArray from client
            const {commands, commandsArray} = client;
            
            // Loop through each file in the commandFiles
            for(const files of commandFiles) {
                // Require (import) the file
                const command = require(srcdir + `/commands/${folder}/${files}`);
                
                // Set the command in the commands collection with its name as the key
                commands.set(command.data.name,command);
                
                // Push the command and its JSON representation to the commandsArray
                commandsArray.push(command.data.toJSON());
                
                // Log that the command has been passed through the handler
                console.log(`Command ${command.data.name} has been passed trough handler`)
            }
        }
       
        const discordtoken = token;

       

        const rest = new REST({version: '9'}).setToken(discordtoken);
        try {
            console.log('Started refreshing application (/) commands.');
            await rest.put(Routes.applicationGuildCommands(clientID, guildID),
                {
                    body: client.commandsArray,
                }
            );
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    }
}
