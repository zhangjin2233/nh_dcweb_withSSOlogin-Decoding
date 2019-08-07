//新建组合数据
function createGroup(view,nodeGroup,groups){
  let newGroup = [view.id];
  for(let i in nodeGroup){
    newGroup.push(nodeGroup[i].id);
    nodeGroup[i].visible = !view.visible;
    nodeGroup[i].viewNodeFlag = !view.viewNodeFlag;
  }
  groups.push(newGroup);
}

export default createGroup;