
//获取组合的数据
function getGroup(node,groups){
  let group = {
  	'member': [],
  	'index': -1,
  };

  for(let i=0; i<groups.length; i++){
    if(groups[i].indexOf(node) != -1){
      group.index = i;
      group.member = groups[i].slice(0);
      break;
    }
  }
  return group;
}

export default getGroup;