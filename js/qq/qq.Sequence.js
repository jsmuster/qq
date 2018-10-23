/* Sequence class */

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

'use strict';

console.log("- injected qq.Sequence.js");

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

try {
		qq.Sequence = (function (...rest)
		{
			/* set of all the registered generators */
			const set = new Set();

			/* set of all the generator objects */
			const generators = new Set();

			/* arguments */
			let args = [];

			/* specifies whether the Sequence is blocked */
			let locked = false;

			/* counts the number of animation frames executed */
			let counter = 0;

			/* CONSTRUCTOR */

			if(rest.length > 0)
			{
				let subset = new Set();

				for(const item of rest)
				{
					subset.add(item);
				}

				set.add(subset);
			}

			/* PRIVATE METHODS */

			const tick = now => 
			{
				/* executes the initial tick - gets all generator references. Convert a tree into a sequence. */
				if(counter == 0)
				{
					for(const subset of set)
					{
						for(const item of subset)
						{
							generators.add(item(args));
						}
					}

					counter++;
				}
				else
				{
					/* re-execute the generator sequence */
					for(const item of generators)
					{
						item.next();
					}

					/* add execution counter */
					counter++;
				}

				requestAnimationFrame(tick);
			};

			/* PUBLIC METHODS */

			/**
			* Adds a subset of generators into the sequence.
			*/
			const add = function (...rest)
			{
				if(locked == false)
				{
					let subset = new Set();

					for(const item of rest)
					{
						subset.add(item);
					}

					set.add(subset);
				}
			};

			/**
			* Starts the sequence.
			*/
			const start = function (...rest)
			{
				if(locked == false)
				{
					args = rest;

					/* lock the sequence so we can't start or add to it. */
					locked = true;

					requestAnimationFrame(tick);
				}
			};

			return {start:start, add:add};
		});

		qq.Sequence.prototype = {};
	}
	catch(e)
	{
		console.log("Error qq.Sequence: ", e);
	}
	finally
	{
		console.log("Loaded SEQUENCE")
	}
	
}).apply(this, [qq]);
//debugger;
//console.log("module this ", this)