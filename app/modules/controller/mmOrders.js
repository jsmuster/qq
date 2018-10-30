(function(qq)
{
	//debugger;
	console.log("%c module.mmOrders", "color: white; background: red; padding: 2px; font-size: 13px;");
	/* mapToName: if true - maps view names to services */
	var module = qq.registerModule("mmOrders", {mapToName:true, mainView:"main"}),
		main;
	
	main = module.registerView("main", "#mmOrders");
	
	main.triggers = {};
	// {
	// 	img1:{q:"#updateImage1", action:"updateImage1", preventDefault:true},
	// 	img2:{q:"#updateImage2", action:"updateImage2", preventDefault:true}
	// };
	
	main.registerAction("updateImage2", function ()
	{
		var module = this.parent(),
			reg = module.registry(),
			id = "img2";
		
		this.openService("updateImage2", {id:id}, function (data, sdata)
		{
			console.warn("data", data);
			this.setData(data, "direct");
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("main imageTest 2 fail");
		});
	});
	
	main.registerAction("updateImage1", function ()
	{
		var module = this.parent(),
			reg = module.registry(),
			id = "img1";
		
		this.openService("updateImage1", {id:id}, function (data, sdata)
		{
			console.warn("data", data);
			this.setData(data, "direct");
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("main imageTest 1 fail");
		});
	});
	
	// fullView.services = {
	// 	updateImage1:{type:"json", url:"/data/imageTest-01.json", data:{}, dataMap:"direct"},
	// 	updateImage2:{type:"json", url:"/data/imageTest-02.json", data:{}, dataMap:"direct"}
	// };
		
	main.defaults = {orderList: {data:[
			{type:"buy", price:[50.12, 50.13], shares:[11,22], stoploss:0.01}
			,
			{type:"buy", price:[50.22, 50.33], shares:[111,222], stoploss:0.02}
		], dataMap:"direct"}};

	/* made a transformer for the data */
	main.transformers = {
		orderList:{
			/* transforms data for the 'orderList' itself */
			__: function (data)
			{
				console.log("transformer: orderList ", data);

				return data;
			},
			orderGroup: function (data)
			{
				console.log("transformer: orderGroup ", data);

				var arr = [];

				for(var i = 0, l = data.price.length; i < l; i++)
				{
					arr.push({type:data.type, price:data.price[i], shares:data.shares[i], stoploss:data.stoploss});
				}

				//{type:"buy", price:[50.02, 50.03], shares:[10,20], stoploss:0.01}

				return arr;
			}
		}
	};

	/* the view has selectors. Then each selector has sub-selectors */
	main.selectors = {
		orderList:{q:"#mmOrderList", 
				type:"list", 
				li:{q:"#mmOItem", 
					selectors: {orderGroup:{q:"#mmOIContainer", qq:"#mmOIGroup", 
												type:"list", 
													li:{q:"#mmOrderItem", 
														type:"mm.order"}
											}
								}
					},
				on:{
					value:function (index, length, val, cfg)
					{
						//console.log("(*) on val", index, "length", length, "val", val, "cfg" cfg);
						console.log("orderList: (*) on val", index, length, val, cfg);
						
						return val;
					},
					render: function (length, ref, cfg)
					{
						console.log("orderList: (*) on render", length, "\nref", ref, "\ncfg", cfg);
					}
				}
		}
	};

	main.widgets = {
		"mm.order": (function ()
		{
			return {init: function(ref, cfg, GROUPS)
				{
					console.log("mm.order (*) init", ref, cfg, GROUPS);
				},
				set: function (ref, data, cfg)
				{
					console.log("mm.order SET ", ref, "\ndata", data, "\ncfg", cfg)
				},
				get: function (ref, cfg)
				{
					return ref.value;
				}};
		})
	};

	//mmOrderList:{q:"#image1", qq:"img", type:"list"}

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
	//fullView
	
	module.addResponseHandler(function (data)
	{
		console.log(" mmOrders - addResponseHandler", data);

		if(data != null)
		{
			// var action = "",
			// 		id = null,
			// 		view;
			
			// if(data.action != null)
			// {
			// 	action = data.action.toLowerCase()
			// }
			
			// if(data.id != null && data.id.length > 0)
			// {
			// 	id = data.id;
			// }
			
			// if(id != null)	
			// {
				
			// }
			// else
			// {
			// 	view = this.setView("main");
			// }

			//view = this.setView("main");
		}
	});

	module.on("init", function ()
	{
		var _isNode = qq.isNode();

		if(_isNode)
		{
			console.log("is node");
		}
		else
		{
			chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
			{
				if(request.muid == null && request.path != null && request.data != null)
				{
					var res = request;
					
					sendEvent("OnHTTPResponseData", function ()
					{

					}, {res:res});
				}
				else if(request.muid != null)
				{
					if(messageHandlers[request.muid] != null)
				    {
				        sendResponse({ status: "success" });

				        var cb = messageHandlers[request.muid];

				        try
				        {
				            cb(request.data);
				        }
				        catch(e)
				        {
				            console.log("ERROR executing a call back from chrome.runtime.onMessage in background.js", e);
				        }
				    }
				}
			});
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