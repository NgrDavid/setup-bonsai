@echo off
setlocal
cd ../setup-bonsai-test/
set INPUT_ENVIRONMENT-PATHS=**/.bonsai/
set INPUT_INJECT-PACKAGES=
set INPUT_ENABLE-CACHE=false
set INPUT_ENABLE-COMMON-PACKAGE-DIRECTORY=true

set __TEST_INVOCATION_ID=DummyInvocationId
set RUNNER_TEMP=%~dp0scratch/RUNNER_TEMP/
set RUNNER_TOOL_CACHE=%~dp0scratch/RUNNER_TOOL_CACHE/

set GITHUB_STATE=%~dp0scratch/GITHUB_STATE
break > %GITHUB_STATE%

node %~dp0dist\main.js
echo ==============================================================================================
node %~dp0dist\post.js
