
function isNoView(Vue,nodes,nodesId){
  let hasView = true;
  for(let i=0; i<nodesId.length; i++){
    if(nodes[nodesId[i]][Vue.flow.nodeType] == Vue.flow.viewFlag){
      hasView = false;
      break;
    }
  }
  return hasView;
}

export default isNoView;