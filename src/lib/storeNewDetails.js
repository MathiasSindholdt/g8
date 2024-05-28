async function storeNewUserDetails(userDetailsList, discordInput, username, DISCORD, trelloInput) {
    // Creating an object with the provided variables
    const user = {
        discord: discordInput,
        username: username,
        DISCORD: DISCORD,
        roles: [],
        trello: trelloInput
    };
    userDetailsList.push(user);
    dataIsDirty = true;
    await new Promise(resolve => setTimeout(resolve, 100));
    return
}

async function storeNewAutomationDetails(automationsList, title, users, type) {
    const automation = {
        Title: title,
        Users: users,
        Type: type
    };
    automationsList.push(automation);
    await new Promise(resolve => setTimeout(resolve, 100)); // Mock async operation, typically here you'd interact with a database
    return
}

module.exports = { storeNewUserDetails, storeNewAutomationDetails };