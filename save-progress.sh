#!/bin/bash

# Get today's date in YYYY-MM-DD format
TODAY=$(date +%Y-%m-%d)

# Branch name
BRANCH_NAME="progress-$TODAY"

echo "🚀 Saving DSA progress for $TODAY..."

# Checkout new branch (or switch to it if it already exists)
git checkout -b $BRANCH_NAME 2>/dev/null || git checkout $BRANCH_NAME

# Stage all changes
git add .

# Commit with a standardized message
git commit -m "feat: complete DSA practice for $TODAY"

# Push the branch to GitHub
git push -u origin $BRANCH_NAME

echo "✅ Progress successfully saved and pushed to branch: $BRANCH_NAME"