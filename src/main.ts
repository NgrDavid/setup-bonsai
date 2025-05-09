import * as util from './util';
import * as core from '@actions/core';
import * as glob from '@actions/glob';

async function main() {
    const environmentPathPatterns = core.getInput('environment-paths', { required: true });
    console.log(`'${environmentPathPatterns}'`);
    console.log(`cwd = '${process.cwd()}'`);

    console.log("Found environments:");
    const environmentPaths = await glob.create(environmentPathPatterns, { implicitDescendants: false });
    console.log(await environmentPaths.glob());
    //for await (const environmentPath of environmentPaths.globGenerator()) {
    //    console.log(`'${environmentPath}'`);
    //}
}

main();
