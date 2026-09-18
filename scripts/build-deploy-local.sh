#!/bin/bash

## paste & uncomment the follwing script in the post-commit 
## hook inside .git/hooks/post-commit and make it executable.

########################################################
########################################################
########################################################
########################################################
########################################################
########################################################

###     #!/bin/bash
###
###     BUILD_SCRIPT_PATH="$HOME/trading/trade/scripts/build-deploy-local.sh"
###     {
###      if [ -f "$BUILD_SCRIPT_PATH" ]; then
###        # Run the script in the background so VS Code doesn't hang
###        echo "Executing Script > $BUILD_SCRIPT_PATH"
###        $BUILD_SCRIPT_PATH
###      else
###        echo "Warning: Post-commit script not found at $BUILD_SCRIPT_PATH" >&2
###      fi
###     } > $HOME/trading/trade/.git/post_commit.log 2>&1 & 

########################################################
########################################################
########################################################
########################################################
########################################################
########################################################

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

    rm -rf public

    npm run build

    cp -r public /var/www/trade

    echo "Local Deployment completed successfully."

    echo "Local Development Build deployed at $(date)"


else

    echo "This hook is meant to run on develop branch only. CURRENT BRANCH:- $CURRENT_BRANCH"
    # Quietly exit if it's any other branch.
    exit 0
fi