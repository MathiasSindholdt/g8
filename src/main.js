// start up of framework
console.log(`Current directory: ${process.cwd()}`);
//require('dotenv').config({path: '../.env'});
const cron = require('node-cron');
require('path')
const express = require("express")
const fs = require('fs');

const {githubResponse, trelloResponse, message} = require('./lib/classes.js')
const {queueSorting} = require('./lib/queueSorting.js')
const {getDateTime} = require('./lib/getDateTime.js')
const {renameCardInJsonFile} = require('./lib/renameCardInJsonFile.js')

let QueueIndex = 0;
let Queue = [];
let returnedActors = []
let multipleActors = []
let actor
let actorQueue = []
let trelloPrio 
let github = false
const server = require("./../server.js")
const app = express();
// background processes
const githubWebhook = require('./functions/API/Github/github.js');
const discordBot = require('./bot.js');
var trelloApi = require('./functions/API/Trello/trelloAPI.js');
const { Client, Intents, Collection, GatewayIntentBits } = require("discord.js");
const path = require('path');

const { arch } = require('os');
const { timeout } = require('cron');
let queueFilePath = ('../config/Queue.json')
let Pull;
app.listen(PORT, () => {
    console.log(`xWebhook server is running on port ${PORT}`);
});

cron.schedule('0 12 * * *', async() => {
	await populateQueueArrays()
	queueSorting(Queue, actorQueue)
	await queueHandling()
	cleanQueueJSON()
   k = 1
   Queue = []
   QueueIndex = 0
   actorQueue = []
});

cron.schedule('0 18 * * *', async() => {
  	await populateQueueArrays()
	queueSorting(Queue, actorQueue)
	await queueHandling()
	cleanQueueJSON()
   k = 1
   Queue = []
   QueueIndex = 0
   actorQueue = []
});


let messageToSend

function cleanQueueJSON(){
	console.log("Cleaning queue")
	fs.writeFileSync(queueFilePath, JSON.stringify([], null, 2));
}
async function sendQueueOnShutdown(){
	console.log("Sending queue on shutdown")
	await populateQueueArrays()
	queueSorting(Queue, actorQueue)
	await queueHandling()
	cleanQueueJSON()
   k = 1
   Queue = []
   QueueIndex = 0
   actorQueue = []
}




async function populateQueueArrays() {
    try {
    
        const data =  await fs.promises.readFile(queueFilePath, 'utf-8');

        const queueData = JSON.parse(data);
        
			console.log("Queue data: " )
			console.log(queueData)
        // Hiver beskederne og actors ud af det data vi har læst fra filen
         Queue = queueData.map(item => item.message);
         actorQueue = queueData.map(item => item.actors);
		 
        console.log('Queue:', Queue);
        console.log('actorQueue:', actorQueue);
    } catch (err) {
        console.error('Error reading JSON file:', err);
    }
}


//UNCOMMENT THIS TO TEST THE QUEUE

// async function test(){
// 	await populateQueueArrays()
// 	queueSorting(Queue, actorQueue)
// 	await queueHandling()
// 	cleanQueueJSON()
//    k = 1
//    Queue = []
//    QueueIndex = 0
//    actorQueue = []
// }



// setInterval(() => {
// test()
// }, 120000);



async function queueHandling() {
    let i = 0; 
    for (const index of actorQueue) {
        console.log("Index " + i + " of actorQueue");
		console.log("Index: ")
		console.log(index)
	    if (index[0].length > 0) {
            console.log("sending dm to user");
			if(Queue[i].actors[0].length > 0){
				console.log(Queue[i].actors[0])
				const messageToSend = queueMessageFormatter(Queue[i], Queue[i].actors[0], Queue[i].actors[1]);
				await discordBot.sendDMUser(messageToSend, index[0]);
			}					
        } 
        if (index[1].length > 0) {
            console.log("sending dm to role");
			if(Queue[i].actors[1].length > 0){
				const messageToSend = queueMessageFormatter(Queue[i], Queue[i].actors[0],Queue[i].actors[1]);
				console.log("IM SENDING THIS MESSAGE: " + messageToSend);
               	await discordBot.sendDMRole(messageToSend, index[1]);
			}
		}
		i++; 
    }
}




const client = new Client({ intents: GatewayIntentBits.Guilds});
const githubChannel = client.channels.cache.get(destinationChannelGIT);
gr = new githubResponse();


