const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const tests = [
    'robust_test_latest_state.cjs',
    'e2e_test_swapped_centers.cjs'
];

console.log('═══════════════════════════════════════');
console.log('  Running All Tests - Checking Logs');
console.log('═══════════════════════════════════════\n');

(async () => {
    const results = [];

    for (const test of tests) {
        console.log(`\n▶ Running: ${test}`);
        console.log('-'.repeat(50));

        try {
            const { stdout, stderr } = await execAsync(`node tests/${test}`, {
                cwd: 'd:\\Documents\\Workspace\\gemini\\rubix-cube-solver',
                timeout: 20000
            });

            const output = stdout + stderr;
            const hasValidationError = output.includes('VALIDATION_FAILED');
            const hasSolverError = output.includes('SOLVER_FAILED');
            const domUnsolvable = output.includes('Unsolvable');
            const testFailed = output.includes('❌ FAILED');
            const testPassed = output.includes('✅ PASSED') || output.includes('✓ SUCCESS');

            results.push({
                test,
                validationError: hasValidationError,
                solverError: hasSolverError,
                domUnsolvable,
                testFailed,
                testPassed
            });

            if (hasValidationError) {
                console.log('  ⚠️  VALIDATION_FAILED detected in console');
            }
            if (hasSolverError) {
                console.log('  ⚠️  SOLVER_FAILED detected in console');
            }
            if (domUnsolvable) {
                console.log('  ⚠️  DOM shows "Unsolvable"');
            }
            if (testFailed) {
                console.log('  ❌ Test marked as FAILED');
            }
            if (testPassed) {
                console.log('  ✅ Test marked as PASSED');
            }

        } catch (e) {
            console.log('  ❌ Test execution error:', e.message.substring(0, 100));
            results.push({
                test,
                error: e.message
            });
        }
    }

    console.log('\n\n' + '='.repeat(50));
    console.log('SUMMARY');
    console.log('='.repeat(50));

    results.forEach(r => {
        console.log(`\n${r.test}:`);
        if (r.error) {
            console.log('  ❌ Execution error');
        } else {
            if (r.validationError) console.log('  ⚠️  VALIDATION_FAILED logged');
            if (r.solverError) console.log('  ⚠️  SOLVER_FAILED logged');
            if (r.testFailed) console.log('  ❌ Test failed');
            if (r.testPassed && !r.validationError && !r.solverError) console.log('  ✅ Test passed, no errors');
        }
    });
})();
