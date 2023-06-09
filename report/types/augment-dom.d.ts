/**
 * @license Copyright 2021 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview Augment global scope with needed DOM APIs that are newer or not
 * widely supported enough to be in tsc's lib `dom`.
 */

// Import to augment querySelector/querySelectorAll with stricter type checking.
import '../../types/internal/query-selector';

declare global {
  var CompressionStream: {
    prototype: CompressionStream,
    new (format: string): CompressionStream,
  };

  interface CompressionStream extends GenericTransformStream {
    readonly format: string;
  }
}
