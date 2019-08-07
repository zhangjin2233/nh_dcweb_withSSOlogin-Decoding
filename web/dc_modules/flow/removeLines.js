import removeLine from './removeLine'

//获取连线的两端节点在哪一条组合数据中
function getGroupIndexOfLine(line,groups){
  let startNode = line[0],
      targetNode = line[1],
      groupIndexOfStartNode = -1,
      groupIndexOfTargetNode = -1;

  for(let i=0; i<groups.length; i++){
    if(groups[i].indexOf(startNode) != -1){
      groupIndexOfStartNode = i;
    }
    if(groups[i].indexOf(targetNode) != -1){
      groupIndexOfTargetNode = i;
    }
    if(groupIndexOfStartNode!=-1 && groupIndexOfTargetNode!=-1){
      break;
    }
  }

  return {
    'start': groupIndexOfStartNode,
    'target': groupIndexOfTargetNode,
  }
};

//获取连线的两端是否是视图中唯一与外部的连线的一端
function getIsNodeBehalfInGroup(lines,line,groups,groupIndexOfNode){
  let startNode = line[0],
      targetNode = line[1],
      groupIndexOfStartNode = groupIndexOfNode.start,
      groupIndexOfTargetNode = groupIndexOfNode.target,
      isStartNodeBehalfInGroupFlag = true,
      isTargetNodeBehalfInGroupFlag = true;

  for(let i=0; i<lines.length; i++){
    if(lines[i][1]==targetNode && lines[i][0]!=startNode && groupIndexOfStartNode!=-1 && groups[groupIndexOfStartNode].indexOf(lines[i][0])>0){
      isStartNodeBehalfInGroupFlag = false;
    }
    if(lines[i][0]==startNode && lines[i][1]!=targetNode && groupIndexOfTargetNode!=-1 &&  groups[groupIndexOfTargetNode].indexOf(lines[i][1])>0){
      isTargetNodeBehalfInGroupFlag = false;
    }
    if(!isStartNodeBehalfInGroupFlag && !isTargetNodeBehalfInGroupFlag){
      break;
    }
  }

  return {
    'start': isStartNodeBehalfInGroupFlag,
    'target': isTargetNodeBehalfInGroupFlag,
  }
};

//删除视图与视图之间的连线
function removeViewWithView(nodes,lines,groups,groupIndexOfNode){
  let groupIndexOfStartNode = groupIndexOfNode.start,
      groupIndexOfTargetNode = groupIndexOfNode.target;
  for(let i=lines.length-1; i>=0; i--){
    if(lines[i] && groups[groupIndexOfStartNode].indexOf(lines[i][0])!=-1 && groups[groupIndexOfTargetNode].indexOf(lines[i][1])!=-1){
      removeSingleNodeWithSingleNode(lines,i);
    }
  }
};

//删除视图到节点的连线
function removeViewToNode(index,lines,groups){
  let groupIndexOfNode = getGroupIndexOfLine(lines[index],groups),
      groupIndexOfStartNode = groupIndexOfNode.start,
      targetNode = lines[index][1];

  removeNodeWithView(lines,index,groups,groups[groupIndexOfStartNode],targetNode,0,1)
};

//删除节点到视图的连线
function removeNodeToView(index,lines,groups){
  let groupIndexOfNode = getGroupIndexOfLine(lines[index],groups),
      groupIndexOfTargetNode = groupIndexOfNode.target,
      startNode = lines[index][0];

  removeNodeWithView(lines,index,groups,groups[groupIndexOfTargetNode],startNode,1,0);
};

//删除节点与视图的连线
function removeNodeWithView(lines,index,groups,viewGroup,node,indexOfView,indexOfNode){
  removeSingleNodeWithSingleNode(lines,index);
  transformNodeWithNodes(lines,groups,viewGroup,node,indexOfView,indexOfNode);
};

//将节点与视图转化为节点与多节点连线问题
function transformNodeWithNodes(lines,groups,viewGroup,node,indexOfView,indexOfNode){
  for(let i=lines.length-1; i>=0; i--){
    if(lines[i] && viewGroup.indexOf(lines[i][indexOfView])>0 && lines[i][indexOfNode]==node){
      removeNodeWithNode(i,lines,groups);
    }
  }
};

//删除节点与节点的连线
function removeNodeWithNode(index,lines,groups){
  let groupIndexOfNode = getGroupIndexOfLine(lines[index],groups),
      groupIndexOfStartNode = groupIndexOfNode.start,
      groupIndexOfTargetNode = groupIndexOfNode.target;

  if(groupIndexOfStartNode == groupIndexOfTargetNode){
    removeSingleNodeWithSingleNode(lines,index);
  }else if(groupIndexOfStartNode!=-1 && groupIndexOfTargetNode!=-1){
    removeGroupNodeWithGroupNode(index,lines,groups);
  }else if(groupIndexOfStartNode!=-1){
    removeGroupNodeToSingleNode(index,lines,groups);
  }else{
    removeSingleNodeToGroupNode(index,lines,groups);
  }
};

//删除独立节点与独立节点的连线
function removeSingleNodeWithSingleNode(lines,index){
  removeLine(lines,index);
};

