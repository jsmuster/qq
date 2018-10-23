/**
The MIT License (MIT)

Copyright (c) <2013> <Arseniy Tomkevich at XSENIO Inc. http://www.xsenio.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

'use strict';

var qq = require('./js/qq/qq.node.js');

var style = "color: black; background-color: pink; font-weight: bold; font-size: 12px;";

/* configure qq before initializing it */
// qq.configure(function (qq)
// {
// 	qq.configure("container", "#wdgtMMOrders");
// 	qq.configure("controllers",  './app/modules/controller/');
// 	qq.configure("views", './app/modules/view/');
// });

/* configure qq */


//console.log("QQ  ", JSON.stringify(qq));

// adding routes
var appRouter = qq.rr.add(/stocks\/(.*)/, function()
{
	var msg = 'stock page xxxx';

    qq.console(msg);
})
.add(function()
{
	var msg = 'main page';
	
    qq.console(msg);
})
.add("login", function ()
{
	var msg = 'login page';

	//qq.loadModule({id:"mmOrders"});
	
	qq.init({module:"mmOrders"});
	
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
//.init();

// qq.configure("container", "#wdgtMMOrders");
// qq.configure("controllers",  'chrome-extension://kbiogcpibcooalffffomccbcgfgcohfg/modules/controller/');
// qq.configure("views", 'chrome-extension://kbiogcpibcooalffffomccbcgfgcohfg/modules/view/');

// qq.loadModule({id:"mmOrders"});

// qq.init({module:"mmOrders"});