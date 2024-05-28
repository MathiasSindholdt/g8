const { queueSorting } = require('../src/lib/queueSorting.js');
const { message } = require('../src/lib/classes.js');

describe('queueSorting', () => {
    it('should sort the queue based on message priority', () => {
        let testQueue = [];

        // Create test messages with decreasing priority
        for (let step = 0; step <= 10; step++) {
            let Lmessage = new message();
            Lmessage.message = "expected index " + (10 - step);
            Lmessage.priority = 10 - step;
            testQueue[step] = Lmessage;
        }

        // And the actor queue.
        let actorQueue = []
        
        for (let step = 0; step <= 10; step++) {
            actorQueue[step] = "user_id#"+(10-step);
        }

        // Sort the queue
        queueSorting(testQueue, actorQueue);

        // Verify the queue is sorted correctly by priority (descending order)
        for (let i = 0; i < testQueue.length - 1; i++) {
            expect(testQueue[i].priority).toBeLessThanOrEqual(testQueue[i + 1].priority);
        }

        // Verify that actors have been correctly sorted.
        for (let i = 0; i < testQueue.length - 1; i++) {
            expect(actorQueue[i] === ("user_id#"+i));
        }        
    });
});