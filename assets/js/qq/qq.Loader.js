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

				registerLoader(qq);
				
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

	//var {UIDGenerator} = require("./qq.UIDGenerator.js");

	function registerLoader(qq)
	{
		var generator = new qq.UIDGenerator();

		var LoaderRequest = function(cls, src)
		{
			this.type = "GET";

			/* request class such as "image" "json" "xml" or others */
			this.cls = cls;

			/* url of the data source */
			this.source = null;

			if(src != null && src.length > 0)
			{
				this.source = src;
			}

			/* object where 'stuff' gets loaded, like an Image reference */
			this.ref = null;

			this.text = null;
			this.blocking = false;

			this.appendTo = null;

			this.init = null;

			this.complete = null;
			this.progress = null;
			this.error = null;

			/* on abort callback */
			this.abort = null;
			
			this.total = null;
			this.end = null;

			/* object with all the key / value pairs that get passed with request */
			this.data = null;

			/* add a custom random variable to the url source or keep it cacheable by the browser and let the browser take care of it */
			this.cacheable = false;

			var getFullSource = function ()
			{
				var src = this.source,
					cacheable = this.cacheable,
					data = this.data;
				
				if(this.type.toLowerCase() == "GET")
				{
					var urlvars = "";
					
					if(data != null)
					{
						for(var each in data)
						{
							urlvars += (each + "=" + data[each] + "&");
						}
					}
					
					if(urlvars.length > 1)
					{
						src += "?" + urlvars;
						
						if(cacheable != true)
						{
							src += "&qq9i=" + generator.generateUID();
						}
					}
					else if(cacheable != true)
					{
						src += "?qq9i=" + generator.generateUID();
					}
					
					return src;
				}
				else
				{
					if(cacheable != true)
					{
						return src + "?qq9i=" + generator.generateUID();
					}
					else
					{
						return src;
					}
				}
			};

			this.getFullSource = getFullSource.bind(this);
		};

		var LoaderGroup = function()
		{
			this.complete = null;
			this.progress = null;
			this.error = null;
		};

		var Loader = (function()
		{
			/* Internal Loader Token */
			var LoaderToken = function (request)
			{
				this.request = request;

				this.src = '';
				this.asynchronous = true;
				this.complete;
			};
			
			var alone = [],
				groups = {},
				processInterval,
				intervalFrequency,
				groupEvents;

			/** 
			 * Destroy token.
			 * @token token reference
			 */
			var destroyToken = function(token)
			{
				var request = token.request,
					ref = request.ref;

				if(request.cls == "image" || (ref instanceof Image))
				{
					if(token.error != null)
					{
						ref.removeEventListener("error", token.error);
						token.error = null;
					}

					if(token.abort != null)
					{
						ref.removeEventListener("abort", token.abort);
						token.abort = null;
					}

					if(token.load != null)
					{
						ref.removeEventListener("load", token.load);
						token.load = null;
					}
				}
				else if(request.cls == "script")
				{
					if(token.fail != null)
					{
						token.fail = null;
					}

					if(token.load != null)
					{
						token.load = null;
					}
				}
			};

			/** 
			 * Process token.
			 * @token token reference
			 * 
			 */
			var processToken = function(token, isGrouped)
			{
				var request = token.request,
					ref = request.ref,
					total = 0,
					loaded = 0,
					res = {
						progress: false,
						cancel: false,
						complete: false,
						total: 0,
						loaded: 0
					};

				if(request.cls == "image" || ref instanceof Image)
				{
					total = 1;

					if(ref.complete == true && token.loaded == true)
					{
						loaded = 1;
					}
				}
				else if(request.cls = "script")
				{
					total = 1;

					if(token.loaded == true)
					{
						loaded = 1;
					}
				}
				else if(request.cls = "xml")
				{
					total = 1;

					if(token.loaded == true)
					{
						loaded = 1;
					}
				}

				if(loaded == total && (loaded > 0 && total > 0))
				{
					request.endTimer = (new Date()).getTime();

					if(isGrouped == false)
					{
						if(request.complete != null)
						{
							try
							{
								request.complete(request);
							}
							catch(e)
							{
								throw new qq.Error("qq.Loader", "processToken", "Error executing the 'complete' callback for request. (guid:"+ guid +"), (i:" + i + ").");
							}
						}
					}

					res.complete = true
				}
				else
				{
					if(token.abort != null && token.abort != false)
					{
						res.cancel = true;
						destroyToken(token);

						if(request.abort != null && typeof(request.abort) == "function")
						{
							request.abort(request);
						}
					}
					else if(token.error != null && token.error == true)
					{
						if(request.getFullSource != null && request.getFullSource() != null)
						{
							res.cancel = true;
							destroyToken(token);

							if(request.error != null)
							{
								try
								{
									request.error(request);
								}
								catch(e)
								{
									throw new qq.Error("qq.Loader", "processToken", "Error executing the 'complete' callback for request. (guid:"+ guid +"), (i:" + i + ").");
								}
							}
						}
					}
					else
					{
						res.progress = true;

						if(request.progress != null)
						{
							try
							{
								request.progress(request);
							}
							catch(e)
							{
								throw new qq.Error("qq.Loader", "processToken", "Error executing the 'complete' callback for request. (guid:"+ guid +"), (i:" + i + ").");
							}
						}
					}
				}
			}; /* end processToken method */

			/** 
			 * loader interval processor.
			 * @token token reference
			 * 
			 */
			var intervalProcessor = function ()
			{
				var token, request, ref, res;

				/* process tokens that load by themselves */
				for(var i = 0, l = alone.length; i < l; i++)
				{
					token = alone[i];

					request = token.request;

					res = processToken(token);

					if(res.complete == true || res.cancel == true)
					{
						/* cut out element from the array */
						alone.splice(i, 1);
					}
				}

				/* process groups */
				var loaded, 
					total,
					bytesTotal,
					bytesLoaded,
					i, 
					l;

				for(var guid in groups)
				{
					group = groups[guid];

					if(group != null)
					{
						/* reset group variables and process a group */
						loaded = 0;
						total = group.length;

						bytesTotal = 0;
						bytesLoaded = 0;

						for(i = 0, l = group.length; i < l; i++)
						{
							token = group[i];

							request = token.request;

							res = processToken(token, true);

							bytesTotal += res.total;
							bytesLoaded += res.loaded;

							if(res.complete == true)
							{
								loaded++;
							}
							else if(res.cancel == true)
							{
								// 
							}
							else if(res.progress == true)
							{
								try
								{
									if(typeof(request.progress) == "function")
									{
										request.progress(loaded, total, request);
									}
								}
								catch(e)
								{
									throw new qq.Error("qq.Loader","","Error executing the 'complete' callback for request. (guid:"+ guid +"), (event i:" + i + ").");
								}
							}
						} /* end for group */

						/* all the elements in a group loaded, proceed with executing group complete methods */
						if(loaded == total)
						{
							for(i = 0, l = group.length; i < l; i++)
							{
								token = group[i];

								request = token.request;

								if(request != null && typeof(request.complete) == "function")
								{
									try
									{
										request.complete(request);
									}
									catch(e)
									{
										throw new qq.Error("qq.Loader: Error executing the 'complete' callback for request. (guid:"+ guid +"), (event i:" + i + ").");
									}
								}
							}

							/* execute group complete events */
							if(group.events != null && group.events.length > 0)
							{
								var events = group.events;

								for(var i = 0, l = events.length; i < l; i++)
								{
									if(events[i] != null && typeof(events[i].complete) == "function")
									{
										try
										{
											events[i].complete(loaded, total, bytesLoaded, bytesTotal);
										}
										catch(e)
										{
											throw new qq.Error("qq.Loader: Error executing the 'complete' callback for request. (guid:"+ guid +"), (event i:" + i + ").");
										}
									}
								}
							}

							groups[guid] = null;

							delete(groups[guid]);
						} /* end if loaded == total - all items in the group loaded */
						else
						{
							/* the total and loaded aren't the same, so group didn't load all the way - in progress */
							if(group.events != null && group.events.length > 0)
							{
								var events = group.events;

								for(var i = 0, l = events.length; i < l; i++)
								{
									if(events[i] != null && typeof(events[i].progress) == "function")
									{
										try
										{
											events[i].progress(loaded, total, bytesLoaded, bytesTotal);
										}
										catch(e)
										{
											throw new qq.Error("qq.Loader: Error executing the 'progress' callback for request. (guid:"+ guid +"), (event i:" + i + ").");
										}
									}
								}
							}
						}

					} /* if group != null */

				} /* end for groups */
			};

			var handlers = {img:{}, script:{}, xml:{}};

			handlers.img.error = function ()
			{
				this.error = true;
			};

			handlers.img.abort = function ()
			{
				this.abort = true;
			};

			handlers.img.load = function ()
			{
				this.loaded = true;
			};

			handlers.script.load = function ()
			{
				this.loaded = true;
			};

			handlers.script.fail = function (xhr, exception, thrownError)
			{
				var msg,
					statusErrorMap = {
						'400' : "Server understood the request but request content was invalid.",
						'401' : "Unauthorised access.",
						'403' : "Forbidden resouce can't be accessed",
						'500' : "Internal Server Error.",
						'503' : "Service Unavailable"
					};
					
					if(xhr.status > 200)
					{
						msg = statusErrorMap[xhr.status];
						
						if(!msg)
						{
							msg = "Unknow Error.";
						}
					}
					else if(exception == 'parsererror')
					{
						msg = "Parsing Javascript source failed.";
					}
					else if(exception == 'timeout')
					{
						msg = "Request Time out.";
					}
					else if(exception == 'abort')
					{
						msg = "Request was aborted by the server";
					}
					else
					{
						msg = "Unknow Error.";
					}
					
					this.error = true;
					this.errorMsg = msg + " " + thrownError.message;
			};

			handlers.xml.error = function (xhr, exception, thrownError)
			{
				var msg, 
					statusErrorMap = {
						'400' : "Server understood the request but request content was invalid.",
						'401' : "Unauthorised access.",
						'403' : "Forbidden resouce can't be accessed",
						'500' : "Internal Server Error.",
						'503' : "Service Unavailable"
					};

				if(xhr.status > 200)
				{
					msg = statusErrorMap[xhr.status];
					
					if(!msg)
					{
						msg = "Unknown Error.";
					}
				}
				else if(exception=='parsererror')
				{
					msg = "Error: Parsing XML Request failed.";
				}
				else if(exception=='timeout')
				{
					msg = "Request Time out.";
				}
				else if(exception=='abort')
				{
					msg = "Request was aborted by the server";
				}
				else
				{
					msg = "Unknown Error.";
				}

				this.error = true;
				this.errorMsg = msg + " " + thrownError.message;

				if(tryLoadCount <= 5 && (src != null && src != ""))
				{
					setTimeout( function ()
					{
						$.ajax({
							type: "GET",
							url: src,
							dataType: "xml",
							success: token.load,
							error: token.error
						}, 30000);
					});
				}
			};

			handlers.xml.load = function ()
			{
				this.loaded = true;
				this.request.ref = doc;
				this.request.text = jqXHR.responseText;
			};

			/** 
			 * Loads object.
			 * @token token reference
			 */
			var loadToken = function (token)
			{
				var request = token.request;

				var tryLoadCount = 0;

				if(request != null)
				{
					request.start = (new Date()).getTime();

					var ref = request.ref,
						src,
						refjq,
						srcattr;
					//console.log("req111", lclQQ.console);

					console.log("req111", request);

					src = request.getFullSource();

					if(request.cls == "image" || ref instanceof Image)
					{
						token.error = qq.delegate.create(token, handlers.img.error);
						token.abort = qq.delegate.create(token, handlers.img.abort);
						token.load = qq.delegate.create(token, handlers.img.load);

						ref.addEventListener("error", token.error);
						ref.addEventListener("abort", token.abort);
						ref.addEventListener("load", token.load);

						$(ref).attr("src", src);
					}
					else if(request.cls == "script")
					{
						token.fail = qq.delegate.create(token, handlers.script.fail);
						token.load = qq.delegate.create(token, handlers.script.load);

						$.getScript(src).done(token.load).fail(token.fail);
					}
					else if(request.cls = "xml")
					{
						token.error = qq.del.create(token, handlers.xml.error);
						token.load = qq.del.create(token, handlers.xml.load);

						var rtype = "GET";

						if(token.type == "POST")
						{
							rtype = "POST";
						}

						$.ajax({
							type: rtype,
							url: src,
							dataType: "xml",
							success: token.load,
							error: token.error
						});
					}
				}
			};

			/** 
			 * Adds group events to a particular group.
			 * @group group name
			 */
			var addGroupEvents = function (guid, complete, progress, error)
			{
				if(groups[guid] != null)
				{
					group = groups[guid];

					group.events.push({complete:complete, progress: progress, error: error});
				}
			};

			/** 
			 * Loads a Request object and / or associates it with a group
			 * @request qq.loader.request object
			 * @guid a unique group name
			 */
			var load = function (request, guid)
			{
				var token = new LoaderToken(request);

				/* group uid */
				if(guid != null && guid.length > 0)
				{
					if(groups[guid] == null)
					{
						groups[guid] = [];
						groups[guid].events = [];
					}

					group = groups[guid];
					
					group.push(token);
				}
				else
				{
					alone.push(token);

					loadToken(token);

					clearInterval(processInterval);
					processInterval = setInterval(intervalProcessor.bind(this), intervalFrequency);
				}

				return token;
			};

			/** 
			 * Initializes a group
			 * @guid a unique group name
			 */
			var initGroup = function (guid)
			{
				if(guid != null && guid.length > 0)
				{
					if(groups[guid] == null)
					{
						groups[guid] = [];
					}

					group = groups[guid];

					var token, loaded = 0;

					for(var i = 0, l = group.length; i < l; i++)
					{
						token = group[i];

						loadToken(token);

						loaded++;
					}

					if(loaded > 0)
					{
						clearInterval(processInterval);
						processInterval = setInterval(intervalProcessor.bind(this), intervalFrequency);

						/* returns true if something got loaded */
						return true;
					}
				}

				/* returns false if nothing got loaded */
				return false;
			};
			

			return {load:load,
				initGroup: initGroup,
				addGroupEvents: addGroupEvents
			};

		});
		
		qq.Loader = new Loader();
		qq.loader = qq.Loader;

		qq.loader.create = function()
		{
			return new Loader();
		};

		qq.Loader.Request = LoaderRequest;
		qq.Loader.request = LoaderRequest;

		qq.Loader.Group = LoaderGroup;
		qq.Loader.group = LoaderGroup;
	};

	if(_isNode == false)
	{
		registerLoader(qq);
	}

}).apply(this, [qq]);