import * as core from '@actions/core';
import * as path from 'path';

export const actionIsUnderTest = !!process.env['__TEST_INVOCATION_ID'];

export const invocationId = (() => {
    const stateName = 'ActionInvocationId';
    let result = core.getState(stateName);
    if (result)
        return result;

    result = process.env['__TEST_INVOCATION_ID'] || crypto.randomUUID();
    core.saveState(stateName, result);
    return result;
})();

export function getTemporaryPath(...paths: string[]): string {
    let runnerTemp = process.env['RUNNER_TEMP'];
    if (!runnerTemp) {
        throw Error("RUNNER_TEMP is not specified!");
    }

    return path.join(runnerTemp, 'setup-bonsai', ...paths);
}
