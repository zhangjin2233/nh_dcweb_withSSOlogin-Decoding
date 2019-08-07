
//记录该连线
function recordLine(line,container){
  container.push(line);
};

//排除该连线，并返回该线的上一下标
function ruleOutLine(index,lines){
  lines.splice(index--,1);
  return index;
};

//判断两个变量是否相等
function isSame(val1,val2){
  return (val1==val2);
};

//判断[lineStart,lineTarget]构成的连线是否存在环路
function isLoop(lineStart,lineTarget,lines){ //有向无环约束
  var sameLengthPathNodes = [];
  for(var i=0; i<lines.length; i++){      
    if(isSame(lines[i][0],lineTarget)){
      if(isSame(lines[i][1],lineStart)){
        return true;
      }else{
        //记录可能存在的通路路线
        //减少已记录的数据，减少循环次数
        recordLine(lines[i],sameLengthPathNodes);
        i = ruleOutLine(i,lines);
      }
    }
  }
  // sameLengthPathNodes长度为0，说明不存在可能的通路
  if(sameLengthPathNodes.length != 0){
    for(var j=0; j<sameLengthPathNodes.length; j++){
      lineTarget = sameLengthPathNodes[j][1];
      if(isLoop(lineStart,lineTarget,lines)){
        return true;
      }
    }
  }
  return false;
};

export default isLoop;