app.use(githubWebhook(express, app, gr => {				
	if(gr.event === 'push'){
		trelloApi.githubIntegrations("Commit",gr.commitMessage)
	}
	
	if( gr.event === 'pull_request'){
		console.log(gr.pullRequestMessage+ "\n" + gr.action)
			if (gr.action === 'closed' && gr.closeMerge === null) {
				console.log("Pull request denied")
				let status = "Denied"
				console.log(gr.reviwerName)
				m = new message();
				m.action = gr.event
				m.time = getDateTime()
				m.message = "Pull request " + gr.pullRequestTitle + " was denied by " + gr.reviwerName  + "\n" + gr.pullRequestUrl

				if(gr.pullRequestMessage.includes("!0")){m.priority = 0

				}
				else if(gr.pullRequestMessage.includes("!1")){m.priority = 1}
				else if(gr.pullRequestMessage.includes("!2")){m.priority = 2}
				else if(gr.pullRequestMessage.includes("!3")){m.priority = 3}
				else{m.priority = 3}
				github = true
				actorQueue[QueueIndex] = []
				Queue[QueueIndex] = m;
				QueueIndex++
				trelloApi.githubIntegrations(status, gr.pullRequestMessage)
				   
				}else if (gr.action === 'closed' && gr.closeMerge != null) {
					let status = "Accepted"
					console.log("Pull request accepted")
					m = new message();
					m.action = gr.event
					m.time = getDateTime()
					m.message = "Pull request " + gr.pullRequestTitle + " was accepted by " + gr.reviwerName  + "\n " + gr.pullRequestUrl
					if(gr.pullRequestMessage.includes("!0")){m.priority = 0}
					else if(gr.pullRequestMessage.includes("!1")){m.priority = 1}
					else if(gr.pullRequestMessage.includes("!2")){m.priority = 2}
					else if(gr.pullRequestMessage.includes("!3")){m.priority = 3}
				    else{m.priority = 3}
					github = true
				    actorQueue[QueueIndex] = []
				    Queue[QueueIndex] = m;
				    QueueIndex++
				    trelloApi.githubIntegrations(status, gr.pullRequestMessage)
				}else if (gr.action === 'opened'|| gr.action === 'reopened'){
					let status = "Opened"
					m = new message();
					m.action = gr.event
					m.time = getDateTime()
					m.message = "Pull request " + gr.pullRequestTitle + " was opened by " + gr.pullRequestAuthor + "\n: " + gr.pullRequestMessage  + "\n" + gr.pullRequestUrl
					
					if(gr.pullRequestMessage.includes("!0")){m.priority = 0}
					else if(gr.pullRequestMessage.includes("!1")){m.priority = 1}
					else if(gr.pullRequestMessage.includes("!2")){m.priority = 2}
					else if(gr.pullRequestMessage.includes("!3")){m.priority = 3}
					else{m.priority = 3}
					github = true
					actorQueue[QueueIndex] = []
					Queue[QueueIndex] = m;
				    QueueIndex++
				    trelloApi.githubIntegrations(status, gr.pullRequestMessage)
			       }
			   }
			}
		),
	);
// server.websitehandling(app)

server.callwebsiteHandling(app,express)
const filePath = ('../config/automationList.json');
const moreFilePath = ('../config/userList.json')



