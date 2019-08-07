import objClone from '../js/base/objClone'
import svgXY from './svgXY'
import objFloat from './objFloat'
import nodeIntoView from './nodeIntoView'
import changeGroupVisible from './changeGroupVisible'
import removeNode from './removeNode'
import panelBorderMonitor from './panelBorderMonitor'
import contactOperate from './contactOperate'
import getGroup from './getGroup'
import getSkinship from './getSkinship'

const SKIN_FLAG = {
  PRE: 'pre',
  NEXT: 'next',
  ALL: 'all',
}

const CONTACT_FLAG = { //碰撞的方向标记
  NULL: -1,
  LEFT: 1,
  RIGHT: 0
};

let Node = {};

Node.attr = {
  'x0': 0, //用于多节点移动的定位
  'y0': 0,
  'x': 0, //节点在svg画板中的坐标
  'y': 0,
  'id': '',
  'label': '',
  'width': 1,
  'height': 1,
  'visible': true, //节点的可见度，用于标识视图节点与成员的展示
  'moveFlag': {'value': false}, //移动和拖拽的标记，使用对象存储是为了方便传值
  'dragFlag': {'value': false},
  'viewNodeFlag': false, //节点是否是视图节点的标记
  'type': '', //节点的类型，视图或者普通节点，该字段只是后台数据需要
  'textList': [],
  'listShow': true,
  'animate': '',
};

//设置Node的属性
Node.setAttr = function(attr,value){
  this[attr] = value;
};

Node.setAttrs = function(obj){
  this.attr = objClone(obj,this.attr);
};

//设置或获取节点的标记值
Node.nodeFlag = function(type, flag){
  if (flag !== undefined) {
    type.value = flag;
  }
  return type.value;
};

//计算节点在画板中的坐标
Node.computeXY = function(e,Vue,node){
  let position = svgXY(e,Vue.panelObj,Vue);
  node.x = position.x - node.width/2;
  node.y = position.y - node.height/2;
};

//计算节点的id
Node.uniqueId = function(node){
  node.id = (new Date().getTime())+Math.random().toString(); //唯一的id
};

//让节点在svg画板中显示
Node.appearSvg = function(e,Vue,node){
  this.computeXY(e,Vue,node);
  this.uniqueId(node);
};

//节点开始移动
Node.moveStart = function(){
  this.nodeFlag(this.attr.moveFlag,true); //记录当前节点拖拽前提标记
};

//组合节点的缩放
Node.zoom = function(Vue,node){
  let group = getGroup(node.id, Vue.groups);
  if(group.member.some(k=>Vue.nodes[k][SKIN_FLAG.PRE] || Vue.nodes[k][SKIN_FLAG.NEXT])){
    dataTool.alert("存在折叠数据，请先展开节点再进行操作,","提示");
  }else{
    changeGroupVisible(Vue.nodes, group.member,node);
    
    //合并视图时是否自动布局
    if(node.viewNodeFlag || (!node.viewNodeFlag && Vue.flow.isZoomLayout)){
      Vue.panelObj.autoLayout(Vue, Vue.nodes, Vue.lines);
    }
    //聚焦
    Vue.focusNodes.splice(0,Vue.focusNodes.length,...group.member.filter(k=>Vue.nodes[k].visible))
  }
};

//节点的移动
Node.objMove = function(e,Vue){ 
  let position = svgXY(e,Vue.panelObj,Vue);
  this.attr.x = position.x - this.attr.width/2;
  this.attr.y = position.y - this.attr.height/2;
  //边界处理
  panelBorderMonitor(position,Vue);
};

