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

console.log("- injected qq.view.js");

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

			module.exports = function (qqref)
			{
				if(qqref != null)
				{
					qq = qqref;
				}

				registerView(qq);
				
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

	//var Registry;
	
	function registerView(qq)
	{
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

				DATA = {},
				
				pmodule = pmodule,
				
				REGISTRY = new qq.Registry(),
				
				viewUID = uid,
				viewID = id,
				modID = modID,
				viewDOM,
				bInited = false,
				bConfigured = false;
			
			/**
			* Returns a parent module.
			*/
			this.parent = function ()
			{
				return pmodule;
			};
			
			/**** SELECTORS ****/
			
			/**
			* Registers a selector configuration.
			*/
			var registerSelector = function (id, selector)
			{
				if(id != null && id.length > 0)
				{
					if(selector.uid != null)
					{
						throw new qq.Error("qq.View", "registerSelector", "The selector you are trying to register can not have a uid (id:" + id + ").");
					}
					
					/* generate a UID hash code out of the selector object so we can store custom configuration for this object */
					var path = modID + "." + viewID + "." + id;
					
					/* widget uid in the current view */
					var uid = qq.GetHashCode(selector, path);
					
					console.log("%c register selector - path: " + path, "color: green;");
					
					//cfg.uid = uid;

					if(SELECTOR[id] != null)
					{
						throw new qq.Error("qq.View", "registerSelector", "Selector configuration under (id:" + id + ") is already registered (uid:"+uid+")");
					}
					else
					{
						var isGroup = false;
						
						if(selector.type != null)
						{
							if(typeof(selector.type) == "object")
							{
								isGroup = true;
							}
							else
							{
								if(WIDGETS[selector.type] == null)
								{
									throw new qq.Error("qq.View", "registerSelector", "Invalid type (type:" + selector.type + ") under selector configuration (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
								}
							}
						}
						else
						{
							isGroup = true;
						}
						
						if(selector.q != null)
						{
							if(typeof(selector.q) == "object")
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
							throw new qq.Error("qq.View", "registerSelector", "Selector configuration under (id:" + id + ") is missing a query (q:" + selector.q + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
						}
						
						/* new configuration object for a selector */
						var ncfg = qq.$.extend(true, {}, selector);
							/* uid is MD5 hash of the path */
							ncfg.uid = uid;
							/* selector path based on its hierarchy */
							ncfg.path = path;
						
						if(isGroup == true)
						{
							/* items - selector references, irefs - dom item references */
							SELECTOR[id] = {id: id, path: path, items: ncfg, group: true, irefs: {}};
						}
						else
						{
							SELECTOR[id] = {id: id, path: path, selector: ncfg, group: false};
						}
					}
				}
				else
				{
					throw new qq.Error("qq.view", "registerSelector", "Invalid selector id - (id:" + id + ").");
				}
			};
			this.registerSelector = registerSelector;
			
			/**
			* Processes the 'selectors' and registers them into the View.
			*/
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
			
			/**
			* Registers a trigger
			*/
			var registerTrigger = function (id, cfg)
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
			this.registerTrigger = registerTrigger;
			
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
			
			/**
			* Register default data for a particular selector
			*/
			var registerDefault = function (id, val)
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
			this.registerDefault = registerDefault;
			
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
			
			
			/**
			* Sets a data mapping from 'id' to 'selector'
			*/
			var setDataMap = function (id, selector)
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
			this.setDataMap = setDataMap;
			
			/**** SERVICES ****/
			
			/**
			* Register service
			*/
			var registerService = function (type, cfg)
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
			this.registerService = registerService;

			/**
			* Registers a data transformer.
			*/
			var registerTransformer = function (type, cfg)
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
			this.registerTransformer = registerTransformer;
			
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
			
			/**
			*
			*/
			var updateService = function (id, data, done)
			{
				var cfg = SERVICES[id], nudata = {}, dcounter = 0;
				
				if(cfg == null)
				{
					throw new qq.Error("qq.view", "updateService", "The service (id:" + id + ") isn't registered with the view, view id (id:" + viewID + "), module id (id:" + modID + ").");
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
								throw new qq.Error("qq.View", "updateService", "There was an error executing the cbDone handler for service (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + "). " + e);
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
								throw new qq.Error("qq.View", "updateService", "There was an error executing the done handler for service (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + "). " + e);
							}
						}
					}
				}
			};
			this.updateService = updateService;
			
			/* loads data from external service and sends it into the widget */
			var openService = function (id, data, done, fail)
			{
				var cfg = SERVICES[id], nudata = {};
				
				if(cfg == null)
				{
					throw new qq.Error("qq.view", "openService", "The service (id:" + id + ") isn't registered with the view, view id (id:" + viewID + "), module id (id:" + modID + ").");
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
								throw new qq.Error("qq.View", "openService", "There was an error executing the done handler for service (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + "). " + e);
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
								throw new qq.Error("qq.View", "openService", "There was an error executing the done handler for service (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + "). " + e);
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
						throw new qq.Error("qq.View", "openService", "Service failure (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + "), (errorid:" + type + "), (message:" + msg + ")");
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
					throw new qq.Error("qq.View", "openService", "Invalid service url - (url:" + cfg.url + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
				}
				
			};
			this.openService = openService;
			
			/** ACTIONS **/
			
			/**
			* Registers a View action.
			*/
			var registerAction = function (id, del)
			{
				if(id != null && id.length > 0)
				{
					ACTIONS[id] = del;
				}
				else
				{
					throw new qq.Error("qq.view", "registerAction","Invalid action id - (id:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
				}
			};
			this.registerAction = registerAction;
			
			/** EVENTS **/
			
			/**
			* Register 'on' events.
			*/
			var on = function (type, del)
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
								throw new qq.Error("qq.view", "on","Unable to execute 'on' handler for view  - (type:" + type + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
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
					throw new qq.Error("qq.view", "on","Invalid event handler type - (type:" + type + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
				}
			};
			this.on = on;
			
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
			
			/**
			* Apply data on to a widget
			* @uid selector uid
			* @cfgso selector configuration object
			* @data data to apply to selector widget
			* @map data mapping
			* @altMap alternative mapping
			*/
			var applyData = function (uid, cfgso, data, map, altMap)
			{
				var so, val, arr, i, l, curef, container, wdgt, wdgtCfg, gid, sid, transformer, tranfn, tranData, dnode;
				
				//debugger;

				if(altMap != null && altMap[uid] != null)
				{
					arr = altMap[uid].split(".");
					
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
					val = data[uid];
				}

				/* apply transformer to data */
				if(TRANSFORMERS[uid] != null)
				{
					transformer = TRANSFORMERS[uid];
					
					if(transformer != null && transformer.__ != null && typeof(transformer.__) == "function")
					{
						tranfn = transformer.__;

						try
						{
							val = tranfn(val);
						}
						catch(e)
						{
							throw new qq.Error("qq.view", "applyData", "Error executing transformer (id:" + uid + ").\n" + e);
						}
					}
					else if(typeof(transformer) == "function")
					{
						try
						{
							val = transformer(val);
						}
						catch(e)
						{
							throw new qq.Error("qq.view", "applyData", "Error executing transformer (id:" + uid + ").\n" + e);
						}

						transformer = null;
					}
				}

				//dnode = {val: val};

				//SELECTORS[uid] = dnode;

				val = qq.clone(val);

				cfgso.data = val;

				/* added the alt map if it was used, just because for now */
				/* TODO figure it out */
				if(altMap != null && altMap[uid] != null)
				{
					dnode.alt = altMap[uid];
				}
				
				if(cfgso.group == true)
				{
					var grp = GROUPS[cfgso.gtype];
					
					if(grp != null && grp.cfg != null)
					{
						if(grp.cfg.set != null)
						{
							if(cfgso.inited != true)
							{
								initGroup(cfgso, grp.cfg);
							}
							
							/* this is where we set service data to a group configuration */
							grp.cfg.set.call(grp.cfg, val, cfgso.irefs, cfgso.state, cfgso.items);
						}
					}
					else
					{
						/* TODO ERROR - no group registered */
					}
				}
				else if(cfgso.dom != null)
				{
					if(qq.isNode(cfgso.dom) && cfgso.dom.length > 0)
					{
						if(cfgso.domqq != null && qq.isNode(cfgso.domqq) && cfgso.domqq.length > 0)
						{
							container = cfgso.domqq;
						}
						else
						{
							container = cfgso.dom;
						}
						
						wdgt = WIDGETS[cfgso.type];
						
						if(wdgt != null && wdgt.cfg != null)
						{
							wdgtCfg = wdgt.cfg;
							
							if(wdgtCfg.set != null)
							{
								/* this is where we set service data to a widget */

								if(wdgt.hasSelectors == true && transformer != null)
								{
									/* at this point we pass a transformer into the set method of a widget */
									wdgtCfg.set(container, val, cfgso, transformer);
								}
								else
								{
									wdgtCfg.set(container, val, cfgso);
								}
							}
						}
					}
				}
			}; /* end applyData method */

			/**
			* Set data on to a selector widget
			* @uid selector uid
			* @data data load
			* @map is a data mapping type (dataMap in selector attribute)
			* @altMap is an alternative mapping for the data
			*/
			var setWidgetData = function (uid, data, map, altMap)
			{
				if(SELECTOR[uid] != null)
				{
					/* selector object */
					var so = SELECTOR[uid],
						cfgso;
					
					/* if the selector is a group (concept) */
					if(so.group == true)
					{
						cfgso = so;
					}
					else
					{
						cfgso = so.selector;
					}

					/* Apply Data accepts a data object, create it here */
					var dta = {};
						dta[uid] = data;

					//so.data = dta;

					/* cfgso :
						{id, path, items: ncfg, group: true, irefs: {}}
						{id, path, selector: ncfg, group: false}
					*/
					applyData(uid, cfgso, dta, map, altMap);
				}
			};
			this.setWidgetData = setWidgetData;

			/**
			* Sets data to a widget or group of widgets
			*/
			var setData = function (data, map, altMap)
			{
				console.log("* Set Data", "data", data, "map", map, "altMap", altMap);

				var so, cfgso, val, arr, i, l, curef, container, wdgt, gid, sid;
				
				if(arguments.length == 1)
				{
					map = "direct";
				}
				
				if(map == "direct")
				{
					for(var each in data)
					{
						cfgso = null;
						
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
									cfgso = so.items[sid];
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
									cfgso = so;
								}
								else
								{
									cfgso = so.selector;
								}
							}
						}
						
						if(cfgso != null)
						{
							applyData(each, cfgso, data, map, altMap);
						}
					}
				}
			};
			this.setData = setData;
			

			/**
			* Gets selector data.
			*/
			var getSelectorData = function (cfg, scope)
			{
				var container, wdgt;
				debugger;
				if((WIDGETS[cfg.type] != null && WIDGETS[cfg.type].cfg != null && WIDGETS[cfg.type].cfg.get != null) && cfg.dom != null)
				{
					/* TODO make it possible to do this without jQuery?? */
					if(qq.isNode(cfg.dom) && cfg.dom.length > 0)
					{
						if(cfg.domqq != null && qq.isNode(cfg.domqq) && cfg.domqq.length > 0)
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

			/**
			* Retrieves data from the view
			*/
			var getData = function ()
			{
				var so, cfg, val, arr, i, l, curef, count = 0, data = {}, seldata, lcl = {count:0};
				
				for(var each in SELECTOR)
				{
					so = SELECTOR[each];
					
					count = lcl.count;
					seldata = null;
					
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
						// TODO this is a mistake, the seldata is set in grp.cfg.get above - this needs to be worked out
						if(seldata == null)
						{
							// TODO plugged a logic hole above, fix this, remove the null check
							seldata = getSelectorData(cfg, lcl);
						}
					}
					else
					{
						cfg = so.selector;
						
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
			this.getData = getData;

			/**
			* Retrieves the entire state from the view for use as 'initial' data element later
			* @returns a null if the view hasn't been initialized
			*/
			var getState = function ()
			{
				if(bInited == false)
				{
					return null;
				}

				var so, cfg, val, arr, i, l, curef, count = 0, state = {}, selstate, lcl = {count:0}, dnode;

				state.selectors = {};
				
				for(var each in SELECTOR)
				{
					so = SELECTOR[each];

					// so.id
					// so.path
					// so.selector
					// so.group
					// so.items
					// so.irefs

					//dnode = DATA[each];

					count = lcl.count;
					selstate = null;
					
					/* group only */
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
								
								if(grp.cfg.get != null)
								{
									selstate = grp.cfg.get.call(grp.cfg, so.irefs, so.state, so.items);
								}
							}
						}
						else
						{
							/* TODO ERROR - no group registered */
						}
						debugger;
						if(selstate == null)
						{
							cfg = so.selector;

							// TODO fix this - this havent been tested 
							selstate = getSelectorState(cfg, lcl);
						}
					}
					else
					{
						cfg = so.selector;
						
						//cfg.id
						//each
						// cfg.path

						selstate = getSelectorState(cfg, lcl);
					}
					
					if(count < lcl.count)
					{
						selstate.id = each;
						
						// if(dnode != null)
						// {
						// 	selstate.data = dnode.val;
						// }

						state.selectors[each] = selstate;
					}
				}
				
				if(lcl.count > 0)
				{
					return state;
				}
				else
				{
					return null;
				}
			};
			this.getState = getState;


			/**
			* Gets selector state.
			*/
			var getSelectorState = function (cfg, scope)
			{
				var container, wdgt, selstate = {};

				var wdgt = WIDGETS[cfg.type];

				var placedomqq, placedom, elplacing = {};
				
				/* make sure the widget has .getstate method implemented */
				if((wdgt != null && wdgt.cfg != null && wdgt.cfg.getstate != null) && cfg.dom != null)
				{
					/* TODO make it possible to do this without jQuery?? */
					if(qq.isNode(cfg.dom) && cfg.dom.length > 0)
					{
						if(cfg.domqq != null && qq.isNode(cfg.domqq) && cfg.domqq.length > 0)
						{
							container = cfg.domqq;
							placedomqq = qq.place(cfg.domqq);
						}
						else
						{
							container = cfg.dom;
						}

						placedom = qq.place(cfg.dom);
						
						//wdgt = wdgt.cfg;

						selstate.uid = cfg.uid;
						selstate.path = cfg.path;

						selstate.dom = placedom;

						if(placedomqq != null)
						{
							selstate.domqq = placedomqq;
						}
						
						if(wdgt.cfg.getstate != null)
						{
							scope.count++;

							/* result of the 'get' life cycle widget method */
							var res = wdgt.cfg.getstate(container, cfg);

							selstate.state = res;
						}

						return selstate;
					}
				}

				if(cfg.dom != null)
				{
					if(qq.isNode(cfg.dom) && cfg.dom.length > 0)
					{
						if(cfg.domqq != null && qq.isNode(cfg.domqq) && cfg.domqq.length > 0)
						{
							container = cfg.domqq;

							pathdomqq = qq.place(cfg.domqq);
						}

						pathdom = qq.place(cfg.dom);
					}
				}
				
				selstate.uid = cfg.uid;
				selstate.path = cfg.path;

				selstate.pathdom = pathdom;

				if(pathdomqq != null)
				{
					selstate.pathdomqq = pathdomqq;
				}

				return selstate;
			};

			// var getState = function()
			// {
			// 	var data = getData();

			// 	return {viewID: viewID, modID: modID, viewUID: viewUID, data: data};
			// };
			// this.getState = getState;
			
			/**
			* Configures the view.
			*/
			var configure = function (uid)
			{
				if(bConfigured != true)
				{
					if(viewUID != uid)
					{
						throw new qq.Error("qq.View", "configure", "Incorrect view uid (uid:" + uid + ").");
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
			this.configure = configure;
			
			/**
			* Initializes the triggers within the view.
			*/
			var initTriggers = function ()
			{
				var cfgtr, ref, refqq, del;
				
				for(var each in TRIGGERS)
				{
					cfgtr = TRIGGERS[each];
					
					ref = viewDOM.find(cfgtr.q);
					
					if(cfgtr.qq != null && cfgtr.qq.length > 0)
					{
						refqq = ref.find(cfgtr.qq);
						
						if(refqq.length > 0)
						{
							cfgtr.dom = ref;
							cfgtr.domqq = refqq;
						}
						else
						{
							throw new qq.Error("qq.View", "initTriggers", "Couldn't find sub selector (qq:" + cfgtr.qq + ") for (trigger:" + each + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
						}
					}
					else
					{
						if(ref.length > 0)
						{
							cfgtr.dom = ref;
							cfgtr.domqq = null;
						}
						else
						{
							throw new qq.Error("qq.View", "initTriggers", "Couldn't find a trigger (q:" + cfgtr.q + ") for (trigger:" + each + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
						}
					}
					
					if(cfgtr.action != null && cfgtr.action.length > 0)
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
						del.action = cfgtr.action;
						del.preventDefault = cfgtr.preventDefault;
						
						if(cfgtr.domqq != null)
						{
							cfgtr.domqq.on("click", del);
						}
						else
						{
							cfgtr.dom.on("click", del);
						}
					}
				}
				
			};

			/**
			* Used to initialize a widget
			*/
			var processWidget_init = function (container, cfgsel)
			{
				var wdgt = WIDGETS[cfgsel.type];

				if(wdgt != null && wdgt.cfg != null)
				{
					wdgt = wdgt.cfg;
					
					if(wdgt.init != null)
					{
						/* this is where we set service data to a widget */
						wdgt.init(container, cfgsel, GROUPS);
					}
				}
			};
			
			/**
			* Performs query selection and establishes the dom & domqq references within the view
			*/
			var initSelector = function (id, cfgsel)
			{
				var ref, refqq;
				//debugger;
				ref = viewDOM.find(cfgsel.q);
				refqq = null;
				
				if(cfgsel.qq != null && cfgsel.qq.length > 0)
				{
					refqq = ref.find(cfgsel.qq);
					
					if(refqq.length > 0)
					{
						cfgsel.dom = ref;
						cfgsel.domqq = refqq;
						
						processWidget_init(refqq, cfgsel);

						return refqq;
					}
					else
					{
						throw new qq.Error("qq.View", "initSelector", "Couldn't find sub selector (qq:" + cfgsel.qq + ") for (selector:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
					}
				}
				else
				{
					if(ref.length > 0)
					{
						cfgsel.dom = ref;
						cfgsel.domqq = null;
						
						processWidget_init(ref, cfgsel);

						return ref;
					}
					else
					{
						throw new qq.Error("qq.View", "initSelector", "Couldn't find a selector (q:" + cfgsel.q + ") for (selector:" + id + "), view id (id:" + viewID + "), module id (id:" + modID + ").");
					}
				}
			};

			/**
			* Goes through the object widgets and registers them with QQ.
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
			
			/**
			* Initializes selectors and sets all the references to for all the items.
			*/
			var initSelectors = function ()
			{
				/* so - selector object */
				var so, cfgsel, grp, ref, refqq, eachA, eachB, stype, stcount, sttotal;
				
				for(eachA in SELECTOR)
				{
					so = SELECTOR[eachA];
					
					if(so.group == true)
					{
						//debugger;
						stcount = 0;
						sttotal = 0;
						stype = null;
						
						/* initialize group's selectors */
						for(eachB in so.items)
						{
							cfgsel = so.items[eachB];
							
							sttotal++;
							/* see if all the types within the group are the same as the first */
							if(stype == null)
							{
								stype = cfgsel.type;
								stcount++;
							}
							else if(stype == cfgsel.type)
							{
								stcount++;
							}
							
							so.irefs[eachB] = initSelector(eachB, cfgsel);
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
						//debugger;
						initSelector(eachA, so.selector);
					}
				}
			};
			
			/**
			* Initializes the qq.View.
			* @uid view unique identifier
			* @domNode is the view node
			*/
			var init = function (uid, domNode)
			{
				console.log("** qq.View.init");
				
				if(bInited != true)
				{
					if(viewUID != uid)
					{
						throw new qq.Error("qq.View", "init", "Incorrect view uid (uid:" + uid + ").");
					}
					
					viewDOM = domNode;
					
					initTriggers.call(this);
					initSelectors.call(this);
					initWidgets.call(this);

					var def;

					//using the default data set it here via setData

					for(var each in DEFAULTS)
					{
						def = DEFAULTS[each];

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
			this.init = init;

			this.actions = ACTIONS;
			
		};
		
		qq.View.prototype = {};
	};

	if(_isNode == false)
	{
		registerView(qq);
	}
	
}).apply(this, [qq]);