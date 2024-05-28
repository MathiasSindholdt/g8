const express = require('express');
const axios = require('axios');
const port = 3000;
const fs = require('fs')
require('./../../../../.env')
let ToDoListId, OngoingListId, ReviewListId, DoneListId;
let ToDoListName, OngoingListName, ReviewListName, DoneListName;
let cardId;
let details;
require('../../../lib/classes.js')
module.exports ={  
    githubIntegrations: function githubIntegration(pullAccept, pullRequestMessage){
        const automationData = JSON.parse(fs.readFileSync('../config/automationList.json', 'utf-8'));
        findMatchingCard(details, pullRequestMessage);
        if (pullAccept == "Commit"){
            console.log("Commit")
            moveTrelloCard(cardId, OngoingListId);
        }
        if(automationData.length<=0){console.log("ERROR: no automations found")}
        for (let automationIndex in automationData){
    
            if(automationData[automationIndex].github && cardId == automationData[automationIndex].id){
            switch (pullAccept) {
            case "Opened":
                        console.log("Pull request åbnet");
                        moveTrelloCard(cardId, ReviewListId);
                        break;
            case "Denied":
                        console.log("Pull request afvist");
                        moveTrelloCard(cardId, OngoingListId);
                        break;
            case "Accepted":
                        console.log("Pull request godkendt");
                        moveTrelloCard(cardId, DoneListId);
                        break;
            default:
                        break;
            }
            }
        }
        },
        
        trelloWebhook: function callwebhooksetup(app, callback){
            trelloCallback(app, callback)
        },
    
        findInfo: async function findInfo(boardTitle) {
            const boards = await findAllBoards();
            const targetBoard = boards.find(board => board.name === boardTitle);
            details = await findListsAndCards(targetBoard.id);
            await createVariables(details);
            return details
        }   
    }
let currentWebhookId;



function trelloCallback(app, callback){
    app.head('/trelloCallback', (req, res) => {
        res.status(200).send('OK');
    });

    app.use(express.json());
    app.post('/trelloCallback', (req, res) => {
        res.status(200).send('OK');
        const payload = req.body.action;
        tr.translationKey = payload.display.translationKey
        switch (tr.translationKey) {
            case 'action_move_card_from_list_to_list':
                tr.listBeforeName = payload.data.listBefore.name;
                tr.listAfterName = payload.data.listAfter.name;
                tr.cardName = payload.data.card.name
                dataExport();
                break;
                case 'action_archived_card':
            tr.archivedCardName = payload.data.card.name;
            dataExport();
            break;
            case 'action_sent_card_to_board':
            tr.unarchivedCardName = payload.data.card.name;
            dataExport();
            break;
        case 'action_delete_card':
            tr.deleteCardName = payload.data.card.name;
            dataExport();
            break;
            case 'action_renamed_card':
                tr.renameCard = payload.data.card.name;
                tr.oldCardName = payload.data.old.name;
                dataExport();
                break;
                case 'action_create_card':
                    tr.createCardName = payload.data.card.name;
            tr.createCardList = payload.data.list.name;
            dataExport();
            break;
            case 'action_changed_description_of_card':
                tr.descriptionCardName = payload.data.card.name;
            tr.changedDescription = payload.data.card.desc;
            tr.oldDescription = payload.data.old.desc;
            dataExport();
            break;
            case 'action_add_checklist_to_card':
                tr.checklistCardName = payload.data.card.name;
            tr.checklistName = payload.data.checklist.name;
            dataExport();
            break;
        case 'action_renamed_checklist':
            tr.checklistNewName = payload.data.checklist.name;
            tr.checklistOldName = payload.data.old.name;
            dataExport();
            break;
            case 'action_remove_checklist_to_card':
                tr.cardNameRemovedChecklist = payload.data.card.name;
                tr.removedCheckList = payload.data.checklist.name;
                dataExport();
                break;
                case 'action_added_a_due_date':
                    tr.dueDayCardName = payload.data.card.name;
                    tr.dueDay = payload.data.card.due;
                    dataExport();
                    break;
                    case 'action_changed_a_due_date':
            tr.dueCardName = payload.data.card.name;
            tr.dueDayChanged = payload.data.card.due;
            tr.dueDayOld = payload.data.old.due;
            dataExport();
            break;
        case 'action_removed_a_due_date':
            tr.remDueCardName = payload.data.card.name;
            tr.removedDue = payload.data.old.due;
            dataExport();
            break;
        case 'action_added_list_to_board':
            tr.createListName = payload.data.list.name;
            dataExport();
            break;
            case 'action_archived_list':
                tr.archivedList = payload.data.list.name;
                dataExport();
                break;
                case 'action_sent_list_to_board':
                    tr.unArchivedList = payload.data.list.name;
                    dataExport();
                    break;
                    case 'action_renamed_list':
                        tr.renameList = payload.data.list.name;
                        tr.oldListName = payload.data.old.name;
                        dataExport();
                        break;
                        case 'action_moved_list_right':
            tr.movedListRight = payload.data.list.name;
            dataExport();
            break;
            case 'action_moved_list_left':
                tr.movedListLeft = payload.data.list.name;
            dataExport();
            break;
            case 'action_member_joined_card':
            tr.memberOnCard = payload.data.member.name
            tr.memberCardName = payload.data.card.name
            tr.cardID = payload.data.card.id
            dataExport()
            break;
        default :
        //Nothing will happen
            break;
        }
        function dataExport(){
            callback(tr)
            
        }
    });
   return app;
}

