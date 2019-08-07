import removeNodeLines from './removeNodeLines'
import getGroup from './getGroup'
import removeNodeGroup from './removeNodeGroup'
import removeNodeData from './removeNodeData'
import removeView from './removeView'
import changeGroupVisible from './changeGroupVisible'
import removeLine from './removeLine'
import ruleOutGroup from './ruleOutGroup'

//删除视图的连线
function removeViewLine(nodeId,nodes,lines){
  for(let i=lines.length-1; i>=0; i--){
    if(lines[i] && lines[i].indexOf(nodeId) != -1){
      removeLine(lines,i);
    }
  }
}

//删除视图外壳
function removeViewAndSubView(viewId,viewLabel,Vue,groupIndex){
  changeGroupVisible(Vue.nodes,Vue.groups[groupIndex].slice(1),Vue.nodes[viewId]); //改变视图成员的可见度
  removeView(viewId,Vue); //删除视图外壳
}

// //删除视图成员节点
function removeNodeFromGroup(nodeId,groups,groupIndex){
  let index = groups[groupIndex].indexOf(nodeId);
  ruleOutGroup(groups[groupIndex],index);
  if(groups[groupIndex].length == 1){ //如果该视图只剩下视图节点
    removeNodeGroup(groups,groupIndex);
  }
}

//删除节点
function removeNode(Vue,node){
  let groupIndex = getGroup(node.id, Vue.groups).index;
  if(node.viewNodeFlag){
    removeViewNode(Vue,node,groupIndex);
  }else{
    removeGeneralNode(Vue,node,groupIndex);
  }
};

function removeViewNode(Vue,node,groupIndex){
  let params = {};
  params[Vue.flow.req.removeView.data.viewName] = node.label;
  params[Vue.flow.req.removeView.data.flowName] = Vue.flow.flowName;
  params.layer = JSON.parse(window.sessionStorage.getItem(Vue.layers)).slice(-1).pop();
  Vue.flowLoading = true;
  DCHttp.req({url:Vue.flow.req.removeView.url, params:params}).then(res=>{
    if(res){
      removeViewLine(node.id,Vue.nodes,Vue.lines);
      removeViewAndSubView(node.id,node.label,Vue,groupIndex); //删除视图外壳
      Vue.panelObj.autoLayout(Vue, Vue.nodes, Vue.lines);

      Vue.flow.historyReset(Vue); //历史记录重置
      // Vue.flow.saveFlow(Vue); //保存
    }
    Vue.flowLoading = false;
  }).catch( err => {
    Vue.flowLoading = false;
  });
}

function removeGeneralNode(Vue,node,groupIndex){
  if(groupIndex != -1){ //如果是视图成员节点
    removeNodeLines(node.id,Vue);
    removeNodeData(Vue.nodes,node.id);
    removeNodeFromGroup(node.id,Vue.groups,groupIndex);
  }else{ //与视图无关
    removeNodeLines(node.id,Vue);
    // 因为单纯删除节点不会引起nodes的监听变化，故在此通过监听lines来实现
    Vue.lines.push(null); Vue.lines.pop();
    removeNodeData(Vue.nodes,node.id);
  }
}

export default removeNode;
  