//删除视图成员节点与视图成员节点的连线
function removeGroupNodeWithGroupNode(index,lines,groups){
  let startNode = lines[index][0], 
      targetNode = lines[index][1],
      groupIndexOfNode = getGroupIndexOfLine(lines[index],groups),
      groupIndexOfStartNode = groupIndexOfNode.start,
      groupIndexOfTargetNode = groupIndexOfNode.target,
      isNodeBehalfInGroup = getIsNodeBehalfInGroup(lines,lines[index],groups,groupIndexOfNode),
      isStartNodeBehalfInGroupFlag = isNodeBehalfInGroup.start,
      isTargetNodeBehalfInGroupFlag = isNodeBehalfInGroup.target;

  if(isStartNodeBehalfInGroupFlag && isTargetNodeBehalfInGroupFlag){
    removeNodeBehalfInGroupWithNodeBehalfInGroup(lines,startNode,groups[groupIndexOfStartNode][0],targetNode,groups[groupIndexOfTargetNode][0]);
  }else if(!isStartNodeBehalfInGroupFlag && isTargetNodeBehalfInGroupFlag){
    removeSingleNodeToNodeBehalfInGroup(lines,startNode,targetNode,groups[groupIndexOfTargetNode][0]);
  }else if(isStartNodeBehalfInGroupFlag && !isTargetNodeBehalfInGroupFlag){
    removeNodeBehalfInGroupToSingleNode(lines,startNode,targetNode,groups[groupIndexOfStartNode][0]);
  }else{
    removeSingleNodeWithSingleNode(lines,index);
  }
};

function removeNodeBehalfInGroupWithNodeBehalfInGroup(lines,startNode,startNodeView,targetNode,targetNodeView){
  for(let i=lines.length-1; i>=0; i--){
    if(lines[i] && (lines[i][0]==startNode || lines[i][0]==startNodeView) && (lines[i][1]==targetNode || lines[i][1]==targetNodeView)){
      removeSingleNodeWithSingleNode(lines,i);
    }
  }
};

function removeNodeBehalfInGroupToSingleNode(lines,startNode,targetNode,startNodeView){
  removeNodeBehalfInGroupWithSingleNode(lines,startNode,startNodeView,0,targetNode,1);
};

function removeNodeBehalfInGroupWithSingleNode(lines,behalfNode,behalfNodeView,behalfNodeIndex,singleNode,singleNodeIndex){
  for(let i=lines.length-1; i>=0; i--){
    if(lines[i] && (lines[i][behalfNodeIndex]==behalfNode || lines[i][behalfNodeIndex]==behalfNodeView) && lines[i][singleNodeIndex]==singleNode){
      removeSingleNodeWithSingleNode(lines,i);
    }
  }
};

function removeSingleNodeToNodeBehalfInGroup(lines,startNode,targetNode,targetNodeView){
  removeNodeBehalfInGroupWithSingleNode(lines,targetNode,targetNodeView,1,startNode,0);
};

function removeGroupNodeToSingleNode(index,lines,groups){
  let startNode = lines[index][0], 
      targetNode = lines[index][1],
      groupIndexOfNode = getGroupIndexOfLine(lines[index],groups),
      groupIndexOfStartNode = groupIndexOfNode.start,
      isNodeBehalfInGroup = getIsNodeBehalfInGroup(lines,lines[index],groups,groupIndexOfNode),
      isStartNodeBehalfInGroupFlag = isNodeBehalfInGroup.start;

  if(isStartNodeBehalfInGroupFlag){
    removeNodeBehalfInGroupToSingleNode(lines,startNode,targetNode,groups[groupIndexOfStartNode][0]);
  }else{
    removeSingleNodeWithSingleNode(lines,index);
  }
};

function removeSingleNodeToGroupNode(index,lines,groups){
  let startNode = lines[index][0], 
      targetNode = lines[index][1],
      groupIndexOfNode = getGroupIndexOfLine(lines[index],groups),
      groupIndexOfTargetNode = groupIndexOfNode.target,
      isNodeBehalfInGroup = getIsNodeBehalfInGroup(lines,lines[index],groups,groupIndexOfNode),
      isTargetNodeBehalfInGroupFlag = isNodeBehalfInGroup.target;

  if(isTargetNodeBehalfInGroupFlag){
    removeSingleNodeToNodeBehalfInGroup(lines,startNode,targetNode,groups[groupIndexOfTargetNode][0]);
  }else{
    removeSingleNodeWithSingleNode(lines,index);
  }
};

function removeLines(index,nodes,lines,groups){ //删除连线
  let startNode = lines[index][0], 
      targetNode = lines[index][1],
      groupIndexOfNode = getGroupIndexOfLine(lines[index],groups);

  if(nodes[startNode].viewNodeFlag && nodes[targetNode].viewNodeFlag){ //视图相连
    removeViewWithView(nodes,lines,groups,groupIndexOfNode); //删除视图到视图的所有连线包括子节点与子节点
  }else if(nodes[startNode].viewNodeFlag && !nodes[targetNode].viewNodeFlag){ //视图连接节点
    removeViewToNode(index,lines,groups); //删除视图及其子节点到节点的连线
  }else if(!nodes[startNode].viewNodeFlag && nodes[targetNode].viewNodeFlag){ //节点连接视图
    removeNodeToView(index,lines,groups); //删除节点到视图及其子节点的连线
  }else{ //节点连接节点
    removeNodeWithNode(index,lines,groups); 
  }
};

export default removeLines;