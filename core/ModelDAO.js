/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

X.ModelDAO = X.foam.core.bootstrap.BrowserFileDAO.create();


// Hookup ModelDAO callback as CLASS and __DATA methods.

(function() {
  var oldClass = CLASS;

  CLASS = function(json) {
    json.model_ = 'Model';
    if ( document && document.currentScript )
      json.sourcePath = document.currentScript.src;
    X.ModelDAO.onData(json, oldClass);
  };
})();

var __DATA = X.ModelDAO.onData;
