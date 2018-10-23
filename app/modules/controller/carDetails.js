(function($, qq)
{
	/* mapToName: if true - maps view names to services */
	var module = qq.registerModule("carDetails", {mapToName:true, mainView:"main"}),
					mainView;
	
	var reg = module.registry();
	
	var ids = [12, 13, 14, 15, 16, 17, 18, 19, 20], index = 0, indexById = {};
	
	reg.set("ids", ids);
	reg.set("indexById", indexById);
	reg.set("index", index);
	
	for(var i = 0, l = ids.length; i < l; i++)
	{
		indexById[ids[i]] = i;
	}
	
	mainView = module.registerView("main", "#carDetailsPageView");
	
	/* xml, json, script, or html */
	mainView.services = {
		carDetails:{type:"json", url:"/data/next.json", data:{}, dataMap:"direct"}
	};
	
	mainView.triggers = {
		prev:{query:".topNavButton.previous", action:"previous", preventDefault:true},
		next:{query:".topNavButton.next", action:"next", preventDefault:true}
	};
	
	mainView.selectors = {
		price:{q:".vehicleInfo .value.finalPrice", type:"text", transformer:{type:"currency", opts:"$,.-"}},
		blueBookPrice:{q:".vehicleInfo .value.kbbPrice", type:"text", transformer:{type:"currency", opts:"$,.-"}},
		priceDiff:{q:".vehicleInfo .value.savings", type:"text", transformer:{type:"currency", opts:"$,.-"}},
		miles:{q:".vehicleInfo .miles.value", type:"text"},
		bodyStyle:{q:".vehicleInfo .bodyStyle.value", type:"text"},
		driveInfo:{q:".vehicleInfo .driveInfo.value", type:"text"},
		transmissionInfo:{q:".vehicleInfo .transmissionInfo.value", type:"text"},
		colorInfo:{q:".vehicleInfo .colorInfo.value", type:"text"},
		unitId:{q:".vehicleInfo .unitId.value", type:"text"},
		vinInfo:{q:".vehicleInfo .vinInfo.value", type:"text"},
		
		engineSpec:{q:"#vdSpecs .engineSpec.value", type:"text"},
		transSpec:{q:"#vdSpecs .transSpec.value", type:"text"},
		epaSpec:{q:"#vdSpecs .epaSpec.value", type:"text"},
		
		convenienceSpec:{q:".vdSpecs .convenienceSpec.disc", type:"list"},
		exteriorSpec:{q:".vdSpecs .exteriorSpec.disc", type:"list", li:"li"},
		entertainmentSpec:{q:".vdSpecs .entertainmentSpec.disc", type:"list", li:"<li class='cool' />"},
		interiorSpec:{q:".vdSpecs .interiorSpec.disc", type:"list"},
		safetySpec:{q:".vdSpecs .safetySpec.disc", type:"list"},
		
		mlcontent:{q:"#vehicleDetailImages .mlcontent", type:"text", transformer:{type:"wrapper", opts:"<p class='blah' />"}},
		
		manualUrl:{q:"#vehicleDetailImages .referenceLinks .manManual", type:"link"},
		buyersGuideUrl:{q:"#vehicleDetailImages .referenceLinks .buyersGuide", type:"link"}
	};
	
	mainView.updateCarDetails = function (id)
	{
		/* type, data, done, fail */
		this.openService("carDetails", {id:id}, function (data, sdata)
		{
			this.setData(data, "direct", {
				convenienceSpec:"options.convenience", 
				exteriorSpec:"options.exterior", 
				entertainmentSpec:"options.entertainment", 
				interiorSpec:"options.interior", 
				safetySpec:"options.safety", 
				mlcontent:"options.modelOverview"});
			
			carDetails.setImages(data.thumbnails, data.images);
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("mainView carDetails fail");
		});
	};
	
	mainView.registerAction("next", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id, index = reg.get("index"), ids = reg.get("ids");
		
		index++;
		
		if(index <= ids.length - 1)
		{
			id = ids[index];
		}
		else
		{
			index = 0;
			id = ids[index];
		}
		
		reg.set("index", index);
		
		this.updateCarDetails(id);
		
	});
	
	mainView.registerAction("previous", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id, index = reg.get("index"), ids = reg.get("ids");
		
		index--;
		
		if(index >= 0)
		{
			id = ids[index];
		}
		else
		{
			index = ids.length - 1;
			id = ids[index];
		}
		
		reg.set("index", index);
		
		this.updateCarDetails(id);
	});
	
	module.addResponseHandler(function (data)
	{
		if(data != null)
		{
			var did = data.id, view, reg = this.registry();
			
			if(did != null)
			{
				var indexById = reg.get("indexById"),
								cindex = reg.get("index"),
								index = indexById[did];
				
				if(cindex != index)
				{
					this.getView("main").updateCarDetails(did);
				}
			}
		}
	});
	
}(jQuery, qq));