function trelloCompare(trelloName){
	const trelloData = JSON.parse(fs.readFileSync(moreFilePath, 'utf-8'));
	const trelloToFind = trelloData.find(user => user.trello === trelloName)
	const trelloUserName = trelloToFind.username
	const trelloDiscordID = trelloToFind.discord
	const trelloUser = { username: trelloUserName, discord: trelloDiscordID }
	return trelloUser	
}

 function findActors(automationCardName, newTrelloUser ){

	 
	 multipleActors = []
	 const usersData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
	 const cardToFind = usersData.find(cardData => cardData.name === automationCardName);

	 
	if(typeof newTrelloUser !== 'undefined'){

			console.log("checking if user exist")
			const userExists = cardToFind.selectedUsers.some(user => user.username === newTrelloUser.username)
			if(!userExists){
				console.log("added new user from trello")
				cardToFind.selectedUsers.push(newTrelloUser)
				fs.writeFileSync(filePath, JSON.stringify(usersData, null, 2));
			}else{
				console.log("user was already in automation list")
			}
		}
		console.log("Finding actors for automation card: " + automationCardName)
	const rolesToTag = cardToFind.selectedRoles.map(selectedRole => `${selectedRole.roleId}`)
	const usersToTag = cardToFind.selectedUsers.map(selectedUser => `${selectedUser.discord}`)
	if(rolesToTag && !usersToTag){
		return rolesToTag
	}
	
	if(usersToTag && !rolesToTag){
		return  usersToTag
	}
	
	if(usersToTag && rolesToTag){
		multipleActors.push(usersToTag)
		multipleActors.push(rolesToTag)
		return multipleActors
	}
}
let dueDate
function dueDatePrio(automationCardName){
	dueDate = readDueDateFromFile(automationCardName)
	if(dueDate === "No due date"){
		return 3
	}
	console.log("Current due date: " + dueDate)
	const currentDate = new Date().toISOString().split('T')[0];
	const timeUntilDueDay = Math.floor((new Date(dueDate) - new Date(currentDate)) / (1000 * 60 * 60 * 24));
	console.log("Time until due day: " + timeUntilDueDay)

	if (timeUntilDueDay <= 1) {
		console.log("Due date is in less than 1 day")
		return 0;
	} else if (timeUntilDueDay <= 2 && timeUntilDueDay > 1) {
		console.log("Due date is in less than 2 days")
		return 1;
	} else if (timeUntilDueDay <= 3 && timeUntilDueDay > 2) {
		console.log("Due date is in less than 3 days")
		return 2;
	} else if (timeUntilDueDay <= 6 && timeUntilDueDay > 3) {
		console.log("Due date is more than 6 days away")
		return 3;
	}else{
		return 3;
	}
}
function readDueDateFromFile(automationCardName){
	const usersData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
	const cardToFind = usersData.find(cardData => cardData.name === automationCardName);
	if (cardToFind.dueDate === undefined) {
		console.log("Card does not contain a due date")
		return "No due date";
	}
	const dueDate = cardToFind.dueDate.map(dueDate => dueDate.Date);
	console.log(dueDate)

		return dueDate
}

function findAndAssignDueDate(automationCardName, dueDate, userTimezone) {
	console.log("finding due date")
    const usersData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let cardToFind = usersData.find(cardData => cardData.name === automationCardName);
    
    // Parse the input date string
    const parsedDate = new Date(dueDate);
	
    // Get the current UTC time
    const currentUTCTime = new Date().toUTCString();
	console.log(currentUTCTime)
    // Calculate the difference in hours between UTC and the user's timezone
    const timezoneOffsetHours = -1 * (new Date(currentUTCTime).getTimezoneOffset()) / 60;
	
    // Adjust the time to fit the user's timezone
    parsedDate.setHours(parsedDate.getHours() + timezoneOffsetHours);

    // Format the date and time as desired	
    const formattedDueDate = {
        Date: parsedDate.toISOString().split('T')[0], // Extract date portion
        Time: parsedDate.toISOString().split('T')[1].split('.')[0] // Extract time portion and remove milliseconds
    };

    // Include the group with timezone information
    const group = `UTC ${timezoneOffsetHours >= 0 ? '+' : '-'} ${Math.abs(timezoneOffsetHours)}`;
    formattedDueDate.Group = group;
	console.log(formattedDueDate)
    // Update dueDate property of the card
    cardToFind.dueDate = [formattedDueDate]; // Store in an array as requested
	console.log(cardToFind.dueDate)
	
    // Write updated data back to the JSON file
    fs.writeFileSync(filePath, JSON.stringify(usersData, null, 2));
}
function removedueDate(automationCardName){
	const usersData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
	const cardToFind = usersData.find(cardData => cardData.name === automationCardName);
	cardToFind.dueDate = []
	fs.writeFileSync(filePath, JSON.stringify(usersData, null, 2));
}
function combineQueues(Queue, actorQueue) {
    let combinedQueue = [];
    for (let i = 0; i < Queue.length; i++) {
        let message = Queue[i];
		console.log("Message: " )
		console.log(message)
        let actors = actorQueue[i] || []; // If actorQueue[i] is undefined, use an empty array
        if (message && actors.length >= 0) { // Check if both message and actors exist
            combinedQueue.push({
                message: message,
                actors: actors
            });
        }
    }
	console.log("Combined queue: ")
	console.log(combinedQueue)
    return combinedQueue;
}

