const { Builder, By, until } = require('selenium-webdriver');

const APP_URL = 'http://localhost:3001';
const TIMEOUTS = { element: 5000, settle: 1000 };

// Checkerboard Pattern (R2 L2 U2 D2 F2 B2)
// Valid state where edges are opposite colors of corners/center
const checkerboardState = {
    // U (Green) -> Edges Blue
    "U": ["green", "blue", "green", "blue", "green", "blue", "green", "blue", "green"],
    // D (Blue) -> Edges Green
    "D": ["blue", "green", "blue", "green", "blue", "green", "blue", "green", "blue"],
    // F (White) -> Edges Yellow
    "F": ["white", "yellow", "white", "yellow", "white", "yellow", "white", "yellow", "white"],
    // B (Yellow) -> Edges White
    "B": ["yellow", "white", "yellow", "white", "yellow", "white", "yellow", "white", "yellow"],
    // L (Red) -> Edges Orange
    "L": ["red", "orange", "red", "orange", "red", "orange", "red", "orange", "red"],
    // R (Orange) -> Edges Red
    "R": ["orange", "red", "orange", "red", "orange", "red", "orange", "red", "orange"]
};

console.log('═══════════════════════════════════════');
console.log('  Test 3: Checkerboard Pattern (Complex)');
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

        console.log('4. Loading checkerboard state...');
        const textarea = await driver.wait(until.elementLocated(By.css('textarea')), TIMEOUTS.element);
        await textarea.clear();
        await textarea.sendKeys(JSON.stringify(checkerboardState));

        const loadBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Load Cube State')]")), TIMEOUTS.element);
        await loadBtn.click();
        await driver.sleep(1500);

        console.log('5. Clicking Solve Cube...');
        const solveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Solve Cube')]")), TIMEOUTS.element);
        await solveBtn.click();

        console.log('6. Waiting for solution (checking every 5s for up to 60s)...');

        let solved = false;
        for (let i = 5; i <= 60; i += 5) {
            await driver.sleep(5000);
            const bodyText = await driver.findElement(By.tagName('body')).getText();

            console.log(`   [${i}s] Checking...`);

            if (bodyText.includes('Unsolvable') || bodyText.includes('Invalid')) {
                console.log('\n✗ FAILED: Cube marked as unsolvable');
                console.log('Status:', bodyText.substring(0, 300));
                process.exit(1);
            }

            if (bodyText.includes('Solvable') || bodyText.includes('Solved in') || bodyText.includes('already solved')) {
                const match = bodyText.match(/Solved in (\d+) moves?|(\d+) moves?/i);
                const moves = match ? (match[1] || match[2] || '0') : '0';
                console.log(`\n✓ SUCCESS: Solution found after ${i}s!`);
                console.log(`   Moves: ${moves}`);
                solved = true;
                break;
            }
        }

        if (!solved) {
            console.log('\n✗ TIMEOUT: No solution found after 60 seconds');
            process.exit(1);
        }

        console.log('7. Playing animation to verify final state...');
        const playBtn = await driver.wait(until.elementLocated(By.css('button[class*="bg-blue-600"]')), TIMEOUTS.element);
        await playBtn.click();

        // Wait for animation (approx 1s per move + buffer)
        // Checkerboard is usually solved in ~6-10 moves depending on metric
        console.log('   Waiting 20s for animation...');
        await driver.sleep(20000);

        // Take screenshot
        const fs = require('fs');
        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync('d:/Documents/Workspace/gemini/rubix-cube-solver/tests/test3_checkerboard_final.png', screenshot, 'base64');
        console.log('   Screenshot saved: tests/test3_checkerboard_final.png');

        // Verify final state from localStorage
        const finalStateStr = await driver.executeScript('return localStorage.getItem("debug_finalDisplayedCubeState");');

        if (finalStateStr) {
            const finalState = JSON.parse(finalStateStr);
            console.log('\n8. Checking final cube state...');

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
                process.exit(0);
            } else {
                console.log('\n✗ FAILED: Final cube is NOT solved!');
                console.log('   This likely means other moves (L, U, D, F, B) are also broken in cubeManipulator.ts');
                process.exit(1);
            }
        } else {
            console.log('\n⚠ WARNING: Could not retrieve final state');
            process.exit(1);
        }

    } catch (e) {
        console.error('\n✗ ERROR:', e.message);
        process.exit(1);
    } finally {
        await driver.quit();
    }
})();
