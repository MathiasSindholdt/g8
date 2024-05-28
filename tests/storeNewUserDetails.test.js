const { storeNewUserDetails } = require('../src/lib/storeNewDetails.js');

describe('storeNewUserDetails', () => {
    let userDetailsList;
    let discordInput;
    let username;
    let DISCORD;
    let trelloInput;
    let originalDataIsDirty;

    beforeEach(() => {
        userDetailsList = [];
        discordInput = '12345678901234567';
        username = 'testUser';
        DISCORD = 'someDiscordValue';
        trelloInput = 'someTrelloValue';
        originalDataIsDirty = global.dataIsDirty;
        global.dataIsDirty = false;
    });

    afterEach(() => {
        global.dataIsDirty = originalDataIsDirty;
    });

    it('should add a new user to the userDetailsList and set dataIsDirty to true', async () => {
        await storeNewUserDetails(userDetailsList, discordInput, username, DISCORD, trelloInput);

        expect(userDetailsList).toHaveLength(1);
        expect(userDetailsList[0]).toEqual({
            discord: discordInput,
            username: username,
            DISCORD: DISCORD,
            roles: [],
            trello: trelloInput
        });

        expect(global.dataIsDirty).toBe(true);
    });

    it('should handle the asynchronous delay properly', async () => {
        const startTime = Date.now();
        await storeNewUserDetails(userDetailsList, discordInput, username, DISCORD, trelloInput);
        const endTime = Date.now();

        // Check if the function waited at least 100ms
        expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
});
