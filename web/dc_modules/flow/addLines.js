
// 补全视图的连线
function addLines(linesData,groupsData){
  let addLineDataLength = addNodeWithViewLines(linesData,groupsData);
  addLineDataLength += addViewtoViewLines(linesData,groupsData,addLineDataLength);
  uniqueLinesData(linesData,addLineDataLength);
};

function addGroupNodesWithViewLines(linesData,linesDataLength,group){
  for(let j=0; j<linesDataLength; j++){
    if(group.indexOf(linesData[j][0])!=-1 && group.indexOf(linesData[j][1])==-1){
      linesData.push([group[0],linesData[j][1]]);
    }else if(group.indexOf(linesData[j][0])==-1 &&  group.indexOf(linesData[j][1])!=-1){
      linesData.push([linesData[j][0],group[0]]);
    }
  }
};

function addNodeWithViewLines(linesData,groupsData,groupIndex){
  const linesDataLength = linesData.length;
  if(typeof(groupIndex) === "undefined"){
    for(let i=0; i<groupsData.length; i++){
      addGroupNodesWithViewLines(linesData,linesDataLength,groupsData[i]);
    }
  }else{
    addGroupNodesWithViewLines(linesData,linesDataLength,groupsData[groupIndex]);
  }
  return linesData.length-linesDataLength;
};

function addViewtoViewLines(linesData,groupsData,handleLength){
  const linesDataLength = linesData.length;
  for(let i=0; i<groupsData.length; i++){
    for(let j=linesDataLength-1; j>=linesDataLength-handleLength; j--){
      if(groupsData[i].indexOf(linesData[j][0])!=-1 &&  groupsData[i].indexOf(linesData[j][1])==-1){
        linesData.push([groupsData[i][0],linesData[j][1]]);
      }else if(groupsData[i].indexOf(linesData[j][0])==-1 &&  groupsData[i].indexOf(linesData[j][1])!=-1){
        linesData.push([linesData[j][0],groupsData[i][0]]);
      }
    }
  }
  return linesData.length-linesDataLength;
};

function uniqueLinesData(lines,handleLength){
  let obj={};
  for(let i=lines.length; i>=0; i--){
    if(obj[JSON.stringify(lines[i])]){
      lines.splice(i,1);
    }else{
      obj[JSON.stringify(lines[i])] = true;
    }
  }
};

export default addLines;