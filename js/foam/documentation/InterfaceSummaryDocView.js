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
  package: 'foam.documentation',
  name: 'InterfaceSummaryDocView',
  extendsModel: 'foam.documentation.SummaryDocView',
  documentation: 'Displays the documentation of the given interface.',

  requires: ['foam.documentation.TextualDAOListView',
             'foam.documentation.DocFeatureModelRefView',
             'foam.documentation.DocBodyView'],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        this.updateHTML();
      }
    },
  ],

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.data) {  %>
        <div class="introduction">
          <h1><%=this.data.name%></h1>
          <div class="model-info-block">
            <p class="important">Interface definition</p>

<%        if (this.data.package) { %>
            <p class="important">Package <%=this.data.package%></p>
<%        } %>

<%        if (this.data.description) { %>
            <p class="important">Description: <%=this.data.description%></p>
<%        } %>

<%        if (this.data.extends && this.data.extends.length > 0) { %>
            <p class="important">Extends: $$extends{ model_: 'foam.documentation.TextualDAOListView', rowView: 'foam.documentation.DocFeatureModelRefView', mode: 'read-only' }</p>
<%        } %>

            <div id="scrollTarget_<%=this.data.name%>" class="introduction">
              <h2><%=this.data.label%></h2>
              $$documentation{ model_: 'foam.documentation.DocBodyView' }
            </div>
          </div>
        </div>
<%    } %>
    */}
  ]

});
