const {SlashCommandBuilder} = require ('discord.js');

module.exports = {
        data: new SlashCommandBuilder().setName('dm').setDescription('DMs the user the input')
        .addStringOption(option => option.setName('input').setDescription('The input to DM'))
        .addUserOption(option => option.setName('user').setDescription('The user to DM')),
        
       async execute(interaction, client) {
   const message = await interaction.deferReply({ 
    fetchReply: true,
    ephemeral: true
});

const newMessage = `${interaction.options.getString('input')}`;
await interaction.options.getUser('user').send(newMessage);
     await interaction.editReply({ 
        content: `Sent message to ${interaction.options.getUser('user').username}`
    });
}
}