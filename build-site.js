const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const problemsDir = path.join(distDir, 'problems');
const questionsDir = path.join(__dirname, 'questions');
const solutionsDir = path.join(__dirname, 'solutions');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);
if (!fs.existsSync(problemsDir)) fs.mkdirSync(problemsDir);

const indexTemplate = fs.readFileSync(path.join(__dirname, 'template-index.html'), 'utf8');
const problemTemplate = fs.readFileSync(path.join(__dirname, 'template-problem.html'), 'utf8');

const files = fs.readdirSync(questionsDir).filter((f) => f.endsWith('.json'));
const problems = [];

files.forEach((file) => {
    const slug = file.replace('.json', '');
    const qPath = path.join(questionsDir, file);
    const sPath = path.join(solutionsDir, `${slug}.js`);

    if (fs.existsSync(sPath)) {
        const question = JSON.parse(fs.readFileSync(qPath, 'utf8'));
        const code = fs.readFileSync(sPath, 'utf8');
        problems.push({ slug, question, code });
    }
});

// UPDATED SORTING: Sort numerically by LeetCode problem number
// If an older JSON doesn't have a number yet, push it to the back (Infinity)
problems.sort((a, b) => {
    const numA = a.question.number || Infinity;
    const numB = b.question.number || Infinity;
    return numA - numB;
});

// 1. GENERATE INDIVIDUAL PROBLEM PAGES
problems.forEach((p) => {
    const { slug, question, code } = p;
    const topicTags = (question.topics || []).map((t) => `<span class="topic-tag">${t}</span>`).join('');
    const descFormatted = question.description.replace(/\n/g, '<br>');

    // Fallback to '?' if it's an old JSON missing the number
    const displayNum = question.number || '?';

    const html = problemTemplate
        .replace(/{{TITLE}}/g, question.title)
        .replace(/{{ID}}/g, displayNum)
        .replace(/{{SLUG}}/g, slug)
        .replace(/{{DIFFICULTY}}/g, question.difficulty || 'Easy')
        .replace(/{{DIFFICULTY_LOWER}}/g, (question.difficulty || 'Easy').toLowerCase())
        .replace(/{{TOPICS}}/g, topicTags)
        .replace(/{{DESCRIPTION}}/g, descFormatted)
        .replace(/{{CODE}}/g, code.replace(/</g, '&lt;').replace(/>/g, '&gt;'));

    fs.writeFileSync(path.join(problemsDir, `${slug}.html`), html);
});

// 2. GENERATE MAIN INDEX PAGE
const cardsHtml = problems
    .map((p) => {
        const diff = p.question.difficulty || 'Easy';
        const displayNum = p.question.number || '?';

        return `
        <a href="problems/${p.slug}.html" class="card">
            <h3 class="card-title">${p.question.title}</h3>
            <div class="card-meta">
                <span>#${displayNum}</span>
                <span class="badge ${diff.toLowerCase()}">${diff}</span>
            </div>
        </a>
    `;
    })
    .join('');

const finalIndex = indexTemplate.replace(/{{TOTAL_COUNT}}/g, problems.length).replace(/{{PROBLEM_CARDS}}/g, cardsHtml);

fs.writeFileSync(path.join(distDir, 'index.html'), finalIndex);

console.log(`✅ Built main index and ${problems.length} problem pages!`);
