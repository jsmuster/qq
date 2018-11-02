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

				registerEventDispatcher(qq);
				
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

	function registerEventDispatcher(qq)
	{
		qq.Event = (function (path) {
			// 
			var dispatcher;
			
			// create a getter and empty setter - eventPath can only be set via constructor.
			var eventPath;
			
			// path is a hierarchial path like so 'com.cisco.SomeEvent'
			if(path == null)
			{
				throw new qq.Error("Event", "_constructor", "Event path is null.");
			}
			
			eventPath = path;
			
			/*if(bubble === false || bubble === true)
			{
				this.bubbles = bubble;
			}
			else
			{
				this.bubbles = true;
			}*/
			
			if(dispatcher == null)
			{
				//dispatcher = Application.getInstance().getEventDispatcher();
			}
			
			function getPath()
			{
				return eventPath;
			};
			this.getPath = getPath;
			
			
			function setPath(value)
			{
				throw new qq.Error("Event", "setPath", "The path is ready only.");
			}
			this.setPath = setPath;
			
		});

		qq.EventDispatcher = function () {

			var events = {children:{}, values:{}};

			var uidcounter = 0;
			
			// registers an event handler with that event
			// eventPath is a multi level path such as 'com.cisco.SomeEvent'
			// returns an identifier which can be used to remove the event
			function addEvent(eventPath, handler, timeout, onTimeOut)
			{
				var path = eventPath.split("."),
					name,
					escope = events;
				
				for(var i = 0, l = path.length; i < l; i++)
				{
					name = path[i];
					
					if(escope.children[name] == null)
					{
						escope.children[name] = {children:{}, values:{}};
					}
					
					escope = escope.children[name];
				}
				
				var euid = uidcounter;
				var config = {uid:euid};

				escope.values[euid] = {value:handler};

				config.values = escope.values;
				config.onTimeOut = onTimeOut;
				
				if(timeout > 0)
				{
					setTimeout(qq.Delegate.create(config, function()
					{
						delete(this.values[this.uid]);

						if(this.onTimeOut != null)
						{
							try
							{
								this.onTimeOut();
							}
							catch(e)
							{
								throw new qq.Error("EventDispatcher","addEvent","Error executing the onTimeOut callback for event ("+eventPath+")");
							}
						}
					}), timeout);
				}

				uidcounter++;

				return euid;
			};
			this.addEvent = addEvent;
			
			// removes the event handler from an event
			function removeEvent(eventPath, id)
			{
				var path = eventPath.split("."),
					name,
					escope = events;
				
				for(var i = 0, l = path.length; i < l; i++)
				{
					name = path[i];
					
					if(escope.children[name] == null)
					{
						escope.children[name] = {children:{}, values:{}};
					}
					
					escope = escope.children[name];
				}
				
				delete(escope.values[id]);

				return true;
			}
			this.removeEvent = removeEvent;
			
			// used to dispatch an event - event path can hierarchial like 'com.cisco.SomeEvent'
			// if event bubles then dispatch it for every node in the path 'com.cisco' as well as 'com' so we can register to 'com.cisco' and receive all the events.
			// all events bubble by default.
			function dispatchEvent(event)
			{
				if(typeof(event) == "string")
				{

				}
				else
				{
					var epath = event.getPath();

					if(epath != null)
					{
						var path = epath.split("."),
							name,
							escope = events,
							data,
							handler;

						//console.log(" * dispatchEvent "+ event.getPath());
						
						/* TODO OPTIMIZE - speed up the for loop of path access by checking path length and access the variables directly */
						for(var i = 0, l = path.length; i < l; i++)
						{
							name = path[i];
							
							if(escope.children[name] == null)
							{
								escope.children[name] = {children:{}, values:{}};
							}
							
							escope = escope.children[name];
						}
						
						data = escope.values;

						//console.log('* data ' + typeof(data));

						for(var each in data)
						{
							//console.log("each " + each);

							handler = data[each].value;
							
							try
							{
								//console.log("* handler " + handler);
								
								handler.apply(null, [event]);
							}
							catch(e)
							{
								throw new qq.Error("EventDispatcher", "dispatchEvent", "There was an error dispatching an event " + event.getPath() + ".\n" + e);
							}
						}
					}
					else
					{
						throw new qq.Error("EventDispatcher", "dispatchEvent", "Invalid event path:  ('" + epath + "'').\n" + e);
					}
				}
			};
			this.dispatchEvent = dispatchEvent;
		};

		/* global event dispatcher reference */
		qq.ed = new qq.EventDispatcher();

	};

	if(_isNode == false)
	{
		registerEventDispatcher(qq);
	}
	
}).apply(this, [qq]);