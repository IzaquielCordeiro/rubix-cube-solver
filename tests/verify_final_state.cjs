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
console.log('  Verifying Final Solved State');
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

        console.log('6. Waiting for solution (5s)...');
        await driver.sleep(5000);

        const bodyText = await driver.findElement(By.tagName('body')).getText();

        if (!bodyText.includes('Solvable')) {
            console.log('\n✗ FAILED: Cube not marked as solvable');
            process.exit(1);
        }

        console.log('7. Solution found! Playing animation...');

        // Click play button to start animation
        const playBtn = await driver.wait(until.elementLocated(By.css('button[class*="bg-blue-600"]')), TIMEOUTS.element);
        await playBtn.click();

        console.log('8. Waiting for animation to complete (5s)...');
        await driver.sleep(5000);

        // Take screenshot of final state
        const fs = require('fs');
        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync('d:/Documents/Workspace/gemini/rubix-cube-solver/tests/test2_final_state.png', screenshot, 'base64');
        console.log('9. Screenshot saved: tests/test2_final_state.png');

        // Get final cube state from localStorage (saved by ResultScreen DEBUG code)
        const finalStateStr = await driver.executeScript('return localStorage.getItem("debug_finalDisplayedCubeState");');

        if (finalStateStr) {
            const finalState = JSON.parse(finalStateStr);
            console.log('\n10. Checking if final cube state is solved...');

            // Check if each face has all same colors
            const faces = ['F', 'R', 'B', 'L', 'U', 'D'];
            let allSolved = true;

            for (const face of faces) {
                const faceColors = finalState[face];
                const firstColor = faceColors[0];
                const allSame = faceColors.every(c => c === firstColor);

                console.log(`   Face ${face}: ${allSame ? '✓' : '✗'} (${firstColor})`);

                if (!allSame) {
                    allSolved = false;
                    console.log(`      Colors: ${faceColors.join(', ')}`);
                }
            }

            if (allSolved) {
                console.log('\n✓ SUCCESS: Final cube is SOLVED!');
                console.log('   All faces have uniform colors.');
                process.exit(0);
            } else {
                console.log('\n✗ FAILED: Final cube is NOT solved!');
                console.log('   Some faces have mixed colors.');
                process.exit(1);
            }
        } else {
            console.log('\n⚠ WARNING: Could not retrieve final state from localStorage');
            console.log('   Check screenshot manually: tests/test2_final_state.png');
            process.exit(1);
        }

    } catch (e) {
        console.error('\n✗ ERROR:', e.message);
        process.exit(1);
    } finally {
        await driver.quit();
    }
})();
