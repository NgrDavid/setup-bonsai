import * as util from './util';
import * as core from '@actions/core';
import * as glob from '@actions/glob';

async function main() {
    console.log("Found environments:");
    const environmentPaths = await glob.create(core.getInput('environment-paths', { required: true }));
    for await (const environmentPath of environmentPaths.globGenerator()) {
        console.log(`'${environmentPath}'`);
    }

    util.test();
}

main();