async function writeQueuesTOJSON(){
	//This combines the two global queues, containing the messages and the actors
	let comboQueue = combineQueues(Queue, actorQueue)
	try { //Attempting to write the combinedQueue to the queue JSON
		console.log("Trying to write to JSON file")
		console.log(comboQueue)
		console.log(comboQueue[0].message)
		//Reads the JSON file to put the data into the currentData list
		let currentData = [];
        try {
            const fileContent = await fs.promises.readFile(queueFilePath, 'utf-8');
            if (fileContent) {
                currentData = JSON.parse(fileContent);
            }
        } catch (err) {
			console.error('Error reading the file:', err);
		}
		//This pushes and overwrites any changes and adds new messages to the currentData queue
		currentData.push(...comboQueue); 
		console.log("Check for prio messages")
		//This detects if a priority message is present and sends it immediately if it is
		for(let prioMessages of currentData){
			console.log(prioMessages.message.actors)
			if(prioMessages.message.priority == 0){
					console.log("Priority Message Present")
					//Checks if any users need to be notified
					if(prioMessages.actors[0].length > 0){
						messageToSend = queueMessageFormatter(prioMessages.message, 
							prioMessages.message.actors[0], prioMessages.message.actors[1])
							await discordBot.sendDMUser(messageToSend, prioMessages.actors[0])
						actorQueue = []
						Queue = []
					}
					//Checks if any roles need to be notified
					if(prioMessages.actors[1].length > 0){
						messageToSend = queueMessageFormatter(prioMessages.message, 
							prioMessages.message.actors[0], prioMessages.message.actors[1])
						await discordBot.sendDMRole(messageToSend, prioMessages.actors[1])
						actorQueue = []
						Queue = []
					}
					//It returns after a priority message so these are not added to the currentData
				return
			}
		}
		//After all these checks and additions, currentData is written in full to the JSON file
        await fs.promises.writeFile(queueFilePath, JSON.stringify(currentData, null, 2))
	} catch (err) {
		console.error('Error writing the file:', err);
	}
	//Queues are now emptied for next usage
	actorQueue = []
	Queue = []
}

function findActorUsername(automationCardName){
console.log(automationCardName)
	 
	multipleActors = []
	const usersData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
	const cardToFind = usersData.find(cardData => cardData.name === automationCardName);

	console.log("Finding Usernames for automation card: " + automationCardName)
	
   const roleUsername = cardToFind.selectedRoles.map(selectedRole => `${selectedRole.roleName}`)
   const userUsername = cardToFind.selectedUsers.map(selectedUser => `${selectedUser.username}`)

   if(roleUsername && !userUsername){
	   //console.log("sending dm to roles")
	   return roleUsername
   }
   
   if(userUsername && !roleUsername){
	   //console.log("sending dm to users")
	   return  userUsername
   }
   
   if(userUsername && roleUsername){
	   multipleActors.push(userUsername)
	   multipleActors.push(roleUsername)
	   //	console.log("sending dm to users and roles")
	   return multipleActors
   }
}


