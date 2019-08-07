import isLoop from './isLoop'
import addLines from './addLines'
import isLineExist from './isLineExist'

const CONTACT_FLAG = { //碰撞的方向标记
  NULL: -1,
  LEFT: 1,
  RIGHT: 0
};

//节点平移
function moveX(node,contactFlag,Vue){
  const moveSpace = Vue.flow.moveSpace;
  switch(contactFlag){
    case CONTACT_FLAG.RIGHT:
      node.x -= moveSpace;
      break;
    case CONTACT_FLAG.LEFT:
      node.x += moveSpace;
    default:
      break;
  }
};

//碰撞节点处理
function contactNode(node,contactResult,lines,groups,Vue){
  let lineStartNode=node, lineTargetNode=contactResult.node;
  if(contactResult.flag === CONTACT_FLAG.RIGHT){
    addLine(lineStartNode,lineTargetNode,lines,groups);
  }else{
    addLine(lineTargetNode,lineStartNode,lines,groups);
  }
};

//除去自环的连线
function removeRing(lines){
  for(let i=lines.length-1; i>=0; i--){
    if(lines[i][0] == lines[i][1]){
      lines.splice(i,1);
    }
  }
}

//碰撞后增加连线关系
function addLine(lineStartNode,lineTargetNode,lines,groups){
  if(!isLineExist([lineStartNode.id,lineTargetNode.id],lines)){
    lines.push([lineStartNode.id,lineTargetNode.id]);
    let linesTemp = JSON.parse(JSON.stringify(lines));
    removeRing(linesTemp);
    if(isLoop(lineStartNode.id, lineTargetNode.id, linesTemp)){
      lines.pop();
    }else{
      addLines(lines,groups);
    }
  } 
};

export default {
	moveX,
	contactNode
};