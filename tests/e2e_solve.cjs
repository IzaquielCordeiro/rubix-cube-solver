const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function example() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        console.log('Navigating to app...');
        await driver.get('http://localhost:3001');

        // Wait for Welcome Screen
        console.log('Waiting for Welcome Screen...');
        const pixelBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Pixel Scanner')]")), 5000);
        console.log('Clicking Pixel Scanner...');
        await pixelBtn.click();

        // Wait for Scan Screen and Debug Button
        console.log('Waiting for Debug Button...');
        const debugBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Debug Mode')]")), 5000);
        console.log('Clicking Debug Mode...');
        await debugBtn.click();

        // Wait for Debug Dialog
        console.log('Waiting for Textarea...');
        const textarea = await driver.wait(until.elementLocated(By.css('textarea')), 5000);

        // Paste Solved Cube State
        const solvedState = {
            "F": ["white", "white", "white", "white", "white", "white", "white", "white", "white"],
            "R": ["orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange"],
            "B": ["yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow"],
            "L": ["red", "red", "red", "red", "red", "red", "red", "red", "red"],
            "U": ["green", "green", "green", "green", "green", "green", "green", "green", "green"],
            "D": ["blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue"]
        };

        console.log('Entering Cube State...');
        await textarea.sendKeys(JSON.stringify(solvedState));

        // Click Load
        console.log('Clicking Load...');
        const loadBtn = await driver.findElement(By.xpath("//button[contains(., 'Load Cube State')]"));
        await loadBtn.click();

        // Wait for Solve Button to be enabled
        console.log('Waiting for Solve Button...');
        const solveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Solve Cube')]")), 5000);

        // Give a moment for state to settle
        await driver.sleep(1000);

        console.log('Clicking Solve...');
        await solveBtn.click();

        // Wait for Solution
        console.log('Waiting for Solution...');
        await driver.wait(until.elementLocated(By.xpath("//h2[contains(., 'Solution Found')]")), 10000);

        console.log('TEST PASSED: Solution Found!');

    } catch (e) {
        console.error('TEST FAILED:', e);
        process.exit(1);
    } finally {
        await driver.quit();
    }
})();
