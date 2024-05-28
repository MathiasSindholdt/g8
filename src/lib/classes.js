class githubResponse{
    constructor(event, action, branch ,commitUrl, commitMessage, commitAuthor, repository,
		       mergeCommitDetected, pullRequestTitle, pullRequestMessage, pullRequestUrl, pullRequestAuthor,
		       closeMerge, reviewerName, commentMessage, resolver, commentUrl,
		pullRequestCommentUrl, commentPath){
	this.event = event;
	this.action = action;
	this.branch = branch;
	this.commitUrl = commitUrl;
	this.commitMessage = commitMessage;
	this.commitAuthor = commitAuthor;
	this.repository = repository;
	this.mergeCommitDetected = mergeCommitDetected;
	this.pullRequestTitle = pullRequestTitle;
	this.pullRequestMessage = pullRequestMessage;
	this.pullRequestUrl = pullRequestUrl;
	this.pullRequestAuthor = pullRequestAuthor;
	this.closeMerge = closeMerge;
	this.reviwerName = reviewerName;
	this.commentMessage = commentMessage;
	this.resolver = resolver;
	this.commentUrl = commentUrl;
	this.pullRequestCommentUrl = pullRequestCommentUrl;
	this.commentPath = commentPath;
	
    }
}
class trelloResponse{
    constructor(listBeforeName, listAfterName, cardName, archivedCardName, unarchivedCardName, deleteCardName, renameCard, oldCardName,
	 createCardName, createCardList, descriptionCardName, changedDescription, oldDescription, checklistCardName, checklistName, 
	 checklistNewName, checklistOldName, cardNameRemovedChecklist, removedCheckList, dueDayCardName, dueDay, dueCardName,
	  dueDayChanged, dueDayOld, remDueCardName, removedDue, createListName, archivedList, unArchivedList, renameList, oldListName, 
		movedListRight, movedListLeft, memberOnCard, memberCardName, translationKey, cardID){
	this.listBeforeName = listBeforeName;
	this.listAftername = listAfterName;
	this.cardName = cardName;
	this.archivedCardName = archivedCardName;
	this.unarchivedCardName = unarchivedCardName;
	this.deleteCardName = deleteCardName;
	this.renameCard = renameCard;
	this.oldCardName = oldCardName;
	this.createCardName = createCardName;
	this.createCardList = createCardList;
	this.descriptionCardName = descriptionCardName;
	this.changedDescription = changedDescription;
	this.oldDescripton = oldDescription;
	this.checklistCardName = checklistCardName;
	this.checklistName = checklistName;
	this.checklistNewName = checklistNewName;
	this.checklistOldName = checklistOldName;
	this.cardNameRemovedChecklist = cardNameRemovedChecklist;
	this.removedChecklist = removedCheckList;
	this.dueDayChanged = dueDayChanged;
	this.dueDay = dueDay;
	this.dueDayCardName = dueDayCardName
	this.dueCardName = dueCardName;
	this.dueDayOld = dueDayOld;
	this.remDueCardName = remDueCardName;
	this.removedDue = removedDue;
	this.createListName = createListName;
	this.archivedList = archivedList
	this.unarchivedList = unArchivedList
	this.renameList = renameList
	this.oldListName = oldListName;
	this.movedListRight = movedListRight
	this.movedListLeft = movedListLeft
	this.memberOnCard = memberOnCard
	this.memberCardName = memberCardName
	this.translationKey = translationKey
	this.cardID = cardID
    }
}

class message{
    constructor(action, time, message, actors, priority, type, id){
	this.action = action;
	this.time = time;
	this.message = message;
	this.actors = actors;
	this.priority = priority;
	this.type;
	this.id;
    }
}

module.exports = {
    githubResponse,
    trelloResponse,
    message
}
