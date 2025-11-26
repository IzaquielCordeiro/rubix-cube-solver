const { Builder, By, until } = require('selenium-webdriver');

const APP_URL = 'http://localhost:3001';
const TIMEOUTS = { element: 5000, solution: 60000, settle: 1000 };

// Valid R-move scramble (verified all colors = 9/9)
const scrambledCubeState = {
    "F": ["white", "white", "blue", "white", "white", "blue", "white", "white", "blue"],
    "R": ["orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange"],
    "B": ["green", "yellow", "yellow", "green", "yellow", "yellow", "green", "yellow", "yellow"],
    "L": ["red", "red", "red", "red", "red", "red", "red", "red", "red"],
    "U": ["green", "green", "white", "green", "green", "white", "green", "green", "white"],
    "D": ["blue", "blue", "yellow", "blue", "blue", "yellow", "blue", "blue", "yellow"]
};

const solvedCubeState = {
    "F": ["white", "white", "white", "white", "white", "white", "white", "white", "white"],
    "R": ["orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange"],
    "B": ["yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow"],
    "L": ["red", "red", "red", "red", "red", "red", "red", "red", "red"],
    "U": ["green", "green", "green", "green", "green", "green", "green", "green", "green"],
    "D": ["blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue"]
};

async function waitForElement(driver, xpath, timeout = TIMEOUTS.element) {
    return await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
}

async function clickElement(driver, xpath, description) {
    console.log(`  ${description}...`);
    await (await waitForElement(driver, xpath)).click();
}

async function runTest(testName, cubeState) {
    console.log(`\n=== ${testName} ===`);
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get(APP_URL);
        await clickElement(driver, "//button[contains(., 'Pixel Picker')]", "Select Pixel Picker");
        await driver.sleep(TIMEOUTS.settle);

        await clickElement(driver, "//button[contains(., 'Debug Mode')]", "Open Debug Mode");
        await driver.sleep(500);

        const textarea = await waitForElement(driver, "//textarea");
        await textarea.clear();
        await textarea.sendKeys(JSON.stringify(cubeState));
        await clickElement(driver, "//button[contains(., 'Load Cube State')]", "Load Cube State");
        await driver.sleep(1500);

        await clickElement(driver, "//button[contains(., 'Solve Cube')]", "Click Solve");

        console.log('  Waiting for solution...');
        await driver.sleep(20000);

        const bodyText = await driver.findElement(By.tagName('body')).getText();

        if (bodyText.includes('Unsolvable') || bodyText.includes('Invalid')) {
            console.log(`✗ ${testName} FAILED: Marked as unsolvable`);
            return false;
        }

        // Check for success - look for "Solvable" or "Solved in" text
        if (bodyText.includes('Solvable') || bodyText.includes('Solved in') || bodyText.includes('already solved')) {
            const match = bodyText.match(/Solved in (\d+) moves?|(\d+) moves?/i);
            const moves = match ? (match[1] || match[2] || '0') : '0';
            console.log(`✓ ${testName} PASSED: Solution found (${moves} moves)`);
            return true;
        }

        console.log(`✗ ${testName} FAILED: No solution after 20s`);
        console.log(`  Status: ${bodyText.substring(0, 200)}`);
        return false;
    } catch (e) {
        console.log(`✗ ${testName} FAILED: ${e.message}`);
        return false;
    } finally {
        await driver.quit();
    }
}

(async () => {
    console.log('═══════════════════════════════════════');
    console.log('  Rubik\'s Cube E2E Test Suite');
    console.log('═══════════════════════════════════════');

    const results = {
        solved: await runTest('Test 1: Solved Cube', solvedCubeState),
        scrambled: await runTest('Test 2: Scrambled Cube (R-move)', scrambledCubeState)
    };

    console.log('\n═══════════════════════════════════════');
    console.log('  RESULTS');
    console.log('═══════════════════════════════════════');
    console.log(`Test 1 (Solved):    ${results.solved ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Test 2 (Scrambled): ${results.scrambled ? '✓ PASS' : '✗ FAIL'}`);
    console.log('═══════════════════════════════════════');

    const allPassed = Object.values(results).every(r => r === true);
    console.log(`\nOverall: ${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}\n`);

    process.exit(allPassed ? 0 : 1);
})();
