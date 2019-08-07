
import Flow from './Flow.js'
import objClone from '../js/base/objClone'

const SKIN_FLAG = {
  PRE: 'pre',
  NEXT: 'next',
  ALL: 'all',
}
const Class = 'JobMgr';
const jobClass = 'JobMgr';
const removeOption = [{
  label: '删除PDC',
  value: undefined
},{
  label: '保留移除的PDC及其引用、镜像节点',
  value: false
},{
  label: '保留移除的PDC，删除其引用、镜像节点',
  value: true
}];

function hasLackNodes(nodes,recordNodes){
  return Object.keys(recordNodes).some(key=>!nodes[key] && recordNodes[key].type1 == 'Instance');
}

//获取所有节点的id
function getNodesId(flow,nodes){
  let nodesId = [];
  for(let i in nodes){
    if(nodes[i][flow.nodeType] != flow.viewFlag){
      nodesId.push(nodes[i].id);
    }
  }
  return nodesId;
}

//获取所有节点数据
function getNodes(flow,nodes){
  let nodesData = {};
  for(let i in nodes){
    if(nodes[i][flow.nodeType] != flow.viewFlag){
      nodesData[i] = objClone(nodes[i],{id:nodes[i].pdcId},['guid','type1','moType','label'],true)
    }
  }
  return nodesData;
}

function savePresentFlow(Vue){ //保存当前流图
  let newData = {
    nodes: objClone(Vue.nodes),
    lines: objClone(Vue.lines)
  };
  saveFlowConfirm(Vue,newData);
}

function selectSaveFlow(Vue,flowData){
  let form = new dc.Form({
    structure: [{
      label: 'PDC移除选项',
      type: 'singleEnum',
      name: 'removeRefAndMirror',
      option: removeOption
    }],
    data: {
      removeRefAndMirror: removeOption[0].value
    }
  })
  Vue.$openDialog(new dc.Dialog({
    top: "30px",
    component: 'dc-form',
    data: {object:form},
    hasBtn: true,
    btnGroup: [{
      text: '确定', 
      type: 'primary',
      click:(dialog)=>{ 
        dialog.show = false;
        saveFlowReq(Vue,form.data,flowData)
      }
    },{
      text: '取消', 
      click:(dialog, component)=>{ 
        dialog.show = false;
        Vue.flowLoading = false;
      }
    }]
  }))
}

function saveFlowConfirm(Vue,flowData){
  let params = { [Vue.flow.req.getFlow.data.flowName]: Vue.flow.flowName };
  DCHttp.req({url:Vue.flow.req.getFlow.url, params:params}).then(res=>{
    if(res){
      hasLackNodes(flowData.nodes,res.CONTENT.nodes) ? selectSaveFlow(Vue,flowData) : saveFlowReq(Vue,{},flowData);
    }else{
      throw new Error();
    }
  }).catch(err=>{Vue.flowLoading = false;});
}

function saveFlowReq(Vue,params,flowData){
  params[Vue.flow.req.saveFlow.data.flowName] = Vue.flow.flowName;
  params.nodes = getNodes(Vue.flow,flowData.nodes);
  params.links = Vue.flow.getLinesNoView(Vue.flow,flowData.nodes,flowData.lines);
  DCHttp.req({url:Vue.flow.req.saveFlow.url, params:params, method:'POST', info:{success: "保存成功", error: "保存出错，建议刷新"}}).then(res=>{
    Vue.flowLoading = false;
    if(res){
      params.removeRefAndMirror === removeOption[1].value ? Vue.flow.historyReset(Vue) : Vue.flow.initFlow(Vue);
    }
  }).catch(err=>{
    Vue.flowLoading = false;
  })
}

function getFlowData(Vue,type){
  return new Promise((resolve,reject)=>{
    localforage.getItem(type+Vue.index, (err, value)=>{
      if (err == null && value) {
        resolve(value);
      }
    });
  })
}

async function saveMainFlow(Vue,viewId){ //在视图层中保存主界面的流图,目前保留的主界面-进入时保留的视图+目前的视图=最新的主界面
  let res0 = JSON.parse(await getFlowData(Vue,'flow'));
  let res1 = JSON.parse(await getFlowData(Vue,'view'));
  let mainNodes = res0.CONTENT.nodes; 
  let mainLines = res0.CONTENT.links;
  let viewNodes = res1.CONTENT.nodes;
  let viewLines = res1.CONTENT.links;
  let newData = {
    nodes: Vue.flow.getNewNodesData(mainNodes,viewNodes,Vue.nodes),
    lines: Vue.flow.getNewLinesData(mainLines,viewLines,Vue.lines)
  };
  saveFlowConfirm(Vue,newData);
}

