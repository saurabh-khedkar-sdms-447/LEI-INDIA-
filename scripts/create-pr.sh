#!/bin/bash
# Script to create a Pull Request from your fork to upstream
# Usage: GITHUB_TOKEN=your_token ./scripts/create-pr.sh

set -e

UPSTREAM_OWNER="saurabh-khedkar1707"
UPSTREAM_REPO="LEI-INDIA-"
FORK_OWNER="saurabh-khedkar-sdms-447"
FORK_REPO="LEI-INDIA-"
BASE_BRANCH="main"
HEAD_BRANCH="main"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is required"
    echo ""
    echo "You can create a token at: https://github.com/settings/tokens"
    echo "Required scopes: repo"
    echo ""
    echo "Usage: GITHUB_TOKEN=your_token ./scripts/create-pr.sh"
    exit 1
fi

# Get commit messages for PR description
COMMITS=$(git log --oneline upstream/main..HEAD --format="- %s")

PR_TITLE="Add documentation and update admin pages"
PR_BODY="This PR includes the following updates:

## Changes
${COMMITS}

## Commits
- Add documentation for adding products and categories
- Update admin pages, product features, and add migration documentation

## Type
- [x] Documentation
- [x] Feature Update"

# Create temporary JSON file for proper escaping
TMP_JSON=$(mktemp)
cat > "$TMP_JSON" <<EOF
{
  "title": "$PR_TITLE",
  "body": $(echo "$PR_BODY" | jq -Rs .),
  "head": "${FORK_OWNER}:${HEAD_BRANCH}",
  "base": "${BASE_BRANCH}"
}
EOF

# Create PR using GitHub API
echo "Creating Pull Request..."
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}/pulls" \
  -d "@$TMP_JSON")

# Clean up
rm -f "$TMP_JSON"

# Check if PR was created successfully
PR_URL=$(echo "$RESPONSE" | grep -o '"html_url":"[^"]*"' | cut -d'"' -f4)

if [ -n "$PR_URL" ]; then
  echo ""
  echo "✅ Pull Request created successfully!"
  echo "PR URL: $PR_URL"
else
  echo ""
  echo "❌ Failed to create Pull Request"
  echo "Response: $RESPONSE"
  exit 1
fi
