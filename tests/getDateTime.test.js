const { getDateTime } = require('../src/lib/getDateTime.js');


describe('getDateTime', () => {
    it('should return the formatted current date and time', () => {
        // Mock the Date object
        const mockDate = new Date(2024, 4, 14, 12, 30, 45); // May 14, 2024 @ 12:30:45
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        const expectedDateTime = "14/5/2024 @ 12:30:45";
        const result = getDateTime();

        expect(result).toBe(expectedDateTime);

        // Restore the original Date object
        global.Date.mockRestore();
    });
});
