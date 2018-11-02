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

			module.exports = function (qqref)
			{
				if(qqref != null)
				{
					qq = qqref;
				}

				registerMD5(qq);
				
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

	function registerMD5(qq)
	{
		if(qq.encryption == null)
		{
			qq.encryption = {};
		}

		var IntUtil;

		/* IMPORTS */
		if(_isNode)
		{
			//var incqq = require('./IntUtil.js');

			IntUtil = qq.encryption.IntUtil;
		}
		else
		{
			IntUtil = qq.encryption.IntUtil;
		}

		qq.encryption.MD5 = (function()
		{
			function f(x, y, z)
			{
				return ( x & y ) | ( (~x) & z );
			};
			
			function g(x, y, z)
			{
				return ( x & z ) | ( y & (~z) );
			};
			
			function h(x, y, z)
			{
				return x ^ y ^ z;
			};
			
			function i(x, y, z)
			{
				return y ^ ( x | (~z) );
			};
			
			function transform(func, a, b, c, d, x, s, t)
			{
				var newInt = parseInt(func( b, c, d )),
					tmp;
				
				if(newInt == NaN)
				{
					newInt = 0;
				}
				
				tmp = a + newInt + x + t;
				
				return IntUtil.rol( tmp, s ) +  b;
			};
			
			function ff( a, b, c, d, x, s, t)
			{
				return transform( f, a, b, c, d, x, s, t );
			};
			
			function gg( a, b, c, d, x, s, t)
			{
				return transform( g, a, b, c, d, x, s, t );
			};
			
			function hh( a, b, c, d, x, s, t)
			{
				return transform( h, a, b, c, d, x, s, t );
			};
			
			function ii( a, b, c, d, x, s, t)
			{
				return transform( i, a, b, c, d, x, s, t );
			};
			
			function createBlocks( s)
			{
				var blocks = new Array(),
					len = s.length * 8,
					mask = 0xFF,
					i = 0;
				
				for(; i < len; i += 8 )
				{
					blocks[ i >> 5 ] |= ( s.charCodeAt( i / 8 ) & mask ) << ( i % 32 );
				}
				
				// append padding and length
				blocks[ len >> 5 ] |= 0x80 << ( len % 32 );
				blocks[ ( ( ( len + 64 ) >>> 9 ) << 4 ) + 14 ] = len;
				
				return blocks;
			};
			
			return {hash: function(s)
			{
				// initialize the md buffers
				var a = 1732584193,
					b = -271733879,
					c = -1732584194,
					d = 271733878,
					aa,
					bb,
					cc,
					dd,
					x = createBlocks(s),
					len = x.length,
					i = 0;
				
				// loop over all of the blocks
				for ( ; i < len; i += 16)
				{
					// save previous values
					aa = a;
					bb = b;
					cc = c;
					dd = d;				
					
					// Round 1
					a = ff( a, b, c, d, x[i+ 0],  7, -680876936 ); 	// 1
					d = ff( d, a, b, c, x[i+ 1], 12, -389564586 );	// 2
					c = ff( c, d, a, b, x[i+ 2], 17, 606105819 ); 	// 3
					b = ff( b, c, d, a, x[i+ 3], 22, -1044525330 );	// 4
					a = ff( a, b, c, d, x[i+ 4],  7, -176418897 ); 	// 5
					d = ff( d, a, b, c, x[i+ 5], 12, 1200080426 ); 	// 6
					c = ff( c, d, a, b, x[i+ 6], 17, -1473231341 );	// 7
					b = ff( b, c, d, a, x[i+ 7], 22, -45705983 ); 	// 8
					a = ff( a, b, c, d, x[i+ 8],  7, 1770035416 ); 	// 9
					d = ff( d, a, b, c, x[i+ 9], 12, -1958414417 );	// 10
					c = ff( c, d, a, b, x[i+10], 17, -42063 ); 		// 11
					b = ff( b, c, d, a, x[i+11], 22, -1990404162 );	// 12
					a = ff( a, b, c, d, x[i+12],  7, 1804603682 ); 	// 13
					d = ff( d, a, b, c, x[i+13], 12, -40341101 ); 	// 14
					c = ff( c, d, a, b, x[i+14], 17, -1502002290 );	// 15
					b = ff( b, c, d, a, x[i+15], 22, 1236535329 ); 	// 16
					
					// Round 2
					a = gg( a, b, c, d, x[i+ 1],  5, -165796510 ); 	// 17
					d = gg( d, a, b, c, x[i+ 6],  9, -1069501632 );	// 18
					c = gg( c, d, a, b, x[i+11], 14, 643717713 ); 	// 19
					b = gg( b, c, d, a, x[i+ 0], 20, -373897302 ); 	// 20
					a = gg( a, b, c, d, x[i+ 5],  5, -701558691 ); 	// 21
					d = gg( d, a, b, c, x[i+10],  9, 38016083 ); 	// 22
					c = gg( c, d, a, b, x[i+15], 14, -660478335 ); 	// 23
					b = gg( b, c, d, a, x[i+ 4], 20, -405537848 ); 	// 24
					a = gg( a, b, c, d, x[i+ 9],  5, 568446438 ); 	// 25
					d = gg( d, a, b, c, x[i+14],  9, -1019803690 );	// 26
					c = gg( c, d, a, b, x[i+ 3], 14, -187363961 ); 	// 27
					b = gg( b, c, d, a, x[i+ 8], 20, 1163531501 ); 	// 28
					a = gg( a, b, c, d, x[i+13],  5, -1444681467 );	// 29
					d = gg( d, a, b, c, x[i+ 2],  9, -51403784 ); 	// 30
					c = gg( c, d, a, b, x[i+ 7], 14, 1735328473 ); 	// 31
					b = gg( b, c, d, a, x[i+12], 20, -1926607734 );	// 32
					
					// Round 3
					a = hh( a, b, c, d, x[i+ 5],  4, -378558 ); 	// 33
					d = hh( d, a, b, c, x[i+ 8], 11, -2022574463 );	// 34
					c = hh( c, d, a, b, x[i+11], 16, 1839030562 ); 	// 35
					b = hh( b, c, d, a, x[i+14], 23, -35309556 ); 	// 36
					a = hh( a, b, c, d, x[i+ 1],  4, -1530992060 );	// 37
					d = hh( d, a, b, c, x[i+ 4], 11, 1272893353 ); 	// 38
					c = hh( c, d, a, b, x[i+ 7], 16, -155497632 ); 	// 39
					b = hh( b, c, d, a, x[i+10], 23, -1094730640 );	// 40
					a = hh( a, b, c, d, x[i+13],  4, 681279174 ); 	// 41
					d = hh( d, a, b, c, x[i+ 0], 11, -358537222 ); 	// 42
					c = hh( c, d, a, b, x[i+ 3], 16, -722521979 ); 	// 43
					b = hh( b, c, d, a, x[i+ 6], 23, 76029189 ); 	// 44
					a = hh( a, b, c, d, x[i+ 9],  4, -640364487 ); 	// 45
					d = hh( d, a, b, c, x[i+12], 11, -421815835 ); 	// 46
					c = hh( c, d, a, b, x[i+15], 16, 530742520 ); 	// 47
					b = hh( b, c, d, a, x[i+ 2], 23, -995338651 ); 	// 48
					
					// Round 4
					a = ii( a, b, c, d, x[i+ 0],  6, -198630844 ); 	// 49
					d = ii( d, a, b, c, x[i+ 7], 10, 1126891415 ); 	// 50
					c = ii( c, d, a, b, x[i+14], 15, -1416354905 );	// 51
					b = ii( b, c, d, a, x[i+ 5], 21, -57434055 ); 	// 52
					a = ii( a, b, c, d, x[i+12],  6, 1700485571 ); 	// 53
					d = ii( d, a, b, c, x[i+ 3], 10, -1894986606 );	// 54
					c = ii( c, d, a, b, x[i+10], 15, -1051523 ); 	// 55
					b = ii( b, c, d, a, x[i+ 1], 21, -2054922799 );	// 56
					a = ii( a, b, c, d, x[i+ 8],  6, 1873313359 ); 	// 57
					d = ii( d, a, b, c, x[i+15], 10, -30611744 ); 	// 58
					c = ii( c, d, a, b, x[i+ 6], 15, -1560198380 );	// 59
					b = ii( b, c, d, a, x[i+13], 21, 1309151649 ); 	// 60
					a = ii( a, b, c, d, x[i+ 4],  6, -145523070 ); 	// 61
					d = ii( d, a, b, c, x[i+11], 10, -1120210379 );	// 62
					c = ii( c, d, a, b, x[i+ 2], 15, 718787259 ); 	// 63
					b = ii( b, c, d, a, x[i+ 9], 21, -343485551 ); 	// 64
			
					a += aa;
					b += bb;
					c += cc;
					d += dd;
				}
				
				// Finish up by concatening the buffers with their hex output
				return IntUtil.toHex( a ) + IntUtil.toHex( b ) + IntUtil.toHex( c ) + IntUtil.toHex( d );
			}};
		
		}());

	};
	
	if(_isNode == false)
	{
		registerMD5(qq);
	}

}).apply(this, [qq]);