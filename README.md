# 🚀 Local DSA Tracker & Judge

A lightweight, terminal-based workflow for practicing Data Structures and Algorithms locally. This project allows you to scrape LeetCode problems directly into your workspace, run local test cases using a custom Node.js judge, and automate your daily Git commits to track your progress.

## ✨ Features

- **LeetCode GraphQL Scraper**: Instantly fetch problem descriptions, starter code, and test cases using just the problem slug.
- **Local Test Engine**: Run your solutions locally against test cases with deep equality checking. No need to constantly submit to the platform.
- **Automated Solution Generation**: Automatically creates a structured JavaScript file for your solution with the problem description formatted as JSDoc comments.
- **Daily Git Automation**: A one-click bash script to commit and push your daily progress to a date-stamped branch.

## 📂 Project Structure

\`\`\`text
dsa-tracker/
├── questions/         # Auto-generated JSON files containing test cases and problem data
├── solutions/         # Your daily workspace containing the JS solution files
├── scrape.js          # The LeetCode problem scraper
├── runner.js          # The local Node.js test runner
└── save-progress.sh   # Bash script for daily Git automation
\`\`\`

## 🛠️ Prerequisites

- **Node.js**: v18.0 or higher (uses native `fetch` and `assert`).
- **Git**: Configured with your GitHub repository.

## 🚀 Daily Workflow

### 1. Fetch a Problem
Find a problem on LeetCode and grab its URL slug (e.g., `two-sum` from `leetcode.com/problems/two-sum/`). Run the scraper tool:

\`\`\`bash
node scrape.js two-sum
\`\`\`
*What happens?*
- Generates `questions/two-sum.json` containing the problem data.
- Generates `solutions/two-sum.js` with the problem description and starter code.

**Note:** Open the generated `questions/<slug>.json` file to format the example inputs into arrays and fill in the `"expected"` outputs before testing.

### 2. Solve and Test
Open `solutions/<slug>.js` and write your algorithm. When you are ready to test it, run the local judge:

\`\`\`bash
node runner.js two-sum
\`\`\`
*What happens?*
- Runs your function against all test cases defined in the JSON file.
- Outputs detailed Pass/Fail logs with expected vs. actual results.

### 3. Save Your Progress
At the end of your practice session, run the automation script to save your work:

\`\`\`bash
./save-progress.sh
\`\`\`
*What happens?*
- Creates a new branch named `progress-YYYY-MM-DD`.
- Stages all changes and commits them with a standard message.
- Pushes the branch to your remote repository.

## ⚙️ Setup Instructions

1. Initialize a new Node.js project:
   \`\`\`bash
   npm init -y
   \`\`\`
2. Create the core files (`scrape.js`, `runner.js`, `save-progress.sh`) in your root directory.
3. Make the bash script executable:
   \`\`\`bash
   chmod +x save-progress.sh
   \`\`\`
4. Initialize your Git repository and connect it to GitHub:
   \`\`\`bash
   git init
   git remote