import svgXY from './svgXY'
import removeNode from './removeNode'
import isNullObject from './isNullObject'
import createView from './createView'
import addLines from './addLines'
import createGroup from './createGroup'
import initView from './initView'
import nodeIntoView from './nodeIntoView'
import panelBorderMonitor from './panelBorderMonitor'
import isNoView from './isNoView'
import objFloat from './objFloat'
import contactOperate from './contactOperate'

const MOVE_START_FIXED = true;
const CONTACT_FLAG = { //碰撞的方向标记
  NULL: -1,
  LEFT: 1,
  RIGHT: 0
};

let SelectBox = {};

SelectBox.attr = {
  'x0': 0, //选框的起始坐标        
  'y0': 0,
  'x1': 0, //选框的定点坐标
  'y1': 0,
  'x':  0, //选框的坐标
  'y':  0,
  'width': 0,
  'height': 0,
  'selectFlag': {'value': false},
  'moveFlag':   {'value': false},
  'nodes':   {}, //选框选中的节点组
  'nodesId': [] //选框选中节点组的id
};

//设置或获取选框的标记值
SelectBox.selectBoxFlag = function(type, flag){
  if(flag !== undefined){
    type.value = flag;
  }
  return type.value;
};

//记录
SelectBox.recordXY = function(obj) {
  obj.x0 = obj.x;
  obj.y0 = obj.y;
};

//记录选框节点组的坐标
SelectBox.recordNodesXY = function(nodes){
  for (let i in nodes) {
    if (nodes[i].x>this.attr.x && nodes[i].x+nodes[i].width<this.attr.x+this.attr.width && nodes[i].y>this.attr.y && nodes[i].y+nodes[i].height<this.attr.y+this.attr.height && nodes[i].visible) {
      this.recordXY(nodes[i]);
    }
  }
};

//记录选框节点组数据
SelectBox.recordNodes = function(nodes, Vue) {
  //初始化节点组
  this.attr.nodes = {};
  this.attr.nodesId = [];
  //获取选框中的所有节点
  for (let i in nodes) {
    if (nodes[i].x>this.attr.x && nodes[i].x+nodes[i].width<this.attr.x+this.attr.width && nodes[i].y>this.attr.y && nodes[i].y+nodes[i].height<this.attr.y+this.attr.height && nodes[i].visible) {
      this.attr.nodes[nodes[i].id] = nodes[i];
      this.attr.nodesId.push(nodes[i].id);
    }
  }
  Vue.focusNodes.splice(0,Vue.focusNodes.length,...this.attr.nodesId);
};

//设置选框的坐标
SelectBox.selectBoxXY = function(Vue,e, panelObj, flag) {
  let position = svgXY(e, panelObj,Vue);
  if(flag){
    this.attr.x1 = position.x;
    this.attr.y1 = position.y;
  }else{
    this.attr.x0 = position.x;
    this.attr.y0 = position.y;
  }
};

//选框大小变化
SelectBox.selectBoxSizeChange = function(e, Vue) {
  if(!e){ //无参数表示选框大小初始化
    this.attr.width = 0;
    this.attr.height = 0;
  }else{
    let position = svgXY(e, Vue.panelObj, Vue);
    if(position.x >= this.attr.x0){
      this.attr.x = this.attr.x0;
      this.attr.width = position.x - this.attr.x0;
    }else{
      this.attr.x = position.x;
      this.attr.width = this.attr.x0 - position.x;
    }
    if(position.y >= this.attr.y0){
      this.attr.y = this.attr.y0;
      this.attr.height = position.y - this.attr.y0;
    }else{
      this.attr.y = position.y;
      this.attr.height = this.attr.y0 - position.y;
    }
    panelBorderMonitor(position,Vue);
  }

};

//移动
SelectBox.objMove = function(position, obj){
  obj.x = position.x - this.attr.x1 + obj.x0;
  obj.y = position.y - this.attr.y1 + obj.y0;
};

//选框节点组移动
SelectBox.multiObjMove = function(position, objs){
  for (var i in objs) {
    this.objMove(position, objs[i]);
  }
};

//框选开始
SelectBox.selectStar = function(Vue,e, panelObj, obj, container) {
  // 框选前提
  this.selectBoxFlag(this.attr.selectFlag, true);

  // 置顶操作
  objFloat(obj, container);

  //清楚选中
  this.attr.nodesId = [];

  // 记录位置
  this.selectBoxXY(Vue,e, panelObj);
};

//框选中
SelectBox.selecting = function(e, Vue) {
  //选框缩放
  if(this.selectBoxFlag(this.attr.selectFlag)){
    this.selectBoxSizeChange(e, Vue);
  }
};

//框选结束
SelectBox.selectOver = function(nodes, Vue) {
  if(this.selectBoxFlag(this.attr.selectFlag)){
    this.selectBoxFlag(this.attr.selectFlag, false);
    this.recordNodes(nodes, Vue);
    if(isNullObject(this.attr.nodes)){
      this.selectBoxHidden();
    }
  }
};

