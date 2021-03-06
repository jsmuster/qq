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

//'use strict';

/* this check and creation of the 'qq' object */
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

//console.log("(qq) " + qq);

/* qq Router module */
(function (qq) {
	
	try
	{
		console.log("- injected qq.Router.js");
	}
	catch(e)
	{
		alert("didn't inject qq.Router.js");
	}
	
	var root = null,
		_isNode = false;
	
	
	// these variable names are local to this module - ie this function scope
	// its nice because we can use local variables like '_isNode' in our 
	// root = 'window' in the browser, or 'global' on the server
	try
	{
		//console.log("(qqa) ");
		if(typeof module !== 'undefined' && module.exports)
		{
			root = this;
			//console.log("(qqa1) " + qq);
			module.exports = function (qqref)
			{
				if(qqref != null)
				{
					qq = qqref;
				}

				registerRouter(qq);
				
				return qq;
			};

			_isNode = true;
			
		}
		else
		{
			root = window;
			//console.log("(qqa2) ");
			root.qq = qq;
		}
	}
	catch(e)
	{
		//console.log("(qqb) " + qq);
		var qq = {};
	}
	
	//console.log("(qq2) " + qq);
	
	function registerRouter(qq)
	{
		qq.Router = (function ()
		{
			/* links are other concepts that help manage access, read content / properties and deliver them */
		    var links = [],
		    	routes = [],
		        // mode is history by default
		        mode = 'history',
		        rroot = '/',
		        interval = null,
		        /* configures the router, sets its mode and rroot */
		        config = function(options)
		        {
		        	// sets mode as 'history' or 'hash'
		            mode = options != null && options.mode != null && options.mode == 'history' && !!(history.pushState) ? 'history' : 'hash';
								
		            rroot = options != null && options.root != null ? '/' + clearSlashes(options.root) + '/' : '/';
								
		            return this;
		        },
		        /* returns the fragment of the current url ie page/contactus in a url http://site.com/page/contactus */
		        getFragment = function(url)
		        {
		        	//console.log("get frags " + url);
		            var fragment = '';
		            
		            if(arguments.length == 0)
		            {
		            	url = null;
		            }
								
		            if(mode === 'history')
		            {
		            	if(_isNode) console.log("@ fragment [" + url + "]");
		            	
		            	if(_isNode)
		            	{
		            		/* can use url = require('url'); urlParts = url.parse(req.url, true); urlParts.query, urlParts.pathname */
		            		/* this shouldn't run in Node */
		            		var clr = clearSlashes(url);
		            		
		            		//console.log("clr (" + clr + ")");
		            		
		            		return clr;
		            	}
		            	else
	            		{
	            			url = location.pathname + location.search;
	            		}
	            		
		                fragment = clearSlashes(decodeURI(url));
		                
		                fragment = fragment.replace(/\?(.*)$/, '');
		                
		                if(_isNode) console.log("@ fragment [" + fragment);
									
						/* so if the root isn't '/' then remove it */
	                	fragment = rroot != '/' ? fragment.replace(rroot, '') : fragment;
		            }
		            else
		            {
		                var match = window.location.href.match(/#(.*)$/);
		
		                fragment = match ? match[1] : '';
		            }
								
								/* trims '/' at start and end of the string */
		            return clearSlashes(fragment);
		        },
		        clearSlashes = function(path)
		        {
		            return path.toString().replace(/\/$/, '').replace(/^\//, '');
		        },
		        add = function(re, handler)
		        {
		            if(typeof re == 'function')
		            {
		                handler = re;
		                re = '';
		            }
		            
		            routes.push({ re: re, handler: handler});
		
		            return this;
		        },
		        remove = function(param)
		        {
		            for(var i = 0, r; i < routes.length, r = routes[i]; i++)
		            {
		                if(r.handler === param || r.re.toString() === param.toString())
		                {
		                    routes.splice(i, 1);
		
		                    return this;
		                }
		            }
		
		            return this;
		        },
		        reset = function()
		        {
		            routes = [];
		            mode = 'history';
		            rroot = '/';
		
		            return this;
		        },
		        /* performs the comparison against the router fragment string and executes a handler */
		        validate = function(f)
		        {
		        	//console.log("w3 f (" + f + ") " + typeof(f));
		        		
		            var fragment,
		                match, link, result;
		            
		            if(f != null && f.length >= 0)
		            {
		            	fragment = f;
		            }
		            else
	            	{
	            		fragment = getFragment();
	            	}

	            	/* process all the linked managers before validating the route */
	            	for(var i = 0, l = links.length; i < l; i++)
	            	{
	            		link = links[i];

	            		result = link.apply(null, [fragment]);

	            		if(result == false)
	            		{
	            			return false;
	            		}
	            	}

	            	/* validates the route */
		            for(var i = 0 ; i < routes.length; i++)
		            {
		                match = false;
		
		                if(routes[i].re instanceof RegExp)
		                {
		                    match = fragment.match(routes[i].re);
												
		                    if(match)
		                    {
		                        match.shift();
		
		                        try
		                        {
		                            routes[i].handler.apply({}, match);
		                        }
		                        catch(e)
		                        {
		                            console.log("Error executing the router handler : " + match, "\n", e);
		                        }
		                        
		
		                        return true;
		                    }
		                }
		                else if(typeof(routes[i].re) == "string")
		                {
		                    if(routes[i].re == fragment)
		                    {
		                        try
		                        {
		                            routes[i].handler.apply({}, [fragment]);
		                        }
		                        catch(e)
		                        {
		                            console.log("Error executing the router handler : " + fragment, "\n", e);
		                        }
		
		                        return true;
		                    }
		                }
		            }
		
		            return false;
		        },
		        /**
		        * Initializes the router.
		        * client - starts the router interval and keeps processing the window.url or custom services that retrieves the route path.
		        * 
		        */
		        init = function()
		        {
		        	var current, 
	        			url = null, 
	        			/* service function retrieves a fragment */
	        			getFragService = null;
		        	
		        	if(_isNode == false)
		        	{
			        	/* create a new delegate here so we can assign values to it later */
			        	var delRouteProcessor = function()
			            {
			            	/* retrieve assigned getFragService, which is a custom handler that retrieves the path fragment string */
			            	var getFragService = arguments.callee.getFragService,
			            		frag;
			            	
			            	try
							{
								if(getFragService != null)
								{
									/* trim a frag string - remove '/' at the ends of it */
									frag = clearSlashes(getFragService());
								}
								else
								{
									frag = getFragment();
								}
							}
							catch(e)
							{
								throw new qq.Error("Router", "del", "Error performing fragment retrieval.");
							}

							if(frag != null && current !== frag)
							{
								current = frag;
								validate(frag);
							}
			            }; /* end delRouteProcessor delegate */
		        	}
		        	
		        	/* figure out what the arguments were passed into this function and configure local variables */
		        	/* 2 arguments in this function - 1st is a url string, 2nd is a callback */
		        	if(arguments.length > 1)
		        	{
		        		url = arguments[0];
		        		getFragService = arguments[1];
		        		
		        		/* assign the frag service into the delegate as we discover it */
		        		if(_isNode == false) delRouteProcessor.getFragService = getFragService;
		        	}
		        	else if(arguments.length == 1)
		        	{
		        		if(typeof(arguments[0]) == "function")
		        		{
		        			getFragService = arguments[0];
		        			
		        			/* assign the frag service into the delegate as we discover it */
		        			if(_isNode == false) delRouteProcessor.getFragService = getFragService;
		        		}
		        		else
	        			{
	        				/* url */
	        				url = arguments[0];
	        			}
		        	}
		        	
		        	/* if url was passed then use it to figure out the current fragment */
	        		if(url != null && url.length > 0)
	        		{
	        			current = getFragment(url);
	        		}
	        		else
	      			{
	      				/* or use the fragment service passed into the router instead. The service function is used to figure out the fragment instead of the internal method */
	      				if(getFragService != null)
	      				{
	      					try
	      					{
	      						/* trip fragment from slahes '/' on each side left and right */
	      						current = clearSlashes(getFragService());
	      					}
	      					catch(e)
	      					{
	      						throw new qq.Error("Router", "init:getFragService", "Error performing fragment retrieval from frag service.");
	      					}
	      				}
	      				else
						{
							current = getFragment();
						}
	      			}
	      			
	      			//console.log("validate " + current);
	      			
	      			/* valide the current fragment and execute all the appropriate callback handlers */
	            	var isValid = validate(current) ? true : false;
	            	
	            	/* start interval if its browser based, ie not node (server based) */
	            	/* if the interval is started, the router pays attention to the current browser URL and reacts to any changes in the address */
	            	if(_isNode == false)
	            	{
	            		/* start the router interval for dynamic environments */
		           		clearInterval(interval);
		            	interval = setInterval(delRouteProcessor, 50);
	            	}

	            	return isValid;
		        },
		        stop = function ()
		        {
		            clearInterval(interval);
		
		            return this;
		        },
		        /* navigates the browser to the given path */
		        navigate = function(path)
		        {
		            path = path ? path : '';
		
		            if(mode == 'history')
		            {
		                history.pushState(null, null, rroot + clearSlashes(path));
		            }
		            else
		            {
		                window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
		            }
		
		            return this;
		        },
		        /**
		        * Links access manager or manager that loads external content.
		        */
		        link = function (ref)
		        {
		        	links.push(ref);
		        };
			
		    var router = {};
			
		    router.config = config.bind(router);
		    router.getFragment = getFragment.bind(router);
		    router.clearSlashes = clearSlashes.bind(router);
		    router.add = add.bind(router);
		    router.remove = remove.bind(router);
		    router.reset = reset.bind(router);
		    router.validate = validate.bind(router);
		    router.init = init.bind(router);
		    router.stop = stop.bind(router);
		    router.navigate = navigate.bind(router);
		    router.link = link.bind(router);
			
		    return router;
		
		})();

		qq.router = qq.Router;
		qq.rr = qq.Router;
	};

	if(_isNode == false)
	{
		registerRouter(qq);
	}

}).apply(this, [qq]);