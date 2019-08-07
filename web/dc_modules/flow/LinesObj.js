import ObjFloat from './objFloat'
import removeLines from './removeLines'

// 删除连线
function removeLine(index,Vue,type){
  switch(type){
    case 'jumpLinks':
      Vue[type].splice(index,1);
      break;
    default:
      removeLines(index,Vue.nodes,Vue.lines,Vue.groups);
      break;
  }
};

// 连线上浮
function float(obj,line,Vue){
  if(Vue.floatFlag.value){
    ObjFloat(obj,Vue.$refs.svg);
    Vue.focusLines.push(line);
  }
};

// 连线下沉
function sink(obj,Vue){
  if(Vue.floatFlag.value){
    ObjFloat(obj,Vue.$refs.lineContainer);
    Vue.focusLines.splice(0,Vue.focusLines.length);
  }
};

//改变线宽
function changeWidth(Vue){
  switch(Vue.flow.lineWidth){
    case Vue.flow.line.width.thick:
      Vue.flow.lineWidth = Vue.flow.line.width.thin;
      break;
    case Vue.flow.line.width.thin:
      Vue.flow.lineWidth = Vue.flow.line.width.thick;
      break;
    default:
      break;
  }
  return Vue.flow.lineWidth;
}

export default {
  removeLine,
  float,
  sink,
  changeWidth,
}