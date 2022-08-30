/**
 * @license Copyright 2022 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import fs from 'fs';

// eslint-disable-next-line no-unused-vars
import esbuild from 'esbuild';
import builtin from 'builtin-modules';

import {inlineFs} from './plugins/inline-fs.js';

/**
 * @typedef PartialLoader
 * @property {string} name
 * @property {(code: string, args: esbuild.OnLoadArgs) => Promise<{code: string, warnings?: esbuild.PartialMessage[]}>} onLoad
 */

/** @type {Record<string, PartialLoader>} */
const partialLoaders = {
  inlineFs: {
    name: 'inline-fs',
    async onLoad(inputCode, args) {
      const {code, warnings} = await inlineFs(inputCode, args.path);
      return {code: code ?? inputCode, warnings};
    },
  },
  rmGetModuleDirectory: {
    name: 'rm-get-module-directory',
    async onLoad(inputCode) {
      return {code: inputCode.replace(/getModuleDirectory\(import.meta\)/g, '""')};
    },
  },
};

/**
 * Bundles multiple partial loaders (string => string transforms) into a single esbuild Loader plugin.
 * A partial loader that doesn't want to do any transform should just return the code given to it.
 * @param {Array<{name: string, onLoad: (code: string, args: esbuild.OnLoadArgs) => Promise<{code: string, warnings?: esbuild.PartialMessage[]}>}>} partialLoaders
 * @return {esbuild.Plugin}
 */
function bulkLoader(partialLoaders) {
  return {
    name: 'bulk-loader',
    setup(build) {
      build.onLoad({filter: /\.*.js/}, async (args) => {
        if (args.path.includes('node_modules')) return;

        /** @type {esbuild.PartialMessage[]} */
        const warnings = [];
        // TODO: source maps? lol.
        let code = await fs.promises.readFile(args.path, 'utf-8');

        for (const partialLoader of partialLoaders) {
          const partialResult = await partialLoader.onLoad(code, args);
          code = partialResult.code;
          if (partialResult.warnings) {
            warnings.push(...partialResult.warnings);
          }
        }

        return {contents: code, warnings};
      });
    },
  };
}

/**
 * @param {Record<string, string>} replaceMap
 * @return {esbuild.Plugin}
 */
function replaceModules(replaceMap) {
  return {
    name: 'replace-modules',
    setup(build) {
      build.onLoad({filter: /\.*.js/}, async (args) => {
        if (args.path.includes('node_modules')) return;
        if (!(args.path in replaceMap)) return;

        return {contents: replaceMap[args.path]};
      });
    },
  };
}

/**
 * @param {string[]=} builtinList
 * @return {esbuild.Plugin}
 */
function ignoreBuiltins(builtinList) {
  if (!builtinList) builtinList = [...builtin];
  const builtinRegexp = new RegExp(`^(${builtinList.join('|')})\\/?(.+)?`);
  return {
    name: 'ignore-builtins',
    setup(build) {
      build.onResolve({filter: builtinRegexp}, (args) => {
        if (args.path.match(builtinRegexp)) {
          return {path: args.path, namespace: 'ignore-builtins'};
        }
      });
      build.onLoad({filter: builtinRegexp, namespace: 'ignore-builtins'}, async () => {
        return {contents: ''};
      });
    },
  };
}

export {
  partialLoaders,
  bulkLoader,
  replaceModules,
  ignoreBuiltins,
};