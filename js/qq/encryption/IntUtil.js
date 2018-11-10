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

console.log("- injected encryption/IntUtil.js");

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

				registerIntUtil(qq);
				
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

	function registerIntUtil(qq)
	{
		/*  */
		if(qq.encryption == null)
		{
			qq.encryption = {};
		}
		
		qq.encryption.IntUtil = (function()
		{
			var hexChars = "0123456789abcdef";
			
			return {
				
				rol: function(x, n)
				{
					return ( x << n ) | ( x >>> ( 32 - n ) );
				},
				
				ror: function(x, n)
				{
					var nn = 32 - n;
					
					return ( x << nn ) | ( x >>> ( 32 - nn ) );
				},
				
				toHex: function(n, bigEndian)
				{
					var s = "";
					
					if(bigEndian)
					{
						for(var i = 0; i < 4; i++ )
						{
							s += hexChars.charAt( ( n >> ( ( 3 - i ) * 8 + 4 ) ) & 0xF ) 
								+ hexChars.charAt( ( n >> ( ( 3 - i ) * 8 ) ) & 0xF );
						}
					}
					else
					{
						for(var x = 0; x < 4; x++ )
						{
							s += hexChars.charAt( ( n >> ( x * 8 + 4 ) ) & 0xF )
								+ hexChars.charAt( ( n >> ( x * 8 ) ) & 0xF );
						}
					}
					
					return s;
				}
			};
			
		}());

	};

	if(_isNode == false)
	{
		registerIntUtil(qq);
	}

}).apply(this, [qq]);