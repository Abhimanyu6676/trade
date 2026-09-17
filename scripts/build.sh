#!/bin/bash

# Get the name of the current active branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)


#{
#    echo "🔄 Running background tasks for develop..."
#    # Your long-running command here
#
#} > /root/trading/trade/.git/post_commit.log 2>&1 & 


# Check if the current branch is 'develop'
if [[ "$CURRENT_BRANCH" =~ feature/*|hotfix/* ]]; then
    echo "🔄 Running post-commit tasks for the '$CURRENT_BRANCH' branch..."

    npm run test


else

    echo "This hook is meant to run on develop branch only. CURRENT BRANCH:- $CURRENT_BRANCH"
    # Quietly exit if it's any other branch.
    exit 0
fi