let actorUsernames
tr = new trelloResponse();
//tm = new message()
trelloApi.trelloWebhook(app, (tr) =>{
		switch (tr.translationKey) {
			case 'action_move_card_from_list_to_list':
				tm = new message()
				console.log("action_move_card_from_list_to_list")
				tm.action = tr.translationKey
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				console.log("trelloPrio")
				console.log(trelloPrio)
				tm.priority = trelloPrio
				actor = findActors(tr.cardName)
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				console.log("actor")
				// console.log(actor)
				if (actor) {
					if(github === true){
							actorQueue[QueueIndex] = actor;
							actorQueue[QueueIndex-1] = actor;
							github = false
							Queue[QueueIndex-1].actors = actorUsernames

					}else{
						actorQueue[QueueIndex] = actor;
					}
				} else {
					actorQueue[QueueIndex] = [];
				}			
				tm.message = `"${tr.cardName}" was moved from "${tr.listBeforeName}" to "${tr.listAfterName}"`
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_archived_card':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.archivedCardName)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `"${tr.archivedCardName}" was archived`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_sent_card_to_board':
				tm = new message()
				tm.action = tr.translationKey
				actor =findActors(tr.unarchivedCardName)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `Archived card: "${tr.unarchivedCardName}" was sent back to board`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
				case 'action_delete_card':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.deleteCardName)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `"${tr.deleteCardName}" was deleted `
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
				case 'action_renamed_card':
				tm = new message()
				tm.action = tr.translationKey
				renameCardInJsonFile(tr.oldCardName, tr.renameCard, filePath)
				actor = findActors(tr.renameCard)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `"${tr.oldCardName}" was renamed to "${tr.renameCard}"`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_create_card':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.createCardName)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `"${tr.createCardName}" was created and added to List:"${tr.createCardList}"`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_changed_description_of_card':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.descriptionCardName)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `Description on "${tr.descriptionCardName}" was changed from "${tr.oldDescription}" to "${tr.changedDescription}"`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
				case 'action_add_checklist_to_card':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.checklistCardName)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `Checklist: "${tr.checklistName}" was added to Card: "${tr.checklistCardName}"`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_renamed_checklist':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.checklistNewName)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `Checklist: "${tr.checklistOldName}" was renamed to "${tr.checklistNewName}"`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_remove_checklist_to_card':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.cardNameRemovedCheckList)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `Checklist: "${tr.removedCheckList}" was deleted from Card: "${t.cardNameRemovedCheckList}"`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_added_a_due_date':
				tm = new message()
				console.log("action_added_a_due_date")
				findAndAssignDueDate(tr.dueDayCardName, tr.dueDay)
				tm.action = tr.translationKey
				actor = findActors(tr.dueDayCardName)
				tm.time = getDateTime()
				actorUsernames = findActorUsername(tr.dueDayCardName)
				tm.actors = actorUsernames
				tm.message = `Due date: "${tr.dueDay}" was added to Card: "${tr.deleteCardName}"`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				tm.priority = 0
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_changed_a_due_date':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.dueCardName)
				tm.time = getDateTime()
				findAndAssignDueDate(tr.dueCardName, tr.dueDayChanged)
				actorUsernames = findActorUsername(tr.dueCardName)
				tm.actors = actorUsernames
				tm.message = `The due date on Card "${tr.dueCardName}" was changed from "${tr.dueDayOld}" to "${tr.dueDayChanged}"`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				tm.priority = 0
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_removed_a_due_date':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.remDueCardName)
				tm.time = getDateTime()
				console.log("TEST")
				console.log(tr.removedDue)
				tr.removedDue = []
				removedueDate(tr.remDueCardName)
				actorUsernames = findActorUsername(tr.remDueCardName)
				tm.actors = actorUsernames
				tm.message = `The due date on Card "${tr.remDueCardName}" was removed"`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				tm.priority = 0
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_added_list_to_board':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.createListName)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `A new list "${tr.createListName}" was added to the board`
				
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()

				break;
			case 'action_archived_list':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.archivedList)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `List: "${tr.archivedList}" was archived`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_sent_list_to_board':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.unArchivedList)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `List: "${tr.unArchivedList}" was sent back to board`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_renamed_list':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.renameList)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `List: "${tr.oldListName}" was renamed to "${tr.renameList}"`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
				case 'action_moved_list_right':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.movedListRight)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `List: "${tr.movedListRight}" was moved to the right`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_moved_list_left':
				tm = new message()
				tm.action = tr.translationKey
				actor = findActors(tr.movedListLeft)
				tm.time = getDateTime()
				trelloPrio = dueDatePrio(tr.cardName)
				tm.priority = trelloPrio
				actorUsernames = findActorUsername(tr.cardName)
				tm.actors = actorUsernames
				tm.message = `List: "${tr.movedListLeft}" was moved to the left`
				if (actor) {
					actorQueue[QueueIndex] = actor;
				} else {
					actorQueue[QueueIndex] = [];
				}	
				Queue[QueueIndex] = tm
				QueueIndex++
				writeQueuesTOJSON()
				break;
			case 'action_member_joined_card':
				server.callSaveDataIfDirty()
				let newTrelloUser = trelloCompare(tr.memberOnCard)
				setTimeout(()=>{
						findActors(tr.memberCardName, newTrelloUser)
					}, 500)
			}
	});



let k = 1
function queueMessageFormatter(QueueMessage, Username, Roles){

    let { action, time, actor, message, priority } = QueueMessage;
    console.log("Priority: " + priority)
    if(priority === 0){
	const formattedMessage = `# Priority Message\n` +
	      `Action: ${action}\n` +
	      `Time of action: ${time || 'N/A'}\n` +
	      `Message: ${message}\n` +
	      `Specific Actors: ${Username || 'N/A'} \n` +
	      `Roles: ${Roles || 'N/A'}\n` +
	      `Priority: 0`;
	return formattedMessage;
    }
    const formattedMessage = `# Queued Message${k}:\n` +
          `Action: ${action}\n` +
          `Time of action: ${time || 'N/A'}\n` +
          `Message: ${message}\n` +
          `Specific Actors: ${Username || 'N/A'}\n` +
	  `Roles: ${Roles || 'N/A'}\n` +
          `Priority: ${priority || 'N/A'}`;
    k++
    return formattedMessage;
}

async function shutdownSendQueue() {
    console.log('Shutting down, sending Queue...');
	    try {
		await sendQueueOnShutdown();
	    } catch (error) {
		console.error('Error while shutting down:', error);
	    } finally{
		setTimeout(() => process.exit(0), 1000);
		
	    }
}

process.on('SIGINT', shutdownSendQueue);
process.on('SIGTERM', shutdownSendQueue);
	
	
	
