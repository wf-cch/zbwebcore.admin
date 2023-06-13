//define自定义模块，exports参数，用于输出该模块的接口。
//exports是一个函数，它接受两个参数，第一个参数为模块名，第二个参数为模块接口，当你声明了上述的一个模块后，你就可以在外部使用了
//extend 设定模块别名
layui.extend({admin:'lay/modules/admin'}).define(['admin','conf'],function(exports){
    //解决 IE8 不支持console
    window.console = window.console || (function () {
        var c = {}; c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile
        = c.clear = c.exception = c.trace = c.assert = function () { };
        return c;
    })();
    layui.admin.initPage();
    exports('index',{});
});