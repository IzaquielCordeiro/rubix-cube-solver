const { Builder, By, until } = require('selenium-webdriver');

const APP_URL = 'http://localhost:3001';
const TIMEOUTS = { element: 5000, settle: 1000 };

// Valid R-move scramble (verified all colors = 9/9)
const scrambledCubeState = {
    "F": ["white", "white", "blue", "white", "white", "blue", "white", "white", "blue"],
    "R": ["orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange"],
    "B": ["green", "yellow", "yellow", "green", "yellow", "yellow", "green", "yellow", "yellow"],
    "L": ["red", "red", "red", "red", "red", "red", "red", "red", "red"],
    "U": ["green", "green", "white", "green", "green", "white", "green", "green", "white"],
    "D": ["blue", "blue", "yellow", "blue", "blue", "yellow", "blue", "blue", "yellow"]
};

console.log('═══════════════════════════════════════');
console.log('  Test 2: R-Move Scrambled Cube');
console.log('═══════════════════════════════════════\n');

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

        console.log('4. Loading scrambled cube state...');
        const textarea = await driver.wait(until.elementLocated(By.css('textarea')), TIMEOUTS.element);
        await textarea.clear();
        await textarea.sendKeys(JSON.stringify(scrambledCubeState));

        const loadBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Load Cube State')]")), TIMEOUTS.element);
        await loadBtn.click();
        await driver.sleep(1500);

        console.log('5. Clicking Solve Cube...');
        const solveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Solve Cube')]")), TIMEOUTS.element);
        await solveBtn.click();

        console.log('6. Waiting for solution (checking every 5s for up to 60s)...\n');

        // Check every 5 seconds for up to 60 seconds
        for (let i = 5; i <= 60; i += 5) {
            await driver.sleep(5000);
            const bodyText = await driver.findElement(By.tagName('body')).getText();

            console.log(`   [${i}s] Checking...`);

            if (bodyText.includes('Unsolvable') || bodyText.includes('Invalid')) {
                console.log('\n✗ FAILED: Cube marked as unsolvable');
                console.log('Status:', bodyText.substring(0, 300));
                process.exit(1);
            }

            if (bodyText.includes('Solution Found') || bodyText.includes('already solved')) {
                const match = bodyText.match(/(\d+)\s+moves?/i);
                const moves = match ? match[1] : '0';
                console.log(`\n✓ SUCCESS: Solution found after ${i}s!`);
                console.log(`   Moves: ${moves}`);

                // Take screenshot of success
                const fs = require('fs');
                const screenshot = await driver.takeScreenshot();
                fs.writeFileSync('d:/Documents/Workspace/gemini/rubix-cube-solver/tests/test2_success.png', screenshot, 'base64');
                console.log('   Screenshot saved to: tests/test2_success.png');

                process.exit(0);
            }
        }

        console.log('\n✗ TIMEOUT: No solution found after 60 seconds');
        const bodyText = await driver.findElement(By.tagName('body')).getText();
        console.log('Final status:', bodyText.substring(0, 300));
        process.exit(1);

    } catch (e) {
        console.error('\n✗ ERROR:', e.message);
        process.exit(1);
    } finally {
        await driver.quit();
    }
})();
