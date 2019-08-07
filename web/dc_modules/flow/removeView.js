import getGroup from './getGroup'
import removeNodeGroup from './removeNodeGroup'
import removeNodeLines from './removeNodeLines'
import removeNodeData from './removeNodeData'

//删除视图节点
function removeView(viewId,Vue){
  if(Vue.nodes[viewId].viewNodeFlag){ //删除了view外壳
    let groupIndex = getGroup(viewId, Vue.groups).index;
    removeNodeGroup(Vue.groups,groupIndex);
    Vue.nodes[viewId].viewNodeFlag = false;
    removeNodeLines(viewId,Vue);
    Vue.nodes[viewId].viewNodeFlag = true;
    removeNodeData(Vue.nodes,viewId);
  }
};

export default removeView;