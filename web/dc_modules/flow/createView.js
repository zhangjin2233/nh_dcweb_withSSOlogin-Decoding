
function getViewData(res){
  let view = {};
  res = res.CONTENT;
  for(let k in res){
    if(k != 'allowed'){
      view = objClone(res[k],view);
      break;
    }
  }
  return view;
}

//节点归拢
function nodesGather(Vue,e){
  Vue.flow.foreignObjectStyle = Vue.flow.layoutTransition;
  let viewBoxX = Vue.panelObj.viewBoxX,
      viewBoxY = Vue.panelObj.viewBoxY,
      ratioX = Vue.panelObj.ratioX(),
      ratioY = Vue.panelObj.ratioY();
  let graph = Vue.$refs.graph;
  let clientRect = graph.getBoundingClientRect();
  Object.keys(Vue.selectBox.attr.nodes).forEach(k=>{
    Vue.selectBox.attr.nodes[k].xtemp = Vue.selectBox.attr.nodes[k].x;
    Vue.selectBox.attr.nodes[k].ytemp = Vue.selectBox.attr.nodes[k].y;
    Vue.selectBox.attr.nodes[k].x = (e.clientX - clientRect.left + graph.scrollLeft - Vue.selectBox.attr.nodes[k].width/2)*ratioX + viewBoxX;
    Vue.selectBox.attr.nodes[k].y = (e.clientY - clientRect.top + graph.scrollTop - Vue.selectBox.attr.nodes[k].height/2)*ratioY + viewBoxY;
  })
  setTimeout(() => { Vue.flow.foreignObjectStyle = "" }, Vue.flow.transitionCancelTime);
}

//节点展开
function nodesSpread(Vue){
  Vue.flow.foreignObjectStyle = Vue.flow.layoutTransition;
  Object.keys(Vue.selectBox.attr.nodes).forEach(k=>{
    Vue.selectBox.attr.nodes[k].x = Vue.selectBox.attr.nodes[k].xtemp;
    Vue.selectBox.attr.nodes[k].y = Vue.selectBox.attr.nodes[k].ytemp;
  })
  setTimeout(() => { Vue.flow.foreignObjectStyle = "" }, Vue.flow.transitionCancelTime);
}

function createView(Vue,nodesforView,label,selectObj,e,panel){
  //归拢节点
  nodesGather(Vue,e);
  let params = {};
  params[Vue.flow.req.createView.data.intoGroup] = nodesforView.slice(0);
  params[Vue.flow.req.createView.data.viewLabel] = label;
  params[Vue.flow.req.createView.data.flowName] = Vue.flow.flowName;
  params[Vue.flow.req.createView.data.layer] = JSON.parse(window.sessionStorage.getItem(Vue.layers)).slice(-1).pop();
  //发送数据
  Vue.flowLoading = true;
  DCHttp.req({url:Vue.flow.req.createView.url, params:params}).then(res=>{
    if(res){
      // let view = getViewData(res);
      let view = res.CONTENT ? objClone(res.CONTENT) : {};
      view.img = 'view';
      view.visible = true;
      selectObj.createViewOperate(Vue,view,Vue.nodes,Vue.lines,Vue.groups,e,panel,label);
      Vue.flow.historyReset(Vue); //历史记录重置
      // Vue.flow.saveFlow(Vue);//保存
    }else{
      throw new Error();
    }
    Vue.flowLoading = false;
  }).catch(err=>{
    Vue.flowLoading = false;
    nodesSpread(Vue);
  });
}

export default createView;