const SKIN_FLAG = {
  PRE: 'pre',
  NEXT: 'next',
  ALL: 'all',
}
const jobClass = 'JobMgr'
const RELATION = [{
  label: '展开源节点',
  value: 'source',
},{
  label: '展开目标节点',
  value: 'target',
},{
  label: '展开所有目标',
  value: 'allTarget',
},{
  label: '展开所有源',
  value: 'allSource',
}];

export default {
  req: {
    getStatus: {
      url: '/api/Job/getAllPDCJobStatus',
      data: {
        flowName: 'jobId',
        name: 'pdfId',
      }
    },
  },
  nodeAttrs: ["id","label","type","imgSrc","img"],
  nodeFlag: 'pdc',
  flowRun: 'websocket',
  showStatus: true,
  canRemoveLine: false,
  isContactAttach: false,
  emptyFlowTipShow: false,
  toolbar: [
    [{
      icon: 'fa fa-refresh',
      color: 'green',
      title: '刷新 ctrl+r',
      event:{
        click: function(){
          this.flow.refreshFlow(this);
        }
      },
    },{
      icon: 'fa fa-play',
      color: 'green',
      title: '启动',
      load: false,
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
      event:{
        click: function(flow,btn){
          this.flow.resetJob(this,btn);
        }
      },
    },{
      icon: 'fa fa-mail-reply-all',
      color: 'blue',
      title: '返回上一层',
      disabled: function(flow){
        return flow.vue.layers && !JSON.parse(window.sessionStorage.getItem(flow.vue.layers)).slice(-1).pop();
      },
      event:{
        click: function(){
          this.flow.modifyFlowLayer(this);
          this.flow.initFlow(this);
        }
      },
    },{
      icon: 'fa fa-binoculars',
      color: '#424c50',
      title: '搜索 ctrl+f',
      disabled(flow){
        return (JSON.stringify(flow.vue.nodes) == '{}');
      },
      event:{
        click: function(){
          this.flow.findNode();
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
      title: '切换节点标签显示',
      icon: 'fa fa-book',
      color: 'green',
      event:{
        click: function(){
          this.flow.toggleNodeLabel();
        }
      }
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
      title: '返回',
      icon: 'fa fa-long-arrow-left',
      color: '#3de1ad',
      hide: function(flow){ return !flow.flowType },
      disabled: function(flow){ return !flow.flowType },
      event: {
        click: function(){
          this.$router.go(-1);
        }
      },
    }],
  ],
  copyData: function(Vue){
    let data = {
      nodes: Vue.focusNodes.map(key=>Vue.nodes[key]),
      lines: Vue.lines.filter(line=>Vue.focusNodes.includes(line[0])&&Vue.focusNodes.includes(line[1])),
    };
    localforage.setItem('copyData',JSON.stringify(data));
    VUE.$message({
      type: 'info',
      message: '数据已复制',
      showClose: true
    })
  },
  selectBoxRightClick: function(e,Vue){
    let contextmenu = [{
      text: '复制',
      icon: 'fa fa-clone',
      iconColor: 'green',
      click: function(){
        Vue.flow.copyData(Vue);
        Vue.flow.contextmenu.hideMenu();
      }
    }];
    Vue.flow.contextmenu.showMenu(e,contextmenu);
  },
  nodeDbClick: function(e,node,Vue){
    if(Vue.flow.flowType == 'flowModule'){ //如果是数据流模型
      if(node.viewNodeFlag){
        Vue.nodeObj.intoNode(Vue);
      }else{
        Vue.$router.push({ path: '/pdcForm', query: { guid: node.guid, label: node.title }});
      }
    }else{
      Vue.$router.push({
        path: '/job', 
        query: { pdcName:node.id, link:Vue.flow.flowName,storyId:Vue.flow.pId, flowType:'relation', relationType:'targetAndSource' } 
      })
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
      text: node.viewNodeFlag ? '进入视图' : '编辑表单',
      icon: node.viewNodeFlag ? 'fa fa-sitemap fa-rotate-270' : 'fa fa-edit',
      iconColor: 'blue',
      show(){ return !(node.viewNodeFlag && Vue.flow.flowType !== 'flowModule') }, //是否屏蔽进入视图的功能
      click: function(){
        Vue.flow.contextmenu.hideMenu();
        Vue.flow.nodeDbClick(e,node,Vue);
      }
    },{
      text: '忽略节点',
      icon: 'fa fa-check-square',
      iconColor: '#bddd22',
      show(){ return !node.viewNodeFlag },
      click: function(){
        Vue.flow.ignoreError(Vue,Vue.flow.flowName,node.id)
      }
    },{
      text: '重置运行状态',
      icon: 'fa fa-paint-brush',
      iconColor: 'orange',
      show(){ return !node.viewNodeFlag },
      click: function(){
        Vue.flow.resetNode(Vue,Vue.flow.flowName,[node.id]);
        Vue.flow.contextmenu.hideMenu()
      }
    },{
      text: '重置并重跑影响节点',
      icon: 'fa fa-repeat',
      iconColor: '#40de5a',
      show(){ return (Vue.flow.flowType == 'flowModule' && !node.viewNodeFlag) && (Vue.nodesStatus.CONTENT && Vue.nodesStatus.CONTENT[node.id] && Vue.nodesStatus.CONTENT[node.id].status != 'unkown') },
      click: function(){
        Vue.flow.resetNodeAndReRun(Vue,Vue.flow.flowName,node.id);
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: ((Vue.nodesStatus.CONTENT && Vue.nodesStatus.CONTENT[node.id] && Vue.nodesStatus.CONTENT[node.id].status == 'suspend') ? '激活' : '挂起')+'节点',
      icon: 'fa fa-power-off',
      iconColor: '#ff4e20',
      show(){ return !node.viewNodeFlag },
      click: function(){
        Vue.flow.suspendPDC(Vue,Vue.flow.flowName,node.id,Vue.nodesStatus.CONTENT[node.id].status == 'suspend' ? '激活' : '挂起');
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: '查询历史记录',
      icon: 'fa fa-history',
      iconColor: '#666',
      show(){ return !node.viewNodeFlag },
      click: ()=>{
        Vue.flow.contextmenu.hideMenu();
        Vue.$openDialog(new dc.Dialog({
          verticalCenter: true,
          title: '历史记录',
          top: '40px',
          width: '1000px',
          component: 'historyTable',
          data: { jobId:Vue.flow.flowName, pdcName:node.id },
        }));
      }
    },
    {
      text: '打开数据流模型',
      icon: 'fa fa-sitemap fa-rotate-270',
      iconColor: 'blue',
      show(){ return node.hasModule },
      click: function(){
        Vue.flow.contextmenu.hideMenu();
        Vue.$router.push({ 
          path: '/job', 
          query: { pdcName:node.id, link: Vue.flow.flowName, id:Vue.flow.flowName,storyId:Vue.flow.pId, flowType:'flowModule' } 
        });
      }
    },
    {
      text: '指派代理机',
      icon: 'fa fa-laptop',
      iconColor: '#666',
      show(){ return (Vue.flow.flowType == 'flowModule' && !node.viewNodeFlag) },
      click: ()=>{
        Vue.flow.contextmenu.hideMenu();
        Vue.$openDialog(new dc.Dialog({
          verticalCenter: true,
          title: '指派代理机',
          width: '600px',
          component: 'agentsList',
          data: { 'jobId':Vue.flow.flowName, 'rowName':node.id, 'type':'PDC' },
        }));
      }
    },{
      text: '设置优先级',
      icon: 'fa fa-exchange',
      iconColor: '#666',
      show(){ return !node.viewNodeFlag },
      children: Vue.flow.setPriorityContextmenuChildren(Vue,Vue.flow.flowName,node.id)
    },{
      text: node.viewNodeFlag ? '视图展开' : '视图合并',
      icon: node.viewNodeFlag ? 'fa fa-expand' : 'fa fa-compress',
      iconColor: 'blue',
      show(){ return (Vue.flow.getGroup(node.id, Vue.groups).index > -1) },
      click: function(){
        Vue.nodeObj.zoom(Vue,node,e);
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: '显示视图成员',
      icon: 'fa fa-user-plus',
      iconColor: '#ff8c31',
      show(){ return (Vue.flow.getGroup(node.id, Vue.groups).index > 0) },
      click: function(){
        Vue.focusNodes.push(Vue.flow.getGroup(node.id, Vue.groups).member);
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
    },
    {
      text: '查看运行日志',
      icon: 'fa fa-info-circle',
      iconColor: '#177cb0',
      click: ()=>{
        Vue.$openDialog(new dc.Dialog({
          verticalCenter: true,
          top: '40px',
          title: '运行日志',
          component: 'traceInfo',
          data: { url: '/api/Job/getLog0', hasBtn:true, params:{pdcName: node.id, jobId: Vue.flow.flowName, storyId: Vue.flow.storyId }},
          width: '900px',
        }));
      }
    }
    // {
    //   text: '查看DC详情',
    //   icon: 'fa fa-list-alt',
    //   iconColor: 'blue',
    //   show(){ return !node.viewNodeFlag },
    //   click: ()=>{
    //     // let urls = ['getDataAndMean','getStandardView','getDataView','getCodeView','getLog'].map(item=>{return DCURL.job[item]});
    //     let urls = ['Job/getLog'];
    //     Vue.$openDialog(new dc.Dialog({
    //       top: '40px',
    //       component: 'tabsForm',
    //       data: { urls: urls, params:{pdcName: node.id, jobId: Vue.flow.flowName, storyId: Vue.flow.storyId }},
    //       width: '900px',
    //     }));
    //   }
    // }
    ];
    RELATION.forEach(item=>{
      contextmenu.push({
        text: item.label,
        icon: 'fa fa-share-alt',
        iconColor: 'green',
        show(){ return (Vue.flow.flowType != 'flowModule' && !node.viewNodeFlag) },
        click:()=>{ 
          // if(Vue.$route.query.flowType == 'relation'){
            let skinship = SKIN_FLAG[item.value.includes('arget') ? 'PRE' : 'NEXT'];
            Vue.flow.zoomSkinship(node,Vue,skinship);
            let links = Vue.lines;
            // let links = Vue.flow.getSkinship(Vue,node,skinship).lines;
            Vue.$store.commit('setRelationFlowData',{links:links})
          // }
          Vue.$router.push({
            path: '/job', 
            query: { pdcName:node.id, link:Vue.flow.flowName,storyId:Vue.flow.pId, flowType:'relation', relationType:item.value } 
          })
        }
      });
    })

    if(dcConfig.customModule.dataquality){
      //数据质量框架
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
                data: {vue:Vue,guid:node.id, sRuleIds:res.CONTENT.sRulesIds||"",dataGuid:res.CONTENT.dataGuid,dataCdc:res.CONTENT.dataCdc},
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
  getFlow: (Vue)=>{ //获取流图数据
    Vue.flowLoading = true;
    let reqParams = getFlowReqParams(Vue);
    DCHttp.req(reqParams).then(res => {
      Vue.flowLoading = false
      Vue.flow.name = Vue.$route.query.pdfId || res.CONTENT.pdfId;
      Vue.flow.getFlowFinished(Vue,res);
    }).catch(err => {
      Vue.$router.go(-1)
    })
  },
}

function getFlowReqParams(Vue){
  let reqParams = {};
  switch(Vue.flow.flowType){
    case 'relation':
      let data = {};
      Vue.$store.commit('getRelationFlowData',data);
      reqParams = {
        url: '/api/Job/getDependFlow',
        params: { jobId: Vue.flow.flowName, id: Vue.$route.query.pdcName, type:Vue.$route.query.relationType || RELATION[3].value, flowData:data.flowData }
        // params: { jobId: Vue.flow.flowName, id: Vue.$route.query.pdcName, type:Vue.$route.query.relationType || RELATION[3].value }
      }
      break;
    case 'flowModule':
      if(Vue.$route.query.pdfId){
        reqParams = {
          url: 'UDF=WebPDFMgrUDF&FUNC=getPDF',
          params: { pdfId: Vue.$route.query.pdfId }
        }
      }else{
        reqParams = {
          url: '/api/Job/getDataFlowModel',
          params: { pdfName: Vue.$route.query.pdcName, jobId:Vue.flow.flowName }
        }
      }
      break;
    default:
      reqParams = {
        url: '/api/Job/getNodes',
        params: { jobId: Vue.flow.flowName }
      }
      break;
  }
  return reqParams;
}