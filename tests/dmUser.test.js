const { dmUser } = require('../src/functions/API/DiscordAPI/sendDM');

// Mimicking Discord
const mockSend = jest.fn();
const mockFetchUser = jest.fn().mockResolvedValue({
    send: mockSend,
    tag: 'testuser#1234'
});
const mockClient = {
    users: {
        fetch: mockFetchUser
    }
};

describe('dmUser', () => {
    let consoleErrorMock;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorMock.mockRestore();
    });

    it('Needs to be able to send messages to a user.', async () => {
        const message = 'Hello, this is a test message!';
        const user = '1234567890';

        await dmUser(mockClient, message, user);

        expect(mockFetchUser).toHaveBeenCalledWith(user);
        expect(mockSend).toHaveBeenCalledWith(message);
    });

    it('Errors should be caught.', async () => {
        mockFetchUser.mockRejectedValueOnce(new Error('Failed to fetch user'));

        await dmUser(mockClient, 'Hello', '1234567890');

        expect(mockFetchUser).toHaveBeenCalled();
        expect(mockSend).not.toHaveBeenCalled();
        expect(consoleErrorMock).toHaveBeenCalledWith(expect.any(Error));
    });
});