const data = {
    description: "My Trello webhook",
    callbackURL: callbackURL,
    idModel: idModel,
    sactive: true
};

function checkAndCreateWebhook() {
    let existingWebhooks; // Declare the variable outside the promise chain

    axios.get(`https://api.trello.com/1/tokens/${TrelloToken}/webhooks/?key=${apiKey}`)
        .then(response => {
            existingWebhooks = response.data;
            let existingWebhook = null;

            // Check if any existing webhook matches callbackURL and idModel
            existingWebhooks.forEach(webhook => {
                if (webhook.callbackURL === callbackURL && webhook.idModel === idModel) {
                    existingWebhook = webhook;
                }
            });

            // If no existing webhook found, create a new one
            if (!existingWebhook) {
                console.log('No existing webhook found, creating a new one...');
                return axios.post(`https://api.trello.com/1/tokens/${TrelloToken}/webhooks/?key=${apiKey}`, {
                    callbackURL: callbackURL,
                    idModel: idModel
                });
            } else {
                console.log('Webhook already exists, no need to create a new one.');
                return existingWebhook;
            }
        })
        .then(existingWebhook => {
            // Delete all existing webhooks except the one found or created
            const deletePromises = [];
            existingWebhooks.forEach(webhook => {
                if (webhook.id !== existingWebhook.id) {
                    deletePromises.push(axios.delete(`https://api.trello.com/1/webhooks/${webhook.id}?key=${apiKey}&token=${TrelloToken}`));
                }
            });
            return Promise.all(deletePromises);
        })
        .then(deletedWebhooks => {
            console.log('Deleted unused webhooks');
        })
        .catch(error => {
            console.error('Failed to manage webhooks:', error.response ? error.response.data : error);
        });
}


checkAndCreateWebhook();

function moveTrelloCard(cardId, targetListId) {
    const data = {
        idList: targetListId
    };

    axios.put(`https://api.trello.com/1/cards/${cardId}?key=${apiKey}&token=${TrelloToken}`, data)
        .then(response => {
            console.log('Trello card moved successfully:', response.data);
        })
        .catch(error => {
            console.error('Failed to move Trello card:', error.response ? error.response.data : error);
        });
}

async function findAllBoards () {
    const url = `https://api.trello.com/1/members/me/boards?fields=name&key=${apiKey}&token=${TrelloToken}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching boards:', error);
        return [];
    }
}

async function findListsAndCards(boardId) {
    const url = `https://api.trello.com/1/boards/${boardId}?fields=name&lists=open&list_fields=name&cards=open&card_fields=name&key=${apiKey}&token=${TrelloToken}`;
    try {
        const response = await axios.get(url);
        // console.log("Response:")
        // console.log(response)
        const boardData = response.data;
        // console.log("BoardData: ")
        // console.log(boardData)
        const lists = [];
        const cards = [];

        boardData.lists.forEach(list => {
            lists.push({ id: list.id, name: list.name });
        });

        boardData.cards.forEach(card => {
            cards.push({ id: card.id, name: card.name, listId: card.idList });
        });

        return {
            boardName: boardData.name,
            lists: lists,
            cards: cards
        };
    } catch (error) {
        console.error(`Error fetching lists and cards for board ID ${boardId}:`, error);
        return null;
    }
}


async function createVariables(details) {
    try {
        for (const list of details.lists) {
            switch (list.name) {
            case 'To Do':
                ToDoListId = list.id;
                ToDoListName = list.name;
                break;
            case 'Ongoing':
                OngoingListId = list.id;
                OngoingListName = list.name;
                break;
            case 'Review':
                ReviewListId = list.id;
                ReviewListName = list.name;
                break;
            case 'Done':
                DoneListId = list.id;
                DoneListName = list.name;
                break;
            }
        }
        console.log('List Names:', { ToDoListName, OngoingListName, ReviewListName, DoneListName });
        console.log('List IDs:', { ToDoListId, OngoingListId, ReviewListId, DoneListId });
        return {
            listIds: { ToDoListId, OngoingListId, ReviewListId, DoneListId },
            listNames: { ToDoListName, OngoingListName, ReviewListName, DoneListName },
        };
    } catch (error) {
        console.error('Error processing list and card details:', error);
        throw error; 
    }
}

async function findMatchingCard(details, pullRequestMessage) {
    try {
        if(!details) {
            console.error('No details found');
            return;
        }
        const card = details.cards.find(card => pullRequestMessage.includes(card.name));
        if (card){
            console.log('Matching card found:', card.name);
            cardId = card.id;
            return cardId;
        }
    }
    catch (error) {
        console.error('Error finding matching card:', error);
        throw error;
    }
}


