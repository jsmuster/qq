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

console.log("- injected qq.module.js");

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

			module.exports = function (qqref)
			{
				if(qqref != null)
				{
					qq = qqref;
				}

				registerModule(qq);
				
				return qq;
			};
		}
		else
		{
			/* running in the browser */
			root = window;
		}
	}
	catch(e)
	{}

	function registerModule(qq)
	{
		// var UIDGenerator;
		// var Registry;
		// var View;
		
		// if(_isNode)
		// {
		// 	UIDGenerator = require('./qq.UIDGenerator.js').UIDGenerator;
		// 	Registry = require('./qq.Registry.js').Registry;
		// 	View = require('./qq.View.js').View;
		// }
		// else
		// {
		// 	UIDGenerator = qq.UIDGenerator;
		// 	Registry = qq.Registry;
		// 	View = qq.View;
		// }

		/**
		* WIDGETS & GROUPS are passed into qq.Module upon creation.
		*/
		qq.Module = function (id, uid, WIDGETS, GROUPS)
		{
			if(uid == null || !(uid.length > 0))
			{
				throw new qq.Error("qq.Module", "constructor", "Invalid module uid (uid:" + uid + ").");
			}
			
			/*
				cfg.ref;
				cfg.qsel;
				cfg.uid;
				cfg.dom
			*/
			var VIEWS = {},
				HANDLERS = {},
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
			
			var registerView = function (id, qsel)
			{
				if(id != null && id.length > 0)
				{
					if(VIEWS[id] != null)
					{
						throw new qq.Error("qq.Module", "registerView", "View configuration under (id:" + id + ") is already registered.");
					}
					else
					{
						var cfgv = {},
							uid = UIDGen.generate();
						
						var viewRef = new qq.View(modID, id, uid, this, WIDGETS, GROUPS);
						
						/* qq.View reference */
						cfgv.ref = viewRef;
						
						/* view query selector */
						cfgv.qsel = qsel;
						
						/* newly generated uid */
						cfgv.uid = uid;
						
						/* view id */
						cfgv.id = id;

						/* module id */
						cfgv.mid = modID;
						
						VIEWS[id] = cfgv;
						
						return cfgv.ref;
					}
				}
				else
				{
					throw new qq.Error('qq.Module', 'registerView', 'Invalid view id - (id:' + id + ').');
				}
			};
			this.registerView = registerView;
			this.regview = registerView;
			
			var setView = function (id)
			{
				if(id != null && id.length > 0)
				{
					if(VIEWS[id] == null)
					{
						throw new qq.Error('qq.Module','setView', 'View configuration under (id:' + id + ') isn\'t registered.');
					}
					else
					{
						var cfg;
						
						if(lastView != null)
						{
							cfg = VIEWS[lastView];
							
							cfg.ref.on("pre.hide");

							cfg.dom.css("display", "none");
							//cfg.dom.css("visibility", "hidden");

							cfg.ref.on("post.hide");
						}
						
						cfg = VIEWS[id];

						console.log("* setView", cfg, id);

						//cfg.ref.on();
						
						//cfg.qsel;

						cfg.ref.on("pre.show");

						//cfg.uid;
						//cfg.dom.show();
						cfg.dom.css("display", "block");
						//cfg.dom.css("visibility", "visible");

						// qq.view
						cfg.ref.on("post.show");
						
						//cfg.ref.show();
						
						lastView = id;
						
						return cfg.ref;
					}
				}
				else
				{
					throw new qq.Error("qq.Module", "setView", "Invalid view id - (id:" + id + ").");
				}
			};
			this.setView = setView;
			
			var getView = function (id)
			{
				if(id != null && id.length > 0)
				{
					if(VIEWS[id] == null)
					{
						throw new qq.Error("qq.Module", "getView", "View configuration under (id:" + id + ") isn't registered.");
					}
					else
					{
						return VIEWS[id].ref;
					}
				}
				else
				{
					throw new qq.Error("qq.Module", "getView", "Invalid view id - (id:" + id + ").");
				}
			};
			this.getView = getView;
			
			/**** SERVICE ****/
			
			var registerService = function (type, cfg)
			{
				if(type != null && type.length > 0)
				{
					if(SERVICES[type] != null)
					{
						throw new qq.Error("qq.Module", "getView", "Selector configuration under (id:" + id + ") is already registered.");
					}
					else
					{
						SERVICES[type] = cfg;
					}
				}
				else
				{
					throw new qq.Error("qq.Module", "getView", "Invalid service type - (type:" + type + ").");
				}
			};
			this.registerService = registerService;
			
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
			var addResponseHandler = function (del)
			{
				handleREST = del;
			};
			this.addResponseHandler = addResponseHandler;
			
			/**
			* Configures a module and executes configure method for every qq.view.
			* The right module uid has to be passed into this method for it to execute properly.
			* - registers all the services with the module
			* - executes each view's configure life cycle events by also passing a view uid into a 'configure' event handler
			*/
			var configure = function (uid)
			{
				if(bConfigured != true)
				{
					if(modUID != uid)
					{
						throw new qq.Error("qq.Module", "configure", "Incorrect module uid (uid:" + uid + ") passed.");
					}
					
					/* process all the module services */
					processServices.call(this);
					
					var cfgv;
					
					for(var each in VIEWS)
					{
						cfgv = VIEWS[each];
						
						cfgv.ref.on("pre.configure");
						/* configure each module view */
						cfgv.ref.configure(cfgv.uid);
						
						cfgv.ref.on("post.configure");
					}
					
					bConfigured = true;
				}
				else
				{
					return null;
				}
			};
			this.configure = configure;

			/**
			* Retrieves the module state.
			*/
			var getState = function ()
			{
				var cfgv,
					views = {},
					atom,
					vstate,
					vcount = 0;
				
				for(var each in VIEWS)
				{
					cfgv = VIEWS[each];
					
					/* get state for every view in this module */
					vstate = cfgv.ref.getState();

					/* get view dom placement */
					if(cfgv.dom != null)
					{
						vstate.dom = qq.place(cfgv.dom);
					}
					
					/* don't include views that haven't been initialized */
					if(vstate != null)
					{
						/* set each view state */
						views[each] = vstate;
					}

					vcount++;
				}

				if(vcount > 0)
				{
					return {views: views};
				}
				else
				{
					return {};
				}
				
			};
			this.getState = getState;
			
			/**
			* Initialize a Module.
			* @uid a module UID must be passed into the module to initialize it
			* @args module's arguments
			* @viewWrapper view wrapper node
			*/
			var init = function (uid, args, viewWrapper)
			{
				if(bInited != true)
				{
					/* a module uid and provided uid must match for this method to execute */
					if(modUID != uid)
					{
						throw new qq.Error("qq.Module", "init", "Incorrect module uid (uid:" + uid + ") passed.");
					}
					
					var cfgv, initHandlers;

					var hasInitials = false, 
						minitials,
						viewstate; /* initial view state */

					// if(modstate != null)
					// {
					// 	if(minitials != null)
					// 	{
					// 		hasInitials = true;

					// 		vstate.dom
					// 	}
					// }
					
					/* go through each of the views registered and find their view nodes in the dom */
					for(var vuid in VIEWS)
					{
						cfgv = VIEWS[vuid];

						/* retrieve initial state for this view */
						viewstate = qq.getConfig(modID, vuid);
						//debugger;
						/* there is the initial view configuration, use it instead of going through initialization again */
						if(viewstate != null)
						{
							if(viewstate.dom != null)
							{
								/* associate the view dom with app config as per state */
								cfgv.dom = qq.place(viewstate.dom);
							}
						}
						else
						{
							if(cfgv.qsel != null && cfgv.qsel.length > 0)
							{
								/* set the 'dom' property in a view configuration */
								cfgv.dom = viewWrapper.find(cfgv.qsel);
								
								/* hide the view right after getting its dom reference */
								if(cfgv.dom.length > 0)
								{
									cfgv.dom.css("display", "none");
									//cfgv.dom.css("visibility", "hidden");
								}
							}
						}
						
						cfgv.ref.on("pre.init");

						if(viewstate != null)
						{
							cfgv.ref.init(cfgv.uid, cfgv.dom, viewstate);
						}
						else
						{
							cfgv.ref.init(cfgv.uid, cfgv.dom);
						}
						
						cfgv.ref.on("post.init");
					}
					
					/* if 'mainView' is part of the module configuration then set it */
					if(VIEWS[args.mainView] != null)
					{
						this.setView(args.mainView);
					}
					else
					{
						throw new qq.Error("qq.Module", "init", "The main view specified doesn't exist in the view registry.");
					}

					/* process init callback handlers */
					initHandlers = HANDLERS["init"];

					if(initHandlers != null && initHandlers.length > 0)
					{
						for(var i = 0, l = initHandlers.length, cb; i < l; i++)
						{
							cb = initHandlers[i];
							//debugger;
							try
							{
								cb();
							}
							catch(e)
							{
								throw new qq.Error("qq.Module", "init", "One of the 'init' handlers has an error.");
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
			this.init = init.bind(this);

			/**
			* Registers 'on' handlers to the module.
			*/
			var on = function (type, del)
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
			this.on = on;
			
		};

		qq.Module.prototype = {};

	};

	if(_isNode == false)
	{
		registerModule(qq);
	}
	
}).apply(this, [qq]);