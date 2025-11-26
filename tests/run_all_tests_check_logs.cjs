const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

const APP_URL = 'http://localhost:3001';
const TIMEOUTS = { element: 10000, settle: 1000 };

// All test states
const testStates = {
    'Solved Cube': {
        "F": Array(9).fill("green"),
        "R": Array(9).fill("orange"),
        "B": Array(9).fill("blue"),
        "L": Array(9).fill("red"),
        "U": Array(9).fill("white"),
        "D": Array(9).fill("yellow")
    },
    'Simple R-Scramble': {
        "F": ["green", "green", "white", "green", "green", "white", "green", "green", "white"],
        "R": ["orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange"],
        "B": ["yellow", "blue", "blue", "yellow", "blue", "blue", "yellow", "blue", "blue"],
        "L": ["red", "red", "red", "red", "red", "red", "red", "red", "red"],
        "U": ["white", "white", "white", "white", "white", "white", "blue", "blue", "blue"],
        "D": ["green", "green", "green", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow"]
    },
    'User Latest State (Red/Orange Swapped)': {
        "F": ["yellow", "green", "green", "yellow", "green", "green", "orange", "green", "green"],
        "R": ["white", "yellow", "red", "red", "red", "red", "red", "red", "blue"],
        "B": ["white", "white", "red", "white", "blue", "blue", "orange", "blue", "blue"],
        "L": ["blue", "orange", "orange", "orange", "orange", "orange", "yellow", "white", "white"],
        "U": ["white", "orange", "green", "green", "white", "blue", "green", "white", "orange"],
        "D": ["yellow", "red", "red", "yellow", "yellow", "blue", "yellow", "yellow", "blue"]
    }
};

async function testCubeState(driver, name, state) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Testing: ${name}`);
    console.log('='.repeat(50));

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
        await textarea.sendKeys(JSON.stringify(state));

        const loadBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Load Cube State')]")), TIMEOUTS.element);
        await loadBtn.click();
        await driver.sleep(1000);

        const solveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Solve Cube')]")), TIMEOUTS.element);
        await driver.executeScript("arguments[0].click();", solveBtn);

        await driver.sleep(2000);

        // Collect console logs
        const browserLogs = await driver.manage().logs().get('browser');

        let validationFailed = false;
        let solverFailed = false;
        const errors = [];

        for (const entry of browserLogs) {
            const msg = entry.message;
            if (msg.includes('VALIDATION_FAILED')) {
                validationFailed = true;
                errors.push(msg);
            }
            if (msg.includes('SOLVER_FAILED')) {
                solverFailed = true;
                errors.push(msg);
            }
        }

        // Check DOM
        try {
            await driver.findElement(By.xpath("//div[contains(text(), 'Unsolvable')]"));
            console.log('❌ FAILED: DOM shows "Unsolvable"');
            if (errors.length > 0) {
                console.log('\nConsole Errors:');
                errors.forEach(err => console.log('  -', err.substring(0, 150)));
            }
            return { name, passed: false, errors };
        } catch (e) {
            console.log('✅ PASSED: Cube appears solvable');
            if (errors.length > 0) {
                console.log('\n⚠️  WARNING: Found console errors but DOM shows as solvable:');
                errors.forEach(err => console.log('  -', err.substring(0, 150)));
            }
            return { name, passed: true, errors };
        }

    } catch (e) {
        console.log('❌ ERROR:', e.message);
        return { name, passed: false, errors: [e.message] };
    }
}

(async () => {
    let driver = await new Builder().forBrowser('chrome').build();
    const results = [];

    try {
        for (const [name, state] of Object.entries(testStates)) {
            const result = await testCubeState(driver, name, state);
            results.push(result);
        }

        console.log('\n\n' + '='.repeat(50));
        console.log('FINAL RESULTS');
        console.log('='.repeat(50));

        results.forEach(r => {
            console.log(`${r.passed ? '✅' : '❌'} ${r.name}`);
            if (r.errors.length > 0) {
                console.log(`   ${r.errors.length} error(s) logged`);
            }
        });

        const passedCount = results.filter(r => r.passed).length;
        console.log(`\nPassed: ${passedCount}/${results.length}`);

    } catch (e) {
        console.error('\nFATAL ERROR:', e.message);
    } finally {
        await driver.quit();
    }
})();