//选框移动开始
SelectBox.selectBoxMoveStart = function(e, Vue) {
  this.selectBoxFlag(this.attr.moveFlag, true);

  this.recordXY(this.attr);
  this.recordNodesXY(this.attr.nodes);

  this.selectBoxXY(Vue, e, Vue.panelObj, MOVE_START_FIXED);
};

//选框移动中 
SelectBox.selectBoxMove = function(e, Vue) {
  if(this.selectBoxFlag(this.attr.moveFlag)){
    let position = svgXY(e,Vue.panelObj,Vue);
    panelBorderMonitor(position,Vue);
    this.objMove(position, this.attr);
    this.multiObjMove(position, this.attr.nodes);
  }
};

//选框移动结束是否发生碰撞
SelectBox.isContact = function(nodes){
  let contactFlag = CONTACT_FLAG.NULL;
  for(var i in nodes){
    if(nodes[i] && nodes[i].visible && !this.attr.nodesId.includes(nodes[i].id) && this.attr.y+this.attr.height>=nodes[i].y && this.attr.y<=nodes[i].y+nodes[i].height){
      if(this.attr.x+this.attr.width>=nodes[i].x && this.attr.x+this.attr.width/2<=nodes[i].x+nodes[i].width/2){
        contactFlag = CONTACT_FLAG.RIGHT;
        break;
      }else if(this.attr.x<=nodes[i].x+nodes[i].width && this.attr.x+this.attr.width/2>=nodes[i].x+nodes[i].width/2){
        contactFlag = CONTACT_FLAG.LEFT;
        break;
      }
    }
  }

  return {
    'flag':contactFlag,
    'node':nodes[i]
  }

};

//选框发生碰撞
SelectBox.contactNode = function(contactResult,Vue){
  Vue.focusNodes.splice(0,Vue.focusNodes.length);
  for(let i in this.attr.nodes){
    contactOperate.moveX(this.attr.nodes[i],contactResult.flag,Vue);
    Vue.focusNodes.push(i);
    if(!this.attr.nodes[i].viewNodeFlag){ //如果不是视图
      Vue.flow.isContactAttach && contactOperate.contactNode(this.attr.nodes[i],contactResult,Vue.lines,Vue.groups,Vue);
    }
  }
};

//选框移动结束
SelectBox.selectBoxMoveOver = function(Vue) {
  if(this.selectBoxFlag(this.attr.moveFlag)){
    this.selectBoxFlag(this.attr.moveFlag, false);
    let contactResult = this.isContact(Vue.nodes);
    if(contactResult.flag > CONTACT_FLAG.NULL){
      Vue.flow.foreignObjectStyle = Vue.flow.layoutTransition;
      setTimeout(() => { Vue.flow.foreignObjectStyle = "" }, Vue.flow.transitionCancelTime);
      if(!contactResult.node.viewNodeFlag){ //与节点碰撞
        this.contactNode(contactResult,Vue);
      }else{ //与视图碰撞
        this.contactView(Vue,contactResult);
      }
      this.selectBoxHidden();
    }
  }
};

//选框碰撞视图
SelectBox.contactView = function(Vue,contactResult){
  Vue.focusNodes.splice(0,Vue.focusNodes.length);
  for(let i in this.attr.nodes){
    contactOperate.moveX(this.attr.nodes[i],contactResult.flag,Vue);
    Vue.focusNodes.push(i);
    if(!this.attr.nodes[i].viewNodeFlag){
      nodeIntoView(Vue,this.attr.nodes[i].id,contactResult.node.id,contactResult.node.label,Vue.nodes,Vue.lines,Vue.groups);
    }
  }
};

//选框隐藏
SelectBox.selectBoxHidden = function() {
  this.selectBoxSizeChange();
  this.selectBoxFlag(this.attr.moveFlag, false);
};

//删除选框中的节点组
SelectBox.removeSelectedNodes = function(Vue){
  // if(!isNullObject(this.attr.nodes) && isNoView(Vue,Vue.nodes,this.attr.nodesId)){
//     for(let i in this.attr.nodes){
//       removeNode(Vue,this.attr.nodes[i]);
//     }
  // }
};

//新建视图
SelectBox.createView = function(Vue,nodes,lines,groups,e,panel,label){
  if(!isNullObject(this.attr.nodes) && isNoView(Vue,nodes,this.attr.nodesId)){
    this.selectBoxHidden();
    createView(Vue,this.attr.nodesId,label,this,e,panel);
  }
};

SelectBox.createViewOperate = function(Vue,view,nodes,lines,groups,e,panel,label){
  if(!!view.id){
    let newView = initView(Vue,view,e,panel);
    nodes[newView.attr.id] = newView.attr;
    createGroup(newView.attr,this.attr.nodes,groups);
    addLines(lines,groups,groups.length-1);
  }
};

export default SelectBox;