#!/bin/bash

echo "Updating RebootingwithAI Statistics..."
echo

# Change to script directory
cd "$(dirname "$0")"

# Run the update script
node src/scripts/update-stats.js

echo
echo "Statistics update complete!"
