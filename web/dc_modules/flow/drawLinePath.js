
function drawLinePath(node1,node2,Vue,type){
  const MARGIN = Vue.flow.line.turn.length;
  const NODE_LINE_GAP = Vue.flow.lineWidth+Vue.flow.line.arrow.margin;
  const RADIUS = 10;
  let startX = node1.x+node1.width+2;
  let startY = node1.y+(node1.height/2);
  let targetX = node2.x-NODE_LINE_GAP;
  let x1 = startX+MARGIN;
  let x2 = targetX-MARGIN;
  if(type == 'jump'){
    let targetY = node2.y-node2.width/2;
    if(x2<x1 && targetX>startX){
      x1 = (x1+x2)/2;
      x2 = x1;
    }else if(node2.x<node1.x && node1 != node2){
      targetX = node2.x+node2.width;
      x2 = targetX+NODE_LINE_GAP;
      let diffPath = '';
      if(targetY-startY>=0 && targetY-startY<NODE_LINE_GAP){
        diffPath = `L ${x1},${startY-NODE_LINE_GAP}`;
      }
      return `M ${startX},${startY} L ${x1},${startY} ${diffPath} C ${x1+RADIUS},${targetY} ${x2+RADIUS},${targetY} ${targetX+NODE_LINE_GAP},${targetY} A ${node2.width/2} ${node2.width/2} 180 0 0 ${targetX-node2.width/2} ${targetY+node2.width/2-NODE_LINE_GAP}`
    }
    let y1 = startY;
    let y2 = targetY;
    let x3 = (x1+x2)/2;
    let y3 = y1;
    let x4 = (x1+x2)/2;
    let y4 = (y1+y2)/2;
    let path = (node1===node2) ? `M ${startX},${startY} L ${startX+NODE_LINE_GAP},${startY} C ${startX+NODE_LINE_GAP+RADIUS},${startY} ${startX+NODE_LINE_GAP+RADIUS},${startY-RADIUS} ${startX+NODE_LINE_GAP},${startY-RADIUS}` : `M ${startX},${startY} L ${x1},${y1} Q ${x3},${y3} ${x4},${y4} T ${x2},${y2} L ${targetX},${targetY} A ${node2.width/2} ${node2.width/2} 90 0 1 ${targetX+node2.width/2} ${targetY+node2.width/2-NODE_LINE_GAP}`;
    return path
  }else{
    let targetY = node2.y+(node2.height/2);
    if(x2<x1 && targetX>startX){
      x1 = (x1+x2)/2;
      x2 = x1;
    }else if(node2.x<node1.x && node1 != node2){
      targetX = node2.x+node2.width;
      x2 = targetX+NODE_LINE_GAP;
      return `M ${startX},${startY} L ${x1},${startY} C ${x1+RADIUS},${targetY} ${x2+RADIUS},${targetY} ${targetX+NODE_LINE_GAP},${targetY}`
    }
    let y1 = startY;
    let y2 = targetY;
    let x3 = (x1+x2)/2;
    let y3 = y1;
    let x4 = (x1+x2)/2;
    let y4 = (y1+y2)/2;
    let path = (node1===node2) ? `M ${startX},${startY} L ${startX+NODE_LINE_GAP},${startY} C ${startX+NODE_LINE_GAP+RADIUS},${startY} ${startX+NODE_LINE_GAP+RADIUS},${startY-RADIUS} ${startX+NODE_LINE_GAP},${startY-RADIUS}` : `M ${startX},${startY} L ${x1},${y1} Q ${x3},${y3} ${x4},${y4} T ${x2},${y2} L ${targetX},${targetY}`;
    return path
  }
}

export default drawLinePath;