let structor = {
  nodeAttrs: ["id","label","type","imgSrc","adcLabel","adcName"],
  nodeFlag: 'pdc',
  domType: 'svg',
  type: 'node',
  canRemoveLine: true,
  isContactAttach: true,
  canNodeIntoView: true,
  node:{
    x0: 100,
    y0: 100,
    color: {
      focus: "#ff8c31",
      blur: "transparent",
    },
  }
}

class nodeFlow extends Flow{
  constructor(obj) {
    super();
    for(let i in structor){
      this[i] = structor[i];
    }
    if(obj){
      for(let i in obj){
        this[i] = (typeof obj[i] === 'object' && obj[i] != null) ? objClone(obj[i],this[i]) : obj[i];
      }
    }
  }
  findNode(){
    VUE.$prompt('请输入节点 id', '搜索节点',{
      inputValidator: (value)=>{return (value && !!this.vue.nodes[value] && this.vue.nodes[value].visible)},
      inputErrorMessage: '不存在该节点'
    }).then(({ value }) => {
      this.searchNode(value,this.vue)
    }).catch(()=>{});
  }
  searchNode(val,Vue){
    if(Vue.nodes[val] && Vue.nodes[val].visible){
      Vue.focusNodes = [val];
      Vue.$refs.svg.getElementById(val).scrollIntoView();
      // let clientRect = Vue.$refs.graph.getBoundingClientRect();
      // Vue.$refs.graph.scrollLeft = Vue.nodes[val].x - clientRect.width/2;
      // Vue.$refs.graph.scrollTop = Vue.nodes[val].y - clientRect.height/2;
    }else{
      VUE.$message({
        type: 'info',
        message: '不存在该节点',
        showClose: true
      })
    }
  }
  addKeyUp(e){
    switch(e.code){
      case "KeyF":
        (typeof this.findNode == 'function') && this.findNode();
        break;
      case "KeyC":
        (typeof this.copyData == 'function') && this.copyData(this.vue);
        break;
      case "KeyV":
        (typeof this.pasteData == 'function') && this.pasteData(this.vue);
        break;
      default:
        break;
    }
  }
  addNewOperate(){
    this[this.flowName] = {};
    this.resetJobInfo();
    this[this.flowName].users = [];
  }
  resetJobInfo(){
    this[this.flowName].jobInfo = {
      id: '',
      time: '',
      name: '',
      poolSize: 1
    }
  }
  choseStartJob(Vue,btn){
    let form = new dc.Form({
      structure: [{
        label: "调度时间",
        name: "value",
        type: 'dateTime'
      }],
      data: { value: '' }
    })
    if(this[this.flowName] && this[this.flowName].jobInfo && this[this.flowName].jobInfo.time){
      form.data.value = this[this.flowName].jobInfo.time;
    }else{
      this.resetJobInfo();
      DCHttp.req({
        url: dcConfig.publicPath,
        params: { Class: jobClass, FUNC: 'getJob', [dcConfig.paramsKey]: { jobID: this.flowName }}
      }).then(res => {
        form.data.value = VUE.$formatTime(+res.CONTENT.opTime,'yyyy-mm-dd hh:mm')
      })
    }
    
    Vue.$openDialog(new dc.Dialog({
      title: "启动调度",
      component: 'dc-form',
      width: '400px',
      data: {object: form},
      hasBtn: true,
      btnGroup: [{
        text: '确定',
        type: 'primary',
        click:()=>{
          this[this.flowName].jobInfo.time = form.data.value;
          this.startJob(Vue,btn);
          Vue.$closeDialog();
        }
      }]
    }));
  }
  startJob(Vue,btn){ //启动job
    btn && (btn.load = true);
    let jobId = this.flowName;
    try{  jobId = this[this.flowName].jobInfo.id || this.flowName }catch(e){}
    //格式化发送的数据
    DCHttp.req({
      url: dcConfig.publicPath,
      params: {
        Class: jobClass,
        FUNC: 'startJob',
        [dcConfig.paramsKey]: {
          jobId: jobId,
          opTime: VUE.$formatTime(this[this.flowName].jobInfo.time + ':00','number')
        }
      }
    }).then(res => {
      btn && (btn.load = false);
    }).catch(err => {
      btn && (btn.load = false);
    })
  }
  stopJob(Vue,btn){ //中断job
    btn && (btn.load = true);
    try{ 
      this[this.flowName].jobInfo.id 
    }catch(e){
      this.resetJobInfo();
    }
    let jobId = this[this.flowName].jobInfo.id || this.flowName;
    DCHttp.req({
      url: dcConfig.publicPath,
      params: { Class: jobClass, FUNC: 'stopJob', [dcConfig.paramsKey]: { jobId: jobId } }
    }).then(res => {
      btn && (btn.load = false);
    }).catch(err => {
      btn && (btn.load = false);
    })
  }
  resetJob(Vue,btn){ //重置job
    btn && (btn.load = true);
    try{ 
      this[this.flowName].jobInfo.id 
    }catch(e){
      this.resetJobInfo();
    }
    let jobId = this[this.flowName].jobInfo.id || this.flowName;
    DCHttp.req({
      url: dcConfig.publicPath,
      params: { Class: jobClass, FUNC: 'resetAllPDCOfJob', [dcConfig.paramsKey]: { jobId: jobId } }
    }).then(res => {
      btn && (btn.load = false);
    }).catch(err => {
      btn && (btn.load = false);
    })
  }
  resetErrorJob(Vue,btn){ //重置job的错误
    btn && (btn.load = true);
    try{ 
      this[this.flowName].jobInfo.id 
    }catch(e){
      this.resetJobInfo();
    }
    let jobId = this[this.flowName].jobInfo.id || this.flowName;
    DCHttp.req({
      url: dcConfig.publicPath,
      params: { Class: jobClass, FUNC: 'resetAllErrorPDCOfJob', [dcConfig.paramsKey]: { jobId: jobId } }
    }).then(res => {
      btn && (btn.load = false);
    }).catch(err => {
      btn && (btn.load = false);
    })
  }
  confirmSetPoolSize(form){
    let jobId = this.flowName;
    try{  jobId = this[this.flowName].jobInfo.id }catch(e){}
    let params = {
      Class: jobClass,
      FUNC: 'setJobPoolSize',
      [dcConfig.paramsKey]: { jobId: jobId, poolSize: form.data.poolSize }
    }
    DCHttp.req({ url: dcConfig.publicPath, params }).then(res => {
      this[this.flowName].jobInfo.poolSize = form.data.poolSize;
      VUE.$closeDialog();
    })
  }
  setPoolSize(Vue){
    let form = new dc.Form({
      structure: [{
        type: 'int',
        name: 'poolSize',
        label: '并发数',
      }],
      data: { poolSize: this[this.flowName].jobInfo.poolSize },
      submit:(form)=>{ this.confirmSetPoolSize(form) },
    })
    VUE.$openDialog(new dc.Dialog({
      title: '设置队列并发数',
      width: '400px',
      component: 'dc-form',
      data: { object: form },
      hasBtn: true,
      btnGroup: [{
        text: '确定',
        type: 'primary',
        click:()=>{
          this.confirmSetPoolSize(form);
        }
      }]   
    }))
  }
  confirmIgnoreError(Vue,data){
    Vue.flowLoading=true
    DCHttp.req({
      url: dcConfig.publicPath,
      params: {
        Class: jobClass,
        FUNC: 'ignorePDCFailedByPDCJobName',
        [dcConfig.paramsKey]: data
      }
    }).then(res => {
      Vue.flowLoading = false
    }).catch(err => {
      Vue.flowLoading = false
    })
  }
  ignoreError(Vue,jobId,pdcJobName){
    VUE.$prompt('请输入忽略的信息', '忽略节点状态', '取消').then(({ value }) => {
      this.confirmIgnoreError(Vue,{sIgnoreMsg:value||'', jobId: jobId, pdcJobName:pdcJobName})
    }).catch(()=>{});
  }
  resetNodeAndReRun(Vue,jobId,pdcJobName){
    Vue.flowLoading = true;
    DCHttp.req({
      url: dcConfig.publicPath,
      params: {
        Class: jobClass,
        FUNC: 'resetAllDependPDCsByPDCJobName',
        [dcConfig.paramsKey]: { jobId: jobId, pdcJobName: pdcJobName },
        info: {success:"节点已重置"}
      }
    }).then(res => {
      Vue.flowLoading = false
    }).catch(err => {
      Vue.flowLoading = false
    })
  }
  resetNode(Vue,jobId,pdcJobNames){
    Vue.flowLoading = true
    DCHttp.req({
      url: dcConfig.publicPath,
      params: {
        Class: jobClass,
        FUNC: 'resetPDCStatusOfJob',
        [dcConfig.paramsKey]: { jobId: jobId, pdcJobNames: pdcJobNames }
      },
      info: {success:'节点已重置'}
    }).then(res => {
      Vue.flowLoading = false
    }).catch(err => {
      Vue.flowLoading = false
    })
  }
  suspendPDC(Vue,jobId,pdcJobName,fnText){
    Vue.flowLoading = true;
    DCHttp.req({
      url: dcConfig.publicPath,
      params: {
        Class: jobClass,
        FUNC: 'suspendPDCByPDCJobName',
        [dcConfig.paramsKey]: { jobId: jobId, pdcJobName: pdcJobName},
      },
      info: { success:"节点已"+fnText }
    }).then(res => {
      Vue.flowLoading = false
    }).catch(err => {
      Vue.flowLoading = false
    })
  }
  changePriority(Vue,jobId,pdcName,priority){
    Vue.flowLoading = true;
    DCHttp.req({
      url: dcConfig.publicPath,
      params: {
        FUNC: 'changePDCPriorityByPDCJobName',
        Class: jobClass,
        [dcConfig.paramsKey]: { jobId: jobId, pdcJobNames: [pdcName], priority: priority }
      },
      info: {success:"优先级已设置"}
    }).then(res => {
      Vue.flowLoading=false
    }).catch(err => {
      Vue.flowLoading=false
    })
  }
  setPriorityContextmenuChildren(Vue,jobId,pdcName){
    const PRIORITY = [
      { label: '最高优先级(100)', value: 100 },
      { label: '高优先级(75)', value: 75 },
      { label: '标准(50)', value: 50 },
      { label: '底优先级(25)', value: 25 },
      { label: '最低优先级(1)', value: 1 }
    ];
    return [
      ...PRIORITY.map(item=>{
        return {
          text: item.label,
          click: ()=>{
            this.changePriority(Vue,jobId,pdcName,item.value);
            Vue.flow.contextmenu.hideMenu();
          }
        }
      }),
    {
      text: '自定义',
      click: ()=>{ 
        VUE.$prompt(null, '设置优先级', {
          inputValue: 50,
          inputValidator: (value)=>{const val=parseInt(value); return value == val && val>=1 && val<=100},
          inputErrorMessage: '优先级必须是不小于1且不大于100的整数'
        }).then(({ value }) => {
          this.changePriority(Vue,jobId,pdcName,parseInt(value))
        }).catch(()=>{});
        Vue.flow.contextmenu.hideMenu();
      }
    }]
  }
  addLabelTip(node,e,Vue){
    Vue.popover = {
      show: true,
      arrow: Vue.flow.nodePopoverArrow,
      title: node.label,
      width: Vue.flow.nodePopoverWidth,
      component: 'addNodeTip',
      propData: { node:node, flow:Vue.flow, list: Vue.nodeTips[node.id], pdcId:node.pdcId },
      x: e.clientX+'px',
      y: e.clientY+'px',
    }
    Vue.$refs.popover.focus();
  }
  choseUsers(Vue,e){ //选择业务标签用户
    Vue.flow[Vue.flow.flowName] || (Vue.flow[Vue.flow.flowName] = {});
    Vue.flow[Vue.flow.flowName].users || (Vue.flow[Vue.flow.flowName].users = []);
    Vue.popover = {
      show: true,
      arrow: Vue.flow.nodePopoverArrow,
      title: '显示用户标签',
      width: 300,
      component: 'userInfo',
      propData: { selection: Vue.flow[Vue.flow.flowName].users, flow:Vue.flow },
      x: e.clientX+'px',
      y: e.clientY+'px',
    }
    Vue.$refs.popover.focus();
  }
  showNodeTips(node,e){
    this.vue.popover = {
      show: true,
      arrow: this.vue.flow.nodePopoverArrow,
      title: node.label,
      width: this.vue.flow.nodePopoverWidth,
      component: 'nodeTipsList',
      propData: { flow:this, list: this.vue.nodeTips[node.id], pdcId:node.pdcId },
      x: e.clientX+'px',
      y: e.clientY+'px',
    }
    this.vue.$refs.popover.focus();
  }
  addNodeTips(nodeId,record){
    this.vue.nodeTips[nodeId] || this.vue.$set(this.vue.nodeTips, nodeId, []);
    this.vue.nodeTips[nodeId].push(record);
  }
  refreshNodeTips(){
    let users = [];
    try{ users = this[this.flowName].users }catch(e){}
    DCHttp.req({url:dcConfig.publicPath, params:{
      Class: 'com.leavay.tag.TagAction',
      FUNC: 'listTagsByPDF',
      [dcConfig.paramsKey]: {pdfId: this.flowName, userNames: users }
    }}).then(res=>{
      this.vue.$set(this.vue, 'nodeTips', {});
      Object.keys(this.vue.nodes).forEach(id=>{
        Object.keys(res.CONTENT).forEach(k=>{
          if(this.vue.nodes[id].pdcId == k){
            this.vue.$set(this.vue.nodeTips, id, res.CONTENT[k]);
          }
        })
      })
    })
  }
  saveFlow(Vue){ //保存主流图
    let flowLayer = JSON.parse(window.sessionStorage.getItem(Vue.layers));
    let viewId = flowLayer.slice(-1).pop();
    Vue.flowLoading = true;
    if(viewId){
      saveMainFlow(Vue,viewId);
    }else{
      savePresentFlow(Vue);
    }
  }
  addPDF(Vue,type){ //添加PDF节点
    Vue.$openDialog(new dc.Dialog({
      title: type=='reference' ? '外部引入PDF' : '引入镜像PDF',
      component: 'dc-nodeTree',
      data: { reqData:{type:'PDF'}, dcType:Vue.flow.dcType, url:Vue.flow.req.getPDFTree.url },
      hasBtn: true,
      btnGroup: [{
        text: '确定', 
        type: 'primary', 
        click:(dialog, component)=>{ 
          let selectNodes = !component.tree.nodeSelection ? [] : component.tree.nodeSelection.filter(item=>{
            return item.type.toLowerCase() == Vue.flow.dcType
          })
          if(selectNodes.length){
            Vue.flowLoading = true;
            let reqData1 = {
              type: 'PDF',
              flag: type,
              flowId: Vue.flow.flowName,
              pdcs: selectNodes.map(item=>{return item.link}),
            };
            DCHttp.req({url:Vue.flow.req.addNode.url, params:reqData1}).then(res=>{
              Vue.flowLoading = false;
              res && Vue.flow.addNode(res.CONTENT);
            }).catch(err=>{ Vue.flowLoading = false; })
            dialog.show = false;
          }else{
            Vue.$alert("未选中");
          }
        }
      }]
    }))
  }
  addPDC(Vue,flag){ //添加PDC节点
    const titleMap = {
      pdc: '引入PDC',
      mirror: '引入镜像节点',
      reference: '引入外部节点',
    }
    VUE.$openDialog(new dc.Dialog({
      verticalCenter: true,
      // title: titleMap[flag],
      top: "30px",
      width: '700px',
      component: 'nodeList',
      data: {flag: flag, flowName: Vue.flow.flowName, storyId:Vue.flow.storyId},
      hasBtn: true,
      btnGroup: [{
        text: '确定', 
        type: 'primary', 
        click:(dialog, component)=>{ 
          let list = [];
          component.table1.tableData.forEach((item)=>{ list.push(item.guid); })
          if(list.length){
            let data = {
              type: 'PDC',
              pdcs: component.table1.tableData,
              flag: flag,
              cdcId: component.leafId,
              flowId: Vue.flow.flowName
            };
            DCHttp.req({url:Vue.flow.req.addNode.url, params:data, method:'POST'}).then(res=>{
              res && Vue.flow.addNode(res.CONTENT);
            })
          }
          dialog.show = false;
        }
      }]
    }));
  }
  
}

export default nodeFlow
