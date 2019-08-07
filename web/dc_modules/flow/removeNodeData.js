
//删除节点数据
function removeNodeData(nodes,nodeId){
  //此处本该直接删除节点数据，但因为vue没法动态响应直接删除对象，所以将其设为不可枚举
  nodes[nodeId] && (nodes[nodeId].visible = false);
  Object.defineProperty(nodes,nodeId,{enumerable: false});
  delete nodes[nodeId];
};

export default removeNodeData;