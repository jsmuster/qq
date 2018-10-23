
qq.configure("container", "#modules");

qq.configure("controllers", "modules/controller/");
qq.configure("views", "modules/view/");

/* we can register a module with id only, so then controller and view attributes are same as id */
qq.loadModule({id:"featuredPosts", controller:"featuredPosts", view:"featuredPosts", viewSelector:"#featuredPosts"});

qq.loadModule({id:"listTest"});

qq.loadModule({id:"imageTest"});

qq.loadModule({id:"inputs", controller:"inputTests", view:"inputs"});


//qq.loadModule({id:"gallery"});

//qq.loadModule({id:"mainShutter"});

qq.init();