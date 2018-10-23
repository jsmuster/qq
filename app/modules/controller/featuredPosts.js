(function($, qq)
{
	/* mapToName: if true - maps view names to services */
	var module = qq.registerModule("featuredPosts", {mapToName:true, mainView:"full"}),
			fullView, addView, editView;
	
	module.services = {
		insert:{type:""},
		select:{type:""},
		remove:{type:""},
		update:{type:""}
	};
	
	fullView = module.registerView("full", ".view.full");
	
	fullView.registerAction("reload", function ()
	{
		
	});
	
	addView = module.registerView("add", ".view.add");
	
	addView.behavior = {
		onshow: ["setDefaults", {type:"reset"}]
	};
	
	addView.selectors = {
		title:{q:"#title", type:"text"},
		desc:{q:"#desc", type:"text"},
		category:{q:"#category", type:"list"},
		/* imgFront:{q:{selector:"#fileThumbFront", renderer:""}, type:"file"}, 
		imgBack:{q:"#fileThumbBack", type:"file"},
		singlebutton: {q:"#singlebutton", type:"button", behavior:"submit"}*/
	};
	
	/* maps data to view selectors, data id on the left and view selector on the right. */
	addView.dataMap = {
		title:"title",
		desc:"desc",
		category:"category",
		imgFront:"imgFront",
		imgBack:"imgBack"
	};
	
	/* default values */
	addView.defaults = {
		title: "",
		desc: "",
		category: "",
		imgFront: "",
		imgBack: ""
	};
	
	/* can have its own services */
	addView.services = {
		insert:{type:"", url:"", authorization:{user:"", password:""}},
		update:{type:"", url:""},
		read:{type:""},
		remove:{type:""}
	};
	
	/* TODO implement sequence of callbacks
		
		possible ones too: configure, initialize, render
		
		reset, read, load
		
		- beforeShow
		- onShow
		- afterShow
		
		- beforeRender
		- onRender
		- afterRender
	
		- beforeDestroy
		- onDestroy
		- afterDestroy
	
	*/
	
	addView.on("reset", function ()
	{
		
	});
	
	addView.on("read", function ()
	{
		
	});
	
	addView.on("load", function ()
	{
		
	});
	
	editView = module.registerView("edit", ".view.edit");
	
	
	
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
				if(action == "edit")
				{
					view = this.setView("edit");
					
					//this.getData("mainTable", {id:id});
					
					//view.load();
				}
				else if(action == "add")
				{
					view = this.setView("add");
				}
				else if(action == "delete")
				{
					
				}
			}
			else
			{console.warn("action", action);
				if(action == "add")
				{
					view = this.setView("add");
					console.warn("view", view);
				}
				else
				{
					view = this.setView("full");
				}
			}
		}
	});
	
	qq.on("module=featuredPosts", function ()
	{
		console.warn("FEATURED POSTS");
	});
	
	qq.on("module=featuredPosts&action=edit", function ()
	{
		console.warn("EDIT FEATURED POSTS");
	});
	
})(jQuery, qq);