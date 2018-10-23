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
		qq = {};
	}

	/* check if this is a node environment */
	try
	{
		if(typeof module !== 'undefined' && module.exports)
		{
			_isNode = true;
			root = this;

			module.exports = qq;
		}
		else
		{
			/* running in the browser */
			root = window;
		}
	}
	catch(e)
	{}

	qq.Module = function (id, uid, WIDGETS, GROUPS)
	{
		if(uid == null || !(uid.length > 0))
		{
			throw new qq.Error("qq.Module: invalid module uid (uid:" + uid + ").");
		}
		
		/*
			cfg.ref;
			cfg.qsel;
			cfg.uid;
			cfg.dom
		*/
		
		var VIEWS = {},
				lastView,
				SERVICES = {},
				SELECTOR = {},
				DEFAULTS = {},
				DATAVIEWMAP = {},
				handleREST,
				modID = id,
				modUID = uid,
				UIDGen = new qq.UIDGenerator(),
				bConfigured = false,
				bInited = false,
				
				WIDGETS = WIDGETS,
				
				GROUPS = GROUPS,
				
				REGISTRY = new qq.Registry();
		
		this.registry = function ()
		{
			return REGISTRY;
		};
		
		/**** VIEWS ****/
		
		this.registerView = function (id, qsel)
		{
			if(id != null && id.length > 0)
			{
				if(VIEWS[id] != null)
				{
					throw new qq.Error("View configuration under (id:" + id + ") is already registered.");
				}
				else
				{
					var cfg = {},
							uid = UIDGen.generate();
					
					var viewRef = new qq.View(modID, id, uid, this, WIDGETS, GROUPS);
					
					cfg.ref = viewRef;
					cfg.qsel = qsel;
					cfg.uid = uid;
					cfg.id = id;
					cfg.mid = modID;
					
					VIEWS[id] = cfg;
					
					return cfg.ref;
				}
			}
			else
			{
				throw new qq.Error("Invalid view id - (id:" + id + ").");
			}
		};
		
		this.setView = function (id)
		{
			if(id != null && id.length > 0)
			{
				if(VIEWS[id] == null)
				{
					throw new qq.Error("qq.Module.setView: View configuration under (id:" + id + ") isn't registered.");
				}
				else
				{
					var cfg;
					
					if(lastView != null)
					{
						cfg = VIEWS[lastView];
						
						cfg.ref.on("pre.hide");

						cfg.dom.hide();

						cfg.ref.on("post.hide");
					}
					
					cfg = VIEWS[id];

					console.log("* setView", cfg, id);

					//cfg.ref.on();
					
					//cfg.qsel;

					cfg.ref.on("pre.show");

					//cfg.uid;
					cfg.dom.show();

					// qq.view
					cfg.ref.on("post.show");
					
					//cfg.ref.show();
					
					lastView = id;
					
					return cfg.ref;
				}
			}
			else
			{
				throw new qq.Error("qq.Module.setView: Invalid view id - (id:" + id + ").");
			}
		};
		
		this.getView = function (id)
		{
			if(id != null && id.length > 0)
			{
				if(VIEWS[id] == null)
				{
					throw new qq.Error("qq.Module.getView: View configuration under (id:" + id + ") isn't registered.");
				}
				else
				{
					return VIEWS[id].ref;
				}
			}
			else
			{
				throw new qq.Error("qq.Module.getView: Invalid view id - (id:" + id + ").");
			}
		};
		
		/**** SERVICE ****/
		
		this.registerService = function (type, cfg)
		{
			if(type != null && type.length > 0)
			{
				if(SERVICES[type] != null)
				{
					throw new qq.Error("Selector configuration under (id:" + id + ") is already registered.");
				}
				else
				{
					SERVICES[type] = cfg;
				}
			}
			else
			{
				throw new qq.Error("Invalid service type - (type:" + type + ").");
			}
		};
		
		var processServices = function ()
		{
			var servs = this.services;
			
			if(servs != null)
			{
				for(var each in servs)
				{
					this.registerService(each, servs[each]);
				}
			}
		};
		
		/**
		* Registers a response handler to the module
		*/
		this.addResponseHandler = function (del)
		{
			handleREST = del;
		};
		
		/**
		* Configures a module and executes configure method for every qq.view
		*/
		this.configure = function (uid)
		{
			if(bConfigured != true)
			{
				if(modUID != uid)
				{
					throw new qq.Error("qq.Module.configure: Incorrect module uid (uid:" + uid + ") passed.");
				}
				
				/* process all the module services */
				processServices.call(this);
				
				var cfg;
				
				for(var each in VIEWS)
				{
					cfg = VIEWS[each];
					
					cfg.ref.on("pre.configure");
					/* configure each module view */
					cfg.ref.configure(cfg.uid);
					
					cfg.ref.on("post.configure");
				}
				
				bConfigured = true;
			}
			else
			{
				return null;
			}
		};
		
		this.init = function (uid, args, ref)
		{
			if(bInited != true)
			{
				if(modUID != uid)
				{
					throw new qq.Error("qq.Module.init: Incorrect module uid (uid:" + uid + ") passed.");
				}
				
				var cfg, 
					initHandlers;
				
				for(var each in VIEWS)
				{
					cfg = VIEWS[each];
					
					if(cfg.qsel != null && cfg.qsel.length > 0)
					{
						cfg.dom = ref.find(cfg.qsel);
						
						if(cfg.dom.length > 0)
						{
							cfg.dom.hide();
						}
					}
					
					cfg.ref.on("pre.init");
					cfg.ref.init(cfg.uid, cfg.dom);
					cfg.ref.on("post.init");
				}
				
				if(VIEWS[args.mainView] != null)
				{
					this.setView(args.mainView);
				}
				else
				{
					throw new qq.Error("qq.Module.init: The main view specified doesn't exist in the view registry.");
				}

				initHandlers = HANDLERS["init"];

				if(initHandlers != null && initHandlers.length > 0)
				{
					for(var i = 0, l = initHandlers.length, cb; i < l; i++)
					{
						cb = initHandlers[i];

						try
						{
							cb();
						}
						catch(e)
						{
							throw new qq.Error("qq.Module.init", "One of the 'init' handlers has an error.");
						}
					}
				}
				
				bInited = true;
				
				return handleREST;
			}
			else
			{
				return null;
			}
		};

		this.on = function (type, del)
		{
			if(type != null && type.length > 0)
			{
				if(HANDLERS[type] == null)
				{
					HANDLERS[type] = [];
				}

				var handlers = HANDLERS[type];

				handlers.push(del);
			}
			else
			{
				throw new qq.Error("Invalid event handler type - (type:" + type + "), mod id (id:" + modID + "), mod uid (uid:" + modUID + ").");
			}
		};
		
	};

	qq.Module.prototype = {};
	
}).apply(this, [qq]);