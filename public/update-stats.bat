@echo off
echo Updating RebootingwithAI Statistics...
echo.

cd /d "%~dp0"
node src/scripts/update-stats.js

echo.
echo Statistics update complete!
pause
