// const express = require('express');
const fs = require('fs');
const path = require('path');
const trello = require('./src/functions/API/Trello/trelloAPI.js')
const port = 3000;
let main = require("./src/main.js")
var discordBot = require('./src/bot.js');
const { Console } = require('console');
//const { storeNewUserDetails, storeNewAutomationDetails } = require("./src/lib/storeNewDetails.js");
let currentUserRoles;
let automationsList = JSON.parse(fs.readFileSync("../config/automationList.json")); // Store user data;
let userDetailsList = []
let dataIsDirty = false;
const intervalTimerForSavingDirtyData = 180000; // 3 minutes

async function loadData() {
    const filePath = path.join(__dirname, 'config', 'userList.json');
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        userDetailsList = JSON.parse(data);
    } catch (error) {
        console.error('Error loading user data:', error);
        userDetailsList = [];
    }
}
loadData();
async function saveDataIfDirty() {
    if (dataIsDirty) {
        console.log("Dirty Data saved")
        const filePath = path.join(__dirname, 'config', 'userList.json');
        try {
            await fs.promises.writeFile(filePath, JSON.stringify(userDetailsList, null, 2));
            dataIsDirty = false;
        }catch (error) {
            console.error('Error saving user data:', error);
        }
    }

}
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

function websitehandling(app, express){
    app.use(express.static('../Webpage')); // Serve static files from 'webpage' directory
    app.use(express.json());
    app.post('/addUser', async (req, res) => {
        try {
            const { username, discord, DISCORD, trello, github} = req.body;
            storeNewUserDetails(userDetailsList, discord, username, DISCORD, trello, github);
           // await saveDataIfDirty();
            updatedData = await discordBot.userLookup(userDetailsList);
            userDetailsList = updatedData;
            dataIsDirty = true;
            res.status(201).json({ message: 'User added and lookup initiated.' });
        } catch (err) {
            console.log("Error processing request:", err);
            res.status(500).json({ error: 'Failed to process the request.' });
        }
    });

    // Assuming the automationsList.json exists and is properly formatted.
    app.post('/addAutomation', async (req, res) => {
        const { Title, Users, Type } = req.body;
        const filePath = path.join(__dirname, 'config', 'automationList.json');
        try {
            await storeNewAutomationDetails(automationsList, Title, Users, Type);
            await fs.promises.writeFile(filePath, JSON.stringify(automationsList, null, 2));
            const updatedData = await fs.promises.readFile(filePath, 'utf8');
            const updatedDetailsList = JSON.parse(updatedData);
            automationsList = updatedDetailsList;
            console.log("Updated Automations List:", automationsList);
            res.status(201).json({ message: 'Automation added successfully.' });
        } catch (err) {
            console.error("Error processing request:", err);
            res.status(500).json({ error: 'Failed to process the request.' });
        }
    });
    
    // Endpoint to delete a user by username
    app.delete('/deleteUser/:username', (req, res) => {
        const username = req.params.username;
        const index = userDetailsList.findIndex(user => user.username === username);
        if (index !== -1) {
            userDetailsList.splice(index, 1); // Remove the user from userDetailsList
            dataIsDirty = true;
            res.status(200).json(userDetailsList); // Respond with the updated user list
        } else {
            return false;
        }
    });

    app.get('/users', async (req, res) => {
        res.send(JSON.stringify(userDetailsList));
    });
    
    app.get('/automations', (req, res) => {
        res.send(JSON.stringify(automationsList));
    });
    app.get('/roles', (req, res) => {
	    res.status(200).json(roles);
    });

    // app.listen(port, () => {
     //	console.log(`Server listening at http://localhost:${port}`);
    //});

    //tror ikke behøves
    app.use(express.text({ type: 'text/plain'}))

    app.post('/trello', async (req, res) => {
        const boardTitle = req.body.boardTitle;
        try {
            const response = await trello.findInfo(boardTitle);
            console.log("Trello response:")
            console.log(response);
            res.json(response); // Ensure this sends valid JSON
            console.log("Response sent successfully.");
        } catch (error) {
            console.error("Error during trello.findInfo:", error);
            res.status(500).send('Error processing your request');
        }
    });

    app.get('/discordRoles',async (req, res)=> {
        const filePath = path.join(__dirname, 'config', 'discordRoles.json')
        const updatedRoles = await fs.promises.readFile(filePath,'utf8')
        const filePath2 = path.join(__dirname, 'config', 'userList.json')
        currentUserRoles = await fs.promises.readFile(filePath2,'utf8')
        res.send((updatedRoles))
    })

    app.post('/DiscordAPI', async (req, res) => {
        const roleTitle = req.body.roleTitle;
        try {
            await discordBot.roleCreate(roleTitle);
            await discordBot.updateDiscordRoleInfo();
           // await discordBot.userLookup();
            res.status(201).send('Role created and updated successfully');
        } catch (error) {
            console.error("Error during role creation or update:", error);
            res.status(500).send('Error processing your request');
        }
    });
    

    app.post('/assignUserRole',async (req,res)=> {
        const selectedRole = req.body.selectedRole;
        const selectedUser = req.body.selectedUser;
        try {
            await  discordBot.assignUserRole(selectedUser, selectedRole),
            await  discordBot.userLookup(userDetailsList)
            dataIsDirty = true
            res.status(201).send('Role assigned successfully');
        } catch (error) {
        // error handling
        }
    })

    setInterval(() => {
        saveDataIfDirty();
    }, intervalTimerForSavingDirtyData);   

    app.post('/updateAutomationList', async (req, res) => {
        const automationData = req.body;
        console.log("--REQ BODY--")
        console.log(req.body)

        // Find if the automation exists in the list
        const existingIndex = automationsList.findIndex(automation => automation.id === automationData.id);
        if (existingIndex !== -1) {
        // If the automation exists, overwrite its data
        // ... weaves together 2 objs, overwriting any matching keys in the first obj with the second obj's values
            automationsList[existingIndex] = {
                ...automationsList[existingIndex],
                ...automationData
            };
        } else {
        // If the automation does not exist, add it to the list
            automationsList.push(automationData);
        }
        // Write the updated list to the file
        const filePath = path.join(__dirname, 'config', 'automationList.json');
        try {
            await fs.promises.writeFile(filePath, JSON.stringify(automationsList, null, 2));
            res.status(200).json({ message: 'Automations list updated successfully.' });
        } catch (error) {
            console.error("Error updating automations list:", error);
            res.status(500).json({ error: 'Failed to update automations list.' });
        }
    });
    
    app.get(`/config/automationList.json`, (req, res) => {
        res.send(JSON.stringify(automationsList));
    });
}    

function shutdownSaveData() {
    console.log('Shutting down, saving data...');
    saveDataIfDirty()
}

process.on('SIGINT', shutdownSaveData);
process.on('SIGTERM', shutdownSaveData);

module.exports={
    callwebsiteHandling: function callWebsiteHandling(app, express){
        websitehandling(app, express)
    },
    callSaveDataIfDirty: function callSaveDataIfDirty(){
        saveDataIfDirty()
    }
}


