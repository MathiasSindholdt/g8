const { storeNewAutomationDetails } = require('../src/lib/storeNewDetails.js');

describe('storeNewAutomationDetails', () => {
    let automationsList;
    let title;
    let users;
    let type;

    beforeEach(() => {
        automationsList = [];
        title = 'Test Automation';
        users = ['user1', 'user2'];
        type = 'TestType';
    });

    afterEach(() => {
        automationsList = [];
    });


    it('should add a new automation to the list and simulate async operation', async () => {
        // Call the function
        await storeNewAutomationDetails(automationsList, title, users, type);

        // Verify that the automation was added to the list
        expect(automationsList).toHaveLength(1);
        expect(automationsList[0]).toEqual({
            Title: title,
            Users: users,
            Type: type
        });
    });
    it('should handle the asynchronous delay properly', async () => {
        const startTime = Date.now();
        await storeNewAutomationDetails(automationsList, title, users, type);
        const endTime = Date.now();

        // Check if the function waited at least 100ms
        expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
});
