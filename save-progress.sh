#!/bin/bash

SLUG=$1

if [ -z "$SLUG" ]; then
  echo "❌ Please provide the problem slug. Usage: ./save-progress.sh <slug>"
  exit 1
fi

TODAY=$(date +%Y-%m-%d)
PROGRESS_BRANCH="progress-$TODAY"

echo "🚀 Starting save sequence for $SLUG..."

# ==========================================
# PHASE 1: SAVE CODE TO PROGRESS BRANCH
# ==========================================
# Switch to the main branch first to branch off cleanly
git checkout main 2>/dev/null || git checkout master 2>/dev/null

# Create or switch to today's progress branch
git checkout -b $PROGRESS_BRANCH 2>/dev/null || git checkout $PROGRESS_BRANCH

# Stage and commit the raw code (dist/ is ignored by .gitignore)
git add questions/ solutions/
git commit -m "feat: complete $SLUG for $TODAY"
git push -u origin $PROGRESS_BRANCH
echo "✅ Code saved to branch: $PROGRESS_BRANCH"


# ==========================================
# PHASE 2: GENERATE THE HTML
# ==========================================
echo "⚙️ Building the HTML website..."
# Run the builder without arguments since it does everything now
node build-site.js 


# ==========================================
# PHASE 3: DEPLOYMENT BRANCH
# ==========================================
echo "🌐 Updating the deploy branch..."

git checkout deploy 2>/dev/null || git checkout -b deploy

# Copy EVERYTHING from dist (index.html AND the problems/ folder)
cp -r dist/* ./

# Add all the HTML files and commit
git add index.html problems/
git commit -m "deploy: live website update for $TODAY"
git push -u origin deploy
echo "✅ Website updated on branch: deploy"