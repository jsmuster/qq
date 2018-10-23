(function($, qq)
{
	/* mapToName: if true - maps view names to services */
	var module = qq.registerModule("imageTest", {mapToName:true, mainView:"main"}),
			fullView;
	
	fullView = module.registerView("main", "#imageTests");
	
	fullView.triggers = {
		img1:{q:"#updateImage1", action:"updateImage1", preventDefault:true},
		img2:{q:"#updateImage2", action:"updateImage2", preventDefault:true}
	};
	
	fullView.registerAction("updateImage2", function ()
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
			console.warn("fullView imageTest 2 fail");
		});
	});
	
	fullView.registerAction("updateImage1", function ()
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
			console.warn("fullView imageTest 1 fail");
		});
	});
	
	fullView.services = {
		updateImage1:{type:"json", url:"/data/imageTest-01.json", data:{}, dataMap:"direct"},
		updateImage2:{type:"json", url:"/data/imageTest-02.json", data:{}, dataMap:"direct"}
	};
	
	fullView.selectors = {
		image1:{q:"#image1", qq:"img",
		type:"image"},
		image2:{q:"#image2",
		type:"image"}
	};
		
	module.addResponseHandler(function (data)
	{
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