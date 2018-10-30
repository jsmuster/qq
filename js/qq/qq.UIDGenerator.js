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

				registerUIDGenerator(qq);
				
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

	function registerUIDGenerator(qq)
	{
		var MD5;
		
		if(_isNode)
		{
			
			//var _qq = require('./encryption/MD5.js');
			
			MD5 = qq.encryption.MD5;
		}
		else
		{
			MD5 = qq.encryption.MD5;
		}
		/**
		* The UID Generator generates uid keys.
		*/
		qq.UIDGenerator = function()
		{
			/**
			 * Get random string.
			 */
			var strs = new Object(),
				uids = new Object();
			
			function completeString(arg1, strlen)
			{
				var str = null,
						tempStr = null,
						i = 0,
						l = 0;
				
				str = arg1.toString();
				
				if(str.length == strlen)
				{
					return str;
				}
				
				tempStr = "";
				i = 0;
				l = str.length;
				
				while(i < (strlen - l))
				{
					tempStr = tempStr + "0";
					i += 1;
				}
				
				tempStr = tempStr + str;
				
				return tempStr;
			}
			
			function getRandomStr()
			{
				var randomStr = completeString(Math.round(Math.random() * 100000000000000000), 17);
				
				if(strs[randomStr] !== true)
				{
					strs[randomStr] = true;
					
					return randomStr;
				}
				else
				{
					return getRandomStr();
				}
			}
			
			var has = function (uid)
			{
				return (uids[uid] === true);
			};
			this.has = has;
			
			var generate = function()
			{
				var l1 = new Date(),
					l2 = null,
					year = completeString(l1.getFullYear(), 4),
					month = completeString(l1.getMonth(), 2),
					date = completeString(l1.getDate(), 2),
					day = l1.getDay().toString(),
					hours = completeString(l1.getHours(), 2),
					minutes = completeString(l1.getMinutes(), 2),
					seconds = completeString(l1.getSeconds(), 2),
					miliseconds = completeString(l1.getMilliseconds(), 3),
					randomStr = getRandomStr(),
					uid;
				
				l2 = year + month + date + day + hours + minutes + seconds + miliseconds + randomStr;
				//console.log("hash", MD5.hash)
				uid = MD5.hash(l2);
				
				uids[uid] = true;
				
				return uid;
			};

			this.generate = generate;
		};
	};

	if(_isNode === false)
	{
		registerUIDGenerator(qq);
	}

}).apply(this, [qq]);