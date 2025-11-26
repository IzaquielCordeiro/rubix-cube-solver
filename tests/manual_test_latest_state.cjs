const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');

const APP_URL = 'http://localhost:3001';

// User provided state (latest - with Red Right, Orange Left)
const userState = {
    "F": [
        "yellow", "green", "green",
        "yellow", "green", "green",
        "orange", "green", "green"
    ],
    "R": [
        "white", "yellow", "red",
        "red", "red", "red",
        "red", "red", "blue"
    ],
    "B": [
        "white", "white", "red",
        "white", "blue", "blue",
        "orange", "blue", "blue"
    ],
    "L": [
        "blue", "orange", "orange",
        "orange", "orange", "orange",
        "yellow", "white", "white"
    ],
    "U": [
        "white", "orange", "green",
        "green", "white", "blue",
        "green", "white", "orange"
    ],
    "D": [
        "yellow", "red", "red",
        "yellow", "yellow", "blue",
        "yellow", "yellow", "blue"
    ]
};

console.log('═══════════════');
console.log('Manual User Test');
console.log('═══════════════\n');

console.log('Testing cube state with:');
console.log('  Right center:', userState.R[4], '(Red - non-standard)');
console.log('  Left center:', userState.L[4], '(Orange - non-standard)');
console.log('\nThis should be detected and handled by the validator.\n');

console.log('Paste this JSON into Debug Mode:');
console.log(JSON.stringify(userState, null, 2));
console.log('\nOpening browser for manual testing...');

(async () => {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get(APP_URL);
        console.log('\nBrowser opened! Please:');
        console.log('1. Click "Pixel Picker"');
        console.log('2. Click "Debug Mode"');
        console.log('3. Paste the JSON above');
        console.log('4. Click "Load Cube State"');
        console.log('5. Click "Solve Cube"');
        console.log('\nWaiting 60 seconds for you to complete the steps...');

        await driver.sleep(60000);

    } catch (e) {
        console.error('\nERROR:', e.message);
    } finally {
        await driver.quit();
    }
})();
