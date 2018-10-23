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

/* REQUIRED:
	qq.Registry;
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

	qq.View = function (modID, id, uid, pmodule, WIDGETS, GROUPS)
	{
		if(uid == null || !(uid.length > 0))
		{
			throw new qq.Error("qq.View: invalid view uid (uid:" + uid + ").");
		}
		
		var ACTIONS = {},
				HANDLERS = {},
				
				/*cfg.q
					cfg.type;*/
				SELECTOR = {},
				TRIGGERS = {},
				
				/* this is a global reference to all the widgets registered with qq */
				WIDGETS = WIDGETS,
				
				GROUPS = GROUPS,
				
				/* type:"json xml html"
							url:""
							data:{}
				*/
				TRANSFORMERS = {},
				SERVICES = {},
				DEFAULTS = {},
				DATAVIEWMAP = {},
				
				pmodule = pmodule,
				
				REGISTRY = new qq.Registry(),
				
				viewUID = uid,
				viewID = id,
				modID = modID,
				viewDOM,
				bInited = false,
				bConfigured = false;
		
		this.parent = function ()
		{
			return pmodule;
		};
		
		/**** SELECTORS ****/
		
		this.registerSelector = function (id, cfg)
		{
			if(id != null && id.length > 0)
			{
				if(cfg.uid != null)
				{
					throw new qq.Error("qq.View.registerSelector", "The selector you are trying to register can not have a uid (id:" + id + ").");
				}
				
				/* generate a UID hash code out of the selector object so we can store custom configuration for this object */
				var path = modID + "." + viewID + "." + id;
				
				/* widget uid in the current view */
				var uid = qq.GetHashCode(cfg, path);
				
				console.log("%c register selector - path: " + path, "color: red;");
				
				//cfg.uid = uid;

				if(SELECTOR[id] != null)
				{
					throw new qq.Error("Selector configuration under (id:" + id + ") is already registered (uid:"+uid+")");
				}
				else
				{
					var isGroup = false;
					
					if(cfg.type != null)
					{
						if(typeof(cfg.type) == "object")
						{
							isGroup = true;
						}
						else
						{
							if(WIDGETS[cfg.type] == null)
							{
								throw new qq.Error("qq.View.registerSelector: Invalid type (type:" + cfg.type + ") under selector configuration (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
							}
						}
					}
					else
					{
						isGroup = true;
					}
					
					if(cfg.q != null)
					{
						if(typeof(cfg.q) == "object")
						{
							isGroup = true;
						}
						else
						{
							isGroup = false;
						}
					}
					else if(!isGroup)
					{
						throw new qq.Error("qq.View.registerSelector: Selector configuration under (id:" + id + ") is missing a query (q:" + cfg.q + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
					}
					
					var ncfg = jQuery.extend(true, {}, cfg);
						ncfg.uid = uid;
						ncfg.path = path;
					
					if(isGroup == true)
					{
						/* items - selector references, irefs - dom item references */
						SELECTOR[id] = {id:id, path:path, items:ncfg, group:true, irefs:{}};
					}
					else
					{
						SELECTOR[id] = {id:id, path:path, cfg:ncfg, group:false};
					}
				}
			}
			else
			{
				throw new qq.Error("Invalid selector id - (id:" + id + ").");
			}
		};
		
		var processSelectors = function ()
		{
			var sels = this.selectors;
			
			if(sels != null)
			{
				for(var each in sels)
				{
					this.registerSelector(each, sels[each]);
				}
			}
		};
		
		/**** TRIGGERS ****/
		
		this.registerTrigger = function (id, cfg)
		{
			if(id != null && id.length > 0)
			{
				if(TRIGGERS[id] != null)
				{
					throw new qq.Error("Trigger configuration under (id:" + id + ") is already registered, view id (id:" + viewID + "), module id (id:" + modID + ").");
				}
				else
				{
					TRIGGERS[id] = cfg;
				}
			}
			else
			{
				throw new qq.Error("Invalid trigger id - (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
			}
		};
		
		var processTriggers = function ()
		{
			var trigs = this.triggers;
			
			if(trigs != null)
			{
				for(var each in trigs)
				{
					this.registerTrigger(each, trigs[each]);
				}
			}
		};
		
		/**** DEFAULTS ****/
		
		var processDefaults = function ()
		{
			var defs = this.defaults;
			
			if(defs != null)
			{
				for(var each in defs)
				{
					this.registerDefault(each, defs[each]);
				}
			}
		};
		
		
		this.registerDefault = function (id, val)
		{
			if(id != null && id.length > 0)
			{
				DEFAULTS[id] = val;
			}
			else
			{
				throw new qq.Error("Invalid default id - (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
			}
		};
		
		/**** DATA / VIEW MAP ****/
		
		var processDataMap = function ()
		{
			var dmap = this.dataMap;
			
			if(dmap != null)
			{
				for(var each in dmap)
				{
					this.setDataMap(each, dmap[each]);
				}
			}
		};
		
		
		this.setDataMap = function (id, selector)
		{
			if(id != null && id.length > 0)
			{
				DATAVIEWMAP[id] = selector;
			}
			else
			{
				throw new qq.Error("Invalid data map id - (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
			}
		};
		
		/**** SERVICES ****/
		
		this.registerService = function (type, cfg)
		{
			if(type != null && type.length > 0)
			{
				if(SERVICES[type] != null)
				{
					throw new qq.Error("Selector configuration under (id:" + id + ") is already registered, view id (id:" + viewID + "), module id (id:" + modID + ").");
				}
				else
				{
					SERVICES[type] = cfg;
				}
			}
			else
			{
				throw new qq.Error("Invalid service type - (type:" + type + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
			}
		};

		this.registerTransformer = function (type, cfg)
		{
			if(type != null && type.length > 0)
			{
				if(TRANSFORMERS[type] != null)
				{
					throw new qq.Error("registerTransformers", "Transformer configuration under (id:" + id + ") is already registered, view id (id:" + viewID + "), module id (id:" + modID + ").");
				}
				else
				{
					TRANSFORMERS[type] = cfg;
				}
			}
			else
			{
				throw new qq.Error("registerTransformers", "Invalid service type - (type:" + type + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
			}
		};
		
		var processTransformers = function ()
		{
			if(this.transformers != null)
			{
				var transformers = this.transformers;

				for(var each in transformers)
				{
					this.registerTransformer(each, transformers[each]);
				}
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
		
		this.updateService = function (id, data, done)
		{
			var cfg = SERVICES[id], nudata = {}, dcounter = 0;
			
			if(cfg == null)
			{
				throw new qq.Error("qq.view.updateService: The service (id:" + id + ") isn't registered with the view, view id (id:" + viewID + "), module id (id:" + modID + ").");
			}

			/* copy data from passed data object */
			if(data != null)
			{
				for(each in data)
				{
					nudata[each] = data[each];
					dcounter++;
				}

				if(dcounter > 0)
				{
					var cbDone = cfg.done;
					var cbDone2 = done;

					if(cbDone != null && (cbDone instanceof Function))
					{
						try
						{
							cbDone.call(ref, data, nudata);
						}
						catch(e)
						{
							throw new qq.Error("qq.View.updateService: There was an error executing the cbDone handler for service (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + "). " + e);
						}
					}

					if(cbDone2 != null && (cbDone2 instanceof Function))
					{
						try
						{
							cbDone2.call(ref, data, nudata);
						}
						catch(e)
						{
							throw new qq.Error("qq.View.updateService: There was an error executing the done handler for service (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + "). " + e);
						}
					}
				}
			}
		};
		
		/* loads data from external service and sends it into the widget */
		this.openService = function (id, data, done, fail)
		{
			var cfg = SERVICES[id], nudata = {};
			
			if(cfg == null)
			{
				throw new qq.Error("qq.view.openService: The service (id:" + id + ") isn't registered with the view, view id (id:" + viewID + "), module id (id:" + modID + ").");
			}
			
			/*cfg.type
			cfg.url
			cfg.data
			
			cfg.done
			cfg.fail;*/
			
			if(cfg.data != null)
			{
				for(var each in cfg.data)
				{
					nudata[each] = cfg.data[each];
				}
			}
			
			if(data != null)
			{
				for(each in data)
				{
					nudata[each] = data[each];
				}
			}
			
			if(cfg.url != null && cfg.url.length > 0)
			{
				var delDone = function (data)
				{
					var ref = arguments.callee.ref,
									id = arguments.callee.id,
									done = arguments.callee.done,
									done2 = arguments.callee.done2,
									nudata = arguments.callee.nudata;
				
					if(done != null && (done instanceof Function))
					{
						try
						{
							done.call(ref, data, nudata);
						}
						catch(e)
						{
							throw new qq.Error("qq.View.openService: There was an error executing the done handler for service (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + "). " + e);
						}
					}
					
					if(done2 != null && (done2 instanceof Function))
					{
						try
						{
							done2.call(ref, data, nudata);
						}
						catch(e)
						{
							throw new qq.Error("qq.View.openService: There was an error executing the done handler for service (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + "). " + e);
						}
					}
				};
				
				delDone.ref = this;
				delDone.id = id;
				delDone.done = cfg.done;
				delDone.done2 = done;
				delDone.nudata = nudata;
				
				var delFail = function (e, type, msg)
				{
					var id = arguments.callee.id;
					throw new qq.Error("qq.View.openService: Service failure (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + "), (errorid:" + type + "), (message:" + msg + ")");
				};
				
				delFail.id = id;
				
				if(cfg.type == "json")
				{
					//"xml, json, script, or html"
					$.get(cfg.url, nudata, delDone, "json").fail(delFail);
				}
			}
			else
			{
				throw new qq.Error("qq.View.openService: Invalid service url - (url:" + cfg.url + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
			}
			
		};
		
		/** ACTIONS **/
		
		this.registerAction = function (id, del)
		{
			if(id != null && id.length > 0)
			{
				ACTIONS[id] = del;
			}
			else
			{
				throw new qq.Error("Invalid action id - (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
			}
		};
		
		/** EVENTS **/
		
		this.on = function (type, del)
		{
			if(type != null && type.length > 0)
			{
				/* execute the event handler */
				if(del == null)
				{
					del = HANDLERS[type];

					if(del != null)
					{
						try
						{
							del();
						}
						catch(e)
						{
							throw new qq.Error("Unable to execute 'on' handler for view  - (type:" + type + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
						}
					}
				}
				else
				{
					HANDLERS[type] = del;
				}
			}
			else
			{
				throw new qq.Error("Invalid event handler type - (type:" + type + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
			}
		};
		
		/** DATA TO VIEW **/
		
		// var setListItemValue = function (index, iref, cfg, val)
		// {
		// 	var ii, ll, opts, wrapper, inwrpr;
			
		// 	if(iref.length > 0)
		// 	{
		// 		if(cfg.transformer != null)
		// 		{
		// 			if(cfg.transformer.type == "wrapper")
		// 			{
		// 				if(iref instanceof jQuery)
		// 				{
		// 					iref.html('');
		// 				}
		// 				else
		// 				{
		// 					for(ii = 0, ll = iref.length; ii < ll; ii++)
		// 					{
		// 						$(iref[ii]).html('');
		// 					}
		// 				}
						
		// 				opts = cfg.transformer.opts;
						
		// 				if(opts != null)
		// 				{
		// 					if(typeof(opts) == "object")
		// 					{
		// 						if(opts.q != null && opts.q.length > 0)
		// 						{
		// 							if(opts.q.charAt(0) === "<" && opts.q.charAt( opts.q.length - 1 ) === ">" && opts.q.length >= 3)
		// 							{
		// 								wrapper = $(opts.q);
										
		// 								if(opts.qq != null && opts.q.length > 0)
		// 								{
		// 									inwrpr = wrapper.find(opts.qq);
											
		// 									if(inwrpr.length > 0)
		// 									{
		// 										inwrpr.html(val);
		// 									}
		// 									else
		// 									{
		// 										throw new qq.Error("qq.setListItemValue(1): Couldn't 'find' an element inside the wrapper (opts.q:'" + opts.q + "'), (opts.qq:'" + opts.qq + "'), view id (id:" + viewID + "), module id (id:" + modID + ").");
		// 									}
		// 								}
		// 								else
		// 								{
		// 									wrapper.html(val);
		// 								}
		// 							}
		// 							else
		// 							{
		// 								throw new qq.Error("qq.setListItemValue(2): The 'wrapper' transformer must be a valid jQuery template (q:'" + opts.q + "'), view id (id:" + viewID + "), module id (id:" + modID + ").");
		// 							}
		// 						}
		// 						else
		// 						{
		// 							throw new qq.Error("qq.setListItemValue(3): The 'wrapper' transformer options object doesn't contain a valid template. (opts.q:'" + opts.q + "'), view id (id:" + viewID + "), module id (id:" + modID + ").");
		// 						}
		// 					}
		// 					else if(opts.charAt(0) === "<" && opts.charAt( opts.length - 1 ) === ">" && opts.length >= 3)
		// 					{
		// 						wrapper = $(opts);
															
		// 						wrapper.html(val);
		// 					}
		// 					else
		// 					{
		// 						throw new qq.Error("qq.setListItemValue(4): Invalid 'wrapper' transformer options (opts:'" + opts + "'), view id (id:" + viewID + "), module id (id:" + modID + ").");
		// 					}
		// 				}
						
		// 				iref.append(wrapper);
		// 			}
		// 			else
		// 			{
		// 				val = qq.transform(val, cfg.transformer);
											
		// 				iref.html(val);
		// 			}
		// 		}
		// 		else
		// 		{
		// 			iref.html(val);
		// 		}
		// 	}
		// };
		
		// var bOnValue,
		// 		bOnRender;
		
		/* TODO unfold the method */
		// var executeOnHandler = function (ref, index, total, clone, iref, val, cfg)
		// {
		// 	var i,l,reftype, otype, each, o;
			
		// 	if(ref instanceof Function)
		// 	{
		// 		ref.call(null, index, total, clone, iref, val, cfg);
		// 	}
		// 	else
		// 	{
		// 		if(ref instanceof Array)
		// 		{
		// 			for(i = 0, l = ref.length; i < l; i++)
		// 			{
		// 				clone.addClass(ref[i]);
		// 			}
		// 		}
		// 		else
		// 		{
		// 			reftype = typeof(ref);
					
		// 			if(reftype == "string")
		// 			{
		// 				clone.addClass(ref);
		// 			}
		// 			else if(reftype == "object")
		// 			{
		// 				if(ref.cls != null)
		// 				{
		// 					o = ref.cls;
							
		// 					if(o instanceof Array)
		// 					{
		// 						for(i = 0, l = o.length; i < l; i++)
		// 						{
		// 							clone.addClass(o[i]);
		// 						}
		// 					}
		// 					else
		// 					{
		// 						otype = typeof(o);
								
		// 						if(otype == "string")
		// 						{
		// 							if(o.charAt(0) == "-")
		// 							{
		// 								o = o.substr(1);
		// 								clone.removeClass(o);
		// 							}
		// 							else
		// 							{
		// 								clone.addClass(o);
		// 							}
		// 						}
		// 						else if(otype == "object")
		// 						{
		// 							for(each in o)
		// 							{
		// 								if(o[each] == false)
		// 								{
		// 									clone.removeClass(each);
		// 								}
		// 								else
		// 								{
		// 									clone.addClass(each);
		// 								}
		// 							}
		// 						}
		// 					}
		// 				}
						
		// 				/** attributes **/
						
		// 				if(ref.attr != null)
		// 				{
		// 					clone.attr(ref.attr);
		// 				}
						
		// 				if(ref.data != null)
		// 				{
		// 					clone.data(ref.attr);
		// 				}
						
		// 			}
		// 		}
		// 	}
		// };
		
		// var processOnHandlers = function (index, total, clone, iref, val, cfg)
		// {
		// 	var onCfg = cfg.onCfg, n = onCfg.n, each, nint, ncfg, on = cfg.on, ref, reftype;
			
		// 	for(each in n)
		// 	{
		// 		nint = onCfg.nint[each];
				
		// 		if(((index + 1) % nint) == 0)
		// 		{
		// 			ncfg = n[each];
					
		// 			executeOnHandler(ncfg, index, total, clone, iref, val, cfg);
		// 		}
		// 	}
			
		// 	ref = on["i"+index];
			
		// 	if(ref != null)
		// 	{
		// 		executeOnHandler(ref, index, total, clone, iref, val, cfg);
		// 	}
			
		// 	ref = on.first;
			
		// 	if(ref != null && index == 0)
		// 	{
		// 		executeOnHandler(ref, index, total, clone, iref, val, cfg);
		// 	}
			
		// 	ref = on.item;
			
		// 	if(ref != null)
		// 	{
		// 		executeOnHandler(ref, index, total, clone, iref, val, cfg);
		// 	}
			
		// 	ref = on.last;
			
		// 	if(ref != null && ((index + 1) >= total))
		// 	{
		// 		executeOnHandler(ref, index, total, clone, iref, val, cfg);
		// 	}
			
		// 	ref = on.odd;
			
		// 	if(ref != null && ((index + 1) % 2) == 1)
		// 	{
		// 		executeOnHandler(ref, index, total, clone, iref, val, cfg);
		// 	}
		// 	else
		// 	{
		// 		ref = on.even;
				
		// 		if(ref != null)
		// 		{
		// 			executeOnHandler(ref, index, total, clone, iref, val, cfg);
		// 		}
		// 	}
		// };
		
		// var processListType = function (cfg, index, tag, curef, data)
		// {
		// 	var ecfg,
		// 					val,
		// 					each, i, l, ii, ll, itemA, itemB, iref, parent, pholder, templates, temps, curli, temp, curq, curqq, wrapper, opts, 
		// 					on, onCfg, itype, inum, ifn;
			
		// 	/* initial setup of the domJQConfig
		// 	   - remove the LI elements and use them as templates for when updating the list.
		// 	   TODO add animation controls ability to fade in elements etc.
		// 	   TODO add custom children selector
		// 	   TODO add custom inner container selector where children are located
		// 	   TODO add custom directives to collection of children
		// 	   TODO add custom children templates for single and variation based on order or property within the data
		// 	   TODO optimize DOM manipulation, manipulate DOM in memory first
		// 	*/
		// 	if(cfg.domJQConfig[index] == null)
		// 	{
		// 		/* here we query for lists children within the document or create them from a template */
		// 		if(tag == "ul" && cfg.li == null)
		// 		{
		// 			temps = curef.children("li");
		// 			templates = [];
					
		// 			for(ii = 0, ll = temps.length; ii < ll; ii++)
		// 			{
		// 				templates[templates.length] = {ref:temps[ii], qq:null};
		// 			}
		// 		}
		// 		else if(cfg.li != null)
		// 		{
		// 			templates = [];
					
		// 			if(cfg.li instanceof Array)
		// 			{
		// 				for(i = 0, l = cfg.li.length; i < l; i++)
		// 				{
		// 					curli = cfg.li[i];
							
		// 					if(typeof(curli) == "object")
		// 					{
		// 						curq = curli.q;
		// 						curqq = curli.qq;
		// 					}
		// 					else
		// 					{
		// 						curq = curli;
		// 						curqq = null;
		// 					}
							
		// 					if(curq.charAt(0) === "<" && curq.charAt( curq.length - 1 ) === ">" && curq.length >= 3)
		// 					{
		// 						templates[templates.length] = {ref:$(curq), qq:curqq};
		// 					}
		// 					else
		// 					{
		// 						temps = curef.find(curq);
								
		// 						if(temps.length > 0)
		// 						{
		// 							for(ii = 0, ll = temps.length; ii < ll; ii++)
		// 							{
		// 								templates[templates.length] = {ref:temps[ii], qq:curqq};
		// 							}
		// 						}
		// 						else
		// 						{
		// 							/* TODO provide "developer" feedback that nothing was found */
		// 						}
		// 					}
		// 				}
		// 			}
		// 			else
		// 			{
		// 				curli = cfg.li;
						
		// 				if(typeof(curli) == "object")
		// 				{
		// 					curq = curli.q;
		// 					curqq = curli.qq;
		// 				}
		// 				else
		// 				{
		// 					curq = curli;
		// 					curqq = null;
		// 				}
						
		// 				if(curq.charAt(0) === "<" && curq.charAt( curq.length - 1 ) === ">" && curq.length >= 3)
		// 				{
		// 					templates[templates.length] = {ref:$(curq), qq:curqq};
		// 				}
		// 				else
		// 				{
		// 					temps = curef.find(curq);
							
		// 					if(temps.length > 0)
		// 					{
		// 						for(ii = 0, ll = temps.length; ii < ll; ii++)
		// 						{
		// 							templates[templates.length] = {ref:temps[ii], qq:curqq};
		// 						}
		// 					}
		// 					else
		// 					{
		// 						/* TODO provide "developer" feedback that nothing was found */
		// 					}
		// 				}
						
		// 			}
		// 		}
				
				
		// 		ecfg = {items:[], type:0};
				
		// 		cfg.domJQConfig[index] = ecfg;
				
		// 		if(templates.length == 1)
		// 		{
		// 			ecfg.type = "single";
					
		// 			temp = templates[0];
					
		// 			if(temp.ref instanceof jQuery)
		// 			{
		// 				temp.ref = temp.ref.detach();
						
		// 				ecfg.items[0] = temp;
		// 			}
		// 			else
		// 			{
		// 				temp.ref = $(temp.ref).detach();
						
		// 				ecfg.items[0] = temp;
		// 			}
		// 		}
		// 		else if(templates.length >= 2)
		// 		{
		// 			ecfg.type = "double";
					
		// 			temp = templates[0];
					
		// 			if(temp.ref instanceof jQuery)
		// 			{
		// 				temp.ref = temp.ref.detach();
						
		// 				ecfg.items[0] = temp;
		// 			}
		// 			else
		// 			{
		// 				temp.ref = $(temp.ref).detach();
						
		// 				ecfg.items[0] = temp;
		// 			}
					
		// 			temp = templates[1];
					
		// 			if(temp instanceof jQuery)
		// 			{
		// 				temp.ref = temp.ref.detach();
						
		// 				ecfg.items[1] = temp;
		// 			}
		// 			else
		// 			{
		// 				temp.ref = $(temp.ref).detach();
						
		// 				ecfg.items[1] = temp;
		// 			}
					
		// 			/* TODO process the two and figure the difference between them ? */
					
		// 			if(templates.length > 2)
		// 			{
		// 				for(i = 2, l = templates.length; i < l; i++)
		// 				{
		// 					temp = templates[i];
							
		// 					if(temp.ref instanceof jQuery)
		// 					{
		// 						temp.ref.remove();
		// 					}
		// 					else
		// 					{
		// 						$(temp.ref).remove();
		// 					}
		// 				}
		// 			}
		// 		}
		// 		/* TODO finish more than 2 */
		// 	}
		// 	else
		// 	{
		// 		ecfg = cfg.domJQConfig[index];
		// 	}
			
		// 	i = 0;
		// 	l = data.length;
		// 	pholder = $("<div />");
			
		// 	curef.replaceWith(pholder);
			
		// 	curef.empty();
			
		// 	itemA = ecfg.items[0];
			
		// 	if(cfg.on != null)
		// 	{
		// 		on = cfg.on;
				
		// 		if(on.value != null && (on.value instanceof Function))
		// 		{
		// 			bOnValue = true;
		// 		}
		// 		else
		// 		{
		// 			bOnValue = false;
		// 		}
				
		// 		if(on.render != null && (on.render instanceof Function))
		// 		{
		// 			bOnRender = true;
		// 		}
		// 		else
		// 		{
		// 			bOnRender = false;
		// 		}
				
		// 		/* process on config */
		// 		if(cfg.onCfg == null)
		// 		{
		// 			onCfg = {n:{}, nint:{}};
					
		// 			cfg.onCfg = onCfg;
					
		// 			for(each in on)
		// 			{
		// 				if(each.charAt(0) == "n")
		// 				{
		// 					inum = each.substr(1);
							
		// 					if(inum == parseInt(inum))
		// 					{
		// 						ifn = on[each];
								
		// 						if(ifn != null)
		// 						{
		// 							onCfg.n[inum] = ifn;
		// 							onCfg.nint[inum] = inum;
		// 						}
		// 					}
		// 				}
		// 			}
		// 		}
		// 		else
		// 		{
		// 			onCfg = cfg.onCfg;
		// 		}
		// 	}
		// 	else
		// 	{
		// 		bOnValue = false;
		// 		bOnRender = false;
		// 	}
			
		// 	if(ecfg.type == "single")
		// 	{
		// 		for(; i < l; i++)
		// 		{
		// 			val = data[i];
					
		// 			/* retrieve the proper references from a 'template' of the list item */
		// 			clone = itemA.ref;
					
		// 			if(itemA.qq != null)
		// 			{
		// 				if(itemA.qqref == null)
		// 				{
		// 					iref = clone.find(itemA.qq);
		// 					itemA.qqref = iref;
		// 				}
		// 				else
		// 				{
		// 					iref = itemA.qqref;
		// 				}
		// 			}
		// 			else
		// 			{
		// 				iref = clone;
		// 			}
					
		// 			if(bOnValue)
		// 			{
		// 				val = cfg.on.value.call(null, i, l, val, cfg);
		// 			}
					
		// 			setListItemValue(i, iref, cfg, val);
					
		// 			/* after applying modifications, clone the template and append to the list */
		// 			clone = clone.clone();
					
		// 			if(cfg.on != null)
		// 			{
		// 				processOnHandlers(i, l, clone, iref, val, cfg);
		// 			}
					
		// 			curef.append(clone);
		// 		}
		// 	}
		// 	else if(ecfg.type == "double")
		// 	{
		// 		itemB = ecfg.items[1];
				
		// 		for(; i < l; i++)
		// 		{
		// 			val = data[i];
					
		// 			if(i % 2)
		// 			{
		// 				clone = itemB.ref;
						
		// 				if(itemB.qq != null)
		// 				{
		// 					if(itemB.qqref == null)
		// 					{
		// 						if(itemB.qq != null)
		// 						{
		// 							iref = clone.find(itemB.qq);
		// 							itemB.qqref = iref;
		// 						}
		// 						else
		// 						{
		// 							iref = clone;
		// 						}
		// 					}
		// 					else
		// 					{
		// 						iref = itemB.qqref;
		// 					}
		// 				}
		// 				else
		// 				{
		// 					iref = clone;
		// 				}
		// 			}
		// 			else
		// 			{
		// 				clone = itemA.ref;
						
		// 				if(itemA.qqref == null)
		// 				{
		// 					if(itemA.qq != null)
		// 					{
		// 						iref = clone.find(itemA.qq);
		// 						itemA.qqref = iref;
		// 					}
		// 					else
		// 					{
		// 						iref = clone;
		// 					}
		// 				}
		// 				else
		// 				{
		// 					iref = itemA.qqref;
		// 				}
		// 			}
					
		// 			if(bOnValue)
		// 			{
		// 				val = cfg.on.value.call(null, i, cfg, val);
		// 			}
					
		// 			setListItemValue(i, iref, cfg, val);
					
		// 			/* after applying modifications, clone the template and append to the list */
		// 			clone = clone.clone();
					
		// 			if(cfg.on != null)
		// 			{
		// 				processOnHandlers(i, l, clone, iref, val, cfg);
		// 			}
					
		// 			curef.append(clone);
		// 		}
		// 	}
			
		// 	pholder.replaceWith(curef);
			
		// 	if(bOnRender)
		// 	{
		// 		cfg.on.render.call(null, l, curef, cfg);
		// 	}
		// };
		
		/* Initializes the selector group */
		var initGroup = function(cfg, grp)
		{
			cfg.inited = true;
			cfg.state = {};
			
			if(grp.cfg.init != null)
			{
				grp.cfg.init.call(grp, cfg.irefs, cfg.state, cfg.items);
			}
		};
		
		/* Apply data */
		var applyData = function (each, cfg, data, map, altMap)
		{
			var so, cfg, val, arr, i, l, curef, container, wdgt, wdgtCfg, gid, sid, transformer, tranfn, tranData;
			
			if(altMap != null && altMap[each] != null)
			{
				arr = altMap[each].split(".");
				
				/* TODO OPTIMIZE - see if writing a javascript function into a string is better, whats faster? eval the string - or eval into a function for use later with apply or call */
				curef = data;
				
				for(i = 0, l = arr.length; i < l; i++)
				{
					curef = curef[arr[i]];
				}
				
				val = curef;
			}
			else
			{
				val = data[each];
			}

			/* apply transformer to data */
			if(TRANSFORMERS[each] != null)
			{
				transformer = TRANSFORMERS[each];

				if(transformer.__ != null && typeof(transformer.__) == "function")
				{
					tranfn = transformer.__;

					try
					{
						val = tranfn(val);
					}
					catch(e)
					{
						throw new qq.Error("qq.view.applyData","Error executing transformer (id:" + each + ").\n" + e);
					}
				}
			}
			
			if(cfg.group == true)
			{
				var grp = GROUPS[cfg.gtype];
				
				if(grp != null && grp.cfg != null)
				{
					if(grp.cfg.set != null)
					{
						if(cfg.inited != true)
						{
							initGroup(cfg, grp.cfg);
						}
						
						/* this is where we set service data to a group configuration */
						grp.cfg.set.call(grp.cfg, val, cfg.irefs, cfg.state, cfg.items);
					}
				}
				else
				{
					/* TODO ERROR - no group registered */
				}
			}
			else if(cfg.dom != null)
			{
				/* TODO make it possible to do this without jQuery?? */
				if((cfg.dom instanceof jQuery) && cfg.dom.length > 0)
				{
					if(cfg.domqq != null && (cfg.domqq instanceof jQuery) && cfg.domqq.length > 0)
					{
						container = cfg.domqq;
					}
					else
					{
						container = cfg.dom;
					}
					
					wdgt = WIDGETS[cfg.type];
					
					//debugger;

					if(wdgt != null && wdgt.cfg != null)
					{
						wdgtCfg = wdgt.cfg;
						
						if(wdgtCfg.set != null)
						{
							/* this is where we set service data to a widget */

							if(wdgt.hasSelectors == true && transformer != null)
							{
								/* at this point we pass a transformer into the set method of a widget */
								wdgtCfg.set(container, val, cfg, transformer);
							}
							else
							{
								wdgtCfg.set(container, val, cfg);
							}
						}
					}
				}
			}
		};

		var setWidgetData = function (uid, data, map, altMap)
		{
			if(SELECTOR[uid] != null)
			{
				/* selector object */
				var so = SELECTOR[uid];
				
				/* if the selector is a group (concept) */
				if(so.group != false)
				{
					cfg = so;
				}
				else
				{
					cfg = so.cfg;
				}

				/* Apply Data accepts a data object */
				var dta = {};
					dta[uid] = data;

				//debugger;
				applyData(uid, cfg, dta, map, altMap);
			}
		};
		this.setWidgetData = setWidgetData;

		/* Sets data to a widget or group */
		this.setData = function (data, map, altMap)
		{
			console.log("* Set Data", "data", data, "map", map, "altMap", altMap);

			//debugger;

			var so, cfg, val, arr, i, l, curef, container, wdgt, gid, sid;
			
			if(arguments.length == 1)
			{
				map = "direct";
			}
			
			if(map == "direct")
			{
				for(var each in data)
				{
					cfg = null;
					
					if(each.indexOf(".") != -1)
					{
						arr = each.split(".");
						
						if(arr.length == 2)
						{
							gid = arr[0];
							sid = arr[1];
						}
						else
						{
							/* TODO error - invalid data name */
						}
					}
					else
					{
						gid = null;
						sid = each;
					}
					
					if(gid != null)
					{
						so = SELECTOR[gid];
						
						if(so.group == true)
						{
							if(so.items[sid] != null)
							{
								cfg = so.items[sid];
							}
							else
							{
								/* TODO error - invalid selector path in group */
							}
						}
						else
						{
							/* TODO error - trying to use an invalid group in the data */
						}
					}
					else
					{
						if(SELECTOR[sid] != null)
						{
							so = SELECTOR[sid];
							
							if(so.group != false)
							{
								cfg = so;
							}
							else
							{
								cfg = so.cfg;
							}
						}
					}
					
					//console.group("ApplyData");
					applyData(each, cfg, data, map, altMap);
					//console.groupEnd();
				}
			}
		};
		
		var getSelectorData = function (cfg, scope)
		{
			var container, wdgt;
			
			if((WIDGETS[cfg.type] != null && WIDGETS[cfg.type].cfg != null && WIDGETS[cfg.type].cfg.get != null) && cfg.dom != null)
			{
				/* TODO make it possible to do this without jQuery?? */
				if((cfg.dom instanceof jQuery) && cfg.dom.length > 0)
				{
					if(cfg.domqq != null && (cfg.domqq instanceof jQuery) && cfg.domqq.length > 0)
					{
						container = cfg.domqq;
					}
					else
					{
						container = cfg.dom;
					}
					
					wdgt = WIDGETS[cfg.type];
					
					if(wdgt != null && wdgt.cfg != null)
					{
						wdgt = wdgt.cfg;
						
						if(wdgt.get != null)
						{
							scope.count++;
							return wdgt.get(container, cfg);
						}
					}
				}
			}
			
			return null;
		};
		
		this.getData = function ()
		{
			var so, cfg, val, arr, i, l, curef, count = 0, data = {}, seldata, lcl = {count:0};
			
			for(var each in SELECTOR)
			{
				so = SELECTOR[each];
				
				count = lcl.count;
				
				if(so.group == true)
				{
					var grp = GROUPS[so.gtype];
					
					if(grp != null && grp.cfg != null)
					{
						if(grp.cfg.get != null)
						{
							if(so.inited != true)
							{
								initGroup(so, grp.cfg);
							}
							
							lcl.count++;
							//console.warn("* get ", so, so.items);
							//cfg.irefs, cfg.state, cfg.items
							if(grp.cfg.get != null)
							{
								seldata = grp.cfg.get.call(grp.cfg, so.irefs, so.state, so.items);
							}
						}
					}
					else
					{
						/* TODO ERROR - no group registered */
					}
					
					seldata = getSelectorData(cfg, lcl);
				}
				else
				{
					cfg = so.cfg;
					
					seldata = getSelectorData(cfg, lcl);
				}
				
				if(count < lcl.count)
				{
					data[each] = seldata;
				}
			}
			
			if(lcl.count > 0)
			{
				return data;
			}
			else
			{
				return null;
			}
		};
		
		this.configure = function (uid)
		{
			if(bConfigured != true)
			{
				if(viewUID != uid)
				{
					throw new qq.Error("qq.View.configure: Incorrect view uid (uid:" + uid + ").");
				}
				
				processTriggers.call(this);
				
				processSelectors.call(this);
				processServices.call(this);
				processTransformers.call(this);
				processDataMap.call(this);
				processDefaults.call(this);
				
				bConfigured = true;
			}
		};
		
		var initTriggers = function ()
		{
			var cfg,
					ref, refqq, del;
			
			for(var each in TRIGGERS)
			{
				cfg = TRIGGERS[each];
				
				ref = viewDOM.find(cfg.q);
				
				if(cfg.qq != null && cfg.qq.length > 0)
				{
					refqq = ref.find(cfg.qq);
					
					if(refqq.length > 0)
					{
						cfg.dom = ref;
						cfg.domqq = refqq;
					}
					else
					{
						throw new qq.Error("qq.View.initTriggers: Couldn't find sub selector (qq:" + cfg.qq + ") for (trigger:" + each + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
					}
				}
				else
				{
					if(ref.length > 0)
					{
						cfg.dom = ref;
						cfg.domqq = null;
					}
					else
					{
						throw new qq.Error("qq.View.initTriggers: Couldn't find a trigger (q:" + cfg.q + ") for (trigger:" + each + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
					}
				}
				
				if(cfg.action != null && cfg.action.length > 0)
				{
					del = function (e)
					{
						var ref = arguments.callee.ref,
										action = arguments.callee.action,
										preventDefault = arguments.callee.preventDefault,
										fn = ACTIONS[action];
							
							if(fn == null)
							{
								throw new qq.Error("qq.ActionDelegate: There is no handler associated with the action (action:" + action + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
							}
							
							try
							{
								fn.call(ref);
							}
							catch(e)
							{
								throw new qq.Error("qq.ActionDelegate: There was an error executing an action handler for (action:" + action + "), view id (id:" + viewID + "), module id (id:" + modID + "). " + e);
							}
							
							if(preventDefault == true)
							{
								e.preventDefault();
							}
					};
					
					del.ref = this;
					del.action = cfg.action;
					del.preventDefault = cfg.preventDefault;
					
					if(cfg.domqq != null)
					{
						cfg.domqq.on("click", del);
					}
					else
					{
						cfg.dom.on("click", del);
					}
				}
			}
			
		};

		/**
		* Used to initialize a widget
		*/
		var processWidget_init = function (container, cfg)
		{
			var wdgt = WIDGETS[cfg.type];

			if(wdgt != null && wdgt.cfg != null)
			{
				wdgt = wdgt.cfg;
				
				if(wdgt.init != null)
				{
					/* this is where we set service data to a widget */
					wdgt.init(container, cfg, GROUPS);
				}
			}
		};
		
		/* performs query selection and establishes the dom & domqq references within the view */
		var initSelector = function (id, cfg)
		{
			var ref, refqq;
			
			ref = viewDOM.find(cfg.q);
			refqq = null;
			
			if(cfg.qq != null && cfg.qq.length > 0)
			{
				refqq = ref.find(cfg.qq);
				
				if(refqq.length > 0)
				{
					cfg.dom = ref;
					cfg.domqq = refqq;
					
					processWidget_init(refqq, cfg);

					return refqq;
				}
				else
				{
					throw new qq.Error("qq.View.initSelector: Couldn't find sub selector (qq:" + cfg.qq + ") for (selector:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
				}
			}
			else
			{
				if(ref.length > 0)
				{
					cfg.dom = ref;
					cfg.domqq = null;
					
					processWidget_init(ref, cfg);

					return ref;
				}
				else
				{
					throw new qq.Error("qq.View.initSelector: Couldn't find a selector (q:" + cfg.q + ") for (selector:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
				}
			}
		};

		/**
		* Goes through the object widgets and registers them.
		*/
		var initWidgets = function ()
		{
			var each,
				widgets = this.widgets,
				wdgtFn;

			for(each in widgets)
			{
				wdgtFn = widgets[each];

				qq.registerWidget(each, wdgtFn);
			}
		};
		
		/* initializes selectors and sets all the references to for all the items */
		var initSelectors = function ()
		{
			/* so - selector object */
			var so, cfg, grp,
					ref, refqq,
					eachA, eachB, stype, stcount, sttotal;
			
			for(eachA in SELECTOR)
			{
				so = SELECTOR[eachA];
				
				if(so.group == true)
				{
					stcount = 0;
					sttotal = 0;
					stype = null;
					
					/* initialize group's selectors */
					for(eachB in so.items)
					{
						cfg = so.items[eachB];
						
						sttotal++;
						/* see if all the types within the group are the same as the first */
						if(stype == null)
						{
							stype = cfg.type;
							stcount++;
						}
						else if(stype == cfg.type)
						{
							stcount++;
						}
						
						so.irefs[eachB] = initSelector(eachB, cfg);
					}
					
					/* all the types in the group are the same, therefor set the group type */
					if(sttotal == stcount)
					{
						so.gtype = stype;
					}
					else
					{
						so.gtype = null;
					}
					
					grp = GROUPS[so.gtype];
					
					if(grp != null)
					{
						if(so.inited != true)
						{
							initGroup(so, grp);
						}
					}
					else
					{
						/* TODO ERROR - no group registered */
					}
				}
				else
				{
					initSelector(eachA, so.cfg);
				}
			}
		};
		
		/**
		* Initializes the view.
		*/
		this.init = function (uid, ref)
		{
			console.log("** INIT VIEW");

			if(bInited != true)
			{
				if(viewUID != uid)
				{
					throw new qq.Error("qq.View.init: Incorrect view uid (uid:" + uid + ").");
				}
				
				viewDOM = ref;
				
				initTriggers.call(this);
				initSelectors.call(this);
				initWidgets.call(this);

				var def;

				//using the default data set it here via setData

				for(var each in DEFAULTS)
				{
					def = DEFAULTS[each];

					//def.dataMap
					//def.data

					if(def.data != null)
					{
						var sels = this.selectors;

						if(sels != null && sels[each] != null)
						{
							if(def.dataMap != null)
							{
								setWidgetData(each, def.data, def.dataMap);
							}
							else
							{
								setWidgetData(each, def.data);
							}
						}
					}
				}
				
				bInited = true;
			}
		};
		
	};
	
	qq.View.prototype = {};
	
}).apply(this, [qq]);