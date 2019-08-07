import correctViewAttr from './correctViewAttr'
import svgXY from './svgXY'

//初始化视图节点
function initView(Vue,view,e,panel){
	let newView = objClone(Vue.nodeObj);
  newView.attr = objClone(view,newView.attr);
  let position = svgXY(e,panel,Vue);
  correctViewAttr(Vue,newView,position);
  return newView;
}

export default initView;