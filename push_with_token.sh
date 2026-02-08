#!/bin/bash

# Script to push to GitHub with token authentication
# Usage: ./push_with_token.sh YOUR_TOKEN

cd "/Users/ayushsingh/Desktop/tryb-2026"

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Personal Access Token"
    echo ""
    echo "Usage: ./push_with_token.sh YOUR_TOKEN"
    echo ""
    echo "To get your token:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Generate new token (classic)"
    echo "3. Select scope: repo"
    echo "4. Copy the token (starts with ghp_)"
    exit 1
fi

TOKEN=$1

echo "🚀 Pushing to GitHub..."
echo "Repository: wandermate123/tryb_studio"
echo ""

# Push using token in URL
git push https://wandermate123:${TOKEN}@github.com/wandermate123/tryb_studio.git main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your site: https://wandermate123.github.io/tryb_studio/"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. Token is correct and has 'repo' scope"
    echo "2. Repository exists: https://github.com/wandermate123/tryb_studio"
    echo "3. You have write access to the repository"
fi
