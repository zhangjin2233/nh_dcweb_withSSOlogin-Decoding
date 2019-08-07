
//画板边界监控
function panelBorderMonitor(position,Vue){
  if(position.x<=Vue.panelObj.viewBoxX+Vue.$refs.graph.scrollLeft*Vue.panelObj.ratioX()+Vue.flow.panelBorder.left){
    Vue.$refs.graph.scrollLeft -= Vue.flow.scrollMove.x;
  }else if(position.x>=(Vue.$refs.graph.clientWidth+Vue.$refs.graph.scrollLeft)*Vue.panelObj.ratioX()-Vue.flow.panelBorder.right){
    Vue.$refs.graph.scrollLeft += Vue.flow.scrollMove.x;
  }
  if(position.y<=Vue.panelObj.viewBoxY+Vue.$refs.graph.scrollTop*Vue.panelObj.ratioY()+Vue.flow.panelBorder.top){
    Vue.$refs.graph.scrollTop -= Vue.flow.scrollMove.y;
  }else if(position.y>=(Vue.$refs.graph.clientHeight+Vue.$refs.graph.scrollTop)*Vue.panelObj.ratioY()-Vue.flow.panelBorder.bottom){
    Vue.$refs.graph.scrollTop += Vue.flow.scrollMove.y;
  }
};

export default panelBorderMonitor;