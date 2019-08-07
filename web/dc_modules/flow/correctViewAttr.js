
//修正视图节点的属性
function correctViewAttr(Vue,view,position){
  view.attr.viewNodeFlag = true;
  view.attr.width = Vue.flow.size.view.width;
  view.attr.height = Vue.flow.size.view.height;
  view.attr.x = position.x-view.attr.width/2;
  view.attr.y = position.y-view.attr.height/2;
}

export default correctViewAttr;