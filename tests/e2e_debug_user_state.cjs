const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');

const APP_URL = 'http://localhost:3001';
const TIMEOUTS = { element: 5000, settle: 1000 };

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
console.log('  Test 7: Debug User State (E2E)');
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
        // Use JS click for robustness
        await driver.executeScript("arguments[0].click();", solveBtn);

        console.log('7. Waiting 10s for animation/render...');
        await driver.sleep(10000);

        console.log('8. Taking Screenshot...');
        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync('tests/debug_user_state_result.png', screenshot, 'base64');
        console.log('   Screenshot saved to tests/debug_user_state_result.png');

        console.log('9. Verifying Result...');
        try {
            // Check for success (Result Screen)
            await driver.wait(until.elementLocated(By.xpath("//h2[contains(., 'Final Model')]")), 5000);
            console.log('✓ UI: Result Screen displayed.');

            // Wait for the slider to appear
            const slider = await driver.wait(until.elementLocated(By.css('input[type="range"]')), 5000);

            // Get the max value (total steps)
            const maxSteps = await slider.getAttribute('max');
            console.log(`   Solution has ${parseInt(maxSteps) + 1} steps.`);

            // Force the slider to the end to trigger the final state
            console.log('   Skipping animation to final state...');
            await driver.executeScript("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", slider, maxSteps);

            // Wait for the state to update and save to localStorage
            await driver.sleep(2000);

            // Retrieve the final displayed state from localStorage
            const finalStateJson = await driver.executeScript("return localStorage.getItem('debug_finalDisplayedCubeState');");

            if (!finalStateJson) {
                throw new Error("Could not retrieve final state from localStorage.");
            }

            const finalState = JSON.parse(finalStateJson);

            // Verify if the state is actually solved
            let isSolved = true;
            const faces = ['U', 'D', 'F', 'B', 'R', 'L'];

            console.log('   Verifying final 3D cube state...');

            for (const face of faces) {
                const stickers = finalState[face];
                const firstColor = stickers[0];
                const isFaceSolved = stickers.every(c => c === firstColor);

                if (!isFaceSolved) {
                    console.log(`   ❌ Face ${face} is NOT solved! Colors: ${JSON.stringify(stickers)}`);
                    isSolved = false;
                } else {
                    console.log(`   ✓ Face ${face} is solved (${firstColor}).`);
                }
            }

            if (isSolved) {
                console.log('\n✓ SUCCESS: The final 3D cube is fully solved!');
            } else {
                console.log('\n✗ FAILURE: The final 3D cube is NOT solved.');
                throw new Error("Final 3D cube state is not solved.");
            }

        } catch (e) {
            // Check for error message
            try {
                const errorMsg = await driver.findElement(By.xpath("//div[contains(text(), 'Unsolvable')]"));
                const errorText = await errorMsg.getText();
                console.log('✗ FAILED: Solver returned error:', errorText);

                // Try to get more details if available
                const details = await driver.findElement(By.xpath("//div[contains(@class, 'text-red-400')]"));
                console.log('  Details:', await details.getText());
            } catch (err) {
                console.log('? UNKNOWN ERROR:', e.message);
            }
        }

    } catch (e) {
        console.error('\n✗ ERROR:', e.message);
    } finally {
        await driver.quit();
    }
})();
