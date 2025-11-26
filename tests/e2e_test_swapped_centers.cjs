const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');

const APP_URL = 'http://localhost:3001';
const TIMEOUTS = { element: 5000, settle: 1000 };

// User provided state with swapped R/L centers
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
console.log('  Test: Swapped Centers Debug (E2E)');
console.log('═══════════════════════════════════════\n');

console.log('Analyzing cube state...');
console.log('Center colors:');
console.log('  F:', userState.F[4], '(should be green)');
console.log('  R:', userState.R[4], '(should be orange per min2phase)');
console.log('  B:', userState.B[4], '(should be blue)');
console.log('  L:', userState.L[4], '(should be red per min2phase)');
console.log('  U:', userState.U[4], '(should be white)');
console.log('  D:', userState.D[4], '(should be yellow)');
console.log('\n⚠️  ISSUE: R center is RED, L center is ORANGE (swapped!)\n');

(async () => {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
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

        console.log('7. Waiting 2s for render...');
        await driver.sleep(2000);

        console.log('8. Taking Screenshot...');
        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync('tests/swapped_centers_result.png', screenshot, 'base64');
        console.log('   Screenshot saved to tests/swapped_centers_result.png');

        console.log('9. Checking for error...');
        try {
            const errorMsg = await driver.findElement(By.xpath("//div[contains(text(), 'Unsolvable')]"));
            const errorText = await errorMsg.getText();
            console.log('   ✗ FAILED: Solver returned error:', errorText);

            // Try to get detailed error
            try {
                const details = await driver.findElements(By.xpath("//div[contains(@class, 'text-red') or contains(@class, 'text-amber')]"));
                for (const detail of details) {
                    const text = await detail.getText();
                    if (text.trim()) console.log('     -', text);
                }
            } catch (e) { }
        } catch (e) {
            console.log('   ✓ SUCCESS: No error found, cube appears solvable!');
        }

    } catch (e) {
        console.error('\n✗ ERROR:', e.message);
    } finally {
        await driver.quit();
    }
})();
