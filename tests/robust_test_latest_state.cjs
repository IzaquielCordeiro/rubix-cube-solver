const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');

const APP_URL = 'http://localhost:3001';
const TIMEOUTS = { element: 10000, settle: 1000 };

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

console.log('═══════════════════════════════════════');
console.log('  ROBUST Test: Check Console Logs');
console.log('═══════════════════════════════════════\n');

(async () => {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Enable browser console log collection
        const logs = [];

        console.log('1. Navigating to app...');
        await driver.get(APP_URL);

        console.log('2. Selecting Pixel Picker...');
        const pickerBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Pixel Picker')]")), TIMEOUTS.element);
        await pickerBtn.click();
        await driver.sleep(TIMEOUTS.settle);

        console.log('3. Opening Debug Mode...');
        const debugBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Debug Mode')]")), TIMEOUTS.element);
        await debugBtn.click();
        await driver.sleep(500);

        console.log('4. Pasting User State...');
        const textarea = await driver.wait(until.elementLocated(By.tagName('textarea')), TIMEOUTS.element);
        await textarea.clear();
        await textarea.sendKeys(JSON.stringify(userState));

        console.log('5. Loading Cube State...');
        const loadBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Load Cube State')]")), TIMEOUTS.element);
        await loadBtn.click();
        await driver.sleep(1000);

        console.log('6. Clicking Solve Cube...');
        const solveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Solve Cube')]")), TIMEOUTS.element);
        await driver.executeScript("arguments[0].click();", solveBtn);

        console.log('7. Waiting 2s for processing...');
        await driver.sleep(2000);

        console.log('8. Taking Screenshot...');
        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync('tests/latest_user_state_result.png', screenshot, 'base64');
        console.log('   Screenshot saved!');

        console.log('9. Collecting Browser Console Logs...');
        const browserLogs = await driver.manage().logs().get('browser');

        let validationFailed = false;
        let solverFailed = false;

        for (const entry of browserLogs) {
            const msg = entry.message;
            if (msg.includes('VALIDATION_FAILED')) {
                validationFailed = true;
                console.log('   ❌ VALIDATION_FAILED:', msg);
            }
            if (msg.includes('SOLVER_FAILED')) {
                solverFailed = true;
                console.log('   ❌ SOLVER_FAILED:', msg);
            }
        }

        console.log('\n10. Checking DOM for errors...');
        try {
            // Check for the specific error element
            const unsolvableEl = await driver.findElement(By.css('span.font-bold.text-red-400'));
            const text = await unsolvableEl.getText();
            if (text.includes('Unsolvable')) {
                console.log('   ❌ DOM shows "Unsolvable" (span.text-red-400)');
                validationFailed = true;
            }
        } catch (e) {
            console.log('   ✓ No "Unsolvable" error element found');
        }

        console.log('\n═══════════════════════════════════════');
        console.log('FINAL VERDICT:');
        if (validationFailed || solverFailed) {
            console.log('❌ FAILED: Cube is unsolvable');
            process.exit(1);
        } else {
            console.log('✅ PASSED: Cube is solvable!');
        }

    } catch (e) {
        console.error('\n✗ TEST ERROR:', e.message);
        process.exit(1);
    } finally {
        await driver.quit();
    }
})();
