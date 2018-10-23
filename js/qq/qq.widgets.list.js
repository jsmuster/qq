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
	
	/* LIST WIDGET */
	qq.registerWidget("list", (function ()
	{
		var bOnValue,
			bOnRender;

		/* global hash table for all list sub-selectors, ie selector reference for every child item within the list row. */
		var SUBSELECTORS = {},
			GROUPS,
			WIDGETS;
	
		/* TODO unfold the method */
		var executeOnHandler = function (ref, index, total, clone, iref, val, cfg)
		{
			var i,l,reftype, otype, each, o;
			
			if(ref instanceof Function)
			{
				ref.call(null, index, total, clone, iref, val, cfg);
			}
			else
			{
				if(ref instanceof Array)
				{
					for(i = 0, l = ref.length; i < l; i++)
					{
						clone.addClass(ref[i]);
					}
				}
				else
				{
					reftype = typeof(ref);
					
					if(reftype == "string")
					{
						clone.addClass(ref);
					}
					else if(reftype == "object")
					{
						if(ref.cls != null)
						{
							o = ref.cls;
							
							if(o instanceof Array)
							{
								for(i = 0, l = o.length; i < l; i++)
								{
									clone.addClass(o[i]);
								}
							}
							else
							{
								otype = typeof(o);
								
								if(otype == "string")
								{
									if(o.charAt(0) == "-")
									{
										o = o.substr(1);
										clone.removeClass(o);
									}
									else
									{
										clone.addClass(o);
									}
								}
								else if(otype == "object")
								{
									for(each in o)
									{
										if(o[each] == false)
										{
											clone.removeClass(each);
										}
										else
										{
											clone.addClass(each);
										}
									}
								}
							}
						}
						
						/** attributes **/
						
						if(ref.attr != null)
						{
							clone.attr(ref.attr);
						}
						
						if(ref.data != null)
						{
							clone.data(ref.attr);
						}
						
					}
				}
			}
		};
		
		var processOnHandlers = function (index, total, clone, iref, val, cfg)
		{
			var onCfg = cfg.onCfg, n = onCfg.n, each, nint, ncfg, on = cfg.on, ref, reftype;
			
			for(each in n)
			{
				nint = onCfg.nint[each];
				
				if(((index + 1) % nint) == 0)
				{
					ncfg = n[each];
					
					executeOnHandler(ncfg, index, total, clone, iref, val, cfg);
				}
			}
			
			ref = on["i"+index];
			
			if(ref != null)
			{
				executeOnHandler(ref, index, total, clone, iref, val, cfg);
			}
			
			ref = on.first;
			
			if(ref != null && index == 0)
			{
				executeOnHandler(ref, index, total, clone, iref, val, cfg);
			}
			
			ref = on.item;
			
			if(ref != null)
			{
				executeOnHandler(ref, index, total, clone, iref, val, cfg);
			}
			
			ref = on.last;
			
			if(ref != null && ((index + 1) >= total))
			{
				executeOnHandler(ref, index, total, clone, iref, val, cfg);
			}
			
			ref = on.odd;
			
			if(ref != null && ((index + 1) % 2) == 1)
			{
				executeOnHandler(ref, index, total, clone, iref, val, cfg);
			}
			else
			{
				ref = on.even;
				
				if(ref != null)
				{
					executeOnHandler(ref, index, total, clone, iref, val, cfg);
				}
			}
		};
	
		var setListItemValue = function (index, iref, cfg, val)
		{
			var ii, ll, opts, wrapper, inwrpr;
			
			if(iref.length > 0)
			{
				if(cfg.transformer != null)
				{
					if(cfg.transformer.type == "wrapper")
					{
						if(iref instanceof jQuery)
						{
							iref.html('');
						}
						else
						{
							for(ii = 0, ll = iref.length; ii < ll; ii++)
							{
								$(iref[ii]).html('');
							}
						}
						
						opts = cfg.transformer.opts;
						
						if(opts != null)
						{
							if(typeof(opts) == "object")
							{
								if(opts.q != null && opts.q.length > 0)
								{
									if(opts.q.charAt(0) === "<" && opts.q.charAt( opts.q.length - 1 ) === ">" && opts.q.length >= 3)
									{
										wrapper = $(opts.q);
										
										if(opts.qq != null && opts.q.length > 0)
										{
											inwrpr = wrapper.find(opts.qq);
											
											if(inwrpr.length > 0)
											{
												inwrpr.html(val);
											}
											else
											{
												throw new qq.Error("qq.setListItemValue(1): Couldn't 'find' an element inside the wrapper (opts.q:'" + opts.q + "'), (opts.qq:'" + opts.qq + "').");
											}
										}
										else
										{
											wrapper.html(val);
										}
									}
									else
									{
										throw new qq.Error("qq.setListItemValue(2): The 'wrapper' transformer must be a valid jQuery template (q:'" + opts.q + "').");
									}
								}
								else
								{
									throw new qq.Error("qq.setListItemValue(3): The 'wrapper' transformer options object doesn't contain a valid template. (opts.q:'" + opts.q + "').");
								}
							}
							else if(opts.charAt(0) === "<" && opts.charAt( opts.length - 1 ) === ">" && opts.length >= 3)
							{
								wrapper = $(opts);
															
								wrapper.html(val);
							}
							else
							{
								throw new qq.Error("qq.setListItemValue(4): Invalid 'wrapper' transformer options (opts:'" + opts + "').");
							}
						}
						
						iref.append(wrapper);
					}
					else
					{
						val = qq.transform(val, cfg.transformer);
											
						iref.html(val);
					}
				}
				else
				{
					iref.html(val);
				}
			}
		};

		/**
		* Registers a subselector.
		*
		* id - sub selector id
		* @cfg - configuration
		* @pcfg - parent configuration
		*/
		var registerSubSelector = function (uid, cfg, pcfg)
		{
			if(uid != null && uid.length > 0)
			{
				if(SUBSELECTORS[uid] != null)
				{
					throw new qq.Error("qq.widgets.list: Selector configuration under (uid:" + uid + ") is already registered.");
				}
				else
				{
					/* sub selector path is made out of parent path */
					//var path = pcfg.path + "." + id;

					/* widget uid */
					//var uid = qq.GetHashCode(cfg, path);

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
								throw new qq.Error("qq.widgets.list: Invalid type (type:" + cfg.type + ") under selector configuration (uid:" + uid + ")");
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
						throw new qq.Error("qq.widgets.list: Selector configuration under (uid:" + uid + ") is missing a query (q:" + cfg.q + ").");
					}

					/* make a copy of the widget configuration and store it in sub selectors */
					// var ncfg = jQuery.extend(true, {}, cfg);
					// 	ncfg.uid = uid;
					// 	ncfg.path = path;
						//ncfg.id = id;
					
					//debugger;
					if(isGroup == true)
					{
						/* items - selector references, irefs - dom item references */
						SUBSELECTORS[uid] = {items:cfg, group:true, irefs:{}};
					}
					else
					{
						SUBSELECTORS[uid] = {cfg:cfg, group:false};
					}
				}
			}
			else
			{
				throw new qq.Error("Invalid selector id - (id:" + id + ").");
			}
		};

		/**
		* Registers selectors for a list item during initialization of the qq.View.
		* This procedure registers the selectors with the global list concept.
		*/
		var registerSubSelectors = function (cfg)
		{
			//debugger;

			if(cfg.li != null)
			{
				var path;
				var uid;

				if(cfg.li.selectors != null)
				{
					var ncfg;

					for(var id in cfg.li.selectors)
					{
						path = cfg.path + "." + id;

						uid = qq.GetHashCode(cfg.li.selectors[id], path);

						ncfg = jQuery.extend(true, {}, cfg.li.selectors[id]);

						ncfg.uid = uid;
						ncfg.path = path;
						ncfg.id = id;

						registerSubSelector(uid, ncfg, cfg);
					}
				}
				else if(cfg.li.type != null)
				{
					//debugger;
					var id = "{[ref]}";

					path = cfg.path + "." + id;

					uid = qq.GetHashCode(cfg.li, path);

					ncfg = jQuery.extend(true, {id:id, path:path, uid:uid}, cfg.li);

					//ncfg.uid = uid;
					//ncfg.path = path;
					//ncfg.id = id;

					/* registers a selector without an id */
					registerSubSelector(uid, ncfg, cfg);
				}
			}
		};

		/**
		* Used to initialize a widget
		*/
		var processWidget_init_handler = function (index, container, cfg)
		{
			var wdgt = WIDGETS[cfg.type];

			if(wdgt != null && wdgt.cfg != null)
			{
				wdgt = wdgt.cfg;
				
				if(wdgt.init != null)
				{
					/* this is where we set service data to a widget */
					wdgt.init(container, cfg);
				}
			}
		};

		/* performs query selection and establishes the dom & domqq references within the view */
		var initChild = function (index, viewDOM, id, cfg)
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
					
					processWidget_init_handler(index, refqq, cfg);

					return refqq;
				}
				else
				{
					throw new qq.Error("qq.View.initChild: Couldn't find sub selector (qq:" + cfg.qq + ").");
				}
			}
			else
			{
				if(ref.length > 0)
				{
					cfg.dom = ref;
					cfg.domqq = null;
					
					processWidget_init_handler(index, ref, cfg);

					return ref;
				}
				else
				{
					throw new qq.Error("qq.View.initChild: Couldn't find a selector (q:" + cfg.q + ") for (selector:" + id + ").");
				}
			}
		};
	
		/**
		* Initializes child selectors and sets all the references for all the items
		* index - item index with the list
		* cfg - configuration of the item
		* itemCfg - item configuration
		* val - item data value
		* TRANSFORMERS - transformers for each selector within this hierarchy
		*/
		var initChildSelectors = function (index, cfg, itemCfg, val, TRANSFORMERS)
		{
			/* itemCfg.ref - reference to the item's dom element
			 * itemCfg.children - reference to item's child selectors (children)
			 */
			/* so - selector object for each of the sub selectors in item */
			/* sicfg - item's child configuration - stores selector references & configuration for each item */
			var so,
				childCfg,
				cfg,
				grp,
				ref,
				refqq,
				eachA,
				eachB,
				stype,
				stcount,
				sttotal,
				path,
				uid;

			var ncfg;

			// var ncfg = jQuery.extend(true, {}, cfg);
			// 		ncfg.uid = uid;
			// 		ncfg.path = path;
			
			//debugger;

			for(eachA in cfg.li.selectors)
			{
				so = cfg.li.selectors[eachA];

				path = cfg.path + "[" + index + "]." + eachA;

				/* uid built from a path */
				uid = qq.GetHashCode(so, path);

				if(itemCfg.children[eachA] == null)
				{
					if(so.group == true)
					{
						/* items - selector references, irefs - dom item references */
						//cfg:so, 
						//ncfg = {path:path, uid:uid, items:{}, group:true, irefs:{}};

						ncfg = jQuery.extend(true, {id:eachA, path:path, uid:uid, items:{}, group:true, irefs:{}}, so);

						itemCfg.children[eachA] = ncfg;
					}
					else
					{
						//cfg:so, 
						//itemCfg.children[eachA] = {path:path, uid:uid, group:false};

						ncfg = jQuery.extend(true, {id:eachA, path:path, uid:uid, group:false}, so);

						itemCfg.children[eachA] = ncfg;
					}
				}

				childCfg = itemCfg.children[eachA];
				
				if(so.group == true)
				{
					stcount = 0;
					sttotal = 0;
					stype = null;
					
					/* initialize group's selectors. A group is essentially a collection of selectors */
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
						//debugger;
						console.log("*-- cfg", cfg);

						sicfg.irefs[eachB] = initChild(index, itemCfg.ref, eachB, cfg);
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
						if(sicfg.inited != true)
						{
							initSubGroup(sicfg, grp);
						}
					}
					else
					{
						/* TODO ERROR - no group registered */
					}
				}
				else
				{
					//console.log("*-- childCfg", childCfg);
					
					initChild(index, itemCfg.ref, eachA, childCfg);
				}
			}
		};

		/* Initializes the selector group */
		var initSubGroup = function(childCfg, grp)
		{
			childCfg.inited = true;
			childCfg.state = {};
			
			if(grp.cfg.init != null)
			{
				grp.cfg.init.call(grp, childCfg.irefs, childCfg.state, childCfg.items);
			}
		};


		var applyDataToChildSelectors = function (cfg, itemCfg, val, TRANSFORMERS)
		{
			var so, each, fn, transformer;

			for(each in cfg.li.selectors)
			{
				so = cfg.li.selectors[each];

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

				if(TRANSFORMERS[each] != null)
				{
					fn = TRANSFORMERS[each];

					try
					{
						fn(val);
					}
					catch(e)
					{

					}
				}
			}



			if(itemCfg.children[eachA] == null)
			{

			}
		};

		/**
		* Initializes each item within the list in this method.
		* Here we set the value into each list item.
		*/
		var applyDataToItem = function (index, length, clone, iref, cfg, val, TRANSFORMERS)
		{
			console.log("*** applyDataToItem", index, iref, cfg, val);
			
			//debugger;

			/* each item is a complicated */
			if(cfg.li != null)
			{
				if(cfg.li.selectors != null)
				{
					if(cfg.items == null)
					{
						cfg.items = [];
					}

					var itemCfg = {ref:clone, children:{}};
					
					cfg.items.push(itemCfg);

					initChildSelectors(index, cfg, itemCfg, val, TRANSFORMERS);

					//applyDataToChildSelectors(cfg, itemCfg, val, TRANSFORMERS);
				}
				else if(cfg.li.type != null)
				{
					debugger;
					console.log("W LIST TYPE")
					if(cfg.item == null)
					{
						cfg.item = {ref:clone};
					}

					/* initialize the widget of type cfg.li.type */
					processWidget_init_handler(index, clone, cfg);
				}

				//SUBSELECTORS
				//processSelectors(listItem, cfg.li.selectors);
				// for(var each in cfg.li.selectors)
				// {
				// 	listItem.SELECTOR[id] = {cfg:cfg.li.selectors[each], group:false};
				// }
			}
			/* the item is just an html element with values inside of it, very basic */
			else
			{
				/* sets lists item's value */
				setListItemValue(index, iref, cfg, val);
				
				if(cfg.on != null)
				{
					processOnHandlers(index, l, clone, iref, val, cfg);
				}
			}
		};


		/**
		 * This function setups the templates by collecting the templates from the html definition using a selector. 
		 * The HTML definition may contain more than 1 child template, each template will be used as child.
		 */
		var setDataToList = function (cfg, index, tag, curef, data, TRANSFORMERS)
		{
			console.log("* setDataToList", cfg, index, tag, curef, data);

			var ecfg,
				val,
				each, i, l, ii, ll, itemA, itemB, iref, parent, pholder, templates, temps, curli, temp, curq, curqq, wrapper, opts, 
				on, onCfg, itype, inum, ifn;
			
			/* initial setup of the domJQConfig. This will happen for 

			   - remove the LI elements and use them as templates for when updating the list.
			   TODO add animation controls ability to fade in elements etc.
			   TODO add custom children selector
			   TODO add custom inner container selector where children are located
			   TODO add custom directives to collection of children
			   TODO add custom children templates for single and variation based on order or property within the data
			   TODO optimize DOM manipulation, manipulate DOM in memory first
			*/

			if(cfg.domJQConfig[index] == null)
			{
				/* here we query for lists children within the document or create them from a template */
				if(tag == "ul" && cfg.li == null)
				{
					temps = curef.children("li");
					templates = [];
					
					for(ii = 0, ll = temps.length; ii < ll; ii++)
					{
						templates[templates.length] = {ref:temps[ii], qq:null};
					}
				}
				else if(cfg.li != null)
				{
					templates = [];
					
					if(cfg.li instanceof Array)
					{
						for(i = 0, l = cfg.li.length; i < l; i++)
						{
							curli = cfg.li[i];
							
							if(typeof(curli) == "object")
							{
								curq = curli.q;
								curqq = curli.qq;
							}
							else
							{
								curq = curli;
								curqq = null;
							}
							
							if(curq.charAt(0) === "<" && curq.charAt( curq.length - 1 ) === ">" && curq.length >= 3)
							{
								templates[templates.length] = {ref:$(curq), qq:curqq};
							}
							else
							{
								temps = curef.find(curq);
								
								if(temps.length > 0)
								{
									for(ii = 0, ll = temps.length; ii < ll; ii++)
									{
										templates[templates.length] = {ref:temps[ii], qq:curqq};
									}
								}
								else
								{
									/* TODO provide "developer" feedback that nothing was found */
								}
							}
						}
					}
					else
					{
						curli = cfg.li;
						
						if(typeof(curli) == "object")
						{
							curq = curli.q;
							curqq = curli.qq;
						}
						else
						{
							curq = curli;
							curqq = null;
						}

						if(curq == null)
						{
							throw new qq.Error("qq.setDataToList: Invalid list item selector.");
						}
						
						if(curq.charAt(0) === "<" && curq.charAt( curq.length - 1 ) === ">" && curq.length >= 3)
						{
							templates[templates.length] = {ref:$(curq), qq:curqq};
						}
						else
						{
							temps = curef.find(curq);
							
							if(temps.length > 0)
							{
								for(ii = 0, ll = temps.length; ii < ll; ii++)
								{
									templates[templates.length] = {ref:temps[ii], qq:curqq};
								}
							}
							else
							{
								throw new qq.Error("qq.processListType: Unable to locate an item list reference.");
							}
						}
					}
				}
				
				/* after setting up the template for the list */
				/* assign the jquery configuration */
				ecfg = {items:[], type:0};
				
				cfg.domJQConfig[index] = ecfg;
				
				if(templates.length == 1)
				{
					ecfg.type = "single";
					
					temp = templates[0];
					
					if(temp.ref instanceof jQuery)
					{
						temp.ref = temp.ref.detach();
						
						ecfg.items[0] = temp;
					}
					else
					{
						temp.ref = $(temp.ref).detach();
						
						ecfg.items[0] = temp;
					}
				}
				else if(templates.length >= 2)
				{
					ecfg.type = "double";
					
					temp = templates[0];
					
					if(temp.ref instanceof jQuery)
					{
						temp.ref = temp.ref.detach();
						
						ecfg.items[0] = temp;
					}
					else
					{
						temp.ref = $(temp.ref).detach();
						
						ecfg.items[0] = temp;
					}
					
					temp = templates[1];
					
					if(temp instanceof jQuery)
					{
						temp.ref = temp.ref.detach();
						
						ecfg.items[1] = temp;
					}
					else
					{
						temp.ref = $(temp.ref).detach();
						
						ecfg.items[1] = temp;
					}
					
					/* TODO process the two and figure the difference between them ? */
					
					if(templates.length > 2)
					{
						for(i = 2, l = templates.length; i < l; i++)
						{
							temp = templates[i];
							
							if(temp.ref instanceof jQuery)
							{
								temp.ref.remove();
							}
							else
							{
								$(temp.ref).remove();
							}
						}
					}
				}
				/* TODO finish more than 2 */
			}
			else
			{
				ecfg = cfg.domJQConfig[index];
			}
			//debugger;
			console.log("* ecfg", ecfg);
			
			i = 0;
			l = data.length;
			pholder = $("<div />");
			
			/* remove the entire list reference from the HTML */
			curef.replaceWith(pholder);
			
			/* remove all children of the list item */
			curef.empty();
			
			itemA = ecfg.items[0];
			
			if(cfg.on != null)
			{
				on = cfg.on;
				
				if(on.value != null && (on.value instanceof Function))
				{
					bOnValue = true;
				}
				else
				{
					bOnValue = false;
				}
				
				if(on.render != null && (on.render instanceof Function))
				{
					bOnRender = true;
				}
				else
				{
					bOnRender = false;
				}
				
				/* process on config */
				if(cfg.onCfg == null)
				{
					onCfg = {n:{}, nint:{}};
					
					cfg.onCfg = onCfg;
					
					for(each in on)
					{
						if(each.charAt(0) == "n")
						{
							inum = each.substr(1);
							
							if(inum == parseInt(inum))
							{
								ifn = on[each];
								
								if(ifn != null)
								{
									onCfg.n[inum] = ifn;
									onCfg.nint[inum] = inum;
								}
							}
						}
					}
				}
				else
				{
					onCfg = cfg.onCfg;
				}
			}
			else
			{
				bOnValue = false;
				bOnRender = false;
			}

			/* Only one template is present within the template collection */
			if(ecfg.type == "single")
			{
				/* go through the entire data array and set every value into every item */
				for(; i < l; i++)
				{
					val = data[i];
					
					/* retrieve the proper references from a 'template' of the list item */
					clone = itemA.ref;
					
					/* before applying modifications, clone the template and append to the list */
					clone = clone.clone();

					if(itemA.qq != null)
					{
						if(itemA.qqref == null)
						{
							iref = clone.find(itemA.qq);
							itemA.qqref = iref;
						}
						else
						{
							iref = itemA.qqref;
						}
					}
					else
					{
						iref = clone;
					}
					
					/* the on.value lets us modify the value with the on value callback */
					if(bOnValue)
					{
						val = cfg.on.value.call(null, i, l, val, cfg);
					}

					applyDataToItem(i, l, clone, iref, cfg, val, TRANSFORMERS);

					/* appends a new html item */
					curef.append(clone);
				}
			}
			/* two templates are present within the template collection */
			else if(ecfg.type == "double")
			{
				itemB = ecfg.items[1];
				
				for(; i < l; i++)
				{
					val = data[i];
					
					if(i % 2)
					{
						clone = itemB.ref;
						
						if(itemB.qq != null)
						{
							if(itemB.qqref == null)
							{
								if(itemB.qq != null)
								{
									iref = clone.find(itemB.qq);
									itemB.qqref = iref;
								}
								else
								{
									iref = clone;
								}
							}
							else
							{
								iref = itemB.qqref;
							}
						}
						else
						{
							iref = clone;
						}
					}
					else
					{
						clone = itemA.ref;
						
						if(itemA.qqref == null)
						{
							if(itemA.qq != null)
							{
								iref = clone.find(itemA.qq);
								itemA.qqref = iref;
							}
							else
							{
								iref = clone;
							}
						}
						else
						{
							iref = itemA.qqref;
						}
					}
					
					if(bOnValue)
					{
						val = cfg.on.value.call(null, i, cfg, val);
					}
					
					processItem(i, l, clone, iref, cfg, val);

					curef.append(clone);
				}
			}

			console.log("Replace With", curef);
			
			pholder.replaceWith(curef);
			
			if(bOnRender)
			{
				cfg.on.render.call(null, l, curef, cfg);
			}
		}; /* end setDataToList method */
		
		/* Sets data to List, creates the entire list HTML in one swoop.
		 * ref - reference to the list container
		 * data - list array
		 * cfg - view configuration
		 */
		return {init: function (ref, cfg)
				{
					console.group("LIST INIT");

					console.log("ref", ref);
					console.log("cfg", cfg);
					
					if(WIDGETS == null)
						WIDGETS = qq.getWidgets();
					
					if(GROUPS == null)
						GROUPS = qq.getGroups();
					
					/* goes over the sub selectors and processes the configuration for later use when building the list */
					registerSubSelectors(cfg);

					console.groupEnd();
				},
				set:function (ref, data, cfg, TRANSFORMERS)
					{
						console.group("LIST SET");

						console.log("ref", ref);
						console.log("data", data);
						console.log("cfg", cfg);
						
						window.cfg = cfg;
						
						if((data instanceof Array) && data.length > 0)
						{
							var curef, i, l;
							
							/* initially setup dom configuration & items config */
							if(cfg.domJQ == null)
							{
								/* this is configuration per each dom element of 'ref' */
								cfg.domJQ = [];
								cfg.domJQTags = [];
								cfg.domJQConfig = [];

								cfg.listItems = [];
								
								for(i = 0, l = ref.length; i < l; i++)
								{
									curef = $(ref[i]);
									
									cfg.domJQ[i] = curef;
									cfg.domJQTags[i] = curef.prop('tagName').toLowerCase();
									
									setDataToList(cfg, i, cfg.domJQTags[i], curef, data, TRANSFORMERS);
								}
							}
							else
							{
								/* this happens after all the dom references are setup in the configuration object */
								for(i = 0, l = ref.length; i < l; i++)
								{
									setDataToList(cfg, i, cfg.domJQTags[i], cfg.domJQ[i], data, TRANSFORMERS);
								}
							}
						}

						console.groupEnd();
					}
				}; /* end return object */

	}($, qq)), true); /* end list widget constructor */

}).apply(this, [qq]);