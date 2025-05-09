import * as path from 'path';

export function getTemporaryPath(subpath: string): string {
    let result = process.env['RUNNER_TEMP'];
    if (!result) {
        throw Error("RUNNER_TEMP is not specified!");
    }

    result = path.join(result, 'setup-bonsai');

    if (subpath) {
        result = path.join(result, subpath);
    }

    return result;
}
