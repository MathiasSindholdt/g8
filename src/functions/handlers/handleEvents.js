str = __dirname;
console.log(str);
srcdir = str.replace("\\functions\\handlers","");
const fs = require('fs');
const path = require('path');
str = __dirname;
module.exports = (client) => {
    client.handleEvents = async () => {
        const eventFolders = fs.readdirSync(srcdir + `\\events`);
        for (const folder of eventFolders) {
            const eventFiles = fs.readdirSync(srcdir + `\\events/${folder}`).filter(file => file.endsWith(".js"));
            switch (folder) {
                case "client":
                    for (const file of eventFiles) {
                        const event = require(srcdir + `\\events/${folder}/${file}`);
                        if(client.on) client.on(event.name, (...args) => event.execute(...args, client));
                        else client.on(event.name, (...args) => event.execute(...args, client));
                    }
                    break;
                default:
                    break;
            }
        }
   }
}
