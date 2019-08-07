
import layout from './layout'

let structor = {
  'windowHeight': 1, //画板窗口大小
  'windowWidth': 1, 
	'panelWidthFixed': 1, //画板固定大小
	'panelHeightFixed': 1,
	'panelWidth': 1,  //画板大小
	'panelHeight': 1,
	'deltaX': 0, //画板缩放变量增量
	'deltaY': 0,
	'viewBoxX': 0, //画板的起始坐标
	'viewBoxY': 0,
	'viewBoxWidth': 1, //画板坐标大小
  'viewBoxHeight': 1,
}

class Panel {
  constructor(obj) {
    for(let i in structor){
      this[i] = structor[i];
    }
    if(obj){
      for(let i in obj){
        this[i] = obj[i];
      }
    }
  }
  ratioX(){ //画板坐标比例
    return this.viewBoxWidth/this.panelWidth;
  }
  ratioY(){
    return this.viewBoxHeight/this.panelHeight;
  }
  isPanelSizeChange(){ //画板大小是否发生变化
    return (this.panelWidth > this.panelWidthFixed) || (this.panelHeight > this.panelHeightFixed);
  }
  isViewBoxXYChange(){ //画板坐标是否发生变化
    return this.viewBoxX<0 || this.viewBoxY<0;
  }
  viewBoxRightDownMove(){ //画板坐标右下平移
    this.viewBoxX -= this.windowWidth/2/this.layout.delta;
    this.viewBoxY -= this.windowHeight/2/this.layout.delta;
  }
  viewBoxLeftUpMove(){ //画板坐标左上平移
    this.viewBoxX += this.windowWidth/2/this.layout.delta;
    this.viewBoxY += this.windowHeight/2/this.layout.delta;
  }
  panelRightDownMove(obj){ //画板右下平移
    obj.scrollLeft += this.windowWidth/2/this.layout.delta;
    obj.scrollTop += this.windowHeight/2/this.layout.delta;
  }
  panelLeftUpMove(obj){ //画板左上平移
    obj.scrollLeft -= this.windowWidth/2/this.layout.delta;
    obj.scrollTop -= this.windowHeight/2/this.layout.delta;
  }
  viewBoxSizeSmaller(){ //画板坐标比例增大
    this.viewBoxWidth += this.deltaX;
    this.viewBoxHeight += this.deltaY;
  }
  viewBoxSizeCenterSmaller(){ //画板坐标中心缩小
    this.viewBoxRightDownMove();
    this.viewBoxSizeSmaller();
  }
  viewBoxSizeBigger(){ //画板坐标比例减小
    this.viewBoxWidth -= this.deltaX;
    this.viewBoxHeight -= this.deltaY;
  }
  viewBoxSizeCenterBigger(){ //画板坐标中心放大
    this.viewBoxLeftUpMove();
    this.viewBoxSizeBigger();    
  }
  panelSizeSmaller(){ //画板缩小
    this.panelWidth -= this.deltaX;
    this.panelHeight -= this.deltaY;
  }
  panelSizeCenterSmaller(obj){ //画板中心缩小
    this.panelSizeSmaller();
    this.panelLeftUpMove(obj);    
  }
  panelSizeBigger(){ //画板中心放大
    this.panelWidth += this.deltaX;
    this.panelHeight += this.deltaY;
  }
  panelSizeCenterBigger(obj){ //画板中心放大
    this.panelSizeBigger(); 
    this.panelRightDownMove(obj);
  }
  initGraphSize(){ //初始化画板窗口大小
    this.windowHeight = document.documentElement.clientHeight;
    this.windowWidth = document.documentElement.clientWidth;
  }
  initPanelFixedSize(layoutBorder){ //初始化画板起始大小
    this.panelWidthFixed = (layoutBorder.x + this.layout.fixed.marginRight > document.body.clientWidth) ? (layoutBorder.x + this.layout.fixed.marginRight) : document.body.clientWidth;
    this.panelHeightFixed = (layoutBorder.y + this.layout.fixed.marginBottom > document.documentElement.clientHeight) ? (layoutBorder.y + this.layout.fixed.marginBottom) : document.documentElement.clientHeight;
  }
  initPanelSize(){ //初始化画板大小
    this.panelWidth = this.panelWidthFixed;
    this.panelHeight = this.panelHeightFixed;
  }
  initViewBoxSize(){ //初始化画板坐标大小
    this.viewBoxX = 0;
    this.viewBoxY = 0;
    this.viewBoxWidth = this.panelWidth;
    this.viewBoxHeight = this.panelHeight;
  }
  initDeltaSize(){ //初始化画板缩放增量
    this.deltaX = this.panelWidthFixed/this.layout.delta;
    this.deltaY = this.panelHeightFixed/this.layout.delta; 
  }
  zoomOut(Vue){ //画板缩小
    if(this.isPanelSizeChange()){
      this.panelSizeCenterSmaller(Vue.$refs.graph);
    }else{
      this.viewBoxSizeCenterSmaller();    
    }
  }
  zoomIn(Vue){ //画板放大
    if(this.isViewBoxXYChange()){
      this.viewBoxSizeCenterBigger();
    }else{
      this.panelSizeCenterBigger(Vue.$refs.graph);
    }
  }
  initSize(Vue){
    this.initGraphSize();
    // if(JSON.stringify(Vue.nodes) != '{}'){
      this.autoLayout(Vue,Vue.nodes,Vue.lines);
    // }
  }
  reSizePanel(layoutBorder){ //画板重置
    this.initPanelFixedSize(layoutBorder);
    this.initPanelSize();
    this.initViewBoxSize();
    this.initDeltaSize(); 
  }
  autoLayout(Vue,nodes,lines){ //画板自动布局 
    layout(Vue,nodes,lines,this);
  }
}

export default Panel;