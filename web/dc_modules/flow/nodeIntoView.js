import addLines from './addLines'
import getGroup from './getGroup'
import removeLine from './removeLine'

//节点数据加入组合数据
function intoGroup(nodeId,groups,groupIndex){
	groups[groupIndex].push(nodeId);
}

//移除节点与该视图的连线
function removeViewLine(viewId,lines){
	for(let i=lines.length-1; i>=0; i--){
		if(lines[i] && lines[i].indexOf(viewId) != -1){
			removeLine(lines,i);	
		}
	}
}

//节点进入视图操作
function nodeIntoView(Vue,nodeId,viewId,viewLabel,nodes,lines,groups){
  let params = {};
  params[Vue.flow.req.intoView.data.intoGroup] = [nodeId];
  params[Vue.flow.req.intoView.data.viewName] = viewLabel;
  params[Vue.flow.req.intoView.data.flowName] = Vue.flow.flowName;
  Vue.flowLoading = true;
  DCHttp.req({url:Vue.flow.req.intoView.url, params:params}).then(res=>{
    if(res){
      removeViewLine(viewId,lines);
      let group = getGroup(viewId,groups);
      intoGroup(nodeId,groups,group.index);
      addLines(lines,groups,group.index);
      nodes[nodeId].visible = false;
      Vue.focusNodes.splice(0,Vue.focusNodes.length,viewId);
      Vue.flow.historyReset(Vue); //历史记录重置
      // Vue.flow.saveFlow(Vue)//保存
    }
    Vue.flowLoading = false;
  }).catch(err=>{
    Vue.flowLoading = false;
  });
}

export default nodeIntoView;