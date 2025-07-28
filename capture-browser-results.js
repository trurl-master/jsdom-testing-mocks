import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureBrowserResults(testFile = 'comprehensive-browser-verification.html') {
    console.log('Starting browser test capture...');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        
        // Navigate to our test file
        const testFilePath = path.resolve(__dirname, testFile);
        await page.goto(`file://${testFilePath}`);
        
        console.log('Waiting for tests to complete...');
        
        // Wait for tests to finish (look for results element)
        await page.waitForSelector('#results', { timeout: 30000 });
        
        // Wait a bit more for all tests to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Capture browser info
        const browserInfo = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            const infoElement = document.getElementById('browser-info');
            return infoElement ? infoElement.innerText : 'Browser info not found';
        });
        
        // Capture expressions results
        const expressions = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            const expressionResults = document.querySelectorAll('.expression-result');
            const results = [];
            
            expressionResults.forEach((result, index) => {
                const expression = result.querySelector('.expression')?.innerText || `Expression ${index}`;
                const resultValue = result.querySelector('.result')?.innerText || '';
                const type = result.querySelector('.type')?.innerText || '';
                const error = result.querySelector('.error')?.innerText || '';
                
                results.push({
                    expression,
                    result: resultValue,
                    type: type.replace('Type: ', ''),
                    error: error.replace('Error: ', '')
                });
            });
            
            return results;
        });
        
        // Create test results format for compatibility
        const testResults = expressions.map(expr => ({
            testName: expr.expression,
            status: expr.error ? '✗ FAIL' : '✓ PASS',
            expectedType: '',
            actualType: expr.type,
            expectedValue: '',
            actualValue: expr.result,
            error: expr.error,
            comparison: expr.error ? `Browser throws: ${expr.error}` : `Browser returns: ${expr.result}`,
            behaviorNote: ''
        }));
        
        const summary = `Total: ${testResults.length} | Passed: ${testResults.filter(r => r.status === '✓ PASS').length} | Failed: ${testResults.filter(r => r.status === '✗ FAIL').length}`;
        
        // Generate report
        const report = {
            timestamp: new Date().toISOString(),
            browserInfo,
            summary,
            testResults
        };
        
        // Save detailed report
        const reportPath = path.join(__dirname, 'browser-test-results.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Generate human-readable report
        const humanReadableReport = generateHumanReadableReport(report);
        const humanReportPath = path.join(__dirname, 'browser-test-results.txt');
        fs.writeFileSync(humanReportPath, humanReadableReport);
        
        console.log('\n=== BROWSER TEST RESULTS ===');
        console.log(browserInfo);
        console.log('\n' + summary);
        console.log('\nDetailed results saved to:');
        console.log('- browser-test-results.json (structured data)');
        console.log('- browser-test-results.txt (human readable)');
        
        // Show some key findings
        const passed = testResults.filter(r => r.status.includes('PASS')).length;
        const failed = testResults.filter(r => r.status.includes('FAIL')).length;
        const warnings = testResults.filter(r => r.status.includes('WARNING')).length;
        const skipped = testResults.filter(r => r.status.includes('SKIP')).length;
        
        console.log(`\n=== KEY FINDINGS ===`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Warnings: ${warnings}`);
        console.log(`Skipped: ${skipped}`);
        
        // Show some interesting discrepancies
        const discrepancies = testResults.filter(r => 
            r.status.includes('WARNING') || 
            (r.status.includes('PASS') && r.comparison && !r.comparison.includes('Expected'))
        );
        
        if (discrepancies.length > 0) {
            console.log(`\n=== INTERESTING DISCREPANCIES ===`);
            discrepancies.slice(0, 10).forEach(d => {
                console.log(`\n${d.testName}:`);
                console.log(`  Expected: ${d.expectedType} - ${d.expectedValue}`);
                console.log(`  Actual: ${d.actualType} - ${d.actualValue}`);
                if (d.comparison) console.log(`  Browser: ${d.comparison}`);
            });
        }
        
    } catch (error) {
        console.error('Error capturing browser results:', error);
    } finally {
        await browser.close();
    }
}

function generateHumanReadableReport(report) {
    let output = '';
    
    output += 'CSS TYPED OM BROWSER VERIFICATION RESULTS\n';
    output += '==========================================\n\n';
    output += `Timestamp: ${report.timestamp}\n\n`;
    
    output += 'BROWSER INFORMATION\n';
    output += '-------------------\n';
    output += report.browserInfo + '\n\n';
    
    output += 'SUMMARY\n';
    output += '-------\n';
    output += report.summary + '\n\n';
    
    output += 'DETAILED TEST RESULTS\n';
    output += '---------------------\n';
    
    const categories = {};
    report.testResults.forEach(result => {
        const category = result.testName.split(':')[0];
        if (!categories[category]) categories[category] = [];
        categories[category].push(result);
    });
    
    Object.entries(categories).forEach(([category, tests]) => {
        output += `\n${category.toUpperCase()}\n`;
        output += '-'.repeat(category.length) + '\n';
        
        tests.forEach(test => {
            output += `\n${test.testName}\n`;
            output += `  Status: ${test.status}\n`;
            output += `  Expected Type: ${test.expectedType}\n`;
            output += `  Actual Type: ${test.actualType}\n`;
            output += `  Expected Value: ${test.expectedValue}\n`;
            output += `  Actual Value: ${test.actualValue}\n`;
            
            if (test.error) output += `  Error: ${test.error}\n`;
            if (test.comparison) output += `  Browser Behavior: ${test.comparison}\n`;
            if (test.behaviorNote) output += `  Note: ${test.behaviorNote}\n`;
        });
    });
    
    return output;
}

// Run the capture
const testFile = process.argv[2] || 'comprehensive-browser-verification.html';
captureBrowserResults(testFile).catch(console.error); 