//判断节点是否发生碰撞
Node.isContact = function(nodes){
  let contactFlag = CONTACT_FLAG.NULL;
  // 判断位置是否有交集
  for(var i in nodes){
    if(nodes[i].visible && this.attr.id != nodes[i].id && this.attr.y+this.attr.height>=nodes[i].y && this.attr.y<=nodes[i].y+nodes[i].height){
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

//进入节点内部-进入视图
Node.intoNode = function(Vue){
  if(this.attr.viewNodeFlag){
    Vue.flow.recordFlowLayer(Vue, this.attr.pdcId);
    Vue.flow.initFlow(Vue);
  }
}

Node.getSkinship = function(Vue, type){
  Vue.focusNodes.push(getSkinship(Vue.nodes, Vue.lines,this.attr.id, type).nodes);
  Vue.focusLines.push(getSkinship(Vue.nodes, Vue.lines,this.attr.id, type).lines);
  Vue.floatFlag.value = Vue.flow.line.floatFlag.shut;
}

//节点聚焦
Node.chose = function(node,e,Vue){
  this.attr = node;
  //高亮该节点
  Vue.focusNodes.splice(0,Vue.focusNodes.length,node.id);
  Vue.focusLines.splice(0,Vue.focusLines.length);
  //将当前节点置于顶层
  let obj = e.target;
  while(!Vue.$refs.node.includes(obj)){
    obj = obj.parentNode;
  }
  objFloat(obj,Vue.$refs.svg);
};

Node.remove = function(Vue){
  if(this.attr[SKIN_FLAG.PRE] ||this.attr[SKIN_FLAG.NEXT]){
    Vue.$alert("该节点有折叠数据，请先展开节点再进行删除操作,","提示");
  }else{
    removeNode(Vue,this.attr);
  }
};

//节点移动过程 
Node.moving = function(e,Vue) {
  //移动鼠标过程中更新节点的坐标数据 
  if (this.nodeFlag(this.attr.moveFlag) && Vue.flow.canMoveNode) {
    this.objMove(e,Vue);
  }
};

//节点移动结束
Node.moveOver = function(Vue) {
  if(this.nodeFlag(this.attr.moveFlag)){
    this.nodeFlag(this.attr.moveFlag,false); //设置不可移动
    //判断落脚点是否与其他节点相交
    let contactResult = this.isContact(Vue.nodes);
    if(contactResult.flag > CONTACT_FLAG.NULL){
      Vue.flow.foreignObjectStyle = Vue.flow.layoutTransition;
      setTimeout(() => { Vue.flow.foreignObjectStyle = "" }, Vue.flow.transitionCancelTime);
      contactOperate.moveX(this.attr,contactResult.flag,Vue);
      Vue.focusNodes.splice(0,Vue.focusNodes.length,this.attr.id);
      if(!this.attr.viewNodeFlag && !contactResult.node.viewNodeFlag){ //节点与节点碰撞
        let lineStartNode = contactResult.flag === CONTACT_FLAG.RIGHT ? this.attr : contactResult.node;
        let lineTargetNode = contactResult.flag === CONTACT_FLAG.RIGHT ? contactResult.node : this.attr;
        if(Vue.flow.jumpLinkType.includes(lineStartNode.type) && Vue.jumpLinkType){ //如果是跳转链路
          Vue.flow.canJumplink && Vue.flow.addJumpLink(lineStartNode,lineTargetNode,Vue);
        }else{
          Vue.flow.isContactAttach && contactOperate.contactNode(this.attr,contactResult,Vue.lines,Vue.groups,Vue);
        }
      }else if(!this.attr.viewNodeFlag){ // 节点碰撞视图
        Vue.flow.canNodeIntoView && nodeIntoView(Vue,this.attr.id,contactResult.node.id,contactResult.node.label,Vue.nodes,Vue.lines,Vue.groups);
      }else if(this.attr.viewNodeFlag && contactResult.node.viewNodeFlag){ //视图与视图碰撞
        
      }
    }
  }
};

//节点被拖拽标记
Node.dragStart = function(){
  this.nodeFlag(this.attr.dragFlag,true);//标记置为true
};

//节点拖放触发移动结束
Node.triggerMoveOver = function(Vue){
  this.nodeFlag(this.attr.moveFlag,true); //标记置为true
  this.moveOver(Vue);
};

//节点拖放生成
Node.dragOver = async function(e,Vue){
  if(this.nodeFlag(this.attr.dragFlag)){  
    this.nodeFlag(this.attr.dragFlag,false); //标记置为false
    //获取拖放节点的信息
    let nodeData = JSON.parse(e.dataTransfer.getData("node"));
    //生成完整的节点信息 
    let node = await Vue.flow.createNode(nodeData,this.attr,Vue);
    if(node.id){
      //重新计算节点所在位置
      this.computeXY(e,Vue,node);
      //响应
      node.visible = true;
      Vue.$set(Vue.nodes, node.id, node); //生成对应数据响应界面
      //触发移动
      Vue.$nextTick(()=>{
        let dom = { target: Vue.$refs.svg.getElementById(node.id) };
        this.chose(node,dom,Vue);
        this.triggerMoveOver(Vue);
      })
    }
  }
};

export default Node;