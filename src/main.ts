import * as util from './util';
import * as core from '@actions/core';

console.log("Hello from main!");
console.log(`Environment paths: '${core.getInput('environment-path', { required: true })}'`);
util.test();
