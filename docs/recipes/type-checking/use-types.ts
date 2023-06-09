/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {writeFileSync} from 'fs';

import * as lhApi from 'lighthouse';
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();

const config: lhApi.Config = {
  extends: 'lighthouse:default',
  settings: {
    skipAudits: ['uses-http2'],
  },
};

// Lighthouse will accept a page from whatever Puppeteer version is installed.
const flow: lhApi.UserFlow = await lhApi.startFlow(page, {config});

await flow.navigate('https://example.com');

await flow.startTimespan({name: 'Click button'});
await page.click('button');
await flow.endTimespan();

await flow.snapshot({name: 'New page state'});

const report = await flow.generateReport();
writeFileSync('flow.report.html', report);
