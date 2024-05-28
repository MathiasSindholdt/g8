const fs = require('fs');

function renameCardInJsonFile(oldName, newName, filePath) {
    const usersData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const updatedData = usersData.map(cardData => {
        if (cardData.name === oldName) {
            return { ...cardData, name: newName };
        }
        return cardData;
    });
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf-8');
}

module.exports = { renameCardInJsonFile }