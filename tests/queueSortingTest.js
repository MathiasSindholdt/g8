const {queueSorting} = require("./../src/lib/queueSorting.js")
const {githubResponse, trelloResponse, message} = require('./../src/lib/classes.js');


function queueTesting(){

    let testQueue = []

    for (let step = 0; step <= 10; step++) {
	let Lmessage = new message   
	Lmessage.message = "expected index " + (10 - step);
	Lmessage.priority = 10 - step
	testQueue[step] = Lmessage
    }
    
    var i = 0

    console.log("\n\n ======== before sorting =========\n\n")
    testQueue.forEach((pos)=>{ console.log(
    pos.message + " | priority: " + pos.priority + " | index: " + i)
			   i++
			 }
		 )
    queueSorting(testQueue)
    console.log("\n\n ======== after sorting =========\n\n")
    i = 0
    testQueue.forEach((pos)=>{ console.log(
    pos.message + " | priority: " + pos.priority + " | index: " + i)
			   i++
			 }
		 )

}

queueTesting()
