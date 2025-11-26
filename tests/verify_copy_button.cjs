const { Builder, By, until } = require('selenium-webdriver');

const APP_URL = 'http://localhost:3001';
const TIMEOUTS = { element: 5000, settle: 1000 };

console.log('═══════════════════════════════════════');
console.log('  Test 5: Verify Copy State Button');
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

        console.log('3. Checking for Copy State button...');
        const copyBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Copy State')]")), TIMEOUTS.element);

        if (copyBtn) {
            console.log('✓ SUCCESS: Copy State button found!');
            process.exit(0);
        } else {
            console.log('✗ FAILED: Copy State button not found');
            process.exit(1);
        }

    } catch (e) {
        console.error('\n✗ ERROR:', e.message);
        process.exit(1);
    } finally {
        await driver.quit();
    }
})();
