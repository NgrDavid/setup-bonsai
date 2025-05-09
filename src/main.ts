import * as util from './util';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as glob from '@actions/glob';
import * as toolcache from '@actions/tool-cache';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser({ ignoreAttributes: false });

const inputs = {
    environmentPaths: core.getInput('environment-paths', { required: true }),
    injectPackages: core.getInput('inject-packages'),
    enableCache: core.getBooleanInput('enable-cache', { required: true }),
    useCommonPackageDirectory: core.getBooleanInput('use-common-package-directory', { required: true }),
};

class BonsaiVersion {
    readonly version: string;
    private cachedExe: string | null;

    private constructor(version: string) {
        this.version = version;
        this.cachedExe = null;
    }

    private static instances = new Map<string, BonsaiVersion>();
    public static getOrCreate(version: string): BonsaiVersion {
        let result = this.instances.get(version);
        if (result === undefined) {
            result = new BonsaiVersion(version);
            this.instances.set(version, result);
        }

        return result;
    }

    /*
    public async warmToolCache(): Promise<void> {
        if (this.cachedExe)
            return;

        // Try to load from the tool cache
    }
    */
}

class BonsaiEnvironment {
    readonly rootPath: string;
    readonly relativePath: string;
    readonly bonsaiConfigPath: string;
    readonly nugetConfigPath: string;
    readonly bonsaiVersion: BonsaiVersion;

    public constructor(rootPath: string) {
        this.rootPath = rootPath;
        this.relativePath = path.relative(process.cwd(), rootPath);

        this.bonsaiConfigPath = path.join(rootPath, 'Bonsai.config');
        if (!fs.existsSync(this.bonsaiConfigPath))
            throw "Bonsai.config is missing!"

        this.nugetConfigPath = path.join(rootPath, 'NuGet.config');
        if (!fs.existsSync(this.nugetConfigPath))
            throw "NuGet.config is missing!";

        const bonsaiConfigText = fs.readFileSync(this.bonsaiConfigPath, 'utf8');
        const bonsaiConfig = xmlParser.parse(bonsaiConfigText);

        this.bonsaiVersion = null!;
        for (const packageElement of bonsaiConfig?.PackageConfiguration?.Packages?.Package) {
            if (packageElement['@_id'] == "Bonsai") {
                const version = packageElement['@_version'];
                if (version)
                    this.bonsaiVersion = BonsaiVersion.getOrCreate(version);
                break;
            }
        }

        if (!this.bonsaiVersion)
            throw "Could not determine desired Bonsai version from Bonsai.config";
    }

    public redirectPackagesDirectory(targetDirectory: string): boolean {
        const sourceDirectory = path.join(this.rootPath, 'Packages');
        if (fs.existsSync(sourceDirectory)) {
            core.warning(`Refusing to redirect packages directory for ${this.relativePath}, directory already exists.`);
            return false;
        }

        fs.symlinkSync(targetDirectory, sourceDirectory, 'dir');
        return true;
    }
}

async function main() {
    console.log(`env = ${JSON.stringify(process.env, null, 2)}`);

    // Enumerate environments
    let environments: BonsaiEnvironment[] = [];
    core.debug(`Enumerating environments from patterns:${inputs.environmentPaths}`);
    const environmentPaths = await glob.create(inputs.environmentPaths, { implicitDescendants: false });
    for await (const environmentPath of environmentPaths.globGenerator()) {
        let relativePath = path.relative(process.cwd(), environmentPath);
        core.debug(`Loading '${relativePath}'...`);

        try {
            const environment = new BonsaiEnvironment(environmentPath);
            environments.push(environment);
            core.info(`Found Bonsai environment '${environment.relativePath}'`);
        } catch (error) {
            core.warning(`Bonsai environment at '${relativePath}' is invalid: ${error}`);
        }
    }

    // Unify packages directories
    let commonPackageDirectoryPath = null;
    if (inputs.useCommonPackageDirectory) {
        //commonPackageDirectoryPath = util.getTemporaryPath(`CommonPackages${github.context.}`);
    }
}

main();
