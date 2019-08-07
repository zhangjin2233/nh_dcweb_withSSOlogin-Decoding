const SKIN_FLAG = {
  PRE: 'pre',
  NEXT: 'next',
  ALL: 'all',
}

//获取直接关系
function getDirectSkinship(nodes,lines,root,sameRootSkinNodes,skinLines,lineIndexRoot,lineIndexNode){
	for(let i=lines.length-1; i>=0; i--){
  	if(nodes[lines[i][lineIndexNode]].visible && lines[i][lineIndexRoot] == root){
  		sameRootSkinNodes.push(lines[i][lineIndexNode]); //记录当前节点的直接前驱
  		skinLines.push(lines[i]);
  		lines.splice(i,1); //减少循环次数
  	}
  }
}

//递归获取亲缘关系
function recursiveGetSkinship(nodes,lines,sameRootSkinNodes,skinNodes,skinLines,lineIndexRoot,lineIndexNode){
	for(let i=0; i<sameRootSkinNodes.length; i++){ //循环递归获取当前直接前驱
  	getSameRootSkinship(nodes,lines,sameRootSkinNodes[i],skinNodes,skinLines,lineIndexRoot,lineIndexNode);
  }	
}

//获取root的所有亲缘关系
function getSameRootSkinship(nodes,lines,root,skinNodes,skinLines,lineIndexRoot,lineIndexNode){
	let sameRootSkinNodes = [];
	getDirectSkinship(nodes,lines,root,sameRootSkinNodes,skinLines,lineIndexRoot,lineIndexNode);

	if(sameRootSkinNodes.length){
		skinNodes.push(sameRootSkinNodes); //记录当前节点的所有直接前驱
		recursiveGetSkinship(nodes,lines,sameRootSkinNodes,skinNodes,skinLines,lineIndexRoot,lineIndexNode);
	}
};

//获取nodeId节点的亲缘关系节点和连线
function getSkinship(nodes,lines,nodeId,skinFlag){
	let skinNodes=[], skinLines=[], templines=lines.slice(0);
	switch(skinFlag){
		case SKIN_FLAG.PRE:
			getSameRootSkinship(nodes,templines,nodeId,skinNodes,skinLines,1,0);
			break;
		case SKIN_FLAG.NEXT:
			getSameRootSkinship(nodes,templines,nodeId,skinNodes,skinLines,0,1);
			break;
		case SKIN_FLAG.ALL:
			getSameRootSkinship(nodes,templines,nodeId,skinNodes,skinLines,1,0);
			skinNodes.push(nodeId);
			getSameRootSkinship(nodes,templines,nodeId,skinNodes,skinLines,0,1);
			break;
		default:
			break;
	}
  return {
  	'nodes': [...(new Set([].concat.apply([],skinNodes)))], //数组降维
  	'lines': [...(new Set(skinLines))]
  };
};

export default getSkinship;