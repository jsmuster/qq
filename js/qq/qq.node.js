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

		var IntUtil = require('./encryption/IntUtil.js')(qq);
		var MD5 = require('./encryption/MD5.js')(qq);

		var UIDGenerator = require('./qq.UIDGenerator.js')(qq);
		var Registry = require('./qq.Registry.js')(qq);
		var Delegate = require('./qq.Delegate.js')(qq);
		var Router = require('./qq.Router.js')(qq);
		var EventDispatcher = require('./qq.EventDispatcher.js')(qq);
		var Loader = require('./qq.Loader.js')(qq);

		var Module = require('./qq.Module.js')(qq);

		var View = require('./qq.View.js')(qq);

		/* include widget framework */
		var widgets = require('./qq.widgets.js')(qq);
		var widgetList = require('./qq.widgets.list.js')(qq);

		/* merge all the included concepts into one qq object */
		// Object.assign(qq, IntUtil);
		
		// Object.assign(qq, MD5);

		// Object.assign(qq, UIDGenerator);
		
		// Object.assign(qq, Registry);
		
		// Object.assign(qq, Delegate);
		
		// Object.assign(qq, Router);
		
		// Object.assign(qq, EventDispatcher);

		// Object.assign(qq, Loader);

		// Object.assign(qq, Module);

		// Object.assign(qq, View);

		// Object.assign(qq, widgets);
		// Object.assign(qq, widgetList);
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

			qq.configure.access(each, accessToken);
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
						/* passes an object {id:"mmOrders"} */
						qq.loadModule(mitem);
					}
					else if(typeof(mitem) == "string")
					{
						qq.loadModule({id: mitem});
					}
				}
			}

			if(data.app.main != null && data.app.main.length > 0)
			{
				var mainHTML = fs.readFileSync(data.app.main, 'utf8'); //fs.readFileSync(filePath , 'utf8');

				var htmlDoc = cheerio.load(mainHTML);
				//debugger;
				/* setup the global qq.document property */
				if(htmlDoc != null && htmlDoc.root != null)
				{
					qq.document = htmlDoc.root();
				}

				/* setup the global link to cheerio */
				qq.$ = cheerio;

				//debugger;
				var fnCopyToFrom = function (deep, target, obj)
				{
					if(deep != true)
					{
						obj = target;
						target = deep;

						deep = false;
					}

					if(deep)
					{
						/* two phases to synchronize w deep copy, first we do all the objects, then copy the non objects. */
						for(var each in obj)
						{
							if(typeof(obj[each]) == "object")
							{
								//if(typeof(target[each]) == "object")
								//{
									if(target[each] == null)
									{
										target[each] = {};
									}

									fnCopyToFrom(true, target[each], obj[each]);
								//}
							}
							else
							{
								target[each] = obj[each];
							}
						}
					}
					else
					{
						for(var each in obj)
						{
							target[each] = obj[each];
						}
					}
				};

				/* add extend method to $ to make it more like jquery */
				qq.$.extend = function ()
				{
					var target, index, deep;

					if(arguments[0] === true)
					{
						target = arguments[1];
						index = 2;
						deep = true;
					}
					else
					{
						target = arguments[0];
						index = 1;
						deep = false;
					}

					if(target != null)
					{
						var args = [];

						for(var i = index, l = arguments.length; i < l; i++)
						{
							fnCopyToFrom(deep, target, arguments[i]);
						}

						return target;
					}
				};
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
		//qq.console.flush(false);

		var http = require('http'),
			path = require('path'),
			fs = require("fs"),
			cheerio = require('cheerio'),
			jsVM = require('vm2').VM;

		/* these are only available in nodeJS version */
		qq.fs = fs;
		qq.vm = jsVM;

		/**
		* A method which handles access rights checking, checks if the fragment represents a valid content path or query.
		* The method stops the request or takes over handling it by returning true or false, letting the qq.Router whether to proceed or not.
		*/
		var handleAccessRights = function (fragment)
		{
			var accessCfg = qq.configure.access.get();

			//qq.console("fragment x", fragment);

			var frags = fragment.split("\/");

			//debugger;

			if(frags.length > 1)
			{
				var dirDelimiter = "/";
				/* path without the file name */
				var fullpath = frags.slice(0, frags.length - 1).join(dirDelimiter);
				
				var filename = frags[frags.length - 1],
					fileFrags = filename.split("."),
					fileExtension = fileFrags[fileFrags.length - 1];
					
				var currPath = '', rights, content, mimeType, isValid = false, last = false;

				/* go through every frag in the path, so for 'assets/js/qq/encryption' check 'assets then 'assets/js' then 'assets/js/qq', and check against the rules in each. */
				/* loops through the frag trying out the entire frag from the start so we can see if there are any sub folder rules */
				for(var i = 0, l = frags.length - 1; i < l; i++)
				{
					if(i == 0)
					{
						currPath = frags[0];
					}
					else
					{
						currPath += dirDelimiter + frags[i];

						/* indicate its the last frag */
						if(i == (l - 1))
						{
							last = true;
						}
					}

					/* so the current path has the rights object, lets check it */
					if(accessCfg.static[currPath] != null)
					{
						rights = accessCfg.static[currPath];

						/* the rights equals 'true' */
						if(rights === true)
						{
							/* if its the last frag then validate since rights are true */
							if(last == true)
							{
								console.log("validated last frag, rights = true")
								isValid = true;
							}
						}
						/* rights should be a configuration object with a set of rules */
						else if(typeof(rights) == 'object')
						{
							/* apply sub folders the same rights - a subfolders property was set to true */
							if(rights.subfolders == true)
							{
								console.log("validated '"+currPath+"' path, subfolders = true")
								isValid = true;
							}
						}

						if(isValid == true)
						{
							/* if full file path exists, read from it and out put into the response */
							if(fs.existsSync(fullpath) == true)
							{
								content = fs.readFileSync(fragment, 'utf8');

								if(content != null)
								{
									/* figure out the mime type for the file if we did mention it */
									mimeType = mimeTypes["." + fileExtension];

									if(mimeType != null)
									{
										qq.res.writeHead(200, {'Content-Type': mimeType});
									}
									else
									{
										// no mime type found - write a default mime type?
									}

									qq.res.write(content);
								}
							}


							return false;
						}
					}
				}

				//qq.console("path x", qq.dump(accessCfg));

				// path
				// "assets/js/qq/encryption"

				// assets/js/qq: {subfolders: true}


				// else
				// {
				// 	return true;
				// }
			}

			return true;

			//qq.console("accessCfg", qq.dump(accessCfg));
		};

		/* connect / link the router with a method that validates access rights and lets the qq.Router either proceed with a registered router method or takes over the request instead. */
		qq.rr.link(handleAccessRights);

		//var extname = String(path.extname(filePath)).toLowerCase();
		//var contentType = mimeTypes[extname] || 'application/octet-stream';

		/* on server request event - logical entrance point for the server */
		function handleServerRequestEvent(req, res)
		{
			res.writeHead(200, {'Content-Type': 'text/html'}); // http header
			
			var url = req.url;
			
			qq.res = res;

			if(qq.rr.init(req.url))
			{
				/* manually flush the console */
				qq.console.flush();

				debugger;
				/* output the html into the browser */
				res.write(qq.document.html());
				
				/* remove the response object reference from qq */
				res.end();
				qq.res = null;
			}
			else
			{
				res.end();
				// router didn't validate the url, or perhaps the execution was taken over by another manager linked to the router
			}

			/* initialize qq if it hasn't already been initialized */
			//qq.init();
			
			
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