import objClone from '@/../dc_modules/js/base/objClone'
import addLines from './addLines'
import Node from './nodeObj'
import SelectObj from './SelectObj'
import PanelObj from './PanelObj'
import LinesObj from './LinesObj'
import drawLinePath from './drawLinePath'
import getNodesStatus from './getNodesStatus'
import getNodesTip from './getNodesTip'
import getGroup from './getGroup.js'
import Contextmenu from '@/../dc_modules/contextMenu/Contextmenu.js'
import isLoop from './isLoop'
import getSkinship from './getSkinship'

import flowParams from '@/config/flow.js'
import getBase64 from '../js/base/getBase64.js'

const SKIN_FLAG = {
  PRE: 'pre',
  NEXT: 'next',
  ALL: 'all',
}

let structor = {
  vue: {},
  flowName: '',
  flowResData: {},
  pId: '',
  index: '',
  operateRecord: 'flowRecord',
  layerPre: 'flowLayer',
  recordLength: 0,
  recordIndex: 0,
  nodesTipErrTimes: 0,
  statusErrTimes: 0,
  statusContorl: null,
  contextmenu: new Contextmenu(),
}

class Flow {
  constructor(obj) {
    for(let i in structor){
      this[i] = structor[i];
    }
    for(let i in flowParams){
      this[i] = (typeof flowParams[i] === 'object' && flowParams[i] != null) ? objClone(flowParams[i],this[i]) : flowParams[i];
    }
    if(obj){
      for(let i in obj){
        this[i] = (typeof obj[i] === 'object' && obj[i] != null) ? objClone(obj[i],this[i]) : obj[i];
      }
    }
  }
  initAll(Vue){
    this.initData(Vue); // 初始化节点
    this.recordFlowLayer(Vue); //记录流图层次
    // this.initPanel(Vue); //初始化面板
    this.addNewOperate();
    this.initFlow(Vue); // 初始化流图节点数据及布局
  }
  initData(Vue){
    this.index = new Date().getTime()+Math.random().toString().replace('.','');
    Vue.index = this.index;
    this.vue = Vue;
    Vue.recordKeyPre = this.operateRecord + this.index;
    Vue.layers = this.layerPre + this.index;
    this.lineWidth = this.line.width.thin;
    this.nodeAttr = {
      width: this.size.node.width,
      height: this.size.node.height,
      type: this.nodeFlag,
      x: this.node.x0,
      y: this.node.y0,
    }
    this.nodeObj = objClone(Node);
    this.nodeObj.setAttrs(this.nodeAttr);
    Vue.nodeObj = objClone(this.nodeObj);
    Vue.selectBox = objClone(SelectObj);
    Vue.panelObj = new PanelObj({layout: this.layout});
    Vue.linesObj = objClone(LinesObj); 
  }
  recordFlowLayer(Vue,layer){ //记录流图层次
    this.svgAnimate = "bounceOut";
    let storage = window.sessionStorage;
    let flowLayer = layer ? JSON.parse(storage.getItem(Vue.layers)) : [];
    layer || (layer='');
    flowLayer.push(layer);
    storage.setItem(Vue.layers,JSON.stringify(flowLayer));
  }
  modifyFlowLayer(Vue){ //返回上一层，修改流图层次的记录
    this.svgAnimate = "bounceOut";
    let storage = window.sessionStorage;
    let flowLayer = JSON.parse(storage.getItem(Vue.layers));
    flowLayer.pop();
    storage.setItem(Vue.layers, JSON.stringify(flowLayer));
  }
  focusStyle(obj,container,type){ //obj为高亮对象，container为高亮的容器
    return (JSON.stringify(container).indexOf(JSON.stringify(obj))!=-1 ? this[type].color.focus : this[type].color.blur);
  }
  initFlow(Vue){ //初始化流图数据
    try{
      let layer = JSON.parse(window.sessionStorage.getItem(Vue.layers)).slice(-1).pop(); //取出存储数据中的最后一个数据
      layer ? this.getView(layer,Vue) : this.getFlow(Vue); //layer有值说明当前层是视图，否则为主界面
    }catch(err){
      this.getFlow(Vue);
    }
  }
  refreshFlow(Vue){ //刷新流图
    this.initFlow(Vue);
    return this;
  }
  addNewOperate(){

  }
  getFlow(Vue) { //获取流图数据
    Vue.flowLoading = true;
    let req = this.getFlowReq(Vue,this);
    if(req.content){
      Vue.flowLoading = false;
      this.getFlowFinished(Vue,req.content);
    }else{
      DCHttp.req({method:'post',url:req.url, params: req.params, info:{error:'流图加载失败，请尝试刷新'}}).then(res=>{
        res && this.getFlowFinished(Vue,res);
        Vue.flowLoading = false;
      }).catch(err=>{
        Vue.flowLoading = false;
      });
    }
  }
  getFlowReq(Vue,flow){ //获取流图的请求URL及参数
    let params = {};
    params[this.req.getFlow.data.flowName] = this.flowName;
    return {
      url: this.req.getFlow.url,
      params: params,
      content: null,
    }
  }
  getView(layer,Vue){ //获取流图的视图数据
    Vue.flowLoading = true;
    let params = {};
    //本地保存主流图
    this.saveMainFlowData(Vue);
    params[this.req.getView.data.flowName] = this.flowName;
    params[this.req.getView.data.viewName] = layer;
    DCHttp.req({url:this.req.getView.url, params:params}).then(res => {
      res && this.writeFlowData(Vue,res);
      Vue.flowLoading = false;
    });
  }
  async writeFlowData(Vue,res){
    await this.addSrcAndDstData(Vue,res); //增加视图的前驱后继数据
    this.saveViewFlowData(Vue,res); //本地保存视图流图
    this.getFlowFinished(Vue,res);
  }
  addSrcAndDstData(Vue,res){
    return new Promise((resolve,reject)=>{
      localforage.getItem('flow'+Vue.index, (err, value)=>{
        if (err == null && value) {
          let flowData = JSON.parse(value).CONTENT;
          const nodesId = Object.keys(res.CONTENT.nodes);
          flowData.links.forEach(line=>{ //增加线
            if(nodesId.includes(line[0]) && !nodesId.includes(line[1])){
              res.CONTENT.links.push([line[0],line[1]]);
              if(!res.CONTENT.nodes[line[1]]){
                res.CONTENT.nodes[line[1]] = objClone(flowData.nodes[line[1]],{type:'dst'},['type']);
              }
            }else if(!nodesId.includes(line[0]) && nodesId.includes(line[1])){
              res.CONTENT.links.push([line[0],line[1]]);
              if(!res.CONTENT.nodes[line[0]]){
                res.CONTENT.nodes[line[0]] = objClone(flowData.nodes[line[0]],{type:'src'},['type']);
              }
            }
          });
          resolve();
        }else{
          console.warn('未知的数据读写错误,保存操作可能出错');
          reject();
        }
      });
    })
  }
  getSkinship(Vue,node,type){
    return getSkinship(Vue.nodes, Vue.lines, node.id, type);
  }
  foldingPre(node,Vue){ //折叠前驱节点
    this.foldingSkinship(node, Vue, SKIN_FLAG.PRE)
  }
  foldingNext(node,Vue){ //折叠后继节点
    this.foldingSkinship(node, Vue, SKIN_FLAG.NEXT)
  }
  foldingSkinship(node,Vue,type){ //折叠亲缘节点
    let nodes = getSkinship(Vue.nodes, Vue.lines, node.id, type).nodes.slice(0);
    //获取隐藏的节点
    if(nodes.length){
      Vue.nodes[node.id][type] = nodes;
    }else{
      return ;
    }
    //开启动画
    Vue.flow.foreignObjectStyle = Vue.flow.layoutTransition;
    setTimeout(() => { Vue.flow.foreignObjectStyle = "" }, Vue.flow.transitionCancelTime);
    
    //遍历，改变坐标和延迟改变可见度
    Vue.nodes[node.id][type].forEach(k=>{
      Vue.nodes[k].zoomX = Vue.nodes[k].x;
      Vue.nodes[k].zoomY = Vue.nodes[k].y;
      Vue.nodes[k].x = node.x;
      Vue.nodes[k].y = node.y;
      Vue.nodes[k].opacity = 0.1;
      setTimeout(()=>{ Vue.nodes[k].visible = false },100)
    })
  }
  zoomNext(node,Vue){ //展开后继节点
    this.zoomSkinship(node, Vue, SKIN_FLAG.NEXT);
  }
  zoomPre(node,Vue){ //展开前驱节点
    this.zoomSkinship(node, Vue, SKIN_FLAG.PRE);
  }
  zoomAll(Vue){ //展开所有折叠节点
    Object.keys(Vue.nodes).forEach(k=>{
      [SKIN_FLAG.NEXT,SKIN_FLAG.PRE].forEach(type=>{
        Vue.flow.zoomSkinship(Vue.nodes[k],Vue,type);
      })
    })
  }
  zoomSkinship(node,Vue,type){ //展开亲缘节点
    if(!Array.isArray(Vue.nodes[node.id][type])) return;
    //开启动画
    Vue.flow.foreignObjectStyle = Vue.flow.layoutTransition;
    setTimeout(()=>{ Vue.flow.foreignObjectStyle = "" }, Vue.flow.transitionCancelTime);
    //遍历，改变坐标和可见度
    Vue.nodes[node.id][type].forEach(k=>{
      if(Vue.nodes[k]){
        Vue.nodes[k].x = node.x;
        Vue.nodes[k].y = node.y;
        Vue.nodes[k].visible = true
        setTimeout(()=>{
          Vue.nodes[k].x = Vue.nodes[k].zoomX;
          Vue.nodes[k].y = Vue.nodes[k].zoomY;
          Vue.nodes[k].opacity = 1;
        },0)
      }
    }) 
    Vue.nodes[node.id][type] = null;
  }
  preView(e,node,Vue){
    Vue.popover = {
      show: true,
      arrow: Vue.flow.nodePopoverArrow,
      title: node.label,
      width: Vue.flow.nodePopoverWidth,
      view: node,
      component: 'dc-staticFlow',
      propData: { flowName: node.id, flowData:this.getPreViewData(node,Vue) },
      x: e.clientX+'px',
      y: e.clientY+'px',
    }
    Vue.$refs.popover.focus();
  }
  popoverRefresh(){
    if(this.vue.popover.component == 'dc-staticFlow'){
      this.previewRefresh()
    }
  }
  previewRefresh(){
    this.vue.popover.propData = { flowName: this.vue.popover.view.id, flowData:this.getPreViewData(this.vue.popover.view, this.vue) };
  }
  getPreViewData(node,Vue){
    const member = Vue.flow.getGroup(node.id, Vue.groups).member.slice(1);
    let nodes = {};
    member.forEach(id => {
      nodes[id] = objClone(Vue.nodes[id],{visible:true},['visible']);
    })
    Vue.lines.forEach(line => {
      if(line[0] === node.id && Vue.nodes[line[1]].visible){
        nodes[line[1]] = objClone(Vue.nodes[line[1]],{lineType:'dst'});
      }else if(line[1] === node.id && Vue.nodes[line[0]].visible){
        nodes[line[0]] = objClone(Vue.nodes[line[0]],{lineType:'src'});
      }
    })
    let links = Vue.lines.filter(line =>
      (member.includes(line[0]) && Vue.nodes[line[1]].visible) || (member.includes(line[1]) && Vue.nodes[line[0]].visible)
    )
    return { nodes, links };
  }
  getNodesNoView(flow,nodes){
    let newNodes = {};
    for(let i in nodes){
      if(nodes[i][flow.nodeType] != flow.viewFlag){
        newNodes[i] = nodes[i];
      }
    }
    return newNodes;
  }
  getLinesNoView(flow,nodes,lines){
    let newLines = [];
    for(let i=0; i<lines.length; i++){
      if(nodes[lines[i][0]] && nodes[lines[i][1]] && nodes[lines[i][0]][flow.nodeType] != flow.viewFlag && nodes[lines[i][1]][flow.nodeType] != flow.viewFlag){
        newLines.push(lines[i]);
      }
    }
    return newLines;
  }
  filterFlowData(nodes,lines){
    let nodes0 = objClone(nodes);
    let lines0 = objClone(lines);
    return {
      nodes: this.getNodesNoView(this,nodes0),
      links: this.getLinesNoView(this,nodes0,lines0),
    };
  }
  getNewNodesData(mainNodes,viewNodes,nodes){
    Object.keys(viewNodes).forEach(k=>{
      if(Object.keys(mainNodes).includes(k)){
        delete mainNodes[k];
      }
    })
    mainNodes = objClone(nodes,mainNodes);
    return mainNodes;
  }
  getNewLinesData(mainLines,viewLines,lines){
    viewLines.forEach(viewItem=>{
      let index = mainLines.findIndex(item=>JSON.stringify(item) == JSON.stringify(viewItem));
      index != -1 && mainLines.splice(index,1);
    });
    mainLines.splice(mainLines.length,0,...lines);
    return mainLines;
  }
  saveMainFlowData(Vue){
    let recordRes = { CONTENT:{} };
    const layers = JSON.parse(window.sessionStorage.getItem(Vue.layers));
    if(layers.length === 2){ //重置flow记录
      recordRes.CONTENT = this.filterFlowData(Vue.nodes, Vue.lines);
      this.saveFlowData(Vue,JSON.stringify(recordRes),'flow');
    }else{
      localforage.getItem('flow'+Vue.index, (err, value)=>{
        if (err == null && value) { //已经存在记录
          localforage.getItem('view'+Vue.index, (err1, value1)=>{
            if (err1 == null && value1) {
              let res0 = JSON.parse(value);
              let res1 = JSON.parse(value1);
              let mainNodes = res0.CONTENT.nodes; 
              let mainLines = res0.CONTENT.links;
              let viewNodes = res1.CONTENT.nodes;
              let viewLines = res1.CONTENT.links;
              let newData = {
                nodes: this.getNewNodesData(mainNodes,viewNodes,Vue.nodes),
                lines: this.getNewLinesData(mainLines,viewLines,Vue.lines)
              };
              recordRes.CONTENT = this.filterFlowData(newData.nodes, newData.lines);
              this.saveFlowData(Vue,JSON.stringify(recordRes),'flow');
            }else{
              console.warn('未知的数据读写错误,保存操作可能出错');
            }
          });
        }else{
          console.warn('未知的数据读写错误,保存操作可能出错');
        }
      });
    }
  }
  saveViewFlowData(Vue,res){
    this.saveFlowData(Vue,JSON.stringify(res),'view');
  }
  saveFlowData(Vue,res,type){ //保存流图数据
    localforage.setItem(type+Vue.index, res);
  }
  removeFlowData(Vue){
    localforage.removeItem('flow'+Vue.index);
    localforage.removeItem('view'+Vue.index);
  }
  getFlowFinished(Vue,res){ //获取流图数据后的回调操作
    this.svgAnimate = "";
    this.formatFlowData(Vue,res.CONTENT);
    this.initPanel(Vue);
    this.historyReset(Vue);
    this.flowRun && this.startGetStatus();
  }
  formatFlowData(Vue,flowData){ //格式化流图数据
    //流图节点数判断
    if(Object.keys(flowData.nodes).length > this.maxNodesNumber){
      flowData = {
        nodes: {},
        links: [],
      }
      VUE.$alert('节点数太多，无法直接查看');
    }
    
    this.flowResData = flowData;
    Vue.jumpLinks = objClone(flowData.jumpLinks || []); //初始化跳转路径数据
    Vue.branchData = objClone(flowData.branchData); //初始化分支控制的数据
    Vue.groups = objClone(flowData.groups || []); //初始化视图成员数据
    Vue.nodes = objClone(flowData.nodes); //初始化节点数据
    try{
      this.addAssistAttr(Vue,Vue.nodes);
      this.correctAssistAttr(Vue);
      Vue.lines = objClone(flowData.links); //初始化数据流的连线数据
      addLines(Vue.lines,Vue.groups);
      if(JSON.stringify(flowData.nodes) == '{}'){
        this.emptyFlowTipShow && Vue.$notify({ message: this.emptyFlowTip });
      }
     }catch(err) {}
  }
  toggleNodeLabel(){ //切换节点的标签显示
    this.showNodeId = !this.showNodeId;
  }
  addAssistAttr(Vue,nodes){ //补全数据流的节点数据信息
    for(let i in nodes){
      nodes[i] = objClone(this.nodeObj.attr,nodes[i],this.nodeAttrs);
      if(this.type == 'textList'){
        nodes[i].height = this.titleLineHeight+this.textListLineHeight*(nodes[i].listShow ? nodes[i].textList.length : 0);
      }
      nodes[i].animate = 'flipInX';
      setTimeout(()=>{ nodes[i] && (nodes[i].animate = '') },500)
      nodes[i].viewNodeFlag = false;
      if(nodes[i].hasOwnProperty(this.nodeType)){
        if(nodes[i][this.nodeType] == this.viewFlag){
          nodes[i].viewNodeFlag = true;
          nodes[i].width = this.size.view.width;
          nodes[i].height = this.size.view.height;
        }
      }
    }
  }
  //修正数据流的节点数据信息
  correctAssistAttr(Vue){
    for(let i=Vue.groups.length-1; i>=0; i--){
      Vue.nodes[Vue.groups[i][0]].viewNodeFlag = true;
      Vue.nodes[Vue.groups[i][0]].width = this.size.view.width;
      Vue.nodes[Vue.groups[i][0]].height = this.size.view.height;
      for(let j=Vue.groups[i].length-1; j>=1; j--){
        Vue.nodes[Vue.groups[i][j]].visible = !Vue.nodes[Vue.groups[i][0]].visible;        
      }
    }
  }
  getSatusImg(node){
    const status = this.vue.nodesStatus.CONTENT[node.id].status;
    const img = sessionStorage.getItem(status);
    const imgSrc = this.img.pathStatus + status + this.img.extGif;
    if(!img){
      getBase64(imgSrc).then(res=>{
        sessionStorage.setItem(status,res);
      })
    }
    return img || imgSrc;
  }
  initPanel(Vue){ //初始化画板
    try{
      Vue.panelObj.initSize(Vue);
    }catch(err) {}
    
  }
  linePath(line,Vue,type){ //连线路径
    return drawLinePath(Vue.nodes[line[0]] ,Vue.nodes[line[1]], Vue, type);
  }
  lineTitle(line,Vue,type){ //连线的悬浮提示
    // let title;
    // switch(type){
    //   case 'line':
    //   case 'jumpLink':
    // }
    // return title;
    return `${line[0]} → ${line[1]}`;
  }
  addJumpLink(lineStartNode,lineTargetNode,Vue){
    if(Vue.jumpLinks.some(item=>item[0] == lineStartNode.id)){
      Vue.$alert("一个分支节点只能指定一条跳转路径");
    }else{
      Vue.jumpLinks.push([lineStartNode.id,lineTargetNode.id]);
    }
  }
  isLoop(lineStart,lineTarget,lines){
    return isLoop(lineStart,lineTarget,lines);
  }
  lineOperate(line,Vue){
    console.log("lineOperate");
  }
  clearFocus(Vue){ //清空聚焦的节点与连线，并开启连线沉浮功能
    Vue.focusLines.splice(0,Vue.focusLines.length);
    Vue.focusNodes.splice(0,Vue.focusNodes.length);
    Vue.floatFlag.value = this.line.floatFlag.open;
  }
  historyReset(Vue){ //重置历史操作记录
    localforage.iterate((value, key)=>{
      (key.substr(0, Vue.recordKeyPre.length) == Vue.recordKeyPre && key.substr(Vue.recordKeyPre.length)!=0) && localforage.removeItem(key);
    }).then(()=>{
      let flowData = {
        'nodes': Vue.nodes,
        'lines': Vue.lines,
        'jumpLinks': Vue.jumpLinks,
        'branchData': Vue.branchData,
      };
      this.recordLength = 0;
      this.recordIndex = 0;
      localforage.setItem(Vue.recordKeyPre+this.recordIndex, JSON.stringify(flowData));
    });
  }
  historyUndo(Vue){ //历史操作回退
    if(this.recordIndex == 0) return;
    this.recordIndex--;
    localforage.getItem(Vue.recordKeyPre+this.recordIndex, (err, value)=>{
      if(err == null && value) {
        let flowData = JSON.parse(value);
        Vue.lines = flowData.lines;
        Vue.nodes = flowData.nodes;
        Vue.jumpLinks = flowData.jumpLinks;
        Vue.branchData = Vue.branchData;
      }
    });
  }
  historyRedo(Vue){ //历史操作前进
    if(this.recordIndex == this.recordLength) return;
    this.recordIndex++;
    localforage.getItem(Vue.recordKeyPre+this.recordIndex, (err, value)=>{
      if(err == null && value) {
        let flowData = JSON.parse(value);
        Vue.lines = flowData.lines;
        Vue.nodes = flowData.nodes;
        Vue.jumpLinks = flowData.jumpLinks;
        Vue.branchData = flowData.branchData;
      }
    });
  }
  historySave(Vue){ // 历史操作保存
    clearTimeout(Vue.historySave.timer);
    Vue.historySave.timer = setTimeout(()=>{
      
      let flowData = {
        'nodes': Vue.nodes,
        'lines': Vue.lines,
        'jumpLinks': Vue.jumpLinks,
        'branchData': Vue.branchData
      };
      localforage.getItem(Vue.recordKeyPre+this.recordIndex, (err, value)=>{
        if(err == null && value) {
          let lastRecord = value;
          if(lastRecord && lastRecord==JSON.stringify(flowData)){
            return ;
          }else{
            this.recordIndex++;
            localforage.setItem(Vue.recordKeyPre+this.recordIndex, JSON.stringify(flowData));
            this.recordLength = this.recordIndex;
          }
        }
      });

    },Vue.historySave.delay);
  }
  startGetStatus(){ //开始获取运行状态
    this.clearStatus(); //获取之前先停止
    this.nodesTipErrTimes = 0;
    this.statusErrTimes = 0;
    this.getStatus(this.vue,this);
    if(this.flowRun == 'interval'){
      this.statusContorl = setInterval( ()=>{this.getStatus(this.vue,this)}, this.intervalTime);
    }
    this.getStatus(this.vue,this); 
  }
  getStatus(Vue,flow){ //获取运行状态及信息
    this.showStatus && getNodesStatus(Vue,flow);
    // this.showNodesTip && getNodesTip(Vue,flow);
  }
  stopGetStatus(){ //停止获取状态
    if(this.statusContorl){
      (typeof this.statusContorl == 'object') && this.statusContorl.close();
      (typeof this.statusContorl == 'number') && clearInterval(this.statusContorl);
    }
    this.statusContorl = null;
  }
  clearStatus(){ //清除状态
    this.stopGetStatus();
    this.vue.nodesStatus = {};
    return this
  }
  addKeyUp(e){}
  keyup(e){
    switch(e.code){
      case "KeyS":
        let saveBtn = this.toolbar[0].find(btn=>btn.title.includes('保存'));
        saveBtn && this.saveFlow(this.vue);
        break;
      case "KeyR":
        this.refreshFlow(this.vue);
        break;
      case "KeyZ":
        this.historyUndo(this.vue);
        break;
      case "KeyY":
        this.historyRedo(this.vue);
        break;
      case "KeyA":
        this.choseAll(this.vue);
        break;
      case "KeyL":
        this.vue.panelObj.autoLayout(this.vue, this.vue.nodes, this.vue.lines);
        break;
      case "Equal":
        this.vue.panelObj.zoomIn(this.vue);
        break;
      case "Minus":
        this.vue.panelObj.zoomOut(this.vue);
        break;
      case "KeyB":
        this.vue.linesObj.changeWidth(this.vue);
        break;
      default:
        break;
    }
    this.addKeyUp(e);
  }
  choseAll(Vue){
    Vue.focusNodes.splice(0,Vue.focusNodes.length, ...Object.keys(Vue.nodes));
    Vue.focusLines.splice(0,Vue.focusLines.length, ...Vue.lines);
  }
  addNode(content){
    this.addAssistAttr(this.vue,content.nodes);
    for(let i in content.nodes){
      this.vue.$set(this.vue.nodes,i,content.nodes[i])
    }
  }
  createNode(nodeData,nodeAttr,Vue){//生成一个节点
    return objClone(nodeAttr,{
      id: (new Date().getTime())+Math.random().toString(),
      imgSrc: this.img.name.node,
      width: this.size.node.width,
      height: this.size.node.height,
      type: this.nodeFlag
    },['id','width','height','imgSrc','type']);
  }
  nodeDbClick(e,node,Vue){ //节点双击
    console.log("nodeDbClick");
  }
  nodeSingleClick(e,node,Vue){ //节点单击
    Vue.nodeObj.moveStart();
  }
  nodeRightClick(e,node,Vue){ //节点右击
    Vue.moveOver();
    console.log("nodeRightClick");
  }
  selectBoxRightClick(e,Vue){
    console.log("selectBoxRightClick");
  }
  getGroup(node,groups){
    return getGroup(node,groups);
  }
  panelRightClick(e,Vue){ //画板右击
    this.clearFocus(Vue); //清除选中状态
    Vue.selectBox.selectBoxHidden(); //选框隐藏
  }
  selectBoxDbClick(e,Vue){ //选框双击
    console.log("selectBoxDbClick");
  }
  set(obj){
    for(let i in obj){
      this[i] = obj[i];
    }
    return this;
  }
  getCurrentFlowData(){
    return {
      nodes: this.vue.nodes,
      links: this.vue.lines,
      jumpLinks: this.vue.jumpLinks,
      groups: this.vue.groups,
    }
  }
  setToolbar(type, data, row=0, col=0){ //工具栏的增加、重写和移除
    switch(type){
      case 'add':
        if(Array.isArray(data)){
          this.toolbar.splice(row,0,data);
        }else{
          this.toolbar[row].splice(col,0,data);
        }
        break;
      case 'cover':
        if(Array.isArray(data)){
          this.toolbar.splice(row,1,data);
        }else{
          this.toolbar[row].splice(col,1,data);
        }
        break;
      case 'remove':
        this.toolbar[row].splice(col,1);
        break;
      default:
        break;
    }
    return this;
  }
}

export default Flow