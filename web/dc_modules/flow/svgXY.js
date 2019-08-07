function svgXY(e,panelObj,Vue){
  let viewBoxX = panelObj.viewBoxX,
      viewBoxY = panelObj.viewBoxY,
      ratioX = panelObj.ratioX(),
      ratioY = panelObj.ratioY();
  //当前鼠标在画板中的坐标
  let graph = Vue.$refs.graph;
  let clientRect = graph.getBoundingClientRect();
  let x = (e.clientX+graph.scrollLeft-clientRect.left)*ratioX+viewBoxX;
  let y = (e.clientY+graph.scrollTop-clientRect.top)*ratioY+viewBoxY;
      
  return { 'x':x, 'y':y }
};

export default svgXY;