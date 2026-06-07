const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Get the problem ID from the command line arguments
const problemId = process.argv[2];

if (!problemId) {
    console.error('Please provide a problem ID. Example: node runner.js two-sum');
    process.exit(1);
}

const questionPath = path.join(__dirname, 'questions', `${problemId}.json`);
const solutionPath = path.join(__dirname, 'solutions', `${problemId}.js`);

if (!fs.existsSync(questionPath) || !fs.existsSync(solutionPath)) {
    console.error(`Could not find question or solution for: ${problemId}`);
    process.exit(1);
}

const question = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
const solution = require(solutionPath);

const func = solution[question.functionName];

console.log(`\nRunning tests for: ${question.title}...\n`);

let passed = 0;

question.testCases.forEach((tc, index) => {
    try {
        const actual = func(...tc.inputs);
        // deepStrictEqual checks for exact value and structure matches
        assert.deepStrictEqual(actual, tc.expected);
        console.log(`✅ Test ${index + 1}: Passed`);
        passed++;
    } catch (err) {
        console.log(`❌ Test ${index + 1}: Failed`);
        console.log(`   Expected: ${JSON.stringify(tc.expected)}`);
        console.log(`   Actual:   ${JSON.stringify(err.actual)}`);
    }
});

console.log(`\nResult: ${passed}/${question.testCases.length} Passed\n`);
