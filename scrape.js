const fs = require('fs');
const path = require('path');

const titleSlug = process.argv[2];

if (!titleSlug) {
    console.error('❌ Please provide a LeetCode problem slug. Example: node scrape.js two-sum');
    process.exit(1);
}

const GRAPHQL_URL = 'https://leetcode.com/graphql';

const query = `
  query getQuestionDetail($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      titleSlug
      content
      exampleTestcases
      codeSnippets {
        langSlug
        code
      }
    }
  }
`;

async function fetchProblem() {
    console.log(`🔍 Fetching data for '${titleSlug}'...`);

    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: query,
                variables: { titleSlug: titleSlug },
            }),
        });

        const data = await response.json();
        const question = data.data.question;

        if (!question) {
            console.error(`❌ Problem '${titleSlug}' not found.`);
            process.exit(1);
        }

        // Extract JS starter code
        const jsSnippet = question.codeSnippets.find((s) => s.langSlug === 'javascript');
        const starterCode = jsSnippet ? jsSnippet.code : 'function solution() {\n\n}';

        // Extract the primary function name from the starter code
        const funcMatch = starterCode.match(/var\s+(\w+)\s*=\s*function/);
        const functionName = funcMatch ? funcMatch[1] : 'solution';

        // Clean up HTML tags from the description
        const cleanContent = question.content
            .replace(/<[^>]+>/g, '') // Strip HTML tags
            .replace(/&nbsp;/g, ' ') // Clean up HTML entities
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
            .trim();

        // Format raw test cases
        const rawTestCases = question.exampleTestcases.split('\n');
        const formattedTestCases = [
            {
                note: 'Manually verify the inputs and expected outputs below.',
                inputs: rawTestCases,
                expected: 'FILL_ME_IN',
            },
        ];

        const questionJson = {
            id: question.titleSlug,
            title: question.title,
            functionName: functionName,
            description: cleanContent,
            starterCode: starterCode,
            testCases: formattedTestCases,
        };

        // --- 1. SAVE THE QUESTION JSON ---
        const questionsDir = path.join(__dirname, 'questions');
        if (!fs.existsSync(questionsDir)) {
            fs.mkdirSync(questionsDir);
        }
        const questionFilePath = path.join(questionsDir, `${question.titleSlug}.json`);
        fs.writeFileSync(questionFilePath, JSON.stringify(questionJson, null, 2));
        console.log(`✅ Successfully generated question JSON: ${questionFilePath}`);

        // --- 2. GENERATE THE STARTER SOLUTION FILE ---
        const solutionsDir = path.join(__dirname, 'solutions');
        if (!fs.existsSync(solutionsDir)) {
            fs.mkdirSync(solutionsDir);
        }
        const solutionFilePath = path.join(solutionsDir, `${question.titleSlug}.js`);

        // Prevent overwriting existing solutions
        if (!fs.existsSync(solutionFilePath)) {
            // Format the description as a block comment
            const commentDescription = cleanContent
                .split('\n')
                .map((line) => ` * ${line}`)
                .join('\n');

            const solutionTemplate = `/**
 * Problem: ${question.title}
 * * Description:
${commentDescription}
 * * Example Inputs:
 * ${rawTestCases.join('\n * ')}
 */

${starterCode}

module.exports = { ${functionName} };
`;

            fs.writeFileSync(solutionFilePath, solutionTemplate);
            console.log(`✅ Successfully generated starter solution: ${solutionFilePath}`);
        } else {
            console.log(`ℹ️  Solution file already exists, skipping creation to prevent overwrite: ${solutionFilePath}`);
        }

        console.log(`\n⚠️  Next Steps:`);
        console.log(`1. Open questions/${question.titleSlug}.json and format the 'testCases' arrays.`);
        console.log(`2. Open solutions/${question.titleSlug}.js and start coding!`);
    } catch (error) {
        console.error('❌ Failed to scrape the problem:', error.message);
    }
}

fetchProblem();
