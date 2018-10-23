/**
The MIT License (MIT)

Copyright (c) <2013> <Arseniy Tomkevich at XSENIO Inc. http://www.xsenio.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/* QQ JS Node module which should be included in a Node.JS environment only */
(function () {

	var root = null,
		_isNode = false,
		qq = {};

	var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };
	
	function dump(arr, level)
	{
    	var txt = "";
    	
    	if(level == null) level = 0;

    	var level_padding = "";
    	
    	for(var j = 0; j < level + 1; j++)
    	{
    		level_padding += " ";
    	}

    	if(typeof(arr) == 'object')
    	{
        	for(var item in arr)
        	{
            	var value = arr[item];

            	if(typeof(value) == 'object')
            	{
                	txt += level_padding + "'" + item + "' ...\n";
                	txt += mydump(value, level + 1);
            	}
		    	else if(typeof(value) == 'function')
		    	{
		    		txt += level_padding + "'" + item + "' => \"[function...]\"\n";
		    	}
            	else
            	{
                	txt += level_padding + "'" + item + "' => \"" + value + "\"\n";
            	}
        	}
    	}
    	else
    	{
        	txt = "===>" + arr + "<===(" + typeof(arr) + ")";
    	}

    	return txt;

	}; /* end dump */

	/* includes the entire qq library */
	function setupRequirements()
	{
		/* this isn't a 'var' ie not local - otherwise causes a bug */
		qq = require('./qq.js');

		var IntUtil = require('./encryption/IntUtil.js');
		var MD5 = require('./encryption/MD5.js');

		var UIDGenerator = require('./qq.UIDGenerator.js');
		var Registry = require('./qq.Registry.js');
		var Delegate = require('./qq.Delegate.js');
		var Router = require('./qq.Router.js');
		var EventDispatcher = require('./qq.EventDispatcher.js');
		var Loader = require('./qq.Loader.js');

		/* merge all the included concepts into one qq object */
		Object.assign(qq, IntUtil);
		//console.log("IntUtil : qq " + dump(qq));
		
		Object.assign(qq, MD5);
		//console.log("MD5 : qq " + dump(qq));

		Object.assign(qq, UIDGenerator);
		//console.log("UIDGenerator : qq " + dump(qq));
		
		Object.assign(qq, Registry);
		//console.log("Registry : qq " + dump(qq));
		
		Object.assign(qq, Delegate);
		//console.log("Delegate : qq " + dump(qq));
		
		Object.assign(qq, Router);
		//console.log("Router : qq " + dump(qq));
		
		Object.assign(qq, EventDispatcher);

		Object.assign(qq, Loader);
		//console.log("EventDispatcher : qq " + dump(qq));

		//console.log("sr : qq " + dump(qq));

		//js/qq/qq.module.js
		//js/qq/qq.view.js
		//js/qq/qq.widgets.js
		//js/qq/qq.widgets.list.js
		
		//encryption/MD5.js
		// hover.js
		// hQuery.js
		// js/axios.min.js
		// lodash.min.js
		// bezier.js
		// RobinHood-ES5.js

		// MaidMarianActions.js
		// contentscript.js
	};

	/* processes the config.json */
	function processConfigJSON(data)
	{
		// "access":{
		// 	"css":{"subfolders": true, "static": true},
		// 	"images":{"subfolders": true, "q":["*.png", "*.jpg", "*.gif", "!*.svg"], "static": true},
		// 	"js":{"subfolders":true, "q":"*.js"},
		// 	".":{"q":["*.js", "*.html"]}
		// },
		// "read":{
		// 	"images":{"default":"default.png"}
		// },
		// "cache":{
		// 	"css":{"q":"*.css", "static": true},
		// 	"images": {"static": true},
		// 	"js": {"subfolders": true, "q":["*.js", "a*.js"]},
		// 	"modules":{"subfolders": true, "q":"*.*", "static": true}
		// },
		// "app":{
		// 	"container":"#wdgtMMOrders",
		// 	"controllers":"./app/modules/controller/",
		// 	"views":"./app/modules/view/"
		// }

		/* Go through the access configuration */
		var accessToken, readToken, cacheToken;

		for(var each in data.access)
		{
			accessToken = data.access[each];
		}

		for(var each in data.read)
		{
			readToken = data.read[each];
		}

		for(var each in data.cache)
		{
			cacheToken = data.cache[each];
		}

		if(data.app != null)
		{
			if(data.app.container != null)
			{
				qq.configure("container", data.app.container);
			}

			if(data.app.controllers != null)
			{
				qq.configure("controllers", data.app.controllers);
			}

			if(data.app.views != null)
			{
				qq.configure("views", data.app.views);
			}

			if(data.app.modules != null)
			{
				var modules = data.app.modules, 
					mitem;

				for(var i = 0, l = modules.length; i < l; i++)
				{
					mitem = modules[i];

					/* module */
					if(typeof(mitem) == "object" && mitem.id != null)
					{
						qq.loadModule(mitem);

						//{id:"mmOrders"}
					}
					else if(typeof(mitem) == "string")
					{
						qq.loadModule({id: mitem});
					}
				}
			}

			if(data.app.main != null)
			{
				qq.loader.load(data.app.main);
			}
		}

	}; /* end processConfigJSON method */

	/* check if this is a node environment */
	try
	{
		if(typeof module !== 'undefined' && module.exports != null)
		{
			_isNode = true;
			root = this;
		}
	}
	catch(e)
	{}

	/* if its a node then export */
	if(_isNode == true)
	{
		/* assigns all the object references in the global qq object */
		setupRequirements();

		/* set the console to manual flush */
		qq.console.flush(false);

		var http = require('http'),
			path = require('path'),
			fs = require("fs");

		//var extname = String(path.extname(filePath)).toLowerCase();
		//var contentType = mimeTypes[extname] || 'application/octet-stream';

		/* on server request event - logical entrance point for the server */
		function handleServerRequestEvent(req, res)
		{
			res.writeHead(200, {'Content-Type': 'text/html'}); // http header
			
			var url = req.url;
			
			qq.res = res;

			qq.rr.init(req.url);

			/* initialize qq if it hasn't already been initialized */
			//qq.init();
			
			/* manually flush the console */
			qq.console.flush();
			
			/* remove the response object reference from qq */
			res.end();
			qq.res = null;
		};

		/* CONFIGURE QQ */
		var content = fs.readFileSync("./config.json");

		processConfigJSON(JSON.parse(content))

		//create a server object:
		http.createServer(handleServerRequestEvent).listen(3000, function()
		{
			console.log("server start at port 3000"); //the server object listens on port 3000
		});

		
		

		module.exports = qq;
	}

})();