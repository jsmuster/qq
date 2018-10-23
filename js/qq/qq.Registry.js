/**
The MIT License (MIT)

Copyright (c) <2013> <Arseniy Tomkevich, Nikita Tomkevich, Petr Tomkevich at XSENIO Inc. http://www.xsenio.com>

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

	qq.RegistryValue = function(value, name, consty)
	{
		this.value = value;
		this.name = name;
		
		if(consty != null)
		{
			this.consty = consty;
		}
		else
		{
			this.consty = false;
		}
	}

	qq.RegistryValue.prototype = {};


	qq.Registry = function()
	{
		var RegistryValue = qq.RegistryValue;
		
		var DATA = new Object(),
				BINDINGS = new Object(),
				counter = 0;
		
		/** binds a property within the registry to another property or function delegate
		 * @name property name
		 * @to object reference where the 'property' is located
		 * @property name in the 'to' object reference.
		 */
		this.bindTo = function(name, to, property)
		{
			var reg;
			
			if(BINDINGS[name] == null)
			{
				reg = BINDINGS[name] = new Registry();
			}
			else
			{
				reg = BINDINGS[name];
			}
			
			return reg.register(new RegistryValue({ref:to, property:property}));
		};
		
		this.unbindTo = function(name, id)
		{
			var reg = BINDINGS[name];
			
			return reg.remove(id);
		};
		
		// TODO make setting a little more flexible - support name, value signature
		// sets a variable within the registry
		// process all the bindings
		// specify whether variable is a consty
		// returns a key
		/**
		 * @val returns unique identifier for the value.
		 * @name,val uses 'name' as unique identifier.
		 * @name,val,const uses 'name' as unique identifier and makes the 'value' constant, doesn't allow overwrite.
		 */
		this.set = function()
		{
			var val,
				name,
				value,
				val2,
				consty;
			
			if(arguments.length >= 2)
			{
				name = arguments[0];
				val = arguments[1];
				
				if(arguments.length == 3)
				{
					consty = arguments[2];
					
					if(consty !== false || consty !== true)
					{
						consty = false;
					}
				}
				else
				{
					consty = false;
				}
				
				if(DATA[name] == null)
				{
					value = new RegistryValue(val, name, consty);
					
					DATA[name] = value;
				}
				else
				{
					value = DATA[name];
					
					if(value.consty)
					{
						return null;
					}
					else
					{
						value = new RegistryValue(val, name, consty);
						
						DATA[name] = value;
					}
				}
			}
			else if(arguments.length == 1 && (arguments[0] instanceof RegistryValue))
			{
				value = arguments[0];
				
				if(value.name != null)
				{
					DATA[value.name] = value;
				}
				else
				{
					DATA[counter] = value;
					
					value.name = "" + counter;
					
					counter++;
				}
			}
			else if(arguments.length == 1)
			{
				value = new RegistryValue(arguments[0]);
				
				DATA[counter] = value;
					
				value.name = "" + counter;
				
				counter++;
			}
			
			var reg = BINDINGS[value.name],
				regValue;
			
			if(reg != null)
			{
				var data = reg.getData(),
					ref,
					prop,
					rref;
				
				for(var each in data)
				{
					regValue = data[each];
					
					ref = regValue.value.ref;
					prop = regValue.value.property;
					
					if(ref instanceof Registry)
					{
						rref = ref;
						rref.register(prop, value.value);
					}
					else
					{
						if(ref[prop] instanceof Function)
						{
							try
							{
								ref[prop].apply(ref, [value.value]);
							}
							catch(e)
							{
								throw new qq.Error("Registry", "sets", "There was an error processing binding for name = " + value.name + ".\n" + e);
							}
						}
						else
						{
							ref[prop] = value.value;
						}
					}
				}
			}
			
			return value.name;
		};
		
		this.reloadBinding = function()
		{
			var value, reg, regValue,
				data, ref, rref, prop, each;
			
			for(var eachName in BINDINGS)
			{
				value = DATA[eachName];
				
				if(value == null) continue;
				
				reg = BINDINGS[eachName];
				
				if(reg != null)
				{
					data = reg.getData();
					
					for(each in data)
					{
						regValue = data[each];
						
						ref = regValue.value.ref;
						prop = regValue.value.property;
						
						if(ref instanceof Registry)
						{
							rref = ref;
							rref.register(prop, value.value);
						}
						else
						{
							if(ref[prop] instanceof Function)
							{
								try
								{
									ref[prop].apply(ref, [value.value]);
								}
								catch(e)
								{
									throw new qq.Error("Registry", "reloadBinding", "There was an error processing binding for name = " + value.name + ".\n" + e);
								}
							}
							else
							{
								ref[prop] = value.value;
							}
						}
					}
				}
			}
		};
		
		this.getData = function()
		{
			return DATA;
		};
		
		/**
		 * Removes a value registered under a 'name'.
		 */
		this.remove = function(name)
		{
			if(DATA[name] != null)
			{
				var value = DATA[name];
				
				if(value.consty)
				{
					return false;
				}
				
				DATA[name] = null;
				
				delete(DATA[name]);
				
				return true;
			}
			else
			{
				return false;
			}
		};
		
		this.reset = function()
		{
			DATA = new Object();
			counter = 0;
		};
		
		// gets a variable from the registry
		this.get = function(name)
		{
			if(DATA[name] != null)
			{
				return DATA[name].value;
			}
			else
			{
				return null;
			}
		};
	};

	qq.Registry.prototype = {};

}).apply(this, [qq]);