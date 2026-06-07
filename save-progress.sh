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
# Switch to main to branch off cleanly
git checkout main 2>/dev/null || git checkout master 2>/dev/null

# Create or switch to today's progress branch
git checkout -b $PROGRESS_BRANCH 2>/dev/null || git checkout $PROGRESS_BRANCH

# Stage and commit the raw code
git add questions/ solutions/
git commit -m "feat: complete $SLUG for $TODAY"
git push -u origin $PROGRESS_BRANCH
echo "✅ Code saved to branch: $PROGRESS_BRANCH"


# ==========================================
# PHASE 2: GENERATE THE HTML
# ==========================================
echo "⚙️ Building the HTML website..."
node build-site.js 


# ==========================================
# PHASE 3: DEPLOYMENT (THE FIX)
# ==========================================
echo "🌐 Deploying strictly the built files..."

# 1. Get the remote repository URL
REPO_URL=$(git remote get-url origin)

# 2. Go inside the ignored dist/ folder
cd dist

# 3. Create a temporary, completely blank Git repo
git init
git checkout -b deploy

# 4. Add ONLY the HTML files and commit
git add .
git commit -m "deploy: live website update for $TODAY"

# 5. Force push this tiny, clean repo over your GitHub 'deploy' branch
git push -f $REPO_URL deploy

# 6. Clean up the temporary git data and go back to the root folder
rm -rf .git
cd ..

echo "✅ Website deployed cleanly! The 'deploy' branch now ONLY contains your website."


# ==========================================
# PHASE 4: CLEANUP
# ==========================================
# Return back to the main working branch
git checkout main 2>/dev/null || git checkout master 2>/dev/null
echo "🎉 All done! You are back on your main branch."