@echo off
setlocal
cd ../setup-bonsai-test/
set INPUT_ENVIRONMENT-PATHS=**/.bonsai/
set RUNNER_TEMP=scratch/RUNNER_TEMP/
set RUNNER_TOOL_CACHE=scratch/RUNNER_TOOL_CACHE/
node %~dp0dist\main.js
