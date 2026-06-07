const fs = require('fs');
const path = require('path');

const titleSlug = process.argv[2];

if (!titleSlug) {
    console.error('❌ Please provide a LeetCode problem slug. Example: node scrape.js two-sum');
    process.exit(1);
}

const GRAPHQL_URL = 'https://leetcode.com/graphql';

// UPDATED QUERY: Added questionFrontendId
const query = `
  query getQuestionDetail($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      questionFrontendId
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

        const jsSnippet = question.codeSnippets.find((s) => s.langSlug === 'javascript');
        const starterCode = jsSnippet ? jsSnippet.code : 'function solution() {\n\n}';
        const funcMatch = starterCode.match(/var\s+(\w+)\s*=\s*function/);
        const functionName = funcMatch ? funcMatch[1] : 'solution';

        const cleanContent = question.content
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        const topics = question.topicTags ? question.topicTags.map((tag) => tag.name) : [];

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
            formattedTestCases.push({ inputs: parsedInputs, expected: parsedOutput });
            outputIndex++;
        }

        // UPDATED JSON STRUCTURE: Added "number"
        const questionJson = {
            id: question.titleSlug,
            number: parseInt(question.questionFrontendId, 10), // The actual LeetCode #
            title: question.title,
            difficulty: question.difficulty,
            topics: topics,
            functionName: functionName,
            description: cleanContent,
            starterCode: starterCode,
            testCases: formattedTestCases,
        };

        const questionsDir = path.join(__dirname, 'questions');
        if (!fs.existsSync(questionsDir)) fs.mkdirSync(questionsDir);

        const questionFilePath = path.join(questionsDir, `${question.titleSlug}.json`);
        fs.writeFileSync(questionFilePath, JSON.stringify(questionJson, null, 2));
        console.log(`✅ Successfully generated question JSON: ${questionFilePath}`);

        const solutionsDir = path.join(__dirname, 'solutions');
        if (!fs.existsSync(solutionsDir)) fs.mkdirSync(solutionsDir);

        const solutionFilePath = path.join(solutionsDir, `${question.titleSlug}.js`);
        if (!fs.existsSync(solutionFilePath)) {
            const commentDescription = cleanContent
                .split('\n')
                .map((line) => ` * ${line}`)
                .join('\n');
            const solutionTemplate = `/**\n * Problem: ${question.title}\n * Difficulty: ${question.difficulty}\n * Topics: ${topics.join(', ')}\n * * Description:\n${commentDescription}\n */\n\n${starterCode}\n\nmodule.exports = { ${functionName} };\n`;
            fs.writeFileSync(solutionFilePath, solutionTemplate);
            console.log(`✅ Successfully generated starter solution: ${solutionFilePath}`);
        } else {
            console.log(`ℹ️  Solution file already exists, skipping creation.`);
        }
    } catch (error) {
        console.error('❌ Failed to scrape the problem:', error.message);
    }
}

fetchProblem();
