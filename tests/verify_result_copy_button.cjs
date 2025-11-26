const { Builder, By, until } = require('selenium-webdriver');

const APP_URL = 'http://localhost:3001';
const TIMEOUTS = { element: 5000, settle: 1000 };

console.log('═══════════════════════════════════════');
console.log('  Test 6: Verify Copy Button in Result Screen');
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

        const copyBtns = await driver.findElements(By.xpath("//button[contains(., 'Copy State')]"));

        if (copyBtns.length > 0) {
            console.log(`✓ SUCCESS: Found ${copyBtns.length} Copy State button(s)!`);
            process.exit(0);
        } else {
            console.log('✗ FAILED: Copy State button not found in Result Screen');
            process.exit(1);
        }

    } catch (e) {
        console.error('\n✗ ERROR:', e.message);
        process.exit(1);
    } finally {
        await driver.quit();
    }
})();
