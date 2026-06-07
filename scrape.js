const fs = require('fs');
const path = require('path');

const titleSlug = process.argv[2];

if (!titleSlug) {
    console.error('❌ Please provide a LeetCode problem slug. Example: node scrape.js two-sum');
    process.exit(1);
}

const GRAPHQL_URL = 'https://leetcode.com/graphql';

// UPDATED QUERY: Now includes difficulty and topicTags
const query = `
  query getQuestionDetail($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      titleSlug
      difficulty
      topicTags {
        name
      }
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

        // Format topics into a simple array of strings
        const topics = question.topicTags ? question.topicTags.map((tag) => tag.name) : [];

        // --- THE MAGIC: SMART TEST CASE PARSING ---
        const numParams = (starterCode.match(/@param/g) || []).length;
        const argsCount = numParams > 0 ? numParams : 1;
        const outputStrings = [...cleanContent.matchAll(/Output:\s*(.*)/g)].map((m) => m[1].trim());

        const rawTestCases = question.exampleTestcases.split('\n');
        const formattedTestCases = [];

        let outputIndex = 0;
        for (let i = 0; i < rawTestCases.length; i += argsCount) {
            const currentInputs = rawTestCases.slice(i, i + argsCount);

            const parsedInputs = currentInputs.map((val) => {
                try {
                    return JSON.parse(val);
                } catch (e) {
                    return val;
                }
            });

            let parsedOutput = 'FILL_ME_IN';
            if (outputStrings[outputIndex]) {
                try {
                    parsedOutput = JSON.parse(outputStrings[outputIndex]);
                } catch (e) {
                    parsedOutput = outputStrings[outputIndex];
                }
            }

            formattedTestCases.push({
                inputs: parsedInputs,
                expected: parsedOutput,
            });
            outputIndex++;
        }
        // ----------------------------------------

        // UPDATED JSON: Now includes difficulty and topics
        const questionJson = {
            id: question.titleSlug,
            title: question.title,
            difficulty: question.difficulty,
            topics: topics,
            functionName: functionName,
            description: cleanContent,
            starterCode: starterCode,
            testCases: formattedTestCases,
        };

        // Save Question JSON
        const questionsDir = path.join(__dirname, 'questions');
        if (!fs.existsSync(questionsDir)) {
            fs.mkdirSync(questionsDir);
        }
        const questionFilePath = path.join(questionsDir, `${question.titleSlug}.json`);
        fs.writeFileSync(questionFilePath, JSON.stringify(questionJson, null, 2));
        console.log(`✅ Successfully generated question JSON: ${questionFilePath}`);

        // Generate Solution File
        const solutionsDir = path.join(__dirname, 'solutions');
        if (!fs.existsSync(solutionsDir)) {
            fs.mkdirSync(solutionsDir);
        }
        const solutionFilePath = path.join(solutionsDir, `${question.titleSlug}.js`);

        if (!fs.existsSync(solutionFilePath)) {
            const commentDescription = cleanContent
                .split('\n')
                .map((line) => ` * ${line}`)
                .join('\n');

            // UPDATED TEMPLATE: Added Difficulty and Topics to the top comment
            const solutionTemplate = `/**
 * Problem: ${question.title}
 * Difficulty: ${question.difficulty}
 * Topics: ${topics.join(', ')}
 * * Description:
${commentDescription}
 */

${starterCode}

module.exports = { ${functionName} };
`;

            fs.writeFileSync(solutionFilePath, solutionTemplate);
            console.log(`✅ Successfully generated starter solution: ${solutionFilePath}`);
        } else {
            console.log(`ℹ️  Solution file already exists, skipping creation to prevent overwrite: ${solutionFilePath}`);
        }

        console.log(`\n🎉 All done! Write your code in 'solutions/${question.titleSlug}.js' then run 'node runner.js ${question.titleSlug}'`);
    } catch (error) {
        console.error('❌ Failed to scrape the problem:', error.message);
    }
}

fetchProblem();
