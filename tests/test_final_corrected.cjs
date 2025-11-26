const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');

const APP_URL = 'http://localhost:3001';
const TIMEOUTS = { element: 10000, settle: 1000 };

// User's FINAL corrected state
const userState = {
    "F": ["yellow", "green", "green", "yellow", "green", "green", "orange", "green", "green"],
    "R": ["white", "yellow", "red", "red", "red", "red", "red", "red", "blue"],
    "B": ["white", "white", "red", "white", "blue", "blue", "orange", "blue", "blue"],
    "L": ["blue", "orange", "orange", "orange", "orange", "orange", "yellow", "white", "white"],
    "U": ["white", "orange", "green", "green", "white", "blue", "green", "white", "orange"],
    "D": ["blue", "yellow", "yellow", "blue", "yellow", "yellow", "red", "red", "yellow"]
};

console.log('═══════════════════════════════════════');
console.log('  FINAL TEST: Corrected Down Face');
console.log('═══════════════════════════════════════\n');

(async () => {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get(APP_URL);
        const pickerBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Pixel Picker')]")), TIMEOUTS.element);
        await pickerBtn.click();
        await driver.sleep(TIMEOUTS.settle);

        const debugBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Debug Mode')]")), TIMEOUTS.element);
        await debugBtn.click();
        await driver.sleep(500);

        const textarea = await driver.wait(until.elementLocated(By.tagName('textarea')), TIMEOUTS.element);
        await textarea.clear();
        await textarea.sendKeys(JSON.stringify(userState));

        const loadBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Load Cube State')]")), TIMEOUTS.element);
        await loadBtn.click();
        await driver.sleep(1000);

        const solveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Solve Cube')]")), TIMEOUTS.element);
        await driver.executeScript("arguments[0].click();", solveBtn);
        await driver.sleep(2000);

        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync('tests/final_solution.png', screenshot, 'base64');

        const browserLogs = await driver.manage().logs().get('browser');
        let failed = false;

        for (const entry of browserLogs) {
            const msg = entry.message;
            if (msg.includes('VALIDATION_FAILED') || msg.includes('SOLVER_FAILED')) {
                failed = true;
                console.log('❌', msg.substring(0, 100));
            }
        }

        try {
            await driver.findElement(By.css('span.font-bold.text-red-400'));
            console.log('❌ Unsolvable in DOM');
            failed = true;
        } catch (e) { }

        console.log('\n═══════════════════════════════════════');
        if (failed) {
            console.log('❌ FAILED');
            process.exit(1);
        } else {
            console.log('✅ SUCCESS - CUBE IS SOLVABLE!');
        }

    } catch (e) {
        console.error('ERROR:', e.message);
        process.exit(1);
    } finally {
        await driver.quit();
    }
})();
