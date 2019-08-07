
//判断该线段是否已经存在
function isLineExist(line,lines){
  let isExist = false;
  for(let i=0; i<lines.length; i++){
    if(lines[i][0]==line[0] && lines[i][1]==line[1]){
      isExist = true;
      break;
    }
  }
  return isExist;
}

export default isLineExist;