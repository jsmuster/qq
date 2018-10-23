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

console.log("- injected qq.Delegate.js");

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

	qq.Delegate =
	{
		create: function(ref, fn)
		{
			var execTimes = -2;

			if(arguments.length >= 2)
			{
				/* check if the 2nd argument is a number and 3rd a function */
				if(arguments.length >= 3)
				{
					var istart = 2;

					if(typeof(fn) == "number")
					{
						execTimes = fn;
						fn = arguments[2];

						istart = 3;
					}

					/* the delegate is identical to one bellow in next if else statement */
					var delegate = function ()
					{
						var execTimes = arguments.callee.execTimes,
							execCount = arguments.callee.execCount;

						if(execCount > 0 || execTimes == -2)
						{
							var fn2 = arguments.callee.fnRef,
								objRef2 = arguments.callee.objRef,
								args = arguments.callee.args,
								newArgs = [],
								i, l;
							
							for(i = 0, l = args.length; i < l; i++)
							{
								newArgs[i] = args[i];
							}
							
							for(i = 0, l = arguments.length; i < l; i++)
							{
								newArgs[newArgs.length] = arguments[i];
							}

							execCount--;
							
							arguments.callee.execCount = execCount;
							
							return fn2.apply(objRef2, newArgs);
						}
						else
						{
							return null;
						}
					};
					
					delegate.fnRef = fn;
					delegate.objRef = ref;
					
					delegate.execTimes = execTimes;
					delegate.execCount = execTimes;
					
					var args = new Array();
					
					for(i = istart, l = arguments.length; i < l; i++)
					{
						args[args.length] = arguments[i];
					}
					
					delegate.args = args;
					
					return delegate;
				}
				else
				{
					if(fn == null)
					{
						throw new qq.Error("Delegate.create: Invalid 'fn' reference.");
					}
					
					if(ref == null)
					{
						throw new qq.Error("Delegate.create: Invalid 'ref' reference.");
					}

					/* if we didn't mention a reference but want to create a delegate with a set of pre-defined arguments */
					if((typeof(ref) == "function" && typeof(fn) != "function"))
					{
						/* the delegate is identical to one bellow in next if else statement */
						var delegate = function ()
						{
							var fn2 = arguments.callee.fnRef,
								objRef2 = arguments.callee.objRef,
								args = arguments.callee.args,
								newArgs = [],
								i, l;
							
							for(i = 0, l = args.length; i < l; i++)
							{
								newArgs[i] = args[i];
							}
							
							for(i = 0, l = arguments.length; i < l; i++)
							{
								newArgs[newArgs.length] = arguments[i];
							}

							return fn2.apply(objRef2, newArgs);
						};
						
						delegate.fnRef = ref;
						delegate.objRef = {};
						
						delegate.args = [fn];
					
						return delegate;
					}
					else if((typeof(ref) == "number" && typeof(fn) == "function"))
					{
						var istart = 2;
						
						execTimes = ref;

						/* the delegate is similar to one above the statement */
						var delegate = function ()
						{
							var execTimes = arguments.callee.execTimes,
								execCount = arguments.callee.execCount;

							if(execCount > 0 || execTimes == -2)
							{
								var fn2 = arguments.callee.fnRef,
									objRef2 = arguments.callee.objRef,
									i, l;
								
								execCount--;
								
								arguments.callee.execCount = execCount;
								
								return fn2.apply(objRef2, arguments);
							}
							else
							{
								return null;
							}
						};
						
						delegate.fnRef = fn;
						delegate.objRef = {};
						
						delegate.execTimes = execTimes;
						delegate.execCount = execTimes;
						
						return delegate;
					}
					else
					{
						return fn.bind(ref);
					}
				}
			}
			else
			{
				throw new qq.Error("Delegate.create: Invalid 'ref' & 'fn' references.");
			}
		},
		destroy: function(delegate)
		{
			delegate.fnRef = null;
			delegate.objRef = null;
			delegate.args = null;
		}
	};

	qq.delegate = qq.Delegate;
	qq.del = qq.delegate;

}).apply(this, [qq]);