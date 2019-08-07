const SKIN_FLAG = {
  PRE: 'pre',
  NEXT: 'next',
  ALL: 'all',
}


let params = {
  req: {
    getFlow: {
      url: '/api/PDF/get',
      data: {
        flowName: 'id',
      }
    },
    getView: {
      url: '/api/PDF/getView',
      data: {
        flowName: 'pdfId',
        viewName: 'viewId',
      }
    },
    getStatus: {
      url: '/api/PDF/getStatus',
      data: {
        flowName: 'pdfId',
        name: 'jobId'
      }
    },
    saveFlow: {
      url: '/api/PDF/save',
      data: {
        flowName: 'id',
      }
    },
    createView: {
      url: '/api/PDF/createView',
      data: {
        intoGroup: 'pdcNames',
        viewLabel: 'viewName',
        flowName: 'flowName',
        layer: 'layer',
      }
    },
    intoView: {
      url: '/api/PDF/intoView',
      data: {
        intoGroup: 'pdcNames',
        viewName: 'viewName',
        flowName: 'pdfId',
      }
    },
    removeView: {
      url: '/api/PDF/deleteView',
      data: {
        viewName: 'viewName',
        flowName: 'flowName'
      }
    },
    getPDCTree:{
      url: '/api/tree/getAllTree',
    },
    getPDFTree:{
      url: '/api/tree/getAllTree',
    },
    getPDC:{
      url: '/api/PDC/list',
    },
    addNode:{
      url: '/api/tree/getAddFlow',
    },
  },
  dcType: 'pdf',
  nodeAttrs: ["id","label","type","imgSrc","img"],
  nodeFlag: 'pdc',
  canRemoveLine: true,
  isContactAttach: true,
  canNodeIntoView: true,
  flowRun: 'interval',
  showStatus: true,
  toolbar: [
    [{
      icon: 'fa fa-save',
      color: 'blue',
      title: '保存 ctrl+s',
      event:{
        click: function(){
          this.flow.saveFlow(this);
        }
      },
    },{
      icon: 'fa fa-refresh',
      color: 'green',
      title: '刷新 ctrl+r',
      event:{
        click: function(){
          this.flow.refreshFlow(this);
        }
      },
    },{
      icon: 'fa fa-plus',
      color: 'blue',
      title: '引入PDC',
      disabled: function(flow){
        return flow.vue.layers && JSON.parse(window.sessionStorage.getItem(flow.vue.layers)).length > 1
      },
      event:{
        click: function(flow){
          flow.addPDC(this,'pdc');
        }
      },
    },{
      icon: 'fa fa-plus-circle',
      color: 'blue',
      title: '引入镜像节点',
      disabled: function(flow){
        return flow.vue.layers && JSON.parse(window.sessionStorage.getItem(flow.vue.layers)).length > 1
      },
      event:{
        click: function(flow){
          flow.addPDC(this,'mirror');
        }
      },
    },{
      icon: 'fa fa-plus-square',
      color: 'blue',
      title: '引入外部节点',
      disabled: function(flow){
        return flow.vue.layers && JSON.parse(window.sessionStorage.getItem(flow.vue.layers)).length > 1
      },
      event:{
        click: function(flow){
          flow.addPDC(this,'reference');
        }
      },
    },{
      icon: 'fa fa-plus-square',
      color: 'green',
      title: '外部引入PDF',
      disabled: function(flow){
        return flow.vue.layers && JSON.parse(window.sessionStorage.getItem(flow.vue.layers)).length > 1
      },
      event:{
        click: function(flow){
          flow.addPDF(this,'reference');
        }
      }
    },{
      icon: 'fa fa-plus-circle',
      color: 'green',
      title: '引入镜像PDF',
      disabled: function(flow){
        return flow.vue.layers && JSON.parse(window.sessionStorage.getItem(flow.vue.layers)).length > 1
      },
      event:{
        click: function(flow){
          flow.addPDF(this,'mirror');
        }
      }
    },{
      icon: 'fa fa-tint fa-rotate-180',
      color: '#177cb0',
      title: '显示标签',
      hide: function(){ return !dcConfig.customModule.tagManager },
      event:{
        click: function(flow,btn,r,i,e){
          flow.choseUsers(this,e);
        }
      },
    },{
      title: '展开所有折叠的节点',
      icon: 'fa fa-arrows',
      color: 'green',
      disabled(flow){
        return !(flow.vue.nodes && Object.keys(flow.vue.nodes).some(k=>flow.vue.nodes[k][SKIN_FLAG.NEXT] || flow.vue.nodes[k][SKIN_FLAG.PRE]) )
      },
      event: {
        click: function(flow){
          flow.zoomAll(flow.vue);
        }
      },
    },{
      icon: 'fa fa-rotate-180 fa-share-alt',
      color: '#0aa344',
      title: '前置PDF配置',
      event:{
        click: function(flow){
          VUE.$openDialog(new dc.Dialog({
            verticalCenter: true,
            title: '前置PDF',
            width: '400px',
            component: 'prePDF',
            data: { pdfId: flow.flowName, storyId: flow.storyId },
          }));
        }
      },
    },{
      title: '数据更新配置列表',
      icon: 'fa fa-tasks',
      color: 'black',
      event: {
        click: function(flow){
          let dialog = new dc.Dialog({
            verticalCenter: true,
            title: 'PDF数据更新配置列表',
            width: '400px',
            component: 'jobList',
            data: { flowName: flow.flowName, pId:flow.pId },
            hasBtn: true,
            btnGroup: [{
              text: '取消指定',
              click:(dialog,component)=>{
                flow.resetJobInfo();
                dialog.show = false;
                //为了立即响应
                flow.toolbar.push(null);
                flow.toolbar.pop();
              }
            },{
              text: '指定',
              type: 'primary',
              click:(dialog,component)=>{
                const jobInfo = component.table.tableData.find(item=>item == component.table.currentRow);
                if(jobInfo){
                  flow[flow.flowName] || (flow[flow.flowName] = {});
                  flow[flow.flowName].jobInfo = {
                    time: VUE.$formatTime(jobInfo.jobTime,'yyyy-mm-dd hh:mm'),
                    poolSize: jobInfo.poolSize,
                    id: jobInfo.jobId,
                    name: jobInfo.jobName
                  }
                  dialog.show = false;
                  //为了立即响应
                  flow.toolbar.push(null);
                  flow.toolbar.pop();
                }else{
                  flow.resetJobInfo();
                  VUE.$alert('请先选择Job，再指定');
                  //为了立即响应
                  flow.toolbar.push(null);
                  flow.toolbar.pop();
                }
              }
            }]
          });
          VUE.$openDialog(dialog);
        }
      },
    },{
      icon: 'fa fa-play',
      color: 'green',
      title: '启动',
      load: false,
      hide: function(){ 
        let show; 
        try{ show = this.flow[this.flow.flowName].jobInfo.id }catch(e){ };
        return !show;
      },
      event:{
        click: function(flow,btn){
          this.flow.choseStartJob(this,btn);
        }
      },
    },{
      icon: 'fa fa-stop',
      color: 'red',
      title: '中断',
      load: false,
      hide: function(){ 
        let show; 
        try{ show = this.flow[this.flow.flowName].jobInfo.id }catch(e){ };
        return !show;
      },
      event:{
        click: function(flow,btn){
          this.flow.stopJob(this,btn);
        }
      },
    },{
      icon: 'fa fa-paint-brush',
      color: 'orange',
      title: '重置错误节点',
      load: false,
      hide: function(){ 
        let show; 
        try{ show = this.flow[this.flow.flowName].jobInfo.id }catch(e){ };
        return !show;
      },
      event:{
        click: function(flow,btn){
          this.flow.resetErrorJob(this,btn);
        }
      },
    },{
      icon: 'fa fa-warning',
      color: '#f20c00',
      title: '重置',
      load: false,
      hide: function(){ 
        let show; 
        try{ show = this.flow[this.flow.flowName].jobInfo.id }catch(e){ };
        return !show;
      },
      event:{
        click: function(flow,btn){
          this.flow.resetJob(this,btn);
        }
      },
    },{
      icon: 'fa fa-exchange',
      color: '#ffc773',
      title: '树上选中',
      hide: function(){ 
        let show; 
        try{ show = this.flow[this.flow.flowName].jobInfo.id }catch(e){ };
        return !show;
      },
      event:{
        click: function(){
          Tree.setCurrentKey(this.flow[this.flow.flowName].jobInfo.id);
        }
      },
    },{
      icon: 'fa fa-sliders',
      color: '#808080',
      title: '设置默认队列并发数',
      hide: function(){ 
        let show; 
        try{ show = this.flow[this.flow.flowName].jobInfo.id }catch(e){ };
        return !show;
      },
      event:{
        click: function(){
          this.flow.setPoolSize(this);
        }
      },
    },{
      icon: 'fa fa-file-text',
      color: 'blue',
      title: '修改上下文参数',
      hide: function(){ 
        let show; 
        try{ show = this.flow[this.flow.flowName].jobInfo.id }catch(e){ };
        return !show;
      },
      event:{
        click: function(){
          VUE.$openDialog(new dc.Dialog({
            verticalCenter: true,
            title: '修改上下文参数',
            width: '600px',
            component: 'jobContext',
            data: { jobId: this.flow[this.flow.flowName].jobInfo.id }
          }))
        }
      },
    }],
    [{
      icon: 'fa fa-reply',
      color: 'blue',
      title: '撤销 ctrl+z',
      disabled: function(flow){
        return flow.recordIndex == 0
      },
      event:{
        click: function(){
          this.flow.historyUndo(this);
        }
      },
    },{
      icon: 'fa fa-share',
      color: 'blue',
      title: '重做 ctrl+y',
      disabled: function(flow){
        return flow.recordIndex == flow.recordLength
      },
      event:{
        click: function(){
          this.flow.historyRedo(this);
        }
      },
    },{
      icon: 'fa fa-align-left',
      title: '自动布局 ctrl+l',
      event:{
        click: function(){
          this.panelObj.autoLayout(this, this.nodes, this.lines);
        }
      },
    },{
      title: '切换线的粗细 ctrl+b',
      icon: 'fa fa-usb',
      event: {
        click: function(){
          this.linesObj.changeWidth(this);
        }
      },
    },{
      title: '放大 ctrl+=',
      icon: 'fa fa-search-plus',
      color: 'green',
      event: {
        click: function(){
          this.panelObj.zoomIn(this);
        }
      },
    },{
      title: '缩小 ctrl+-',
      icon: 'fa fa-search-minus',
      color: 'green',
      event: {
        click: function(){
          this.panelObj.zoomOut(this);
        }
      },
    },{
      icon: 'fa fa-binoculars',
      color: '#424c50',
      title: '搜索 ctrl+f',
      disabled: function(flow){
        return (JSON.stringify(flow.vue.nodes) == '{}');
      },
      event:{
        click: function(){
          this.flow.findNode();
        }
      },
    },{
      title: '切换节点标签显示',
      icon: 'fa fa-book',
      color: 'green',
      event:{
        click: function(){
          this.flow.toggleNodeLabel();
        }
      }
    },{
      icon: 'fa fa-object-group',
      color: 'blue',
      title: '创建视图',
      disabled: function(flow){
        let disabled = true;
        try{
          if(Object.keys(flow.vue.selectBox.attr.nodes).length){
            disabled = false;
            for(let i in flow.vue.selectBox.attr.nodes){
              if(flow.vue.selectBox.attr.nodes[i].viewNodeFlag){
                disabled = true;
                break;
              }
            }
          }
        }catch(e){ 
          disabled = true;
        }
        return disabled;
      },
      event:{
        click: function(flow){
          //获取选框的中心位置
          let viewBoxX = flow.vue.panelObj.viewBoxX,
              viewBoxY = flow.vue.panelObj.viewBoxY,
              ratioX = flow.vue.panelObj.ratioX(),
              ratioY = flow.vue.panelObj.ratioY();
          let graph = flow.vue.$refs.graph;
          let clientRect = graph.getBoundingClientRect();
          let e = {
            clientX: (flow.vue.selectBox.attr.x+flow.vue.selectBox.attr.width/2-viewBoxX)/ratioX+clientRect.left-graph.scrollLeft,
            clientY: (flow.vue.selectBox.attr.y+flow.vue.selectBox.attr.height/2-viewBoxY)/ratioY+clientRect.top-graph.scrollTop,
          }
          flow.selectBoxDbClick(e,flow.vue);
        }
      },
    },{
      icon: 'fa fa-mail-reply-all',
      color: 'blue',
      title: '返回上一层',
      hide: function(flow){ return this.layers && !JSON.parse(window.sessionStorage.getItem(flow.vue.layers)).slice(-1).pop() },
      event:{
        click: function(){
          this.flow.modifyFlowLayer(this);
          this.flow.initFlow(this);
        }
      },
    },{
      title: '切换显示视图的直系前驱和直接后继节点',
      icon: 'fa fa-eye',
      color: 'green',
      hide: function(flow){ return this.layers && !JSON.parse(window.sessionStorage.getItem(flow.vue.layers)).slice(-1).pop() },
      event: {
        click: function(flow){
          Object.keys(flow.vue.nodes).forEach(key=>{
            if(['src','dst'].includes(flow.vue.nodes[key].type)){
              flow.vue.nodes[key].visible = !flow.vue.nodes[key].visible
            }
          })
        }
      },
    }]
  ],
  getStatus: function(Vue,flow){ //获取运行状态及信息
    let jobId = "";
    try{ jobId = flow[flow.flowName].jobInfo.id }catch(e){}
    if(jobId && Object.keys(Vue.nodes).length){
      const url = flow.req.getStatus.url;
      const params = { jobId: jobId, pdfId: flow.flowName }
      if(flow.statusErrTimes < 3){
        DCHttp.req({url:url, params:params}).then(res => {
          if(res){
            flow.statusErrTimes = 0;
            let nodes = res.CONTENT.nodes;
            Object.keys(nodes).forEach(k=>{
              nodes[k].status = nodes[k].status ? nodes[k].status.replace(/\s+/g,"").toLowerCase() : 'unkown';
            })
            Object.keys(Vue.nodes).forEach(k=>{
              if(nodes[k] && !nodes[k].status){
                nodes[k] = { status:'unkown' }
              }
            })
            Vue.$set(Vue.nodesStatus,'CONTENT',nodes);
          }else{
            flow.statusErrTimes++;
          }
        }).catch(err=>{
          if(err.response.data.ERR_MSG.includes("Job is null")){
            flow.resetJobInfo();
            flow.toolbar.push(null);
            flow.toolbar.pop();
            this.vue.nodesStatus = {};
          }
          flow.statusErrTimes++;
        });
      }else if(flow.statusErrTimes == 3){
        console.warn('接口错误次数较多,建议检查网络',url);
        flow.statusErrTimes++;
      }
    }else{
      this.vue.nodesStatus = {};
    }
  },
  nodeDbClick: function(e,node,Vue){
    if(node.viewNodeFlag){
      Vue.nodeObj.intoNode(Vue);
    }else{
      Vue.$router.push({ path: '/pdcForm', query: {
        guid: node.id,
        label: node.title,
        from: JSON.stringify({path: Vue.$route.path, query: Vue.$route.query})
      }});
    }
  },
  nodeRightClick: function(e,node,Vue){ //节点右击
    let contextmenu = [
      ...[{text:'折叠上游',icon:'fa fa-fast-forward', skinship:SKIN_FLAG.PRE},{text:'折叠下游',skinship:SKIN_FLAG.NEXT, icon:'fa fa-fast-backward'}].map(item=>{
      return {
        text: item.text,
        icon: item.icon,
        iconColor: 'green',
        show: ()=>{ return Vue.flow.getSkinship(Vue,node,item.skinship).nodes.length },
        click: function(){
          Vue.flow.foldingSkinship(node,Vue,item.skinship);
          Vue.flow.contextmenu.hideMenu();
        }
      }
    }),
    ...[{text:'展开上游',icon:'fa fa-backward',skinship:SKIN_FLAG.PRE},{text:'展开下游',icon:'fa fa-forward',skinship:SKIN_FLAG.NEXT}].map(item=>{
      return {
        text: item.text,
        icon: item.icon,
        iconColor: 'green',
        show: ()=>{ return node[item.skinship] },
        click: function(){
          Vue.flow.zoomSkinship(node,Vue,item.skinship);
          Vue.flow.contextmenu.hideMenu();
        }
      }
    }),{
      text: node.viewNodeFlag ? '视图展开' : '视图合并',
      icon: node.viewNodeFlag ? 'fa fa-expand' : 'fa fa-compress',
      iconColor: 'blue',
      show: ()=>{ return Vue.flow.getGroup(node.id, Vue.groups).index > -1 },
      click: function(){
        Vue.nodeObj.zoom(Vue,node,e);
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: '预览视图',
      icon: 'fa fa-eye',
      iconColor: 'green',
      show: ()=>{ return node.viewNodeFlag },
      click: function(){
        Vue.flow.preView(e,node,Vue);
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: node.viewNodeFlag ? '删除视图' : '删除节点',
      icon: node.viewNodeFlag ? 'fa fa-object-ungroup' : 'fa fa-remove',
      iconColor: 'red',
      show: ()=>{ 
        let jobId;
        try{ jobId = Vue.flow[Vue.flow.flowName].jobInfo.id }catch(e){}
        return !(!!jobId && !node.viewNodeFlag) && node.type!='src' && node.type!='dst' 
      },
      click: function(){
        Vue.nodeObj.remove(Vue);
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: node.viewNodeFlag ? '进入视图' : '编辑表单',
      icon: node.viewNodeFlag ? 'fa fa-sitemap fa-rotate-270' : 'fa fa-edit',
      iconColor: 'blue',
      click: function(){
        Vue.flow.nodeDbClick(e,node,Vue);
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: '显示亲缘节点',
      icon: 'fa fa-share-alt',
      iconColor: '#ff461f',
      show: ()=>{ return Vue.flow.getSkinship(Vue,node,SKIN_FLAG.ALL).nodes.length>1 },
      click: function(){
        Vue.nodeObj.getSkinship(Vue, SKIN_FLAG.ALL); 
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: '显示视图成员',
      icon: 'fa fa-user-plus',
      iconColor: '#ff8c31',
      show: ()=>{ return !node.viewNodeFlag && Vue.flow.getGroup(node.id, Vue.groups).index > -1 },
      click: function(){
        Vue.focusNodes.splice(0,Vue.focusNodes.length,...Vue.flow.getGroup(node.id, Vue.groups).member);
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: '添加业务标签',
      icon: 'fa fa-tint fa-rotate-180',
      iconColor: '#177cb0',
      show: ()=>{ return !node.viewNodeFlag && dcConfig.customModule.tagManager },
      click: function(){
        Vue.flow.addLabelTip(node,e,Vue);
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: '查看运行日志',
      icon: 'fa fa-info-circle',
      iconColor: '#177cb0',
      show: ()=>{ 
        let jobId;
        try{ jobId = Vue.flow[Vue.flow.flowName].jobInfo.id;}catch(e){}
        return !!jobId && !node.viewNodeFlag
      },
      click: ()=>{
        Vue.$openDialog(new dc.Dialog({
          verticalCenter: true,
          top: '40px',
          title: '运行日志',
          component: 'traceInfo',
          data: { url: '/api/Job/getLog0', hasBtn:true, params:{pdcName: node.id+'<MainJob>', jobId: Vue.flow[Vue.flow.flowName].jobInfo.id, storyId: Vue.flow.storyId }},
          width: '900px',
        }));
      }
    },{
      text: '忽略节点',
      icon: 'fa fa-check-square',
      iconColor: '#bddd22',
      show: ()=>{ 
        let jobId;
        try{ jobId = Vue.flow[Vue.flow.flowName].jobInfo.id;}catch(e){}
        return !!jobId && !node.viewNodeFlag
      },
      click: function(){
        Vue.flow.ignoreError(Vue,Vue.flow[Vue.flow.flowName].jobInfo.id,node.id+'<MainJob>')
      }
    },{
      text: '重置运行状态',
      icon: 'fa fa-paint-brush',
      iconColor: 'orange',
      show: ()=>{ 
        let jobId;
        try{ jobId = Vue.flow[Vue.flow.flowName].jobInfo.id;}catch(e){}
        return !!jobId && !node.viewNodeFlag
      },
      click: function(){
        Vue.flow.resetNode(Vue,Vue.flow[Vue.flow.flowName].jobInfo.id,[node.id+'<MainJob>']);
        Vue.flow.contextmenu.hideMenu()
      }
    },{
      text: '重置并重跑影响节点',
      icon: 'fa fa-repeat',
      iconColor: '#40de5a',
      show: ()=>{ 
        let jobId;
        try{ jobId = Vue.flow[Vue.flow.flowName].jobInfo.id && Vue.nodesStatus.CONTENT[node.id].status != 'unkown'}catch(e){}
        return !!jobId && !node.viewNodeFlag 
      },
      click: function(){
        Vue.flow.resetNodeAndReRun(Vue,Vue.flow[Vue.flow.flowName].jobInfo.id,node.id+'<MainJob>')
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: ((Vue.nodesStatus.CONTENT && Vue.nodesStatus.CONTENT[node.id] && Vue.nodesStatus.CONTENT[node.id].status == 'suspend') ? '激活' : '挂起')+'节点',
      icon: 'fa fa-power-off',
      iconColor: '#ff4e20',
      show: ()=>{ 
        let jobId;
        try{ jobId = Vue.flow[Vue.flow.flowName].jobInfo.id}catch(e){}
        return !!jobId && !node.viewNodeFlag 
      },
      click: function(){
        Vue.flow.suspendPDC(Vue,Vue.flow[Vue.flow.flowName].jobInfo.id,node.id+'<MainJob>',Vue.nodesStatus.CONTENT[node.id].status == 'suspend' ? '激活' : '挂起');
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: '查询历史记录',
      icon: 'fa fa-history',
      iconColor: '#666',
      show: ()=>{ 
        let jobId;
        try{ jobId = Vue.flow[Vue.flow.flowName].jobInfo.id}catch(e){}
        return !!jobId && !node.viewNodeFlag 
      },
      click: ()=>{
        Vue.flow.contextmenu.hideMenu();
        Vue.$openDialog(new dc.Dialog({
          verticalCenter: true,
          title: '历史记录',
          top: '40px',
          width: '1000px',
          component: 'historyTable',
          data: { jobId:Vue.flow[Vue.flow.flowName].jobInfo.id, pdcName:node.id+'<MainJob>' },
        }));
      }
    },{
      text: '指派代理机',
      icon: 'fa fa-laptop',
      iconColor: '#666',
      show: ()=>{ 
        let jobId;
        try{ jobId = Vue.flow[Vue.flow.flowName].jobInfo.id;}catch(e){}
        return !!jobId && !node.viewNodeFlag
      },
      click: ()=>{
        Vue.$openDialog(new dc.Dialog({
          verticalCenter: true,
          title: '指派代理机',
          width: '600px',
          component: 'agentsList',
          data: { 'jobId':Vue.flow[Vue.flow.flowName].jobInfo.id, 'rowName':node.id+'<MainJob>', 'type':'PDC' },
        }));
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: '设置优先级',
      icon: 'fa fa-exchange',
      iconColor: '#666',
      show: ()=>{ 
        let jobId;
        try{ jobId = Vue.flow[Vue.flow.flowName].jobInfo.id;}catch(e){}
        return !!jobId && !node.viewNodeFlag
      },
      children: Vue.flow.setPriorityContextmenuChildren(Vue,Vue.flow[Vue.flow.flowName].jobInfo.id,node.id+'<MainJob>')
    }];

    if(dcConfig.customModule.dataquality){
      //数据质量框架项目
      DCHttp.req({url:dcConfig.publicPath, params:{
        Class: 'com.leavay.dataquality.DataQualityAction',
        FUNC: 'getDataQualityNodeCfg',
        [dcConfig.paramsKey]: {nodeId: node.id}
      }}).then(res=>{
        if(res && res.CONTENT.isWork){
          //右键菜单加入查看规则配置列表
          contextmenu.push({
            text: '查看规则配置列表',
            icon: 'fa fa-table',
            iconColor: 'blue',
            click: ()=>{
              Vue.$openDialog(new dc.Dialog({
                verticalCenter: true,
                title: '规则列表',
                data: {vue:Vue, guid:node.id, sRuleIds:res.CONTENT.sRulesIds||"",dataGuid:res.CONTENT.dataGuid,dataCdc:res.CONTENT.dataCdc},
                component: 'rulessettingTable',
                width: '1200px',
                top: '40px',
              }));
            }
          });
        }
      })
    }
    
    Vue.flow.contextmenu.showMenu(e,contextmenu);
  },
  initPanel:(Vue)=>{ //初始化画板
    dcConfig.customModule.tagManager && Vue.flow.refreshNodeTips();
    Vue.panelObj.initSize(Vue);
  },
  selectBoxRightClick:(e,Vue)=>{
    let contextmenu = [{
      text: '创建视图',
      icon: 'fa fa-object-group',
      iconColor: 'blue',
      click: function(){
        Vue.flow.selectBoxDbClick(e,Vue);
      }
    }];
    Vue.flow.contextmenu.showMenu(e,contextmenu);
  },
  selectBoxDbClick: function(e,Vue){
    for(let i in Vue.selectBox.attr.nodes){
      if(Vue.selectBox.attr.nodes[i].viewNodeFlag) return;
    }
    VUE.$prompt('请输入视图名称', '创建视图',{
      inputValidator: (value)=>{return !!value && !Vue.nodes[value]},
      inputErrorMessage: '视图名称不能为空且不能已存在'
    }).then(({ value }) => {
      Vue.selectBox.createView(Vue,Vue.nodes,Vue.lines,Vue.groups,e,Vue.panelObj,value);
    }).catch(()=>{});
  }
}

export default params