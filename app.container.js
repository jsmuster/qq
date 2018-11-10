
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

				return runApp(qq);
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

	function runApp(qq)
	{
		var main;

		if(_isNode)
		{
			var fs = require("fs");
			var main = fs.readFileSync('./app.js');

			eval('(function() { ' + main + ' main()})();');
		}
		else
		{
			debugger;


			var loaded = {appscript:false, config:false};
			var appScript = null;

			/**
			* Executed before main(), after load config.json is loaded.
			*/
			var handleInitialAssetLoaded = function ()
			{
				if(loaded.appscript == true && loaded.config == true)
				{
					eval(`(function() { ` + appScript + ` 
						
						main();
						
						qq.rr.init();

					})();`);
				}
			};

			var handleMain = function (data, textStatus, jqXHR)
			{
				//console.log("app.js loaded data length = ", data.length, "textStatus", textStatus, "jqXHR", jqXHR);
				
				if(data != null && data.length > 0)
				{
					/* save app.js for later */
					appScript = data;

					loaded.appscript = true;

					handleInitialAssetLoaded();
				}
			};
		    
		    qq.$.ajax({
		        url: '/assets/js/app.js',
		        dataType: 'script',
		        success: handleMain,
		        async: true
		    });

		    //./config.json

		    var handleInitialConfig = function (data, textStatus, jqXHR)
			{
				if(data != null && typeof(data) == "object")
				{
					try
					{
						processConfigJSON(data);
					}
					catch(e)
					{
						throw new qq.Error("app.container", "handleInitialConfig", "Error processing config.json.\n" + e);
					}

					loaded.config = true;

					handleInitialAssetLoaded();
				}
				else if(data == null)
				{
					throw new qq.Error("app.container", "handleInitialConfig", "The data loaded is empty. Check 'config.json' or server access configuration.");
				}
				else
				{
					throw new qq.Error("app.container", "handleInitialConfig", "The data loaded but doesn't appear to be an object. (data) = " + data);
				}
			};
		    
		    qq.$.ajax({
		        url: '/assets/config.json',
		        dataType: 'json',
		        success: handleInitialConfig,
		        async: true
		    });

			//}
		}

		//main();

		//return appRouter;

	}; /* end runApp method */


	function processConfigJSON(data)
	{
		//debugger;

		/* setup access, read and cache tokens */

		/* Go through the access configuration & configure access points for the router */
		var accessToken, readToken, cacheToken;

		for(var path in data.access)
		{
			accessToken = data.access[path];

			qq.configure.access(path, accessToken);
		}

		// for(var path in data.read)
		// {
		// 	readToken = data.read[path];
		// }

		// for(var path in data.cache)
		// {
		// 	cacheToken = data.cache[path];
		// }

		/* setup application access */
		if(data.app != null)
		{
			if(data.app.container != null)
			{
				qq.configure("container", data.app.container);
			}

			if(data.app.controllers != null)
			{
				qq.configure("controllers", data.app.controllers);
			}

			if(data.app.views != null)
			{
				qq.configure("views", data.app.views);
			}

			if(data.app.modules != null)
			{
				var modules = data.app.modules, 
					mitem;

				for(var i = 0, l = modules.length; i < l; i++)
				{
					mitem = modules[i];

					/* module */
					if(typeof(mitem) == "object" && mitem.id != null)
					{
						/* passes an object {id:"mmOrders"} */
						qq.loadModule(mitem);
					}
					else if(typeof(mitem) == "string")
					{
						qq.loadModule({id: mitem});
					}
				}
			}
		}

	}; /* end processConfigJSON method */
	
	//debugger;

	if(_isNode == false)
	{
		runApp(qq);
	}

}).apply(this, [qq]);

