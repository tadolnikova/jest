/**
 * Copyright (c) 2014, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const {spawnSync} = require('child_process');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const rimraf = require('rimraf');

const run = (cmd, cwd) => {
  const args = cmd.split(/\s/).slice(1);
  const spawnOptions = {cwd};
  const result = spawnSync(cmd.split(/\s/)[0], args, spawnOptions);

  if (result.status !== 0) {
    const message = `
      ORIGINAL CMD: ${cmd}
      STDOUT: ${result.stdout && result.stdout.toString()}
      STDERR: ${result.stderr && result.stderr.toString()}
      STATUS: ${result.status}
      ERROR: ${result.error}
    `;
    throw new Error(message);
  }

  return result;
};

const linkJestPackage = (packageName, cwd) => {
  const packagesDir = path.resolve(__dirname, '../packages');
  const packagePath = path.resolve(packagesDir, packageName);
  const destination = path.resolve(cwd, 'node_modules/');
  run(`mkdir -p ${destination}`);
  return run(`ln -sf ${packagePath} ${destination}`);
};

const fileExists = filePath => {
  try {
    fs.accessSync(filePath, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
};

const makeTemplate = string => {
  return values => {
    return string.replace(/\$(\d+)/g, (match, number) => {
      return values[number - 1];
    });
  };
};

const cleanup = (directory: string) => rimraf.sync(directory);

const makeTests = (directory: string, tests: {[filename: string]: string}) => {
  mkdirp.sync(directory);
  Object.keys(tests).forEach(filename => {
    fs.writeFileSync(path.resolve(directory, filename), tests[filename]);
  });
};

module.exports = {
  cleanup,
  makeTests,
  makeTemplate,
  fileExists,
  linkJestPackage,
  run,
};
