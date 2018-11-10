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

console.log("- injected qq.widgets.js");

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
				
				registerWidgets(qq);
				
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

	/**
	* Function that registers all the basic widgets.
	*/
	var registerWidgets = (function (qq)
	{
		/* TEXT WIDGET */
		qq.register.widget("text", {
			set:function (ref, data, cfg)
			{
				if(cfg.transformer != null)
				{
					if(cfg.transformer.type == "wrapper")
					{
						var wrapper;
						
						for(var i = 0, l = ref.length; i < l; i++)
						{
							ref[i].innerHtml = '';
						}
						
						if(data instanceof Array)
						{
							ref.empty();
							
							for(i = 0, l = data.length; i < l; i++)
							{
								wrapper = qq.$(cfg.transformer.opts);
								
								wrapper.html(data[i]);
								
								ref.append(wrapper);
							}
						}
						else
						{
							wrapper = qq.$(cfg.transformer.opts);
							
							wrapper.html(data);
							
							ref.append(wrapper);
						}
						
						return;
					}
					else
					{
						val = qq.transform(data, cfg.transformer);
					}
				}
				
				ref.html(data);
			}
		});
		
		/* LINK WIDGET */
		qq.register.widget("link", {
			set:function (ref, data, cfg)
			{
				if(cfg.transformer != null)
				{
					data = qq.transform(data, cfg.transformer);
				}
				
				ref.attr("href", data);
			}
		});
		
		/* IMAGE WIDGET */
		qq.register.widget("image", (function ()
		{
			return {set:function (ref, data, cfg)
									{
										if(cfg.transformer != null)
										{
											data = qq.transform(data, cfg.transformer);
										}
										
										ref.attr("src", data);
									}
							};
		}()));
		
		
		/* FORM INPUTS */
		
		/* TEXT INPUT WIDGET */
		qq.register.widget("input.text", (function ()
		{
			return {set:function (ref, data, cfg)
									{
										if(cfg.transformer != null)
										{
											data = qq.transform(data, cfg.transformer);
										}
										
										ref.attr("value", data);
									},
									get: function (ref, cfg)
									{
										return ref.val();
									}
							};
		}()));
		
		/* SUBMIT INPUT WIDGET */
		qq.register.widget("input.submit", (function ()
		{
			return {set:function (ref, data, cfg)
									{
										if(cfg.transformer != null)
										{
											data = qq.transform(data, cfg.transformer);
										}
										
										ref.attr("value", data);
									},
									get: function (ref, cfg)
									{
										return ref.val();
									}
							};
		}()));
		
		
		/* TEXT INPUT WIDGET */
		qq.register.widget("input.textarea", (function ()
		{
			return {set:function (ref, data, cfg)
									{
										if(cfg.transformer != null)
										{
											data = qq.transform(data, cfg.transformer);
										}
										
										ref.val(data);
									},
									get: function (ref, cfg)
									{
										return ref.val();
									}
							};
		}()));
		
		
		/* DROPDOWN INPUT WIDGET */
		qq.register.widget("input.dropdown", (function ()
		{
			return {set:function (ref, data, cfg)
									{
										if(data != null)
										{
											var val, i, l, o, str = "", opts, selval = null, selvals = null, selcount = 0, multi = false, atr;
											
											if(!(data instanceof Array))
											{
												if(data.options != null && data.options.length > 0)
												{
													opts = data.options;
													
													if(data.value != null)
													{
														selval = data.value;
													}
													else if(data.values != null)
													{
														selvals = data.values;
													}
												}
												else
												{
													return;
												}
											}
											else
											{
												opts = data;
											}
											
											atr = ref.attr("multiple");
											
											if(typeof(atr) !== 'undefined' && atr !== false)
											{
												multi = true;
											}
											
											val = opts[0];
											
											if(val.value != null && val.text != null)
											{
												for(i = 0, l = opts.length; i < l; i++)
												{
													o = opts[i];
													
													if(cfg.transformer != null)
													{
														val = qq.transform(o.text, cfg.transformer);
													}
													else
													{
														val = o.text;
													}
													
													if((o.selected === true || o.selected == "true") || ((selval != null && selval == o.value) || (multi == true && selvals != null && selvals[o.value] == true)))
													{
														selcount++;
														str += "<option value='" + o.value + "' selected>" + val + "</option>";
													}
													else
													{
														str += "<option value='" + o.value + "'>" + val + "</option>";
													}
													
													
													//ref.attr("value", data);
												}
											}
											else
											{
												for(i = 0, l = opts.length; i < l; i++)
												{
													val = opts[i];
													
													if(cfg.transformer != null)
													{
														val = qq.transform(val, cfg.transformer);
													}
													
													str += "<option value='" + val + "'>" + val + "</option>";
												}
											}
											
											ref.html(str);
										}
									},
									get: function (ref, cfg)
									{
										return ref.val();
									}
							};
		}()));
		
		
		/* RADIO INPUT WIDGET */
		qq.register.widget("input.radio", (function ()
		{
			return {set:function (ref, data, cfg)
									{
										if(data == null) return;
										
										if(data === true)
										{
											ref.attr("value", true);
										}
										else if(data === false)
										{
											ref.attr("value", false);
										}
										else if(typeof(data) == "string")
										{
											if(cfg.transformer != null)
											{
												data = qq.transform(data, cfg.transformer);
											}
											
											ref.attr("value", data);
										}
										else
										{
											if(data.checked != null)
											{
												ref.attr("checked", true);
											}
											
											if(data.value != null)
											{
												if(cfg.transformer != null)
												{
													var val = data.value;
													
													val = qq.transform(val, cfg.transformer);
													
													ref.attr("value", val);
												}
												else
												{
													ref.attr("value", data.value);
												}
											}
										}
									},
									get: function (ref, cfg)
									{
										return ref.val();
									}
							};
		}()));
		
		// qq.register.widget("group", (function ()
		// {
		// 	var MD5 = qq.encryption.MD5;
												
		// 	return {init: function (irefs, state, items)
		// 							{
		// 								var ref, del, chked, val, hsh, arr, arrhsh;
										
		// 								if(state.byval == null)
		// 								{
		// 									state.byval = {};
		// 								}
										
		// 								/* initialize each of the item references */
		// 								for(var each in irefs)
		// 								{
		// 									ref = irefs[each];
											
		// 									del = function (e)
		// 									{
		// 										var fn = arguments.callee, state = fn.state, ref = fn.ref, id = fn.id;
												
		// 										state.id = id;
		// 										state.value = ref.val();
		// 									};
											
		// 									del.state = state;
		// 									del.ref = ref;
		// 									del.id = each;
											
		// 									chked = ref.attr("checked");
											
		// 									val = ref.val();
											
		// 									hsh = MD5.hash(val);
											
		// 									if(state.byval[hsh] == null)
		// 									{
		// 										state.byval[hsh] = [];
		// 									}
											
		// 									arrhsh = state.byval[hsh];
											
		// 									arrhsh[arrhsh.length] = {ref:ref, id:each};
											
		// 									if(chked != null && chked.length > 0)
		// 									{
		// 										state.id = each;
		// 										state.value = ref.val();
		// 									}
											
		// 									ref.on("click", del);
		// 								}
		// 							},
		// 							set:function (val, irefs, state, items)
		// 							{
		// 								var hsh = MD5.hash(val), arr, ref, item, i = 0, l;
										
		// 								arr = state.byval[hsh];
										
		// 								if(arr != null && arr.length > 0)
		// 								{
		// 									state.value = val;
											
		// 									l = arr.length;
											
		// 									for(; i < l; i++)
		// 									{
		// 										item = arr[i];
												
		// 										ref = item.ref;
		// 										state.id = item.id;
												
		// 										ref.attr("checked", "checked");
		// 									}
		// 								}
		// 							},
		// 							get: function (irefs, state, items)
		// 							{
		// 								return state.value;
		// 							}
		// 					};
		// }()));
		
	});
	
	if(_isNode == false)
	{
		registerWidgets(qq);
	}

}).apply(this, [qq]);