(function($, qq)
{
	/* mapToName: if true - maps view names to services */
	var module = qq.registerModule("listTest", {mapToName:true, mainView:"main"}),
			fullView;
	
	fullView = module.registerView("main", "#listTests");
	
	fullView.triggers = {
		basic:{q:"#updateBasic", action:"updateBasicList", preventDefault:true},
		basic2:{q:"#updateBasic2", action:"updateBasicList2", preventDefault:true},
		
		basic3:{q:"#updateBasicTemp", action:"updateBasicList3", preventDefault:true},
		basic4:{q:"#updateBasicTemp2", action:"updateBasicList4", preventDefault:true},
		
		basic5:{q:"#updateBasicTemp3", action:"updateBasicList5", preventDefault:true},
		
		basic6:{q:"#updateBasicTemp4", action:"updateBasicList6", preventDefault:true},
		
		basic7:{q:"#updateBasicTemp5", action:"updateBasicList7", preventDefault:true},
		
		ul:{q:"#updateUL", action:"updateUList", preventDefault:true},
		simple:{q:"#updateSimple", action:"updateSimple", preventDefault:true},
		complex:{q:"#updateComplex", action:"updateComplex", preventDefault:true}
	};
	
	fullView.registerAction("updateBasicList7", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "basic7";
		
		this.openService("updateBasic7", {id:id}, function (data, sdata)
		{
			this.setData(data, "direct");
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView listTest basic6 fail");
		});
	});
	
	fullView.registerAction("updateBasicList6", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "basic6";
		
		this.openService("updateBasic6", {id:id}, function (data, sdata)
		{
			this.setData(data, "direct");
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView listTest basic6 fail");
		});
	});
	
	fullView.registerAction("updateBasicList5", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "basic5";
		
		this.openService("updateBasic5", {id:id}, function (data, sdata)
		{
			this.setData(data, "direct");
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView listTest basic5 fail");
		});
	});
	
	fullView.registerAction("updateBasicList4", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "basic4";
		
		this.openService("updateBasic4", {id:id}, function (data, sdata)
		{
			this.setData(data, "direct");
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView listTest basic4 fail");
		});
	});
	
	fullView.registerAction("updateBasicList3", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "basic3";
		
		this.openService("updateBasic3", {id:id}, function (data, sdata)
		{
			this.setData(data, "direct");
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView listTest basic3 fail");
		});
	});
	
	fullView.registerAction("updateBasicList2", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "basic2";
		
		this.openService("updateBasic2", {id:id}, function (data, sdata)
		{
			this.setData(data, "direct");
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView listTest basic2 fail");
		});
	});
	
	fullView.registerAction("updateBasicList", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "basic";
		
		this.openService("updateBasic", {id:id}, function (data, sdata)
		{
			this.setData(data, "direct");
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView listTest basic fail");
		});
	});
	
	fullView.registerAction("updateUList", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "ul";
		
		this.openService("updateUL", {id:id}, function (data, sdata)
		{
			//console.warn("data", data);
			this.setData(data, "direct");
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView listTest ul fail");
		});
	});
	
	fullView.registerAction("updateSimple", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "simple";
		
		this.openService("updateSimple", {id:id}, function (data, sdata)
		{
			//console.warn("data", data);
			this.setData(data, "direct");
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView listTest simple fail");
		});
	});
	
	fullView.registerAction("updateComplex", function ()
	{
		var module = this.parent(),
						reg = module.registry(), id = "complex";
		
		this.openService("updateComplex", {id:id}, function (data, sdata)
		{
			this.setData(data, "direct");
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView listTest complex fail");
		});
	});
	
	fullView.services = {
		updateBasic:{type:"json", url:"/data/basicList-01.json", data:{}, dataMap:"direct"},
		updateBasic2:{type:"json", url:"/data/basicList-02.json", data:{}, dataMap:"direct"},
		
		updateBasic3:{type:"json", url:"/data/basicList-03.json", data:{}, dataMap:"direct"},
		updateBasic4:{type:"json", url:"/data/basicList-04.json", data:{}, dataMap:"direct"},
		
		updateBasic5:{type:"json", url:"/data/basicList-05.json", data:{}, dataMap:"direct"},
		
		updateBasic6:{type:"json", url:"/data/basicList-06.json", data:{}, dataMap:"direct"},
		
		updateBasic7:{type:"json", url:"/data/basicList-07.json", data:{}, dataMap:"direct"},
		
		updateUL:{type:"json", url:"/data/UList-01.json", data:{}, dataMap:"direct"},
		updateSimple:{type:"json", url:"/data/simpleList-01.json", data:{}, dataMap:"direct"},
		updateComplex:{type:"json", url:"/data/complexList-01.json", data:{}, dataMap:"direct"}
	};
	
	fullView.selectors = {
		basicList:{q:"#basic", 
			type:"list"},
		basicList2:{q:"#basic2", 
			type:"list", 
			li:"li"},
		
		basicList3:{q:"#basic3", 
			type:"list", 
			li:"<li class='basic3Item' />"},
		basicList4:{q:"#basic4", 
			type:"list", 
			li:["<li class='basic3Item' />", "<li class='basic3ItemAlt' />"]},
		
		basicList5:{q:"#basic5", 
			type:"list", 
			li:{q:"<li class='basic5Item'><span class='txt'></span></li>", 
					qq:".txt"
				 }},
		basicList6:{q:"#basic6", 
			type:"list", 
			li:"li", 
			transformer:{
				type:"wrapper", 
				opts:"<span class='cool txt' />"
			},
			/* on could be a function, string, array or object. Object can contain 'attr', 'cls', 'data' variables. If string, we can prepend a '-' to remove classes, separated by space, otherwise those are added. */
			on:{value: function (index, total, val, cfg)
					{
						console.warn("value: index", index, "total", total, "val", val, "cfg", cfg);
						
						return val+"%";
					},
					item:{cls:"item"},
					first:function (index, total, item, initem, val, cfg)
					{
						//console.warn("first: index", index, "total", total, "item", item, "initem", initem, "val", val, "cfg", cfg);
						item.addClass("firstItem");
					},
					last:{attr:{type:"disc", class:"lastItem"}},
					i2:function (index, total, item, initem, val, cfg)
					{
						//console.warn("i2: index", index, "total", total, "item", item, "initem", initem, "val", val, "cfg", cfg);
						item.addClass("i2");
					},
					n4:function (index, total, item, initem, val, cfg)
					{
						//console.warn("n4: index", index, "total", total, "item", item, "initem", initem, "val", val, "cfg", cfg);
						item.addClass("n4");
					},
					odd:"odd",
					even: function (index, total, item, initem, val, cfg)
					{
						//console.warn("even: index", index, "total", total, "item", item, "initem", initem, "val", val, "cfg", cfg);
						item.addClass("even");
					},
					render: function (total, ref, cfg)
					{
						//console.warn("render: total", total, "ref", ref, "cfg", cfg);
					}
			}},
		
		basicList7:{q:"#basic7", type:"list", li:"li", transformer:{type:"wrapper", opts:{q:"<span class='cool txt'><span class='deeper' /></span>", qq:".deeper"}}},
		
		UList:{q:"#pipe", qq:"ul", type:"list", li:{q:"li"}},
		simpleList:{q:"#simpleList", qq:"section", type:"list", li:{q:".item", qq:"div.cell.fname"}},
		complexList:{q:"#complexList", qq:"section", type:"list", li:{q:".item", qq:"div.cell.fname"}}
	};
	
	fullView.registerAction("reload", function ()
	{
		
	});
	
	module.addResponseHandler(function (data)
	{
		//console.warn("data", data);
		if(data != null)
		{
			var action = "",
					id = null,
					view;
			
			if(data.action != null)
			{
				action = data.action.toLowerCase()
			}
			
			if(data.id != null && data.id.length > 0)
			{
				id = data.id;
			}
			
			if(id != null)	
			{
				
			}
			else
			{
				view = this.setView("main");
			}
		}
	});
	
})(jQuery, qq);