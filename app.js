
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
		// adding routes
		var appRouter = qq.rr.add(/stocks\/(.*)/, function()
		{
			var msg = 'stock page xxxx';

		    qq.console(msg);
		})
		.add(function()
		{
			var msg = 'main page';
			
		    qq.console(msg);
		})
		.add("login", function ()
		{
			var msg = 'login page';

			//qq.loadModule({id:"mmOrders"});
			
			qq.init({module:"mmOrders"});
			
			qq.console(msg);
		})
		.add("cart", function ()
		{
			var msg = 'cart page';

			//qq.loadModule({id:"mmCart"});
			//debugger;
			qq.init({module:"mmCart"});
			
			qq.console(msg);
		})
		.add("account", function ()
		{
			var msg = 'account';
			
			qq.console(msg);
		})
		.add("account/banking", function ()
		{
			var msg = 'account banking';
			
			qq.console(msg);
		})
		.add("account/history", function ()
		{
			var msg = 'account history';
			
			qq.console(msg);
		})
		.add("account/settings", function ()
		{
			var msg = 'account settings';
			
			qq.console(msg);
		})
		.add("account/referral", function ()
		{
			var msg = 'account referral';
			
			qq.console(msg);
		});

		return appRouter;
	};
	
	//debugger;

	if(_isNode == false)
	{
		runApp(qq);
	}

}).apply(this, [qq]);

