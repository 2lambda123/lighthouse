#!/usr/bin/env bash

##
# @license Copyright 2021 The Lighthouse Authors. All Rights Reserved.
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
##

# TODO(esmodules): delete when consumers of util.js are all esm.

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LH_ROOT_DIR="$SCRIPT_DIR/../.."

OUT_FILE="$LH_ROOT_DIR"/lighthouse-core/util-commonjs.js

echo '// @ts-nocheck' > "$OUT_FILE"
echo '// Auto-generated by lighthouse-core/scripts/copy-util-commonjs.sh' >> "$OUT_FILE"
echo '// Temporary solution until all our code uses esmodules' >> "$OUT_FILE"
sed 's/export /module.exports = /' "$LH_ROOT_DIR"/report/renderer/util.js >> "$OUT_FILE"