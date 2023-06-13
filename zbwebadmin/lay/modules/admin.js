layui
  .extend({
    conf: 'config',
    api: 'lay/modules/api',
    view: 'lay/modules/view'
  })
  .define(['conf', 'view', 'api', 'jquery'], function (exports) {
    POPUP_DATA = {}
    var conf = layui.conf
    var view = layui.view
    var element = layui.element
    var $ = layui.jquery
    // var upload = layui.upload
    // var xmSelect=layui.xmSelect
    layui.extend(conf.extend)
    var self = {}
    var windowWidth = $(window).width()
    var menumc = '';
    // window.MICROANSWER_DROPDOWAN = 'dpdown';
    self.route = layui.router()
    self.api = layui.api
    self.closeOnceHashChange = false
    self.ie8 = view.ie8
    self.get = view.request
    self.appBody = null
    self.shrinkCls = 'nepadmin-sidebar-shrink'
    self.isInit = false
    self.routeLeaveFunc = null
    self.loginToken = null
    self.routeLeave = function (callback) {
      this.routeLeaveFunc = callback
    }
    self.render = function (elem) {
      if (typeof elem == 'string') elem = $('#' + elem)
      var action = elem.get(0).tagName == 'SCRIPT' ? 'next' : 'find'
      elem[action]('[is-template]').remove()
      view.parse(elem)
    }
    self.renderData = function (elem, data) {
      var datastr = JSON.stringify(data);
      $('#' + elem).attr("lay-data", datastr);
      self.render(elem)
    }
    self.getLoginToken = function () {
      if (self.loginToken == null) {
        self.loginToken =
          self.data()[conf.tokenName] ||
          layui.sessionData(conf.tableName, conf.tokenName)
      }
      return self.loginToken
    }
    self.logout = function () {
      self.data({ key: conf.tokenName, remove: true })
      self.data({ key: conf.tokenName, remove: true }, sessionStorage)
      self.loginToken = null

      self.navigate(conf.loginPage)
      // location.reload() 
    }
    self.login = function (token, data, isSession) {
      self.data(
        {
          key: conf.tokenName,
          value: token
        },
        isSession && sessionStorage
      )

      if ($.isPlainObject(data)) {
        var disableData = []
        layui.each(data, function (key) {
          disableData.push({
            key: key,
            value: data[key]
          })
        })
        self.data(disableData)
      }
    }
    //初始化整个页面
    self.initPage = function (initCallback) {
      //加载样式文件
      layui.each(layui.conf.style, function (index, url) {
        layui.link(url + '?v=' + conf.v)
      })
      self.initView(self.route)
    }
    self.post = function (params) {
      view.request($.extend({ type: 'post' }, params))
    }
    // self.router = function(url) {
    //   var route
    //   if (url) {
    //     url = '#' + url
    //     if (url == '#/') url += conf.entry
    //     console.log(url)
    //   } else {
    //     route = layui.router()
    //   }
    //   route.fileurl = '/' + route.path.join('/')
    //   return route
    // }

    //初始化视图区域
    self.initView = function (route) {
      if (!self.route.href || self.route.href == '/') {
        self.route = layui.router('#' + conf.entry)
        route = self.route
      }
      route.fileurl = '/' + route.path.join('/')
      //判断登录页面
      if (conf.loginCheck == true) {
        if (self.getLoginToken()) {
          if (route.fileurl == conf.loginPage) {
            self.navigate('/')
            return
          }
        } else {
          if (route.fileurl != conf.loginPage) {
            self.logout()
            return
          }
        }
      }

      if ($.inArray(route.fileurl, conf.indPage) === -1) {
        var loadRenderPage = function (params) {
          if (conf.viewTabs == true) {
            view.renderTabs(route)

          } else {
            view.render(route.fileurl)
          }

        }

        if (view.containerBody == null) {
          //加载layout文件
          view.renderLayout(function () {
            //重新渲染导航
            element.render('nav', 'nepadmin-sidebar')
            //加载视图文件
            loadRenderPage()
          })
        } else {
          //layout文件已加载，加载视图文件
          loadRenderPage()
        }
      } else {
        //加载单页面
        view.renderIndPage(route.fileurl, function () {
          if (conf.viewTabs == true) view.tab.clear()
        })
      }

    }
    //根据当前加载的URL高亮左侧导航
    self.sidebarFocus = function (url) {
      url = url || self.route.href
      var elem = $('#app-sidebar')
        .find('[lay-href="' + url + '"]')
        .eq(0)
      if (elem.length > 0) {
        elem.parents('.layui-nav-item').addClass('layui-nav-itemed')
        elem.click()
      }
    }
    self.flexible = function (open) {
      if (open == true) {
        view.container.removeClass(self.shrinkCls)
      } else {
        view.container.addClass(self.shrinkCls)
      }
    }
    self.on = function (name, callback) {
      return layui.onevent(conf.eventName, 'system(' + name + ')', callback)
    }
    self.event = function (name, params) {
      layui.event(conf.eventName, 'system(' + name + ')', params)
    }
    self.csshref = function (name) {
      name = name == undefined ? self.route.path.join('/') : name
      return conf.css + 'views/' + name + '.css' + '?v=' + conf.v
    }
    self.prev = function (n) {
      if (n == undefined) n = -1
      window.history.go(n)
    }
    self.navigate = function (url) {
      if (url == conf.entry) url = '/'
      window.location.hash = url
    }
    self.data = function (settings, storage) {
      if (settings == undefined) return layui.data(conf.tableName)
      if ($.isArray(settings)) {
        layui.each(settings, function (i) {
          layui.data(conf.tableName, settings[i], storage)
        })
      } else {
        layui.data(conf.tableName, settings, storage)
      }
    }

    self.modal = {}
    self.modal.info = function (msg, params) {
      params = params || {}
      params.titleIcoColor = params.titleIcoColor || '#5a8bff'
      params.titleIco = params.titleIco || 'exclaimination'
      params.title = [
        '<i class="layui-icon layui-icon-' +
        params.titleIco +
        '" style="font-size:12px;background:' +
        params.titleIcoColor +
        ';display:inline-block;position:relative;top:-2px;height:24px;line-height:24px;text-align:center;width:24px;color:#fff;border-radius:50%;margin-right:10px;"></i>' +
        (params.title || '提醒'),
        'background:#fff;border:none;font-weight:bold;font-size:18px;color:#08132b;padding-top:20px;height:46px;line-height:46px;padding-bottom:0;'
      ]
      params = $.extend(
        {
          btn: ['我知道了'],
          skin: 'layui-layer-admin-modal',
          area: [windowWidth <= 750 ? '90%' : '50%'],
          closeBtn: 0,
          shadeClose: true
        },
        params
      )
      layer.alert(msg, params)
    }
    self.modal.success = function (msg, params) {
      params = params || {}
      params.titleIco = 'ok'
      params.titleIcoColor = '#30d180'
      self.modal.info(msg, params)
    }
    self.modal.warn = function (msg, params) {
      params = params || {}
      params.titleIco = 'exclaimination'
      params.titleIcoColor = '#ff9900'
      self.modal.info(msg, params)
    }
    self.modal.error = function (msg, params) {
      params = params || {}
      params.titleIco = 'close'
      params.titleIcoColor = '#ed4014'
      self.modal.info(msg, params)
    }
    self.isUrl = function (str) {
      return /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/.test(
        str
      )
    }


    //当小于这个尺寸的时候会进行手机端的适配
    var mobileWidth = 991
    var isMobileAdapter = false
    function mobileAdapter() {
      self.flexible(false)
      var device = layui.device()
      if (device.weixin || device.android || device.ios) {
        //点击空白处关闭侧边栏
        $(document).on('click', '#' + conf.containerBody, function () {
          if (
            $(window).width() < mobileWidth &&
            !view.container.hasClass(self.shrinkCls)
          ) {
            self.flexible(false)
          }
        })


      }
      isMobileAdapter = true
    }
    $(window).on('resize', function (e) {
      if ($(window).width() < mobileWidth) {
        if (isMobileAdapter == true) return
        mobileAdapter()
      } else {
        isMobileAdapter = false
      }
    })

    $(window).on('hashchange', function (e) {
      //移动端跳转链接先把导航关闭
      if ($(window).width() < mobileWidth) {
        self.flexible(false)
      }
      self.route = layui.router()
      layer.closeAll()
      self.initView(self.route)
    })

    //回车提交 form 表单
    // $(document).on('keydown', function (e) {
    //   var ev = document.all ? window.event : e
    //   if (ev.keyCode == 13) {
    //     var form = $(':focus').parents('.layui-form')
    //     form.find('[lay-submit]').click()
    //   }
    // })

    $(document).on('click', '[lay-href]', function (e) {
      var href = $(this).attr('lay-href')
      var target = $(this).attr('target')

      if (href == '') return
      if (self.isUrl(href)) {
        next()
      }

      function next() {
        target == '__blank' ? window.open(href) : self.navigate(href)
      }

      if ($.isFunction(self.routeLeaveFunc)) {
        self.routeLeaveFunc(self.route, href, next)
      } else {
        next()
      }

      return false
    })
    $(document).on('click', '[lay-popup]', function (e) {
      var params = $(this).attr('lay-popup')
      self.popup(
        params.indexOf('{') === 0
          ? new Function('return ' + $(this).attr('lay-popup'))()
          : { url: params }
      )
      return false
    })
    $(document).on('mouseenter', '[lay-tips]', function (e) {
      var title = $(this).attr('lay-tips')
      var dire = $(this).attr('lay-dire') || 3
      if (title) {
        layer.tips(title, $(this), {
          tips: [dire, '#263147']
        })
      }
    })
    $(document).on('mouseleave', '[lay-tips]', function (e) {
      layer.closeAll('tips')
    })

    $(document).on('click', '*[' + conf.eventName + ']', function (e) {
      self.event($(this).attr(conf.eventName), $(this))
    })


    var shrinkSidebarBtn =
      '.' + self.shrinkCls + ' #app-sidebar .layui-nav-item a'

    $(document).on('click', shrinkSidebarBtn, function (e) {
      if (isMobileAdapter == true) return
      var chileLength = $(this)
        .parent()
        .find('.layui-nav-child').length
      if (chileLength > 0) {
        self.flexible(true)
        layer.closeAll('tips')
      }
    })
    $(document).on('mouseenter', shrinkSidebarBtn, function (e) {
      var title = $(this).attr('title')
      if (title) {
        layer.tips(title, $(this).find('.layui-icon'), {
          tips: [2, '#263147']
        })
      }
    })
    $(document).on('mouseleave', shrinkSidebarBtn, function (e) {
      layer.closeAll('tips')
    })

    self.on('flexible', function (init) {
      var status = view.container.hasClass(self.shrinkCls)
      self.flexible(status)
      self.data({ key: 'flexible', value: status })
    })
    self.on('refresh', function (e) {
      var url = self.route.href
      if (conf.viewTabs == true) {
        view.tab.refresh(url);
      } else {
        view.render(location.hash)
      }
    })
    self.on('prev', function (e) {
      self.prev()
    })

    self.on('logout', function (e) {
      self.logout()
    })

    self.on('fullscreen', function (e) {
      var normalCls = 'layui-icon-screen-full'
      var activeCls = 'layui-icon-screen-restore'
      var ico = e.find('.layui-icon')

      if (ico.hasClass(normalCls)) {
        var e = document.body
        e.webkitRequestFullScreen
          ? e.webkitRequestFullScreen()
          : e.mozRequestFullScreen
            ? e.mozRequestFullScreen()
            : e.requestFullScreen && e.requestFullscreen()
        ico.removeClass(normalCls).addClass(activeCls)
      } else {
        var e = document
        e.webkitCancelFullScreen
          ? e.webkitCancelFullScreen()
          : e.mozCancelFullScreen
            ? e.mozCancelFullScreen()
            : e.cancelFullScreen
              ? e.cancelFullScreen()
              : e.exitFullscreen && e.exitFullscreen()
        ico.removeClass(activeCls).addClass(normalCls)
      }
    })
    /*自定义方法 by cch start*/
    //模板赋值
    self.tplsetdata = function (elem, indata) {
      try {
        if (typeof elem == 'string') elem = $('#' + elem)
        var action = elem.get(0).tagName == 'SCRIPT' ? 'next' : 'find'
        elem[action]('[is-template]').remove()
        container = elem
        if (container == undefined) container = NULL
        var template =
          container.get(0).tagName == 'SCRIPT'
            ? container
            : container.find('[template]')

        var renderTemplate = function (template, data, callback) {
          layui.laytpl(template.html()).render(data, function (html) {
            try {
              html = $(
                (/<[^>]+>/g).test(html) ? html : '<span>' + html + '</span>'
              )
            } catch (err) {
              html = $('<span>' + html + '</span>')
            }

            html.attr('is-template', true)
            template.after(html)
            if ($.isFunction(callback)) callback(html)
          })
        }
        layui.each(template, function (index, tem) {
          var tem = $(tem)
          var done = tem.attr('lay-done') || ''

          renderTemplate(
            tem,
            indata,
            self.ie8
              ? function (elem) {
                if (elem[0] && elem[0].tagName != 'LINK') return
                container.hide()
                elem.load(function () {
                  container.show()
                })
              }
              : null
          )
          if (done) new Function(done)()
        })
      } catch (error) {
        layer.msg(error)
      }

    }
    //获取url参数
    self.getUrlParam = function (val) {
      var uri = layui.router().href;
      var re = new RegExp("" + val + "=([^&?/]*)", "ig");
      return ((uri.match(re)) ? decodeURI(uri.match(re)[0].substr(val.length + 1)) : null);
    }
    //设置按钮事件
    self.util = {
      //批量事件
      event: function (attr, obj, eventType) {
        obj = self.util.event[attr] = $.extend(true, self.util.event[attr], obj) || {};
        $('.layui-fluid').on(eventType || 'click', '*[' + attr + ']', function () {
          var othis = $(this), key = othis.attr(attr);
          obj[key] && obj[key].call(this, othis);

        });
      }
    }
    //获取窗口名称
    self.getTitle = function () {
     // var title = $('.layui-fluid').attr('lay-title')
     var title=$(".nepadmin-tabs-active").text().trim()
      return title;
    }
    //获取表名和唯一字段名
    self.getTnamefield = function (domid) {
      var tname = $(domid).attr('tname');
      var tfield = $(domid).attr('tfield');
      var mcfield = $(domid).attr('mcfield');
      var proc = $(domid).attr('proc');
      var tjson = {}
      if (tname) {
        tjson.tname = tname;
      }
      if (tfield) {
        tjson.tfield = tfield;
      }
      if (mcfield) {
        tjson.mcfield = mcfield;
      }
      if (proc) {
        tjson.proc = proc;
      }
      return tjson;
    }
    //上传封装
    self.upload = function (params) {
      var pageid = layui.router().path[layui.router().path.length - 1];
      var elem = params.elem || '[lay-active-' + pageid + '="upload"]';
      var url = params.url || ''
      params.url = conf.requestUrl + url;
      var done = params.done || function () { }
      var size = params.size || 1024 * 20
      var accept = params.accept || 'file'
      var headers = this.getLoginToken()

      var defaultParams = {
        elem: elem
        , url: url
        , accept: accept
        , size: size
        , headers: { token: headers }
        , before: function () {
          layer.load(2);
        }
        , progress: function (n) {
          var percent = n + '%' //获取进度百分比
          $('.layui-layer-loading2').html('<span class="layerload2">' + percent + '</span>');
        }
        , error: function () {
          layer.closeAll('loading');
          layer.msg('上传失败,请检查网络连接!');
        }
      }
      params.done = function (res) {
        layer.closeAll('loading');
        if (!res.flag) {
          layer.alert(res.msg);
        } else {
          layer.msg('上传成功!')
        }
        done(res);
      }
      params = $.extend(defaultParams, params);
      layui.upload.render(params);

    }
    //表格封装
    self.table = function (params) {
      params.elem='#'+params.elem||''
      if(params.api){
        params.url = conf.requestUrl + layui.api[params.api]
      }else{
        params.url=conf.requestUrl + params.url||''
      }
      
      var done = params.done || function () { }
      var defaultParams = {
        elem:params.elem,
        url:params.url,
        method:'post',
        where:params.where||{},
        headers:{token:this.getLoginToken()},
        height: 'full-165',
        totalRow:false,
        page: true,
        size: 'sm',
        skin: 'line',
        //每页显示的条数
        limit: 20,
        //是否显示加载条
        loading: false,
        //用于对分页请求的参数：page、limit重新设定名称
        request: {
          pageName: 'page', //页码的参数名称，默认：page
          limitName: 'limit' //每页数据量的参数名，默认：limit
        }
        , error: function (obj,context) {
          // layer.alert('数据请求失败!'+context);
        }
      }
      params.done = function (res) {
        done(res);
      }
      params = $.extend(true,defaultParams, params);
      console.log(params)
      layui.table.render(params);

    }
    //按钮触发封装
    self.elemevent = function (id,params) {

      var defaultparams={
        cx: function () {
          admin.popup({
            url: '/sys/cx', data: { menumc: menumc }, yes: function (index, layero) {
              var data = layui.form.val("form-group-cx");
              layui.table.reload(tableid, {
                where: { cxtj: JSON.stringify(data) }
              },true);
            }
          });
        }
        ,upload:function(){
          console.log('upload')
          $('#_upload').click();
        }
        ,import:function(){
          console.log('import')
          $('#_import').click();
        }
        , edit: function () {
          var checkStatus = layui.table.checkStatus(tableid);
          var data = checkStatus.data;
          if (data.length == 0) {
            layer.msg('请选择一行!');
            return;
          }
          admin.popup({ url: '/qxgl/userinput', data: { yhbhid: data[0].yhbhid }, area: ['40%', '80%'], offset: 'r', });
          var data=layui.table.getData(tableid)
          console.log(data)
        }
        , del: function () {
          var checkStatus = layui.table.checkStatus(tableid);
          var data = checkStatus.data;
          if (data.length == 0) {
            layer.msg('请选择一行!');
            return;
          }
          layer.confirm('确定要删除该数据?', {
            btn: ['确定', '取消'] //按钮
          }, function () {
            admin.post({
              url: '/qxgl/delYhzd', data: { yhbhid: data[0].yhbhid }, success: function (res) {
                if (res.flag) {
                  layer.msg(res.msg);
                  table.reload(tableid, true);
                } else {
                  layer.alert(res.msg);
                }
              }
            })
          }, function () {
  
          });
  
        }
        , add: function () {
          //获取表格当前数据
          var mdata = table.cache[tableid];
          admin.popup({ url: '/qxgl/userinput', data: {}, area: ['40%', '70%'], offset: 'r', })
        }
        , export: function () {
          console.log(table.cache[tableid])
          //window.open(conf.requestUrl + '/qxgl/DownloadExcel');
          layui.table.exportFile(tableid, null, 'xlsx');
        }
      }
      
      // params.done = function (res) {
      //   done(res);
      // }
      params = $.extend(true,defaultParams, params);
      layui.util.event(id,params);
      
    }
    //下拉框封装
    self.xmselect = function (params) {
      var el = params.el || ''
      // if(el.indexOf('=')>=0){
      //   el=el.replace(']','').split('=')[2]
      // }
      params.el = '#' + el;
      params.name = el;
      var arr = params.arr || '';
      var array = []
      if (arr != null && arr.length > 0) {
        array = params.arr.split(',');
      }
      var url = params.url || ''
      var postdata = params.postdata || {}
      var data = params.data || []
      var radioflag = params.radio
      if (radioflag == undefined) radioflag = true; //默认是单选,如果radio:false则是多选
      var tableid = params.tableid || ''
      //var on=params.on||function(){}
      var page = params.page || false
      var mtype = params.mtype || 'absolute'
      if (page) {
        params.filterable = true
        params.paging = false
        params.pageSize = 20
        params.remoteSearch = true
        params.remoteMethod = function (val, cb, show) {
          self.post({
            url: url, data: { val: val }, success: function (res) {
              cb(res.data)
            }
          })
        }
        params.filterDone = function (val, list) {
          console.log('搜索完毕, 搜索关键词:' + val + ', 过滤数据: ' + list.length + '个')
        }
      }

      var defaultParams = {

        //el: el,
        toolbar: {
          show: radioflag ? false : true,
        },
        //filterable: true,
        // paging: true,
        // pageSize: 3,
        // direction: 'down',
        //name: el,
        layVerify: 'required',
        layVerType: 'msg',
        // id: 'yhzid',
        size: 'small',
        radio: radioflag,
        clickClose: radioflag,
        model: {
          icon: radioflag ? 'hidden' : '',//是否隐藏多选框
          type: mtype, // relative
          label: {
            type: 'text',
            text: {
              //左边拼接的字符
              left: '',
              //右边拼接的字符
              right: '',
              //中间的分隔符
              separator: ', ',
            },
          }
        },

        data: [],
        on: function (data) {
          //arr:  当前多选已选中的数据
          var arr1 = data.arr;
          if (arr1.length == 0) return
          if (tableid != '') {

            var tablearr = layui.table.cache[tableid];
            var temparr = el.split('-')
            tablearr[temparr[1]][temparr[0]] = arr1[0].value
          }
          if ($.isFunction(params.on)) params.on(data)
        }
      }

      var selectid = xmSelect.render($.extend(defaultParams, params));
      if (url == '') {
        selectid.update({ data: data });
        if (array.length > 0) {
          selectid.setValue(array);
        }
      } else {
        self.post({
          url: url, data: postdata, success: function (res) {
            if (res.flag) {
              selectid.update({ data: res.data });
              if (array.length > 0) {
                selectid.setValue(array);
              }
            } else {
              layer.msg(res.msg);
            }
          }
        });
      }
      return selectid;
    }
    //下拉框赋值封装
    self.xmsetval = function (xmobj, arr) {
      var array = []
      if (arr != null && arr.length > 0) {
        array = arr.split(',');
      }
      var url = xmobj.options.url
      if (xmobj.options.remoteSearch) {
        self.post({
          url: url, data: { arrstr: arr }, success: function (res) {
            if (res.flag) {
              xmobj.update({ data: res.data });
              if (array.length > 0) {
                xmobj.setValue(array);
              }
            } else {
              layer.msg(res.msg);
            }
          }
        });
      } else {
        if (array.length > 0) {
          setTimeout(() => {
            xmobj.setValue(array);
          }, 200);

        }

      }
    }
    //弹窗封装，增加查询窗口
    self.popup = function (params) {

      var url = params.url || ''
      var success = params.success || function () { }
      var yes = params.yes || function () { }
      params.skin = 'layui-layer-admin-page'
      POPUP_DATA = params.data || {}
      var defaultParams = {}
      if (url == '/sys/cx') {
        defaultParams = {
          type: 1,
          area: ['85%', '40%'], //宽高
          shadeClose: false,
          moveOut: true,
          maxmin: true,
          shade: 0.01,
          offset: 'rt',
          resize: true,
          //anim: 2,
          btn: ['开始查询', '取消查询'],

          btn2: function (index, layero) {
            layer.close(index);
          }
        }
        params.yes = function (index, layero) {
          var data = layui.form.val("form-group-cx");
          var menumc = $('[name=menumc]').val();
          self.post({ url: '/qxgl/saveCx', data: { menumc: menumc, cxtj: JSON.stringify(data) } })
          yes(index, layero);
          layer.close(index);
        }
        params.skin = 'layui-layer-lan'
      } else {
        defaultParams = {
          type: 1,
          area: ['90%', '90%'], //宽高
          shadeClose: false,
          moveOut: true,
          maxmin: true,
          shade: 0.01,
          //offset: 'r',
          resize: true,
          //anim: 2,
        }

      }

      if (self.isUrl(url)) {
        params.type = 2
        params.content = url
        layer.open($.extend(defaultParams, params))

        return
      }

      view.tab.del(url)
      view.loadHtml(conf.views + url, function (res) {
        var title = $(res.html).attr('lay-title');
        var htmlElem = $('<div>' + res.html + '</div>')
        if (params.title === undefined) {
          params.title = htmlElem.find('title').text() || title;
          if (params.title) htmlElem.find('title').remove()
        }

        params.content = htmlElem.html()
        params.success = function (layer, index) {
          if (url == '/sys/cx') {
            //setTimeout(() => {
            $('.layui-layer-content').css({ "cssText": "overflow:visible!important" })
            // }, 5000);

          } else {
            //移动端键盘会遮挡
            if (isMobileAdapter) {
              $('.layui-layer-content .layui-fluid').css({ 'padding-bottom': '380px' })
            }
          }
          success(layer, index)

          view.parse(layer)
          //重新对面包屑进行渲染
          element.render('breadcrumb', 'nepadmin-breadcrumb')
          view.settoolbtn(title, url);
        }

        params = $.extend(defaultParams, params)
        layer.open($.extend(defaultParams, params))
        setTimeout(function () {
          if (isMobileAdapter) {
            $('.layui-layer-max').click();
            //layer.full();
          }
        }, 50)
      })
    }
    //base64加密封装
    self.base64 = function (lx, str) {
      var ret;
      if (lx == "E") {
        ret = layui.base64.encode(str);
        for (let index = 0; index < 10; index++) {
          ret = layui.base64.encode(ret)

        }

      } else {
        ret = layui.base64.decode(str);
        for (let index = 0; index < 10; index++) {
          ret = layui.base64.decode(ret)

        }
      }
      return ret;

    }

    $(document).on('click', '[zbwebadmin-event="userinfo"]', function (e) {
      self.navigate('/user/userinfo?yhbh=' + self.data()['yhbh'] + '&yhmc=测试&test=8899Admin管理员');
    })
    $(document).on('click', '[zbwebadmin-event="mmxg"]', function (e) {
      self.popup({ url: '/user/mmxg', data: {}, area: ['50%', '50%'], })
    })
    //格式化数字带n位小数

    self.fixed = function (value, n) {
      if (n == undefined) n = 2;
      if (value == undefined) value = 0;
      var f = Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
      var s = f.toString();
      var rs = s.indexOf('.');
      if (rs < 0) {
        s += '.';
      }
      for (var i = s.length - s.indexOf('.'); i <= n; i++) {
        s += "0";
      }
      return s;
    }
    //验证是否为数字
    self.isNumber = function (value) {
      var patrn = /^(-)?\d+(\.\d+)?$/;
      if (patrn.exec(value) == null || value == "") {
        return false
      } else {
        return true
      }
    }
    //table增加记录封装
    self.tableAddRow = function (tableid, params) {

      var focusfield = params.focus || '' //第一个获取焦点的字段
      var defdata = params.defdata || {}  //默认值
      var newrow = {}
      layui.each($('[lay-id="' + tableid + '"]').find('th'), function (i, d) {
        var field = d.dataset.field;
        //if (!self.isNumber(field)) {
        newrow[field] = ''
        //}
      })
      if (defdata) {
        $.extend(newrow, defdata);
      }

      var oldData = layui.table.cache[tableid] == undefined ? [] : layui.table.cache[tableid];
      oldData.push(newrow);
      layui.table.reload(tableid, { data: oldData });
      $('[lay-id="' + tableid + '"]').find('tr[data-index="' + (oldData.length - 1) + '"]').find('td[data-field="' + focusfield + '"]').click()

      $('[lay-id="' + tableid + '"]').on('keyup', '.layui-input', function (event) {
        if (event.keyCode === 13) { // 回车
          layui.stope(event);
          var inputElem = $(this);
          var tdNext = inputElem.parent().nextAll('[data-edit]');
          // (tdNext && tdNext.length) ? tdNext.click() : $(this).blur();
          console.log(tdNext[0])
          if (tdNext && tdNext.length) {
            //console.log('11');
            tdNext.first().click();
            $(".layui-table-edit").select()
          } else {//换行
            //console.log('22');
            var trElement = $(this).closest('tr');
            var trNext = trElement.next();
            //trNext.length ? trNext.find('td[data-edit]').first().click() : inputElem.blur();//没有的就执行这个
            trNext.length ? trNext.find('td[data-edit]').first().click() : $('[lay-id="' + tableid + '"]').find('[lay-event="add"]').click();
            // trNext.select();
            $(".layui-table-edit").select()
          }

        } else {
          // console.log('keyup', 'event.keyCode', event.keyCode);
        }

      });
      //监听单元格事件
      layui.table.on('tool(' + tableid + ')', function (obj) {
        //var data = obj.data;
        //console.log(obj.data)
        var newdata = {};
        if (obj.event === 'date') {
          var field = $(this).data('field');
          layui.laydate.render({
            elem: this.firstChild
            , show: true //直接显示
            , closeStop: this
            , done: function (value, date) {
              newdata[field] = value;
              obj.update(newdata);
              //console.log(JSON.stringify(table.cache[tableid]))
            }
          });
        }
      });
      //监听编辑事件
      layui.table.on('edit(' + tableid + ')', function (obj) {

        var oldValue = $(this).prev().text();

        // var dataChange = obj.data;
        // var indexChange = dataChange.LAY_TABLE_INDEX;
        // var trdom = obj.tr.selector;
        // var price = trdom.match(/\d+/);

        // var tableId = obj.tr.closest('.layui-table-view').attr('lay-id');
        var trIndex = obj.tr.data('index');
        var edittype = $(this).closest('td')[0].dataset.edit;
        if (edittype == 'number' && !self.isNumber(obj.value)) {
          layer.msg('请输入数字!');
          obj.update({ [obj.field]: oldValue })
          $(".layui-table-edit").val(oldValue);
          setTimeout(() => {
            self.tableSetFocus(obj, obj.field)
          }, 200);

        }

        if ($.isFunction(params.editExtend)) params.editExtend(obj)

      });
    }
    //table删除记录封装
    self.tableDelRow = function (tableid) {
      var checkStatus = layui.table.checkStatus(tableid);
      var data = checkStatus.data;
      var array = layui.table.cache[tableid]
      if (data.length == 0) {
        layer.msg('请选择一行!');
        return;
      }

      for (let index = array.length - 1; index >= 0; index--) {
        const element = array[index];
        if (element.LAY_CHECKED) {
          array.splice(element.LAY_TABLE_INDEX, 1)
        }
      }
      layui.table.reload(tableid, { data: array })
    }
    //table赋值
    self.tableSetValue = function (obj, field, val) {
      var fieldkey = obj.tr.find('[data-field="' + field + '"]').attr('data-key')
      obj.tr.find('td[data-field="' + field + '"]').html('<div class="layui-table-cell laytable-cell-' + fieldkey + '">' + val + '</div>')
      obj.update({ [field]: val })

    }
    //设置焦点，其实就是单击单元格事件
    self.tableSetFocus = function (obj, field) {
      obj.tr.find('td[data-field="' + field + '"]').click()
    }
    //禁用编辑,包括table,form
    self.DisabledEdit = function (tableids, forms) {
      if (tableids) {
        var array = tableids
        for (let index = 0; index < array.length; index++) {
          const tableid = array[index];
          layui.each($('[lay-id="' + tableid + '"]').find('th'), function (i, d) {
            var field = d.dataset.field;
            $('[lay-id="' + tableid + '"]').find('td[data-field="' + field + '"]').data('edit', false)
            $('[lay-id="' + tableid + '"]').find('.layui-table-tool-temp').find('.layui-inline').remove() //移除按钮
            $('[lay-id="' + tableid + '"]').find('.layui-form-checkbox').remove();
            $('[lay-id="' + tableid + '"]').find('.laytable-cell-checkbox').remove();


          })
        }
      }
      if (forms) {
        var array = forms
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          $('[lay-filter="' + element + '"]').find('input').attr('disabled', true)

        }
      }
    }
    //table获取所有数据
    self.tableGetData = function (tableid, columns) {

      var olddata = layui.table.cache[tableid]
      var newdata = eval('(' + JSON.stringify(olddata) + ')')
      //$.extend(newdata,olddata)
      layui.each(newdata, function (i, d) {
        delete d['0']
        delete d['1']
        delete d['LAY_TABLE_INDEX']
        if (columns) {
          layui.each(columns, function (i, col) {
            delete d[col]
          })
        }
      })
      return newdata;
    }
    //table工具按钮
    self.tableToolBtn = function (btnarray) {

      console.log(btnarray)
      var html = ''
      for (let index = 0; index < btnarray.length; index++) {
        const element = btnarray[index];
        var toolbar = {
          add: '<button type="button" class="layui-btn layui-btn layui-btn-primary layui-btn-sm" lay-event="add">增加</button>'
          , del: '<button type="button" class="layui-btn layui-btn layui-btn-primary layui-btn-sm" lay-event="del">删除</button>'
          , import: '<button type="button" class="layui-btn layui-btn layui-btn-primary layui-btn-sm" lay-event="import">导入</button>'
        }[element]
        html += toolbar
      }
      return '<div><div class="layui-btn-group" style="padding-right:10px">' + html + '</div></div>'


    }
    //日期格式化
    self.dateformat = function (date) {
      var datestr = "";
      if (date) {
        //datestr=date.split('T')[0];
        datestr = date.replace('T00:00:00', '');
        datestr = datestr.replace('T', ' ');
      }
      return datestr;
    }
    //获取表的列名,及显示编号名称的列
    self.getcols = function (array) {
      var json = {}
      if (!array) return json;
      var colstr = "", mcstr = "", pkeystr = ""
      array.forEach(element => {
        if (element.field && !element.mcfield) {
          colstr = colstr + element.field + ','
        }
        if (element.mcfield) {
          mcstr = mcstr + element.field + ','
        }
        if (element.pkey) {
          pkeystr = element.field
        }
      });
      colstr = colstr.substring(0, colstr.length - 1)
      mcstr = mcstr.substring(0, mcstr.length - 1)

      json.colstr = colstr
      json.mcstr = mcstr
      json.pkeystr = pkeystr
      return json
    }
    //日期设置封装
    self.laydate = function (params) {
      var elem = params.elem || '';
      var val1 = params.val || '';
      var date = new Date();
      var val2 = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
      var val = val1
      if (!val) {
        val = val2
      }
      var defaultParams = {
        elem: elem
        , value: val
        , isInitValue: true
        // , theme: 'molv'
        , type: 'date'
        //, showBottom: false
        , trigger: 'click'
        //,format: 'yyyy-MM-dd H:m:s'
        , format: 'yyyy-MM-dd'
      }

      params = $.extend(defaultParams, params);
      layui.laydate.render(params);

    }

    /**
     * 异步加载依赖的javascript文件
     * src：script的路径
     * callback：当外部的javascript文件被load的时候，执行的回调
     */
    self.loadjs = function (src, callback) {
      var srcArray = src.split("?")[0].split("/");
      var scr_src = srcArray[srcArray.length - 1];

      // 判断要 添加的脚本是否存在如果存在则不继续添加了
      var scripts = document.getElementsByTagName("script");
      if (!!scripts && 0 != scripts.length) {
        for (var i = 0; i < scripts.length; i++) {
          if (-1 != scripts[i].src.indexOf(scr_src)) {
            if (callback) callback();
            return true;
          }
        }
      }

      // 不存在需要的则添加
      var head = document.getElementsByTagName("head")[0];
      var script = document.createElement("script");
      script.setAttribute("type", "text/javascript");
      script.setAttribute("src", src);
      script.setAttribute("async", true);
      script.setAttribute("defer", true);
      head.appendChild(script);

      //fuck ie! duck type
      if (document.all) {
        script.onreadystatechange = function () {
          var state = this.readyState;
          if (state === 'loaded' || state === 'complete') {
            if (callback) callback();
          }
        };
      } else {
        //firefox, chrome
        script.onload = function () {
          if (callback) callback();
        };
      }
    }
    /*end*/
    if ($(window).width() <= mobileWidth) {
      mobileAdapter()
    } else {
      var flexibleOpen = self.data().flexible
      self.flexible(flexibleOpen === undefined ? true : flexibleOpen)
    }

    exports('admin', self)
  })
