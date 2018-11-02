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

console.log("- injected qq.Registry.js");

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

				createRegistry(qq);
				
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

	function createRegistry(qq)
	{
		/**
		* QQ Value object
		*/
		qq.Value = function(data, uid, immutable)
		{
			/* figure out if the value will be a constant / immutable */
			if(immutable != null)
			{
				this.immutable = immutable;
			}
			else
			{
				this.immutable = false;
			}

			this.uid = uid;
			this.value = data;
		}
		qq.Value.prototype = {};


		/**
		* Bindable registry.
		*/
		qq.Registry = function()
		{
			var DATA = new Object(),
				BINDINGS = new Object(),
				uidcounter = 0;
			
			/** 
			 * Binds an item under 'uid' to a 'property' in another object.
			 * @uid unique property identifier
			 * @scope a property object
			 * @property a property name in the 'scope' object
			 */
			var bind = function(uid, scope, property)
			{
				var reg = BINDINGS[uid];
				
				if(reg == null)
				{
					reg = BINDINGS[uid] = new qq.Registry();
				}
				
				return reg.register(new qq.Value({scope:scope, property:property}));
			};
			this.bind = bind;
			
			/**
			 * Unbinds an item under 'uid' property.
			 * @uid unique property identifier
			 * @id registration id that was returned by 'bind' method
			 */
			var unbind = function(uid, id)
			{
				var reg = BINDINGS[uid];
				
				return reg.remove(id);
			};
			this.unbind = unbind;
			

			/**
			 * Sets a registry value & returns unique identifier for the value.
			 * @val returns unique identifier for the value.
			 * @uid, val uses 'uid' as unique identifier.
			 * @uid, val, const uses 'uid' as unique identifier and makes the 'value' constant, doesn't allow overwrite.
			 */
			var set = function()
			{
				var uid, /* property uid to set */
					val, /* value */
					vobj, /* value object token that holds the value and other configuration */
					immutable; /* indicates if the property registered is immutable */
				
				/* set a registry's value if its mutable */
				if(arguments.length >= 2)
				{
					uid = arguments[0];
					val = arguments[1];
					
					if(arguments.length == 3)
					{
						immutable = arguments[2];
						
						if(immutable !== false || immutable !== true)
						{
							immutable = false;
						}
					}
					else
					{
						immutable = false;
					}
					
					if(DATA[uid] == null)
					{
						vobj = new qq.Value(val, uid, immutable);
						
						DATA[uid] = vobj;
					}
					else
					{
						vobj = DATA[uid];
						
						if(vobj.immutable)
						{
							return null;
						}
						else
						{
							vobj = new qq.Value(val, uid, immutable);
							
							DATA[uid] = vobj;
						}
					}
				}
				else if(arguments.length == 1)
				{
					if(arguments[0] instanceof qq.Value)
					{
						vobj = arguments[0];
						
						if(vobj.uid != null)
						{
							DATA[vobj.uid] = vobj;
						}
						else
						{
							DATA[uidcounter] = vobj;
						}
					}
					else
					{
						vobj = new qq.Value(arguments[0]);
					
						DATA[uidcounter] = vobj;
					}

					vobj.uid = uidcounter + '';

					uidcounter++;
				}

				/* PROCESS the BINDINGS */
				
				processBinding(vobj);
				
				return vobj.uid;
			};
			this.set = set;

			/**
			 * Processes all the bindings for a given value.
			 */
			var processBinding = function (vobj)
			{
				/* registry of value object uid */
				var reg = BINDINGS[vobj.uid], 
					rval; /* registry value object */

				if(reg != null)
				{
					/* value object scope */
					var scope,
						prop, /* object scope property */
						rref;
					
					var data = reg.getData();

					for(var each in data)
					{
						rval = data[each];
						
						scope = rval.value.scope;
						prop = rval.value.property;
						
						/* process a registry binding  */
						if(scope instanceof qq.Registry)
						{
							rref = scope;
							rref.register(prop, vobj.value);
						}
						/* process a callback binding */
						else if(scope[prop] instanceof Function)
						{
							try
							{
								scope[prop].apply(scope, [vobj.value]);
							}
							catch(e)
							{
								throw new qq.Error("qq.Registry", "set", "callback in binding for uid = " + vobj.uid + " threw an error.\n" + e);
							}
						}
						else
						{
							/* process regular object binding */
							scope[prop] = vobj.value;
						}
					}

				} /* end processing bindings */
			};
			
			/**
			* Pushes all the data into associated bindings.
			*/
			var push = function()
			{
				var value, 
					reg, 
					regValue,
					data, 
					scope, 
					rref, 
					prop, 
					each;
				
				for(var uid in BINDINGS)
				{
					value = DATA[uid];
					
					if(value == null) continue;

					processBinding(value);
				}
			};
			this.push = push;
			
			/**
			* Returns the registry data object.
			*/
			var data = function()
			{
				return DATA;
			};
			this.data = data;
			
			/**
			 * Removes a value registered under a 'uid'.
			 */
			var remove = function(uid)
			{
				if(DATA[uid] != null)
				{
					var value = DATA[uid];
					
					if(value.immutable)
					{
						return false;
					}
					
					DATA[uid] = null;
					
					delete(DATA[uid]);
					
					return true;
				}
				else
				{
					return false;
				}
			};
			this.remove = remove;
			
			/**
			* Resets the registry.
			*/
			var reset = function(bindingToo)
			{
				DATA = new Object();
				uidcounter = 0;

				if(bindingToo === true)
				{
					BINDINGS = new Object();
				}
			};
			this.reset = reset;
			
			/**
			 * Retrieves a value under the 'uid'
			 */
			var get = function(uid)
			{
				if(DATA[uid] != null)
				{
					return DATA[uid].value;
				}
				else
				{
					return null;
				}
			};
			this.get = get;
		};

		qq.Registry.prototype = {};
	}

	if(_isNode == false)
	{
		createRegistry(qq);
	}

}).apply(this, [qq]);