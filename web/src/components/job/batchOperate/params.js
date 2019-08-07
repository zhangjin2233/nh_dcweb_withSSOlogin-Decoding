const SKIN_FLAG = {
  PRE: 'pre',
  NEXT: 'next',
  ALL: 'all',
}

let params = {
  req: {
    getFlow: {
      url: '/api/Job/getBatchOperateFlowData',
      data: {
        flowName: 'id',
      }
    },
    getPDCTree:{
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
  nodeAttrs: ["id","label","type","imgSrc","adcLabel","adcName"],
  nodeFlag: 'pdc',
  canRemoveLine: true,
  isContactAttach: true,
  canNodeIntoView: false,
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
      icon: 'fa fa-plus',
      color: 'blue',
      title: '导入PDC',
      disabled: function(flow){
        return flow.vue.layers && JSON.parse(window.sessionStorage.getItem(flow.vue.layers)).length > 1
      },
      event:{
        click: function(flow){
          addNodeFun('pdc',flow);
        }
      },
    },{
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
      disabled(flow){
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
      title: '粘贴 ctrl+v',
      icon: 'fa fa-clone',
      color: 'orange',
      event: {
        click: function(){
          this.flow.pasteData(this);
        }
      },
    }]
  ],
  pasteData: function(Vue){
    localforage.getItem('copyData').then(val=>{
      let data = JSON.parse(val)
      let node = data.nodes.find(item=>Object.keys(Vue.nodes).includes(item.id));
      if(!node){
        data.nodes.forEach(item=>{ Vue.$set(Vue.nodes,item.id,item) })
        data.lines.forEach(item=>{ Vue.lines.includes(item) || Vue.lines.push(item) });
      }else{
        VUE.$alert(`数据存在冲突,${node.id}已存在`,'提示');
      }
    }).catch(err=>{
      VUE.$alert('请先在Job流图中复制数据','提示');
    })
  },
  nodeDbClick: function(e,node,Vue){
    if(node.viewNodeFlag){
      // Vue.nodeObj.intoNode(Vue);
    }else{
      Vue.$router.push({ path: '/pdcForm', query: {
        guid: node.id,
        label: node.title,
        from: JSON.stringify({path: Vue.$route.path, query: Vue.$route.query})
      }});
    }
  },
  nodeRightClick: function(e,node,Vue){ //节点右击
    let contextmenu = [{
      text: '删除节点',
      icon: 'fa fa-remove',
      iconColor: 'red',
      click: function(){
        if(node[SKIN_FLAG.PRE] || node[SKIN_FLAG.NEXT]){
          VUE.$alert("该节点有折叠数据，请先展开节点再进行删除操作,","提示");
        }else{
          Vue.nodeObj.remove(Vue);
        }
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
    }];
    Vue.flow.contextmenu.showMenu(e,contextmenu);
  },
}

function addNodeFun(flag, flow){
  let dialog = new dc.Dialog({
    top: "30px",
    width: '700px',
    component: 'nodeList',
    data: { req: flow.req},
    hasBtn: true,
    btnGroup: [{
      text: '确定', 
      type: 'primary', 
      size: 'small', 
      click:(dialog, component)=>{ 
        let list = [];
        component.table1.tableData.map((item)=>{
          list.push(item.guid); 
        })
        if(list.length){
          let data = {
            type: 'PDC',
            pdcs: component.table1.tableData,
            flag: flag,
            cdcId: component.leafId,
            flowId: flow.flowName
          };
          DCHttp.req({url:'/api/tree/getAddFlow', params:data, method:'POST'}).then(res=>{
            flow.vue.flowLoading = false
            res && flow.addNode(res.CONTENT);
          }).catch(err=>{
            flow.vue.flowLoading = false
          })
        }
        dialog.show = false;
      }
    }]
  });
  VUE.$openDialog(dialog);
}

export default params