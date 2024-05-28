const fs = require('fs');
const path = require('path');
const { renameCardInJsonFile } = require('../src/lib/renameCardInJsonFile');

describe('renameCardInJsonFile', () => {
    const tempFilePath = path.join(__dirname, 'tempData.json'); // Path to temp test file

    beforeEach(() => {
        // Create temporary JSON file with test data
        const testData = [
            { name: 'Card1', description: 'Description1' },
            { name: 'Card2', description: 'Description2' },
            { name: 'Card3', description: 'Description3' }
        ];
        fs.writeFileSync(tempFilePath, JSON.stringify(testData, null, 2), 'utf-8');
    });

    afterEach(() => {
        // Delete temporary JSON file after each test
        fs.unlinkSync(tempFilePath);
    });

    it('should rename a card in the JSON file', () => {
        const oldName = 'Card2';
        const newName = 'NewCard';

        // Call the function
        renameCardInJsonFile(oldName, newName, tempFilePath);

        // Read the updated JSON data from the file
        const updatedData = JSON.parse(fs.readFileSync(tempFilePath, 'utf-8'));

        // Verify that the card name has been updated
        expect(updatedData).toEqual([
            { name: 'Card1', description: 'Description1' },
            { name: 'NewCard', description: 'Description2' }, // Card2 renamed to NewCard
            { name: 'Card3', description: 'Description3' }
        ]);
    });

    it('should not modify the JSON file if the card does not exist', () => {
        const oldName = 'NonExistentCard';
        const newName = 'NewCard';

        // Call the function
        renameCardInJsonFile(oldName, newName, tempFilePath);

        // Read the JSON data from the file
        const data = JSON.parse(fs.readFileSync(tempFilePath, 'utf-8'));

        // Verify that the data remains unchanged
        expect(data).toEqual([
            { name: 'Card1', description: 'Description1' },
            { name: 'Card2', description: 'Description2' },
            { name: 'Card3', description: 'Description3' }
        ]);
    });
});
