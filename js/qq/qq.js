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

'use strict';

console.log("- injected qq.js");

try
{
	if(qq == null)
	{
		qq = {};
	}
}
catch(e)
{
	var qq = {};
}

/** QQ module */
(function (qq) {

	var _hasQQ = false,
		_preQQ,
		root = null,
		_isNode = false;

	/* figure out if qq reference exists, if so, copy all the references from qq into a new object _preQQ */

	try
	{
		if(qq != null)
		{
			_hasQQ = true;
		}
	}
	catch(e)
	{
		_hasQQ = false;
	}
	
	if(_hasQQ == true)
	{
		_preQQ = {};

		for(var each in qq)
		{
			_preQQ[each] = qq[each];
		}
	}

	/* check if this is a node environment */
	try
	{
		if(typeof module !== 'undefined' && module.exports)
		{
			_isNode = true;
			root = this;
		}
		else
		{
			/* running in the browser */
			root = window;
		}
	}
	catch(e)
	{}

	/**
	* String transform methods.
	*/
	
	var formatCurrency = function(number, places, symbol, thousand, decimal)
	{
		number = number || 0;
		places = !isNaN(places = Math.abs(places)) ? places : 2;
		symbol = symbol !== undefined ? symbol : "$";
		thousand = thousand || ",";
		decimal = decimal || ".";
		
		var negative = number < 0 ? "-" : "",
						i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "", j = (j = i.length) > 3 ? j % 3 : 0;
		
		return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
	};

	/* TODO optimize value transformation, cache certain operations such as "split" and store it for later use. */
	var transformValue = function (val, cfg)
	{
		if(cfg instanceof Function)
		{
			try
			{
				return cfg.call(null, val);
			}
			catch(e)
			{
				throw new qq.Error("qq.transformValue: There was an error executing the value transformer.");
			}
		}
		else if(cfg.type != null)
		{
			if(cfg.type == "currency")
			{
				if(cfg.opts != null)
				{
					var arr = cfg.opts.split(""),
									places,
									pparsed,
									symbol,
									thousand,
									decimal;
					
					if(arr.length == 4)
					{
						if(arr[3] == "-")
						{
							places = 0;
						}
						else if(arr[3] == "+")
						{
							places = 2;
						}
						else
						{
							pparsed = parseInt(arr[3]);
							
							if(pparsed == arr[3])
							{
								places = pparsed;
							}
						}
					}
					
					symbol = arr[0];
					thousand = arr[1];
					decimal = arr[2];
					
					return formatCurrency(val, places, symbol, thousand, decimal);
				}
				else
				{
					return formatCurrency(val);
				}
			}
		}
		else
		{
			if(cfg == "currency")
			{
				return formatCurrency(val);
			}
		}
	};

	/**
	* Parses a url string into an object 
	* (protocol, host, hostname, port, pathname, search, searchObject, hash)
	*/
	var parseURL = function(url)
	{
		if(_isNode)
		{
			/* parse the url manually */

			return {protocol: null,
			        host: null,
			        hostname: null,
			        port: null,
			        pathname: null,
			        search: null,
			        searchObject: null,
			        hash: null
		    	};
		}

	    var parser = document.createElement('a'),
	        searchObject = {},
	        queries, split, i;
	    
	    // Let the browser do the work
	    parser.href = url;
	    // Convert query string to object
	    queries = parser.search.replace(/^\?/, '').split('&');

	    for(i = 0; i < queries.length; i++ )
	    {
	        split = queries[i].split('=');

	        searchObject[split[0]] = split[1];
	    }

	    return {
	        protocol: parser.protocol,
	        host: parser.host,
	        hostname: parser.hostname,
	        port: parser.port,
	        pathname: parser.pathname,
	        search: parser.search,
	        searchObject: searchObject,
	        hash: parser.hash
	    };
	};

	/**
	* Converts XML To String
	*/
	var XMLtoString = function(ref)
	{
		//debugger;
		var str = null;

		if(_isNode)
		{
			str = ref.toString();
		}
		else
		{
			try
			{
				var oSerializer = new XMLSerializer();
				str = oSerializer.serializeToString(ref);
			}
			catch (e)
			{
				if(window.ActiveXObject)
				{
					str = ref.xml;
				}
			}
		}
		
		return str;
	};

	var SerializeObject = function(object)
    {
        // Private
        var type,
        	serializedCode = "";

        type = typeof object;

        if(type === 'object')
        {
            var element;

            for(element in object)
            {
            	serializedCode += "[" + type + ":" + element + SerializeObject(object[element]) + "]";
            }
        }
        else if(type === 'function')
        {
        	serializedCode += "[" + type + ":" + object.toString() + "]";
        }
        else
        {
        	serializedCode += "[" + type + ":" + object+"]";
        }

        return serializedCode.replace(/\s/g, "");
    };

    var GetHashCode = function(object, path)
    {
    	var str = SerializeObject(object);

    	if(arguments.length == 2)
    	{
    		str = path +"::"+ str;
    	}

    	return qq.encryption.MD5.hash(str);
    };

    var trace = function ()
	{
		try
		{
			if(arguments.length == 1)
			{
				console.warn(arguments[0]);
			}
			else if(arguments.length == 2)
			{
				console.warn(arguments[0], arguments[1]);
			}
			else if(arguments.length == 3)
			{
				console.warn(arguments[0], arguments[1], arguments[2]);
			}
			else if(arguments.length == 4)
			{
				console.warn(arguments[0], arguments[1], arguments[2], arguments[3]);
			}
			else if(arguments.length == 5)
			{
				console.warn(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
			}
			else
			{
				/* TODO  */
				/*for(var i = 0, l = arguments.length; i < l; i++)
				{
					console.warn.apply(null, arguments);
				}*/
			}
		}
		catch(e) {}
	};

	/* virutal DOM methods */

	var QQNode = function ()
	{
		var node = function ()
		{

		};

		node.name = "";
		node.attr = {};
		node.children = [];
		
		node.style = null;
		node.classes = null;

		node.className = '';

		return node;
	};

	var strToParams = function(str, coerce)
	{
	  var result = {},
	    coerce_types = { 'true': !0, 'false': !1, 'null': null },
	    arr = str.replace( /\+/g, ' ' ).split( '&' ),
	    param, key, val, cur, i = 0, l = arr.length, keys, keys_last, 
	    boArr = $.browser.webkit || $.browser.opera || $.browser.mozilla;
	  
	  for(; i < arr.length; i++)
			{
				param = arr[i].split( '=' );
				key = decodeURIComponent( param[0] );
				val;
				cur = result;
				ii = 0;
				
				// If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
				// into its component parts.
				keys = key.split('][');
				keys_last = keys.length - 1;
	    
	    // If the first keys part contains [ and the last ends with ], then []
	    // are correctly balanced.
	    if(/\[/.test( keys[0] ) && /\]$/.test(keys[keys_last]))
	    {
	      // Remove the trailing ] from the last keys part.
	      keys[keys_last] = keys[keys_last].replace(/\]$/, '');
	      
	      // Split first keys part into two parts on the [ and add them back onto
	      // the beginning of the keys array.
	      keys = keys.shift().split('[').concat( keys );
	      
	      keys_last = keys.length - 1;
	    }
	    else
	    {
	      // Basic 'foo' style key.
	      keys_last = 0;
	    }
	    
	    // Are we dealing with a name=value pair, or just a name?
	    if(param.length === 2)
	    {
	      val = decodeURIComponent( param[1] );
	      
	      // Coerce values.
	      if(coerce)
	      {
	        val = val && !isNaN(val)            ? +val              // number
	          : val === 'undefined'             ? undefined         // undefined
	          : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
	          : val;                                                // string
	      }
	      
	      if(keys_last)
	      {
	        // Complex key, build deep object structure based on a few rules:
	        // * The 'cur' pointer starts at the object top-level.
	        // * [] = array push (n is set to array length), [n] = array if n is 
	        //   numeric, otherwise object.
	        // * If at the last keys part, set the value.
	        // * For each keys part, if the current level is undefined create an
	        //   object or array based on the type of the next keys part.
	        // * Move the 'cur' pointer to the next level.
	        // * Rinse & repeat.
	        
	        for(; ii <= keys_last; ii++)
	        {
	          key = keys[i] === '' ? cur.length : keys[ii];
	          cur = cur[key] = i < keys_last
	            ? cur[key] || ( keys[ii + 1] && isNaN( keys[ii+1] ) ? {} : [] )
	            : val;
	        }
	      }
	      else
	      {
	        // Simple key, even simpler rules, since only scalars and shallow
	        // arrays are allowed.
	        
	        
	        /* TODO check this - make sure this works - review this code */
	        if((boArr && (result[key] instanceof Array)) || (Array.isArray && Array.isArray(result[key])))
	        {
	        	// val is already an array, so push on the next value.
	        	result[key][result[key].length] = val;
	        }
	        else if ( result[key] !== undefined )
	        {
	        	// val isn't an array, but since a second value has been specified,
	        	// convert val into an array.
	        	result[key] = [ result[key], val ];
	        }
	        else
	        {
	        	// val is a scalar.
	        	result[key] = val;
	        }
	      }
	    }
	    else if(key)
	    {
	    	// No value was defined, so set something meaningful.
	    	result[key] = coerce ? undefined : '';
	    }
	  };
	  
	  return result;
	};


	var createQQConsole = (function () {
    	var str = "",
    		autoFlush = true,
    		dump = function()
    		{
    			var txt = var_dump.apply(this, arguments);

    			log.call(this, txt);

    			return txt;
    		},
    		/* logs out the message into a console */
    		log = function (msg, arg)
		    {
		        if(arguments.length == 2)
		        {
		            str += "\n" + (msg + " " + arg);
		        }
		        else
		        {
		            str += "\n" + (msg);
		        }

		        /* auto flushes the string with every log if autoFlush is set to true. This will get set to false on NodeJS. */
		        if(autoFlush == true)
		        {
		        	flush();
		        }
		    },
			/* flushes the console string. Or use flush(true) to make console automatically flush the string after every 'log' */
			flush = function (auto)
		    {
		    	if(arguments.length == 1)
		    	{
		    		autoFlush = auto ? true : false;
		    	}
		    	else
		    	{
		    		if(_isNode == true)
			    	{
			    		// if(qq.res != null)
			    		// {
			    		// 	qq.res.write(str);
			    		// }
			    		console.log(str);
			    	}
			    	else
			    	{
			    		console.log(str);
			    	}
			    	
			        str = "";
		    	}
		    };

		    /* instead of an object, we'll use a function so we can use qq.console as reference: qq.console("hello!"); */
		    var fnConsole = function ()
		    {
		    	log.apply(this, arguments);
		    };

		    /* assign qq.console methods into the function, use fnConsole as object, thnx to Javascript */
		    fnConsole.log = log;
		    fnConsole.flush = flush;
		    fnConsole.dump = dump;

    		return fnConsole;

	});
	
	var createQQ = (function ()
	{
		/** UTILS **/
		
		var x = 10;

	    /* qq version of the console, which has to be flushed in order to see the console. */
	    var qqConsole = createQQConsole();
		
		var bInited = false,
		
		// MODULE CONFIG PARAMETERS:
			
		// 	cfg.viewLoaded
		// 	cfg.controllerLoaded
			
		// 	cfg.script
		// 	cfg.viewDoc
		// 	cfg.viewNode
		// 	cfg.view
		// 	cfg.viewUID
		// 	cfg.viewWrapper
			
		// 	cfg.ref
		// 	cfg.resHandler
		// 	cfg.args
			
		// 	cfg.args.mapToName
		// 	cfg.args.mainView
			
		// 	cfg.config
		// 	cfg.config.id
		// 	cfg.config.controller
		// 	cfg.config.view
			
		// 	cfg.registered

				MODULES = {},
				ACTIONS = {},
				
		 // WIDGETS CONFIG PARAMETERS
			// {
			// 	cfg:cfg
				
			// 			cfg.configure
			// 			cfg.create
			// 			cfg.init
			// 			cfg.render
			// 			cfg.destroy
			// }
		
				WIDGETS = {},
				
				
				GROUPS = {},
				
		 // STATE CHANGE HANDLERS:
			
			// cfg.opts - options object containing all the possible values for the current state change
			// cfg.fn - function reference to execute on state change
			
			// the handlers are sorted by a hashtag - MD5 hash of all the 'opts' names for optimization
			
		
				STATEHANDLERS = {absolute:{}, relative:{}},
				CURRSTATE,
				
				CONFIG = {}, /* application configuration */

				/* static object contains configuration for static paths that directly map into configuration object,
				* while configuration in dynamic holds paths that require evaluation every time */
				ACCESSCFG = {static:{}, dynamic:[]}, /* access application configuration */
				READCFG = {static:{}, dynamic:[]}, /* configuration of how items are read, have defaults etc */
				CACHECFG = {static:{}, dynamic:[]}, /* configuration for application cache behavior */

				CONTAINER,
				CONTAINERINNER,
				containerType,
				lastModule,
				UIDGen,
				REGISTRY;
		
		/**
		* Returns a registry
		*/
		var getRegistry = function ()
		{
			return REGISTRY;
		};
		
		/**
		* Appends to container
		*/
		var appendToContainer = function (ref)
		{
			debugger;
			if(CONTAINERINNER != null && CONTAINERINNER.append)
			{
				CONTAINERINNER.append(ref);
			}
			else if(CONTAINER != null && CONTAINER.append)
			{
				CONTAINER.append(ref);
			}
			else
			{
				throw new qq.Error("Unable to append content to container.");
			}
		};
		
		/*
		* Dispatches an 'app.state' event when all the modules are loaded for a given QQ instance.
		*/
		var handleALLModulesLoaded = function ()
		{
			var evt = new qq.Event("app.state");
			
	        if(initialArgs != null)
	        {
	        	evt.args = initialArgs;
				
	        	initialArgs = null;
	        }
			
			console.log("qq.init: (5) before app.state.");
	        qq.ed.dispatchEvent(evt);
	        console.log("qq.init: (6) after app.state.");
		};
		
		/**
		* Gets executed when module finished loading both script & view assets .
		*/
		var handleModuleLoaded = function (id, pObj)
		{
			var mod = pObj[id],
				counter = 0,
				cfg = MODULES[id];
			
			delete(pObj[id]);
			
			cfg.ref.configure(cfg.uid);
			
			for(var each in pObj)
			{
				counter++;
			}
			
			if(counter == 0)
			{
				handleALLModulesLoaded();
			}
		};

		var pmhandlers = {onFailController: function(mID, jqxhr, settings, err)
			{
				//var mID = arguments.callee.id;

				//debugger;
				
				if(settings == "parsererror")
				{
					console.log("qq.processModules: Error parsing the MODULE controller [id:" + mID + "]. Check your code for javascript errors such as missing comma etc. [", err.message, "]");
				}
			},
			onDoneController: function(mID, pObj, script, textStatus)
			{
				var cfg = MODULES[mID];
				
				cfg.script = script;
				
				if(cfg.registered != true)
				{
					throw new qq.Error("Controller for the module (id:" + mID + ") didn't register properly.");
				}
				else
				{
					cfg.controllerLoaded = true;
				}
				
				/* DUPLICATE The following code snippet is a duplicate of the code BELLOW in the next delDone */
				if(cfg.viewLoaded == true && cfg.controllerLoaded == true)
				{
					handleModuleLoaded(mID, pObj);
				}
			},
			onDoneView: function (mID, pObj, data)
			{
				console.log("* DATA ", data);

				//var mID = arguments.callee.id,
				var	cfg = MODULES[mID];
				//debugger;
				
				cfg.viewLoaded = true;
				cfg.viewDoc = data;

				if(cfg.viewDoc != null && cfg.viewDoc.firstChild != null)
				{
					var nodeName;

					if(_isNode)
					{
						nodeName = cfg.viewDoc.firstChild.name.toLowerCase();
					}
					else
					{
						/* running in browser */
						nodeName = cfg.viewDoc.firstChild.nodeName.toLowerCase();
					}
					
					var childNodes, i, l, xmlNode;
					
					if(nodeName == "view")
					{
						childNodes = cfg.viewDoc.firstChild.childNodes;
						
						for(i = 0, l = childNodes.length; i < l; i++)
						{
							xmlNode = childNodes[i];
							
							if(xmlNode.nodeType == 1)
							{
								cfg.viewNode = xmlNode;
								break;
							}
						}
					}
					else if(nodeName == "data")
					{
						childNodes = cfg.viewDoc.firstChild.childNodes;
						
						for(i = 0, l = childNodes.length; i < l; i++)
						{
							xmlNode = childNodes[i];
							
							if(xmlNode.nodeType == 1)
							{
								if(_isNode)
								{
									if(xmlNode.name == "view")
									{
										cfg.viewNode = xmlNode;
									}
									else if(xmlNode.name == "templates")
									{
										/*if(cfg.templates == null)
										{
											cfg.templates = {};
										}
										
										cfg.templates[xmlNode.nodeName] = xmlNode;*/
									}
								}
								else
								{
									/* running in browser */
									if(xmlNode.nodeName == "view")
									{
										cfg.viewNode = xmlNode;
									}
									else if(xmlNode.nodeName == "templates")
									{
										/*if(cfg.templates == null)
										{
											cfg.templates = {};
										}
										
										cfg.templates[xmlNode.nodeName] = xmlNode;*/
									}
								}

								
							}
						}
					}
					
					if(cfg.viewNode == null)
					{
						throw new qq.Error("Couldn't find the view data for the module (id:" + mID + "), it maybe empty.");
					}
				}
				else
				{
					throw new qq.Error("View document for the module (id:" + mID + ") must contain the root 'view' node.");
				}
				
				if(cfg.viewLoaded == true && cfg.controllerLoaded == true)
				{
					/*var fn = cfg.ref.init(cfg.uid);
					
					if(fn != null && typeof(fn) == "function")
					{
						cfg.resHandler = fn;
					}*/
					
					handleModuleLoaded(mID, pObj);
				}

			},
			onFailView: function (mID, jqxhr, settings, err)
			{
				//var mID = arguments.callee.id;

				//debugger;
				
				try
				{
					console.log("Error loading the MODULE view [id:" + mID + "]", err.message);
				}
				catch(e)
				{

				}
			}};
		
		/**
		* Processes all the modules - ie loads their controllers and views.
		*/
		var processModules = function ()
		{
			/* set all the references for this function */
			var cfg, 
				mid, 
				typeOfPathContrl, 
				pathControllers = CONFIG.controllers, 
				typeOfPathViews, 
				pathViews = CONFIG.views, 
				strPathViews, 
				strPathControllers, 
				spath, 
				delDone, 
				delFail, 
				cname, 
				vname,
				nodeName,
				pObj = {},
				options;
			
			if(pathControllers == null)
			{
				pathControllers = "";
			}
			
			if(pathViews == null)
			{
				pathViews = "";
			}
	
			typeOfPathViews = typeof(pathViews);
			typeOfPathContrl = typeof(pathControllers);


			/**
			 * In the asynchronous execution order we need to generate 'pObj' before executing success callbacks
			 * As its used to execute 'all modules loaded' callback.
			 */
			for(var each in MODULES)
			{
				cfg = MODULES[each];
				
				mid = cfg.config.id;
				
				pObj[mid] = cfg;
			}
			
			/* go through all the registered modules */
			for(var each in MODULES)
			{
				cfg = MODULES[each];
				
				cfg.viewLoaded = false;
				cfg.controllerLoaded = false;
				
				mid = cfg.config.id;
				
				//pObj[mid] = cfg;
				
				/** LOAD CONTROLLER **/
				
				/* get controller name from config or module uid */
				if(cfg.config.controller != null && cfg.config.controller.length > 0)
				{
					cname = cfg.config.controller;
				}
				else
				{
					cname = mid;
				}
				
				/* get view name or use module uid */
				if(cfg.config.view != null && cfg.config.view.length > 0)
				{
					vname = cfg.config.view;
				}
				else
				{
					vname = mid;
				}
				
				//jquery.binarytransport.js
				
				//$.getScript(spath).done(delDone).fail(delFail);
				
				/** LOAD VIEW XML */
				/* get path view string */
				if(typeOfPathViews == "function")
				{
					strPathViews = pathViews();
				}
				else
				{
					strPathViews = pathViews;
				}
				
				/* Path to View XML */
				spath = strPathViews + vname + ".xml";;
				
				
				/* setup callback delegates */

				/* DUPLICATE The following code snippet is a duplicate of the code ABOVE in the delDone */
				delDone = qq.delegate.create(this, pmhandlers.onDoneView, each, pObj);
				//delDone.id = each;
				
				delFail = qq.delegate.create(this, pmhandlers.onFailView, each);
				//delFail.id = each;
				
				/* setup options for xml / html view request */
				options = {
					dataType: 'xml',
					processData: false,
					url: spath
				};
				
				/* assign callbacks to xml / html document reading */
				options.success = delDone;
				options.error = delFail;
				
				/* TODO make file loading asynchronous via promises etc */
				if(_isNode)
				{
					if(qq.fs.existsSync(spath))
					{
						var xmlContent = qq.fs.readFileSync(spath, 'utf8');

						try
						{
							//process XML into a document and pass it into the success function
							var xmlTree = qq.$.load(xmlContent, {
								    xml: {
								      normalizeWhitespace: true,
								    }
								});

							var xmlDocument = xmlTree();

							if(xmlDocument != null && xmlDocument.children != null)
							{
								var nodeChildren = xmlDocument.children();

								if(nodeChildren != null && nodeChildren[0] != null)
								{
									var rootNode = nodeChildren[0];

									try
									{
										options.success(rootNode);
									}
									catch(e)
									{
										console.error("qq : Error executing 'onDone' for XML spath = " + spath + "\n" + e);
									}
								}
							}
						}
						catch(e)
						{
							options.error();
						}
					}
				}
				else
				{
					try
					{
						$.ajax(options);
					}
					catch(e)
					{
						throw new qq.Error("Error loading XML document. " + e);
					}
				}


				/* get path to controllers */
				if(typeOfPathContrl == "function")
				{
					strPathControllers = pathControllers();
				}
				else
				{
					strPathControllers = pathControllers;
				}
				
				/* make script path */
				spath = strPathControllers + cname + ".js";
				
				/* setup script callbacks */

				/* handle controller load failure */
				delFail = qq.delegate.create(this, pmhandlers.onFailController, each);
				//delFail.id = each;
				
				/* handle controller load success */
				delDone = qq.delegate.create(this, pmhandlers.onDoneController, each, pObj);
				//delDone.id = each;
				
				/* setup the options for file retrival request */
				options = {
					cache: true,
					dataType: 'script',
					processData: false,
					url: spath
				};
				
				/* assign callback methods into the options object */
				options.success = delDone;
				options.error = delFail;
				
				/* finally initiate loading */
				/* TODO here is where we should make loading asynchronous. Also the execution should happen upon asynchronous load. Setup execution time out based on user role or w/e. */
				if(_isNode)
				{
					//console.log("load script", spath);
					//console.log("from ", __dirname);
					if(qq.fs.existsSync(spath))
					{
						var jsCode = qq.fs.readFileSync(spath, 'utf8');

						const vm = new qq.vm({
						    timeout: 6000000,
						    sandbox: {qq: qq}
						});

						try
						{
							var res = vm.run(jsCode);

							try
							{
								options.success(jsCode, res);
							}
							catch(e)
							{
								console.error("qq : Error executing 'onDone' for controller spath = " + spath + "\n" + e);
							}

							console.log("vm result : ", res);
						}
						catch(e)
						{
							options.error();
						}
					}
				}
				else
				{
					try
					{
						$.ajax(options);
					}
					catch(e)
					{
						throw new qq.Error("Error loading script. " + e);
					}
				}


			}
		};
		
		/**
		* Loads a module.
		*/
		var loadModule = function (config)
		{
			if(config != null && config.id != null && config.id.length > 0)
			{
				if(MODULES[config.id] != null)
				{
					throw new qq.Error("Module configuration under (id:" + config.id + ") is already registered.");
				}
				else
				{
					/* setup the module configuration in MODULES. This is used when the module is loaded and is registered with QQ. */
					MODULES[config.id] = {registered:false, config:config};
				}
			}
		};
		
		/**
		* Registers a module.
		*/
		var registerModule = function (id, args)
		{
			if(MODULES[id] != null)
			{
				var cfg = MODULES[id],
					ref;
				
				cfg.registered = true;
				cfg.config;
				
				cfg.args = args;
				cfg.uid = UIDGen.generate();
				
				ref = new qq.Module(id, cfg.uid, WIDGETS, GROUPS);
				
				cfg.ref = ref;
				
				return ref;
			}
			else
			{
				try
				{
					console.log("qq.registerModule: Error registering a module with [id:" + id + "], no such module id specified, make sure module ids match within the module controller and the qq configuration.");
				} catch(e){}
			}
		};
	
		/**
		* Returns an object of all registered widgets
		*/
		var getWidgets = function ()
		{
			return WIDGETS;
		};
	
		/**
		* Returns an object of all registered groups
		*/
		var getGroups = function ()
		{
			return GROUPS;
		};
		
		/**
		* Registers a widget
		*/
		var registerWidget = function (id, cfg, hasSelectors)
		{
			if(cfg != null && id != null && id.length > 0)
			{
				if(WIDGETS[id] != null)
				{
					throw new qq.Error("qq.registerWidget: A widget configuration under (id:" + id + ") is already registered.");
				}
				else
				{
					var bHasSelectors = hasSelectors === true ? true : false;
	
					WIDGETS[id] = {cfg:cfg, hasSelectors:hasSelectors};
				}
			}
		};
	
		/**
		* Registers a widget group
		*/
		
		var registerWidgetGroup = function (id, cfg)
		{
			if(cfg != null && id != null && id.length > 0)
			{
				if(GROUPS[id] != null)
				{
					throw new qq.Error("qq.registerWidgetGroup: A widget group configuration under (id:" + id + ") is already registered.");
				}
				else
				{
					GROUPS[id] = {cfg:cfg};
				}
			}
		};
		
		/** INIT **/
		
		/**
		* Sets up application state change handler.
		*/
		var setupAppStateChangeHandler = function ()
		{
			var eMMAppState = qq.Delegate.create({}, function (evt)
	        {
	          console.log("* e : app.state", evt);
	          
	          //SelectSharesPack(); 
	
	          if(evt.args != null)
	          {
	          	//debugger;
	          	//qq;
	          	processStateRequest(evt.args);
	
	          	CURRSTATE = evt.args;
	          }
	          
	        });
	
			qq.ed.addEvent("app.state", eMMAppState);
	
	
			// qq.$(window).bind('hashchange', function(e)
			// {
			// 	console.log("* document.URL", document.URL);
			// 	console.log("hashchange", arguments);
				
			// 	var args = $.deparam.fragment();
	
			// 	console.log("args", args);
				
			// 	//processStateRequest(args);
				
			// 	//CURRSTATE = args;
				
			// });
		};
		
		
		var updateState = function (opts)
		{
			var arr, each, str = '', state = {}, b = false;
			
			if(typeof(opts) == "string")
			{
				opts = strToParams(opts);
			}
			
			for(var each in CURRSTATE)
			{
					state[each] = CURRSTATE[each];
			}
			
			for(each in opts)
			{
					state[each] = opts[each];
			}
			
			for(each in state)
			{
				str += (each + "=" + state[each]) + "&";
			}
			
			str = str.substr(0, str.length-1);
			
			window.location.hash = str;
		};
		
		
		var processStateHandler = function (args)
		{
			var each, arr = [], names, hashtag, cfg, i = 0, l, opts, equals = 0, total = 0, msg;
			
			for(each in args)
			{
				arr[arr.length] = each;
				total++;
			}
			
			/* sort a, b, d, g */
			arr.sort();
			
			names = arr.join('|');
			hashtag = qq.encryption.MD5.hash(names);
			
			if(STATEHANDLERS.absolute[hashtag] != null)
			{
				arr = STATEHANDLERS.absolute[hashtag];
				
				for(l = arr.length; i < l; i++)
				{
					cfg = arr[i];
					
					opts = cfg.opts;
					
					for(each in opts)
					{
						if(opts[each] == args[each])
						{
							equals++;
						}
					}
					
					if(total == equals)
					{
						try
						{
							cfg.fn.call();
						}
						catch(e)
						{
							msg = "processStateHandler: There was an error executing a state handler for state '" + cfg.str + "'.";
							try
							{
								console.warn(msg);
							}
							catch(e)
							{
								alert(msg);
							}
						}
					}
					
					equals = 0;
				}
			}
			
			/* process relative state handlers */
			
			var relative = STATEHANDLERS.relative,
				i = 0, l, fn, bopts, goodopts;
			
			for(var each in relative)
			{
				if(parseInt(each) <= total)
				{
					arr = relative[each];
					
					for(i = 0, l = arr.length; i < l; i++)
					{
						cfg = arr[i];
						
						opts = cfg.opts;
						
						fn = cfg.fn;
						
						bopts = cfg.bopts;
						
						goodopts = 0;
						
						for(opt in bopts)
						{
							goodopts--;
							
							if(args[opt]!= null && args[opt] == opts[opt])
							{
								goodopts++;
							}
							
						}
						
						if(goodopts == 0)
						{
							try
							{
								fn.call();
							}
							catch(e)
							{
								msg = "processStateHandler: There was an error executing a state handler for state '" + cfg.str + "'.";
								try
								{
									console.warn(msg);
								}
								catch(e)
								{
									alert(msg);
								}
							}
							
						}
					}
				}
			}
			
			
			
			
			
		};
		
		/**
		* Executes response handler method for the module and passes in the request arguments, but saves the request & arguments for later when module loads.
		* - checks if the module in state request loaded its view and controller
		* - focuses the module in view by generating its contents
		*/
		var processStateRequest = function (args)
		{
			console.group("* process state request");

			/* module ID */
				var mid = args.module, 
			/* action ID */
				aid =  args.action, 
			/* config */
				cfg, arr, saveArgs;
				
				if(mid != null && mid.length > 0)
				{
					if(MODULES[mid] != null)
					{
						cfg = MODULES[mid];
						
						if(cfg.registered == true && (cfg.viewLoaded == true && cfg.controllerLoaded == true))
						{
							/* clone the view reference if it doesn't exist */
							
							focusModuleInView(mid);
							
							/* TODO add simple event manager to the mix and execute life cycle events */
							
							
							/* before the module view is shown we must initialize it, extract view references, hide all the unnecessary views, some views may require to be visibility hidden instead of display none */
							
							/* when changing views or modules, perform a life cycle that allows us to add animations to view / module transitions / add build in transitions */
							
							saveArgs = args;
							
							/* oninit is used to save state requests so they are processed when module finished loading assets and registered.
							*  process all prior requests first
							*/
							if(cfg.oninit != null && cfg.oninit.length > 0)
							{
								arr = cfg.oninit;
								
								for(var i = 0, l = arr.length; i < l; i++)
								{
									args = arr[i];
									
									if(cfg.resHandler != null)
									{
										try
										{
											cfg.resHandler.apply(cfg.ref, [args]);
										}
										catch(e)
										{
											throw new qq.Error("qq.processStateRequest: There was an error executing the response handler for module (id:" + mid + "). " + e);
										}
									}
									
									processStateHandler(args);
								}
							}
							
							/* save args is a previously saved args - we might have used args to execute oninit */
							args = saveArgs;
							
							/* execute a response handler with the arguments */
							if(cfg.resHandler != null)
							{
								try
								{
									cfg.resHandler.apply(cfg.ref, [args]);
								}
								catch(e)
								{
									throw new qq.Error("qq.processStateRequest: There was an error executing the response handler for module (id:" + mid + ")." + e);
								}
							}
							//console.log("4 args", args);
							processStateHandler(args);
						}
						else
						{
							/* save requests if the module hasn't loaded or registered. these requests get processed as soon as the module loads */
	
							/* TODO test if this works */
							/* TODO error ? or keep the last state set and execute only when module has been registered */
							if(cfg.oninit == null)
							{
								arr = [];
								cfg.oninit = arr;
							}
							else
							{
								arr = cfg.oninit;
							}
							
							cfg.oninit[cfg.oninit.length] = args;
						}
					}
				}
				else if(aid != null && aid.length > 0)
				{
					if(ACTIONS[aid] != null)
					{
						cfg = ACTIONS[mid];
					}
				}
	
			console.groupEnd();
		};
		
		
		
		/* TODO add handler's directive as to how many times it executes and whether it does it only once when the view becomes a part of the screen, whetehr it needs to equal ALL state variables or just the ones mentioned etc */
		/* TODO add argument checkers to make sure the right arguments are passed into the method */
		var onStateChange = function (ename, opts, fn, relative)
		{
			if(arguments.length == 3)
			{
				relative = fn;
				fn = opts;
				opts = ename;
				ename = "*";
			}
			
			var arr, each, strOpts = "";
			
			if(typeof(opts) == "string")
			{
				strOpts = opts;
				opts = strToParams(strOpts);
			}
			
			if(relative == true)
			{
				var optsBool = {}, counter = 0;
				
				for(each in opts)
				{
					optsBool[each] = true;
					counter++;
				}
				
				if(STATEHANDLERS.relative[counter] == null)
				{
					arr = [];
					STATEHANDLERS.relative[counter] = arr;
				}
				else
				{
					arr = STATEHANDLERS.relative[counter];
				}
				
				arr[arr.length] = {opts:opts, fn:fn, bopts:optsBool, str:strOpts};
			}
			else
			{
				var pnames, hashtag;
				
				arr = [];
				
				for(each in opts)
				{
					arr[arr.length] = each;
				}
				
				arr.sort();
				
				pnames = arr.join('|');
				hashtag = qq.encryption.MD5.hash(pnames);
				
				if(STATEHANDLERS.absolute[hashtag] == null)
				{
					arr = [];
					STATEHANDLERS.absolute[hashtag] = arr;
				}
				else
				{
					arr = STATEHANDLERS.absolute[hashtag];
				}
				
				arr[arr.length] = {opts:opts, fn:fn, str:strOpts};
			}
		};
		
		/**********/
		
		var hideModule = function (mid)
		{
			var cfg = MODULES[mid];

			cfg.view.css("display", "none");

			//args: Proxy {mapToName: true, mainView: "main"}
			//config: {id: "mmCart"}
			//controllerLoaded: true
			//ref: qq.Module
			//registered: true
			//resHandler: ƒ ()
			//script: 
			//uid:
			//view: Node
			//viewDoc: XML Node
			//viewLoaded: boolean
			//viewNode: 
			//viewString
			//viewUID
			//viewWrapper:
			
			if(containerType == "bs:carousel")
			{
				if(cfg.viewWrapper != null)
				{
					//cfg.viewWrapper.removeClass("active");
				}
			}
			
		};
		
		var showModule = function (mid)
		{
			var cfg = MODULES[mid];
			
			console.log("qq.init: (5-d1) show module.");

			/* cfg.view is a real time Node, so any changes to it affect the view */
			cfg.view.css("display", "block");
			
			if(containerType == "bs:carousel")
			{
				//cfg.viewWrapper.addClass("active");
				
				var arr = CONTAINERINNER.children(),
					i = 0, l = arr.length;
				
				for(; i < l; i++)
				{
					if(arr[i] == cfg.viewWrapper[0])
					{
						CONTAINER.carousel(i);
						
						break;
					}
				}
				
			}
			
		};
		
		/**
		* Focuses module in view. Adds the module view node into the container.
		* - converts the view into XML string
		* - adds view XML string into the container
		* - 
		*/
		var focusModuleInView = function (mid)
		{
			var lastCfg = MODULES[lastModule],
				cfg = MODULES[mid], vcfg;
			
			if(lastCfg != null)
			{
				debugger;
				console.log("qq.init: (5-a) hide previous module.");
				// hide the module depending on its configuration
				hideModule(lastModule);
			}

			debugger;
			/* if the view doesn't exist then */
			/* create & insert the view html into the DOM */
			if(cfg.view == null)
			{
				if(cfg.viewNode != null)
				{
					/* generate the view string out of the module's view node */
					if(cfg.viewString == null)
					{
						console.log("qq.init: (5-b) get view string from node tree.");
						if(_isNode)
						{
							cfg.viewString = XMLtoString(qq.$(cfg.viewNode));
						}
						else
						{
							cfg.viewString = XMLtoString(qq.$(cfg.viewNode).clone()[0]);
						}
					}
					
					/* add view string to container */
					if(cfg.viewString != null)
					{
						console.log("qq.init: (5-c) add view string to container.");
						vcfg = addToContainer(cfg.viewString);
						
						/* content is a node of the view */
						cfg.view = vcfg.content;

						/* uid is also the .id attribute */
						cfg.viewUID = vcfg.uid;

						/* view wrapper node */
						cfg.viewWrapper = vcfg.wrapper;
						
						/* initialize the module prior to showing it, assign the 'resHandler' if a function was returned from the 'init' method. */
						
						//console.log("* initialize the module prior to showing it", cfg, cfg.ref);
						
						/* ref is the module reference */
						debugger;
						if(cfg.ref.init != null)
						{
							var fn = cfg.ref.init(cfg.uid, cfg.args, cfg.viewWrapper);
							
							if(fn != null && typeof(fn) == "function")
							{
								cfg.resHandler = fn;
							}
						}
					}
				}
			}
			
			//show module ie process initialization sequence
			if(cfg.view != null)
			{
				showModule(mid);
			}
			
			lastModule = mid;
		};
		
		
		var addToContainer = function (str)
		{
			var uid = "qq" + UIDGen.generate(),
				content = qq.$(str),
				wrapper;
			
			if(containerType == "bs:carousel")
			{
				wrapper = qq.$('<div id="' + uid + '" class="item"></div>');
				
				wrapper.append(content);
				
				appendToContainer(wrapper);
			}
			else
			{
				wrapper = qq.$('<div id="' + uid + '"></div>');
				
				wrapper.append(content);
				
				appendToContainer(wrapper);
			}
			
			//initBootstrapIn("#"+uid);
			
			return {content:content, uid:uid, wrapper:wrapper, type: containerType};
		};
	
		function loadES6Module(url, callback)
		{
			return loadScript(url, callback, "module");
		}
	
		function loadScript(url, callback, type)
		{
			if(type == null)
			{
				type = "text/javascript";
			}
	
			var script = document.createElement("script")
		    	script.setAttribute("type", type);
	
		    if(script.readyState)
		    {
		    	//IE
		        script.onreadystatechange = function()
		        {
		            if (script.readyState == "loaded" || script.readyState == "complete")
		            {
		                script.onreadystatechange = null;
		                callback();
		            }
		        };
		    }
		    else
		    {
		    	//Others
		        script.onload = function()
		        {
		            callback();
		        };
		    }
	
		    script.setAttribute("src", url);
	
		    const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
			
			head.insertBefore(script, head.lastChild);
	
		    //document.getElementsByTagName("head")[0].appendChild(script);
		};

		/* serializes a reference into a string. Used to console out an object, like var_dump */
		function var_dump(arr, level)
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
	                	txt += level_padding + "" + item + " : {\n";
	                	txt += level_padding + " " + var_dump(value, level + 1).trim() + "\n" + level_padding + "}\n";
	            	}
			    	else if(typeof(value) == 'function')
			    	{
			    		txt += level_padding + "" + item + "()\n";
			    	}
	            	else
	            	{
	                	txt += level_padding + "'" + item + "' => \"" + value + "\"\n";
	            	}
	        	}
	    	}
	    	else
	    	{
	        	txt = "===>"+arr+"<===("+typeof(arr)+")";
	    	}
	    	
	    	return txt;

		}; /* end dump */
	
		/*** ***/
		
		/* TODO not sure if we nedd this */
		var initBootstrap = function(sel)
		{
			var arr = qq.$(sel + " .carousel"), i = 0, l = arr.length;
			
			for(; i < l; i++)
			{
				qq.$(arr[i]).carousel({
	          pause: true,
	          interval: false
	      });
			}
			
			var arr = qq.$(sel + " .btn");
			
			for(i = 0, l = arr.length; i < l; i++)
			{
				qq.$(arr[i]).button();
			}
		};
		
		var initialArgs;

		var executeConfigHandlers = function()
		{
			var arr = CONFIG["~fns~"],
				fn;

			if(arr != null && arr.length > 0)
			{
				for(var i = 0, l = arr.length; i < l; i++)
				{
					fn = arr[i];

					try
					{
						fn();
					}
					catch(e)
					{
						qq.console("Error executing the 'on' config(fn) event handler.");
					}
				}
			}

			/* remove all the on config handlers from the config ! */
			delete(CONFIG["~fns~"]);
		};

		

		var qq$;

		/* QQ$ */
		(function () {

			/* TRAVERSING */
			/**
			* Create a new jQuery object with elements added to the set of matched elements.
			*/
			var add = function ()
			{

			};

			/**
			* Get the children of each element in the set of matched elements, optionally filtered by a selector.
			*/
			var children = function ()
			{
				
			};

			/**
			* Get the children of each element in the set of matched elements, including text and comment nodes.
			*/
			var contents = function ()
			{
				
			};

			/**
			* Get the descendants of each element in the current set of matched elements, filtered by a selector, jQuery object, or element.
			*/
			var find = function ()
			{
				
			};

			/* MANIPULATION CSS */

			/**
			* Adds the specified class(es) to each element in the set of matched elements.
			*/
			var addClass = function ()
			{

			};
			

			/* MANIPULATION DOM */
			
			/**
			* Insert content, specified by the parameter, to the end of each element in the set of matched elements.
			*/
			var append = function ()
			{
				
			};
			
			/**
			* Insert every element in the set of matched elements to the end of the target.
			*/
			var appendTo = function ()
			{
				
			};
			
			/**
			* Insert content, specified by the parameter, before each element in the set of matched elements.
			*/
			var before = function ()
			{
				
			};

			/**
			* Remove the set of matched elements from the DOM.
			*/
			var detach = function ()
			{
				
			};

			/**
			* Remove all child nodes of the set of matched elements from the DOM.
			*/
			var empty = function ()
			{
				
			};

			var html = function ()
			{
				
			};

			/* MANIPULATION > STYLE PROPERTIES */

			var css = function ()
			{
				
			};

			/* MANIPULATION ATTRIBUTES */

			var attr = function ()
			{
				
			};

			/* MISC > DATA STORAGE */

			var data = function ()
			{
				
			};


			/* returns length */
			var length = function ()
			{

			};

			var load = function ()
			{

			};

			var map = function ()
			{

			};

			var parent = function ()
			{

			};

			var promise = function ()
			{

			};

			var prop = function ()
			{

			};

			/**
			* Specify a function to execute when the DOM is fully loaded.
			*/
			var ready = function ()
			{

			};

			/**
			* Remove the set of matched elements from the DOM.
			*/
			var remove = function ()
			{

			};

			var removeAttr = function ()
			{

			};

			var removeClass = function ()
			{

			};

			var removeData = function ()
			{

			};

			var removeProp = function ()
			{

			};

			var replaceAll = function ()
			{

			};

			var replaceWidth = function ()
			{

			};

			var size = function ()
			{

			};

			var slice = function ()
			{

			};

			var text = function ()
			{

			};

			var val = function ()
			{

			};

			var width = function ()
			{

			};

			var height = function ()
			{

			};

			var wrapInner = function ()
			{

			};
			
			qq$ = function ()
			{

				var fn$ = function ()
				{

				};

				/* all the functions inside */
				
				fn$.add = add;
				fn$.children = children;
				fn$.contents = contents;
				fn$.find = find;

				fn$.addClass = addClass;
				fn$.append = append;
				fn$.appendTo = appendTo;
				fn$.before = before;
				fn$.detach = detach;
				fn$.empty = empty;
				fn$.html = html;
				

				fn$.css = css;

				fn$.attr = attr;

				fn$.data = data;

				fn$.length = length;

				fn$.load = load;

				fn$.map = map;

				fn$.parent = parent;

				fn$.promise = promise;

				fn$.prop = prop;

				fn$.ready = ready;

				fn$.remove = remove;

				fn$.removeAttr = removeAttr;

				fn$.removeClass = removeClass;

				fn$.removeData = removeData;

				fn$.removeProp = removeProp;

				fn$.replaceAll = replaceAll;

				fn$.replaceWidth = replaceWidth;

				fn$.size = size;

				fn$.slice = slice;

				fn$.text = text;

				fn$.val = val;

				fn$.width = width;
				fn$.height = height;

				return fn$;
			};

		}).apply({});

		/**
		* Checks if an object is a qq.$ node. Also acts as another function when nothing is passed into it, as a way to tell if we are running in a nodeJS environment.
		*/
		var isNode = function(obj)
		{
			if(obj == null)
			{
				return _isNode;
			}
			else
			{
				return obj.name || obj.type === 'text' || obj.type === 'comment';
			}
		};
		
		/**
		* Initialize QQ
		* - setup main container reference
		* - execute config handlers
		* - sets up state change handlers
		* - processes the modules ie loads view & controller assets
		*/
		var init = function (args)
		{
			if(bInited != true)
			{
				initialArgs = args;
				
				if(qq.UIDGenerator == null)
				{
					throw new qq.Error("qq.init: UIDGenerator didn't load.");
				}
				else
				{
					UIDGen = new qq.UIDGenerator();
				}

				//debugger;

				/* Here is where we find the app container in the application 'document' */
				if(_isNode)
				{
					/* this should search for the container in a global document */
					CONTAINER = qq.document.find(CONFIG.container);

					if(CONTAINER.length > 0)
					{
						console.log("qq.init: (1) setup container reference.")
					}
				}
				else
				{
					CONTAINER = qq.$(CONFIG.container);

					/* If we find a container reference */
					if(CONTAINER.length > 0)
					{
						CONTAINER = qq.$(CONFIG.container);
						/* class list is currently only being used by non-node environments */
						var classList = CONTAINER[0].className.split(/\s+/);

						var classDict = {};

						for(var i = 0; i < classList.length; i++)
						{
							classDict[classList[i]] = true;
						}

						if(classDict.carousel == true)
						{
							containerType = "bs:carousel";
							
							CONTAINERINNER = CONTAINER.find(".carousel-inner");
							
							CONTAINER.carousel({pause:true, interval:false});
						}
					}
				}
				
				REGISTRY = new qq.Registry();
				
				/* process ie execute on config registered handlers - execute the callbacks */
				executeConfigHandlers();
				console.log("qq.init: (2) execute config handlers.");

				/* register the state change handler for the entire qq environment */
				setupAppStateChangeHandler();
				console.log("qq.init: (3) setup state change handlers.");
				
				/* load views and controllers (html/xml & javacript files) of all the modules */
				processModules.call(this);
				console.log("qq.init: (4) loaded view and controller assets.");

				bInited = true;
			}
			else
			{
				//args;

				var evt = new qq.Event("app.state");
				
		        if(args != null)
		        {
		        	evt.args = args;
					
		        	args = null;
		        }
				
				qq.ed.dispatchEvent(evt);
			}
		}; /* end init qq */
		
		/**
		* Use 'configure' to set initial QQ parameters before initializing it.
		*/
		var configure = function (key, value)
		{
			if(bInited != true)
			{
				if(typeof(key) == "function")
				{
					if(CONFIG["~fns~"] == null)
					{
						CONFIG["~fns~"] = [];
					}
					
					var arr = CONFIG["~fns~"];
					
					arr.push(key);
				}
				else
				{
					if(CONFIG[key] == null)
					{
						CONFIG[key] = value;
					}
				}
			}
		};

		/**
		* Configures application access
		*/
		var configureAccess = function (pattern, cfg)
		{
			var _static = ACCESSCFG.static,
				_dynamic = ACCESSCFG.dynamic;

			/* access pattern could be a regular expression */
			if(pattern instanceof RegExp)
            {
                _dynamic.push(pattern);
            }
            else if(typeof(pattern) == "string")
            {
            	_static[pattern] = cfg;

            	//console.log("configureAccess static", pattern, _static, cfg)
            }
		};

		/* returns the application access configuration */
		var configureAccessGet = function ()
		{
			//console.log("ACCESSCFG", qq.dump(ACCESSCFG))
			return ACCESSCFG;
		};

		configureAccess.get = configureAccessGet;

		/*** ERROR CLASS ***/
		
		var errr = function (message)
		{
			if(arguments.length > 1)
			{
				if(arguments.length == 2)
				{
					this.message = message + "." + arguments[1];
				}
				else if(arguments.length == 3)
				{
					this.message = message + "." + arguments[1] + "." + arguments[2];
				}
			}
			else
			{
				this.message = message;
			}
	
			try
			{
				console.warn("[QQ:ERROR] " + message);
			}
			catch(e) {}
		};
		
		errr.prototype = new Error();
		
		
		registerWidget.group = registerWidgetGroup;

		var scope = this;
		
		var qqRef = {loadModule: loadModule.bind(scope), 
					init: init.bind(scope),
					configure: configure.bind(scope),
					
					registerModule: registerModule.bind(scope),
					registerWidget: registerWidget.bind(scope),
					getWidgets: getWidgets.bind(scope),
					getGroups: getGroups.bind(scope),
					
					register:{
						widget:	registerWidget.bind(scope),
						module: registerModule.bind(scope)
					},
					
					GetHashCode: GetHashCode.bind(scope),
					
					trace: trace.bind(scope),
					dump: var_dump.bind(scope),
					console: trace.bind(scope),
					t: trace.bind(scope),
					XMLtoString: XMLtoString.bind(scope),
					parseURL: parseURL.bind(scope),
					
					transform:transformValue.bind(scope),
					
					//initBootstrap: initBootstrap,
					
					updateState: updateState.bind(scope),
					
					on: onStateChange.bind(scope),
					
					registry: getRegistry.bind(scope),

					loadScript: loadScript.bind(scope),
					loadScriptModule: loadES6Module.bind(scope),
					console: qqConsole,
					
					Error: errr.bind(scope),
					Node: QQNode.bind(scope),
					node: QQNode.bind(scope),
					isNode: isNode.bind(scope)//,

					//$: qq$
				};

		qqRef.configure.access = configureAccess;
		//console.log("configure", qqRef.configure.access)

		var fnQQRef = function ()
		{
			// console.log("qq ref");
		};

		/* assign all the method references into the qq function reference */
		for(var each in qqRef)
		{
			fnQQRef[each] = qqRef[each];
		}

		return fnQQRef;

	}); /* end qq function */

	var qq = createQQ();
	
	/* reassign the references from previous qq object to newly created function in order to keep the same references. */
	/* this makes it possible to include the qq.js after including other concepts */
	if(_hasQQ == true)
	{
		for(var each in _preQQ)
		{
			qq[each] = _preQQ[each];
		}
	}
	
	/* assign qq into root */
	root.qq = qq;

	/* if its a node then export */
	if(_isNode)
	{
		module.exports = qq;
	}

	console.log("jQ");
	//console.log("jQuery", jQuery);
	console.log(" :end: - injected qq.js");

}).apply(this, qq);