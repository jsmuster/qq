function main()
{
	qq.rr.add(/stocks\/(.*)/, function()
	{
		var msg = 'stock page xxxx';

	    qq.console(msg);
	})
	.add(function()
	{
		var msg = 'main page';
		
	    qq.console(msg);
	})
	.add("orders", function ()
	{
		var msg = 'orders page';
		//debugger;
		//qq.loadModule({id:"mmOrders"});
		
		qq.init({module:"mmOrders"});
		
		qq.console(msg);
	})
	.add("sub/orders", function ()
	{
		var msg = 'sub order page';

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
	.add("sub/cart", function ()
	{
		var msg = 'sub cart page';

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

	//debugger;
};