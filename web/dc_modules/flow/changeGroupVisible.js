
function changeNodeVisible(nodes,nodeId){
  nodes[nodeId].visible = !nodes[nodeId].visible;
}

function changeGroupVisible(nodes,group,node){
  for(let i=0; i<group.length; i++){
    changeNodeVisible(nodes,group[i]);
    nodes[group[i]].x = node.x;
    nodes[group[i]].y = node.y;
    // if(i>0){
    //   nodes[group[i]].x = nodes[group[0]].x;
    //   nodes[group[i]].y = nodes[group[0]].y;
    // }
  }
};

export default changeGroupVisible;