
let colSpace = 200;
let rowSpace = 100;

//初始化节点的访问标记
function initNodesVisit(nodes){
  for(let i in nodes){
    nodes[i].visit = false;
  }
};

//获取所有的可见节点
function getAllNodes(nodes){
  let allNodes = []; 
  for(let i in nodes){
    if(nodes[i].visible){
      allNodes.push(nodes[i].id);      
    }
  }
  return allNodes;
};

//移出非起点的节点
function removeUnStartNodes(root,lines){
  for(let i=0,index=-1; i<lines.length; i++){
    index = root.indexOf(lines[i][1]);
    if(index != -1){
      root.splice(index,1);
    }
  }
};

//获取所有的起始节点
function getAllStartNodes(nodes,lines){
  let root = getAllNodes(nodes);
  removeUnStartNodes(root,lines);
  return root;
};

//获取同一路径长度的节点，没做去重处理
function getNotUniqueSamePathLengthNodes(preNodes,nodes,lines){
  let samePathLengthNodes = [];
  for(let j=0; j<lines.length; j++){
    if(nodes[lines[j][1]].visible && preNodes.indexOf(lines[j][0]) != -1){
      samePathLengthNodes.push(lines[j][1]);
    }
  }
  return samePathLengthNodes;
};

//数组去重
function uniqueNodes(nodes){
  return [...new Set(nodes)];
};

//获取同一路径长度的节点
function getSamePathLengthNodes(preNodes,nodes,lines){
  let samePathLengthNodes = getNotUniqueSamePathLengthNodes(preNodes,nodes,lines);
  samePathLengthNodes = uniqueNodes(samePathLengthNodes);
  return samePathLengthNodes;
}

//获取所有节点的路径长度
function getAllNodesPathLength(preNodes,nodes,lines){
  let allPathLengthNodes = [];
  let samePathLengthNodes = [];
  do{
    allPathLengthNodes.push(preNodes);
    samePathLengthNodes = getSamePathLengthNodes(preNodes,nodes,lines);
    preNodes = samePathLengthNodes.slice(0);
  }while(samePathLengthNodes.length);
  return allPathLengthNodes;
};

//初始化节点的坐标
function initNodeLayout(node,x,y){
  node.x = x;
  node.y = y;
};

//比较两值大小并返回较大值
function maxValue(val1,val2){
  return val1>val2?val1:val2;
};

//计算出节点初始坐标,并返回同一路径最多节点的节点数
function nodesLayout(allPathLengthNodes,nodes,x0,y0){
  var maxCol=0;
  for(var i=allPathLengthNodes.length-1; i>=0; i--){ //从终点开始排列
    for(var j=0,row=0; j<allPathLengthNodes[i].length; j++,row++){ //从上到下排列
      if(nodes[allPathLengthNodes[i][j]].visit){ //如果节点已被访问过 
        row--;//全部往上一行
      }else{
        initNodeLayout(nodes[allPathLengthNodes[i][j]],i*colSpace+x0,row*rowSpace+y0);
      }
      nodes[allPathLengthNodes[i][j]].visit = true;
    }
    maxCol = maxValue(j,maxCol);
  }
  return maxCol;
};

//返回是否可能存在水平直线中间存在节点的情况
function maybeExistCover(allPathLengthNodes){
  return allPathLengthNodes.length>2;
};

//微调布局,将水平连线之间的节点下移，并返回布局后的行列数
function reLayout(allPathLengthNodes,maxCol,nodes,lines,x0,y0){
  let layoutBorder = {
    'col': allPathLengthNodes.length,
    'row': maxCol,
  };

  if(maybeExistCover(allPathLengthNodes)){
    //当节点在水平连线中间时，当前节点及该列下方节点全部下移一个位置
    var lineAcrossFlag = false;
    for(var j=0; j<maxCol; j++){
      for(var i=1; i<allPathLengthNodes.length-1; i++){
        if(allPathLengthNodes[i][j] && nodes[allPathLengthNodes[i][j]].x == i*colSpace+x0){ //该节点没被移动过
          // 判断是否有连线经过
          for(var l=0; l<lines.length; l++){
            if(nodes[lines[l][0]].y==nodes[lines[l][1]].y && nodes[lines[l][0]].y==nodes[allPathLengthNodes[i][j]].y && nodes[lines[l][0]].x<nodes[allPathLengthNodes[i][j]].x && nodes[lines[l][1]].x>nodes[allPathLengthNodes[i][j]].x && nodes[lines[l][0]].visible && nodes[lines[l][1]]){ //该节点在水平连线之间
              for(var row=j; row<allPathLengthNodes[i].length; row++){ //当前节点及以下下移   
                if(nodes[allPathLengthNodes[i][row]].x == i*colSpace+x0){ //当前节点没被移动过         
                  nodes[allPathLengthNodes[i][row]].y += rowSpace;
                  lineAcrossFlag = true;
                }
              }
              if(lineAcrossFlag){
                j--;
                lineAcrossFlag = false;
              }
              break;
            }

          }
        }
      }
    }
  }

  return layoutBorder;
};


//以(x0,y0)为起点坐标开始排列节点，并返回排列的行列数
function autoLayout(nodes,lines,x0,y0,xSpace,ySpace){
  colSpace = xSpace;
  rowSpace = ySpace;

  initNodesVisit(nodes);
  lines = lines.sort();
  //获取所有的起点
  let root = getAllStartNodes(nodes,lines);
  
  let allPathLengthNodes = getAllNodesPathLength(root,nodes,lines);

  // 确定各节点坐标
  let maxCol = nodesLayout(allPathLengthNodes,nodes,x0,y0);
  //去除水平连线被节点覆盖的问题
  let layoutBorder = reLayout(allPathLengthNodes,maxCol,nodes,lines,x0,y0);

  return layoutBorder;
};

export default autoLayout;