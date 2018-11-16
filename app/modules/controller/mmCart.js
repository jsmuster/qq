(function(qq)
{
	//debugger;

	console.log("%c module.Cart", "color: white; background: red; padding: 2px; font-size: 13px;");
	/* mapToName: if true - maps view names to services */
	var module = qq.registerModule("mmCart", {mapToName:true, mainView:"main"}),
		main;
	
	main = module.registerView("main", "#mmCart");
	
	main.triggers = {
		cartOrders:{q: "#cartOrders", action: "cartOrders", preventDefault: true},
		cartList:{q: "#cartList", action: "cartList", preventDefault: true}
	};

	main.actions = {
		cartOrders: function ()
		{
			var module = this.parent(),
				reg = module.registry(),
				id = "img2";
			
			this.openService("cartOrders", {id:id}, function (data, sdata)
			{
				console.warn("cartOrders data", data);
				this.setData(data, "direct");
				//debugger;
				//qq.updateState({id:sdata.id});
			},
			function ()
			{
				debugger;
				console.warn("main cartOrders 2 fail");
			});
		},
		cartList: function ()
		{
			var module = this.parent(),
				reg = module.registry(),
				id = "img1";
			
			this.openService("cartList", {id:id}, function (data, sdata)
			{
				console.warn("cartList data", data);
				this.setData(data, "direct");
				
				//qq.updateState({id:sdata.id});
			},
			function ()
			{
				console.warn("main imageTest 1 fail");
			});
		}
	};
	
	main.services = {
		cartOrders:{type:"json", url:"/data/cartData.json", data:{}, dataMap:"direct"},
		cartList:{type:"json", url:"/data/cartList.json", data:{}, dataMap:"direct"}
	};
		
	main.defaults = {cartList: {data:[
			{type:"buy", price:[50.12, 50.13], shares:[8,8], stoploss:0.01}
			,
			{type:"buy", price:[50.22, 50.33], shares:[9,9], stoploss:0.02}
		], dataMap:"direct"}};

	/* made a transformer for the data */
	main.transformers = {
		cartList:{
			/* transforms data for the 'orderList' itself */
			__: function (data)
			{
				console.log("transformer: cartList ", data);

				return data;
			},
			cartGroup: function (data)
			{
				console.log("transformer: cartGroup ", data);

				var arr = [];

				for(var i = 0, l = data.price.length; i < l; i++)
				{
					arr.push({type:data.type, price:data.price[i], shares:data.shares[i], stoploss:data.stoploss});
				}

				return arr;
			}
		}
	};


	/* The equivalent of the following meta definition is presented as selector configuration bellow:

		<list id="cartList" selector="#mmCartList" onValue="onValue(index, length, val, cfg)" onRender="onRender(length, ref, cfg)">
			<item selector="mmCItem">
				<list id="cartGroup" selector="#mmCIContainer #mmCIGroup">
					<mm.cartItem selector="mmCartItem" />
				<list>
			</item>
		</list>
	*/

	/* the view has selectors. Then each selector has sub-selectors */
	main.selectors = {
		cartList:{q:"#mmCartList", 
				type:"list", 
				li:{q:"#mmCItem", 
					selectors: {cartGroup:{q:"#mmCIContainer", qq:"#mmCIGroup", type:"list", li:{q:"#mmCartItem", type:"mm.cartItem"}}}},
				on:{
					value:function (index, length, val, cfg)
					{
						//console.log("(*) on val", index, "length", length, "val", val, "cfg" cfg);
						console.log("cartList: (*) on val", index, length, val, cfg);
						
						return val;
					},
					render: function (length, ref, cfg)
					{
						console.log("cartList: (*) on render", length, "\nref", ref, "\ncfg", cfg);
					}
				}}};

	/* register custom widgets */
	main.widgets = {
		"mm.cartItem": (function ()
		{
			return {init: function(ref, cfg, initials)
				{
					console.log("mm.cartItem (*) init", ref, cfg, initials);

					if(initials != null)
					{
						if(initials.refs != null)
						{
							if(initials.refs.action != null)
							{
								cfg.refs = {};
								
								cfg.refs.action = qq.place(initials.refs.action);
							}
							
							if(initials.refs.value != null)
							{
								if(cfg.refs == null) cfg.refs = {};
								
								cfg.refs.value = qq.place(initials.refs.value);
							}
						}
					}
					else
					{
						var action = ref.find(".mmCartItemAction"),
							value = ref.find(".mmCartItemValue");

						/* set references to dom elements for use in set / get life cycle methods */
						cfg.refs = {
							action: action, 
							value: value
						};
					}

					// dom: module.exports [{…}, options: {…}, prevObject: module.exports(1)]
					// domqq: null
					// path: "mmCart.main.cartList[0].cartGroup[0]"
					// q: "#mmCartItem"
					// ref: module.exports [{…}, options: {…}, prevObject: module.exports(1)]
					// refs: Proxy {action: Proxy, value: Proxy}
					// type: "mm.cartItem"
					// uid: 

					//debugger;
				},
				set: function(ref, data, cfg)
				{
					//debugger;
					cfg.refs.action.html(data.price);
					cfg.refs.value.html(data.shares);

					console.log("mm.cartItem SET ", ref, "\ndata", data, "\ncfg", cfg);

					
				},
				getstate: function(cfg)
				{
					var state = {data: {}, refs: {}};
					
					var price = cfg.refs.action.html();
					var shares = cfg.refs.value.html();

					state.data.price = price;
					state.data.shares = shares;

					state.refs.action = qq.place(cfg.refs.action);
					state.refs.value = qq.place(cfg.refs.value);

					return state;
				}};
		})()
	};

	main.on("reset", function ()
    {
    	console.log("RESET main VIEW");
    });

    main.on("read", function ()
    {
    	console.log("READ main VIEW");
    });

    main.on("post.show", function ()
    {
    	console.log("POST SHOW main VIEW", arguments);
    });
	
	module.addResponseHandler(function (data)
	{
		console.log(" mmCart - addResponseHandler", data);

		if(data != null)
		{

		}
	});

	/* TODO change to */
	// module.on.init = function ()
	// {

	// };

	module.on("init", function ()
	{
		//debugger;
		var _isNode = qq.isNode();

		if(_isNode)
		{
			console.log("is node");
		}
		else
		{
			console.log("is not node");
		}
	});

	var messageHandlers = {
		OpenOrdersMenu: function ()
		{
			// sendEvent("OnAuthorizationData", function ()
			// {

			// }, {result:{}});
		}
	};

	var initializeModule = qq.Delegate.create(this, function ()
	{
		
	});

	initializeModule();
	
})(qq);