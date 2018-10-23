(function($, qq)
{
	/* mapToName: if true - maps view names to services */
	var module = qq.registerModule("inputs", {mainView:"main"}),
			fullView;
	
	fullView = module.registerView("main", "#inputTests");
	
	fullView.triggers = {
		inputs1:{q:"#updateInputs1", action:"updateInputs01", preventDefault:true},
		getdata1:{q:"#getData1", action:"getData01", preventDefault:true},
		
		textarea1:{q:"#updateTextArea1", action:"updateTextArea01", preventDefault:true},
		getdata2:{q:"#getData2", action:"getData02", preventDefault:true},
		
		submit1:{q:"#updateSubmit1", action:"updateSubmit01", preventDefault:true},
		getdata3:{q:"#getData3", action:"getData03", preventDefault:true},
		
		dd1:{q:"#updateDropDown1", action:"updateDD1", preventDefault:true},
		dd2:{q:"#updateDropDown2", action:"updateDD2", preventDefault:true},
		dd3:{q:"#updateDropDown3", action:"updateDD3", preventDefault:true},
		getdata4:{q:"#getData4", action:"getData04", preventDefault:true},
		
		updateRadio1:{q:"#updateRadio1", action:"updateRadio1", preventDefault:true},
		getdata5:{q:"#getData5", action:"getData05", preventDefault:true},
		getdata5b:{q:"#getData5b", action:"getData05b", preventDefault:true},
		
		updateCheck1:{q:"#updateCheck1", action:"updateCheck1", preventDefault:true},
		getdata6:{q:"#getData6", action:"getData6", preventDefault:true},
		getdata6b:{q:"#getData6b", action:"getData6b", preventDefault:true}
	};
	
	/*************/
	
	fullView.registerAction("getData6b", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "check2b";
		
		console.warn("----- GET:");
		var data = this.getData();
		console.warn("----- SET:");
		
		var ndata = {"sex":"alien"};
		
		console.warn("new set data", ndata);
		
		this.setData(ndata);
	});
	
	fullView.registerAction("getData6", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "check2";
		
		var data = this.getData();
		
		var ndata = {"sex.radio2":{"checked":true, "value":data.radio1}};
		
		console.warn("new set data", ndata);
		
		this.setData(ndata);
		
		console.warn("getData06", "data", data);
	});
	
	fullView.registerAction("updateCheck1", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "check1";
		
		this.openService("updateCheck1", {id:id}, function (data, sdata)
		{
			this.setData(data);
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView radio 1 fail");
		});
	});
	
	fullView.registerAction("getData05b", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "radio2b";
		
		console.warn("----- GET:");
		var data = this.getData();
		console.warn("----- SET:");
		
		var ndata = {"sex":"alien"};
		console.warn("ndata", ndata);
		this.setData(ndata);
	});
	
	fullView.registerAction("getData05", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "radio2";
		
		var data = this.getData();
		
		var ndata = {"sex.radio2":{"checked":true, "value":data.radio1}};
		console.warn("ndata", ndata);
		this.setData(ndata);
		
		console.warn("getData05", "data", data);
	});
	
	fullView.registerAction("updateRadio1", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "radio1";
		
		this.openService("updateRadio1", {id:id}, function (data, sdata)
		{
			this.setData(data);
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView radio 1 fail");
		});
	});
	
	/*************/
	
	fullView.registerAction("updateDD3", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "dd3";
		
		this.openService("updateDD3", {id:id}, function (data, sdata)
		{
			console.warn("data", data);
			this.setData(data);
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView imageTest 1 fail");
		});
	});
	
	fullView.registerAction("updateDD2", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "dd2";
		
		this.openService("updateDD2", {id:id}, function (data, sdata)
		{
			console.warn("data", data);
			this.setData(data);
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView imageTest 1 fail");
		});
	});
	
	fullView.registerAction("updateDD1", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "dd1";
		
		this.openService("updateDD1", {id:id}, function (data, sdata)
		{
			console.warn("data", data);
			this.setData(data);
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView imageTest 1 fail");
		});
	});
	
	fullView.registerAction("getData04", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "dd2";
		
		var data = this.getData();
		
		var ndata = {"dd2":data.dd1};
		
		this.setData(ndata);
		
		console.warn("getData04", "data", data);
	});
	
	/*************/
	
	fullView.registerAction("updateSubmit01", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "submit01";
		
		this.openService("updateSubmit1", {id:id}, function (data, sdata)
		{
			console.warn("data", data);
			this.setData(data);
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView imageTest 1 fail");
		});
	});
	
	fullView.registerAction("getData03", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "submit02";
		
		var data = this.getData();
		
		var ndata = {"submit2":data.submit1};
		
		this.setData(ndata);
		
		console.warn("getData03", "data", data);
	});
	
	/*************/
	
	fullView.registerAction("updateTextArea01", function ()
	{
		var module = this.parent(),
			reg = module.registry(),
			id = "txtarea01";
		
		this.openService("updateTextArea1", {id:id}, function (data, sdata)
		{
			console.warn("data", data);
			this.setData(data);
			
			qq.updateState({id:sdata.id});
		},
		function ()
		{
			console.warn("fullView imageTest 1 fail");
		});
	});
	
	fullView.registerAction("getData02", function ()
	{
		var module = this.parent(),
			reg = module.registry(),
			id = "txtarea02";
		
		var data = this.getData();
		
		var ndata = {"textarea2":data.textarea1};
		
		this.setData(ndata);
		
		console.warn("getData02", "data", data);
	});
	
	/*************/
	
	fullView.registerAction("updateInputs01", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "input01a";
		
		this.openService("updateInput01", {id:id}, function (data, sdata)
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
	
	fullView.registerAction("getData01", function ()
	{
		var module = this.parent(),
						reg = module.registry(),
						id = "input01b";
		
		var data = this.getData();
		
		var ndata = {"input3":data.input1, "input4":data.input2};
		
		this.setData(ndata);
		
		console.warn("getData01", "data", data);
	});
	
	fullView.services = {
		updateInput01:{type:"json", url:"/data/inputTest-01.json", data:{}, dataMap:"direct"},
		updateTextArea1:{type:"json", url:"/data/inputTest-02.json", data:{}, dataMap:"direct"},
		updateSubmit1:{type:"json", url:"/data/inputTest-03.json", data:{}, dataMap:"direct"},
		updateDD1:{type:"json", url:"/data/inputTest-04.json", data:{}, dataMap:"direct"},
		updateDD2:{type:"json", url:"/data/inputTest-05.json", data:{}, dataMap:"direct"},
		updateDD3:{type:"json", url:"/data/inputTest-06.json", data:{}, dataMap:"direct"},
		updateRadio1:{type:"json", url:"/data/inputTest-07.json", data:{}, dataMap:"direct"},
		updateCheck1:{type:"json", url:"/data/inputTest-08.json", data:{}, dataMap:"direct"}
	};
	
	fullView.selectors = {
		
		"input1":{q:"form", qq:"#fname",
		type:"input.text"},
		"input2":{q:"form", qq:"#lname",
		type:"input.text"},
		
		"input3":{q:"form", qq:"#fname-val",
		type:"input.text"},
		"input4":{q:"form", qq:"#lname-val",
		type:"input.text"},
		
		"textarea1":{q:"form", qq:"#txtarea1",
		type:"input.textarea"},
		"textarea2":{q:"form", qq:"#txtarea2",
		type:"input.textarea"},
		
		"submit1":{q:"form", qq:"#submit1",
		type:"input.submit"},
		"submit2":{q:"form", qq:"#submit2",
		type:"input.submit"},
		
		"dd1":{q:"form", qq:"#dd1",
		type:"input.dropdown"},
		"dd2":{q:"form", qq:"#dd2",
		type:"input.dropdown"},
		
		"sex":{
			"radio1":{q:".inputTestForm", qq:"#radio1",
			type:"input.radio"},
			"radio2":{q:".inputTestForm", qq:"#radio2",
			type:"input.radio"},
			"radio3":{q:".inputTestForm", qq:"#radio3",
			type:"input.radio"},
			"radio4":{q:".inputTestForm", qq:"#radio4",
			type:"input.radio"},
			"radio5":{q:".inputTestForm", qq:"#radio5",
			type:"input.radio"}
		},
		
		"chck5":{q:".inputTestForm", qq:"#check5",
			type:"input.checkbox"},
		
		"box":{
			"chck1":{q:".inputTestForm", qq:"#check1",
			type:"input.checkbox"},
			"chck2":{q:".inputTestForm", qq:"#check2",
			type:"input.checkbox"},
			"chck3":{q:".inputTestForm", qq:"#check3",
			type:"input.checkbox"},
			"chck4":{q:".inputTestForm", qq:"#check4",
			type:"input.checkbox"}
		}
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