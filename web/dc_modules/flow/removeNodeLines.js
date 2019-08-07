import removeLines from './removeLines'

//删除节点的连线,节点周围显性可见的连线
function removeNodeLines(nodeId,Vue){
  for(let i=Vue.jumpLinks.length-1; i>=0; i--){
    Vue.jumpLinks[i].includes(nodeId) && Vue.jumpLinks.splice(i,1);
  }
  for(let i=Vue.lines.length-1; i>=0; i--){
    if(Vue.lines[i] && Vue.lines[i].indexOf(nodeId) != -1 && Vue.nodes[Vue.lines[i][0]].visible && Vue.nodes[Vue.lines[i][1]].visible){
      removeLines(i,Vue.nodes,Vue.lines,Vue.groups);
    }
  }
};

export default removeNodeLines;