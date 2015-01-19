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

CLASS({
  name: 'MessagesBuilder',
  package: 'foam.i18n',

  imports: [
    'console'
  ],

  properties: [
    {
      name: 'messageBundle',
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      name: 'visitModel',
      code: function(model) {
        this.console.warn(
            'Message builder without visitModel implementation: ' +
                this.name_);
        return this.messageBundle;
      }
    },
    {
      name: 'messagesToString',
      code: function() {
        this.console.warn(
            'Message builder without messagesToString implementation: ' +
                this.name_);
        return '';
      }
    }
  ]
});