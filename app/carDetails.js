qq.configure("container", ".container.containerbg");

qq.configure("controllers", "modules/controller/");
qq.configure("views", "modules/view/");

/* we can register a module with id only, so then controller and view attributes are same as id */
qq.loadModule({id:"carDetails", controller:"carDetails", view:"carDetails", viewSelector:"#carDetailsPageView"});

qq.init();