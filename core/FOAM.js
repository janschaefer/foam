/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

var $documents = [];

if ( window ) $documents.push(window.document);

// TODO: clean this up, hide $WID__ in closure
var $WID__ = 0;
function $addWindow(w) {
   w.window.$WID = $WID__++;
   $documents.push(w.document);
}
function $removeWindow(w) {
  for ( var i = $documents.length - 1 ; i >= 0 ; i-- ) {
    if ( ! $documents[i].defaultView || $documents[i].defaultView === w )
      $documents.splice(i,1);
  }
}

/** Replacement for getElementById **/
// TODO(kgr): remove this is deprecated, use X.$ instead()
var $ = function (id) {
  for ( var i = 0 ; i < $documents.length ; i++ ) {
    if ( document.FOAM_OBJECTS && document.FOAM_OBJECTS[id] )
      return document.FOAM_OBJECTS[id];

    var ret = $documents[i].getElementById(id);

    if ( ret ) return ret;
  }
  return undefined;
};
/** Replacement for getElementByClassName **/
// TODO(kgr): remove this is deprecated, use X.$$ instead()
var $$ = function (cls) {
  for ( var i = 0 ; i < $documents.length ; i++ ) {
    var ret = $documents[i].getElementsByClassName(cls);

    if ( ret.length > 0 ) return ret;
  }
  return [];
};


var FOAM = function(map, opt_X) {
   var obj = JSONUtil.mapToObj(opt_X || X, map);
   return obj;
};

/**
 * Register a lazy factory for the specified name within a
 * specified context.
 * The first time the name is looked up, the factory will be invoked
 * and its value will be stored in the named slot and then returned.
 * Future lookups to the same slot will return the originally created
 * value.
 **/
FOAM.putFactory = function(ctx, name, factory) {
  ctx.__defineGetter__(name, function() {
    console.log('Bouncing Factory: ', name);
    delete ctx[name];
    return ctx[name] = factory();
  });
};

var UNUSED_MODELS = {};
var USED_MODELS   = {};

// Package + Model Definition Support
(function(X) {

  function defineLocalProperty(o, name, factory) {
    var value = factory(o, name);
    Object.defineProperty(o, name, { get: function() {
      return o == this ? value : defineLocalProperty(this, name, factory);
    } });
    return value;
  }

  function defineLazyModel(o, name, model) {

  }

  function bindModelToX(model, Y) {
    return Y === GLOBAL ? model : {
      __proto__: model,
      create: function(args, opt_X) {
        return this.__proto__.create(args, opt_X || Y);
      }
    };
  }

  function packagePath_(root, parent, path, i) {
    if ( i == path.length ) return parent;

    var head = path[i];
    if ( ! parent[head] ) {
      var map = { __root__: root };

      defineLocalProperty(parent, head, function(o) {
        return o == parent ? map : { __proto__: map, __root__: o.__root__ || o };
      });
    }

    return packagePath_(root, parent[head], path, i+1);
  }

  function packagePath(X, path) {
    return path ? packagePath_(X, X, path.split('.'), 0) : X;
  }

  /** opt_name includes path **/
  function registerModel(o, model, opt_name) {
    var name    = model.name;
    var package = model.package;

    if ( opt_name ) {
      var a = opt_name.split('.');
      name = a.pop();
      package = a.join('.');
    }

    defineLocalProperty(
      packagePath(o, package),
      name,
      function(o) { return bindModelToX(model, o.__root__ || o); });
  }

  X.XpackagePath   = packagePath;
  X.XregisterModel = registerModel;

  X.MODEL = X.CLASS = function(m) {
    if ( document && document.currentScript ) m.sourcePath = document.currentScript.src;

    var fullName = m.package ? m.package + "." + m.name : m.name;
    UNUSED_MODELS[fullName] = true;

    var path = packagePath(this, m.package);
    Object.defineProperty(path, m.name, {
      get: function () {
        USED_MODELS[fullName] = true;
        delete UNUSED_MODELS[fullName];
        Object.defineProperty(path, m.name, {value: null, configurable: true});
        m = JSONUtil.mapToObj(X, m, Model);
        defineLocalProperty(path, m.name, function(o) {
          return bindModelToX(m, o.__root__ || o);
        });
        return path[m.name];
      },
      configurable: true
    });
  }
})(this);


FOAM.browse = function(model, opt_dao, opt_X) {
   var Y = opt_X || X.sub(undefined, "FOAM BROWSER");

   if ( typeof model === 'string' ) model = Y[model];

   var dao = opt_dao || Y[model.name + 'DAO'] || Y[model.plural];

   if ( ! dao ) {
      dao = Y.StorageDAO.create({ model: model });
      Y[model.name + 'DAO'] = dao;
   }

   var ctrl = Y.DAOController.create({
     model:     model,
     dao:       dao,
     useSearchView: false
   });

  if ( ! Y.stack ) {
    var w = opt_X ? opt_X.window : window;
    var win = Y.Window.create({ window: w });

    Y.stack = Y.StackView.create();
    win.view = Y.stack;
    Y.stack.setTopView(ctrl);
  } else {
    Y.stack.pushView(ctrl);
  }
};


FOAM.lookup = function(key, opt_X) {
  if ( ! ( typeof key === 'string' ) ) return key;

  var path = key.split('.');
  var root = opt_X || GLOBAL;
  for ( var i = 0 ; i < path.length ; i++ ) root = root[path[i]];

  return root;
};


function arequire(modelName, opt_X) {
  var X = opt_X || GLOBAL;
  var model = FOAM.lookup(modelName, X);

  /** This is so that if the model is arequire'd concurrently the
   *  initialization isn't done more than once.
   **/
  if ( ! model ) console.log(modelName, 'not found');
  if ( ! model.required__ ) {
    // TODO: eventually this should just call the arequire() method on the Model
    var args = [];
    if ( model.templates ) for ( var i = 0 ; i < model.templates.length ; i++ ) {
      var t = model.templates[i];
      args.push(aseq(
        aevalTemplate(model.templates[i]),
        (function(t) { return function(ret, m) {
          model.getPrototype()[t.name] = m;
          ret();
        };})(t)
      ));
    }

    // Also arequire required Models.
    for ( var i = 0 ; i < model.requires.length ; i++ ) {
      var r = model.requires[i];
      var m = r.split(' as ');
      args.push(arequire(m[0]));
    }

    model.required__ = amemo(aseq(
      apar.apply(apar, args),
      aconstant(model)));
  }

  return model.required__;
}


var FOAM_POWERED = '<a style="text-decoration:none;" href="https://github.com/foam-framework/foam/" target="_blank">\
<font size=+1 face="catull" style="text-shadow:rgba(64,64,64,0.3) 3px 3px 4px;">\
<font color="#3333FF">F</font><font color="#FF0000">O</font><font color="#FFCC00">A</font><font color="#33CC00">M</font>\
<font color="#555555" > POWERED</font></font></a>';
