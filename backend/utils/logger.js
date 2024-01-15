const fs = require('fs');
const path = require('path');

// Function for logging to a file
function logToFile({ fetched, saved, fetchedArticles, savedArticles }) {
    const logFilePath = path.join(__dirname, '../logs/fetchLog.txt');
    const logEntry = `Time: ${new Date().toISOString()}\nFetched: ${fetched}\nSaved: ${saved}\nFetched Articles: ${JSON.stringify(fetchedArticles, null, 2)}\nSaved Articles: ${JSON.stringify(savedArticles, null, 2)}\n\n   --------------------------------------------------------------\n\n`;

    fs.appendFile(logFilePath, logEntry, err => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}

// Function for reading the last avatar state
function readLastAvatar() {
    try {
        const filePath = path.join(__dirname, '../logs/lastAvatar.txt');
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        // In case of an error (e.g., if the file does not exist), return a default value
        return 'Sofia';
    }
}

// Function for saving the current avatar state
function saveLastAvatar(avatar) {
    const filePath = path.join(__dirname, '../logs/lastAvatar.txt');
    fs.writeFileSync(filePath, avatar, 'utf8');
}

module.exports = {
    logToFile, readLastAvatar, saveLastAvatar
};
