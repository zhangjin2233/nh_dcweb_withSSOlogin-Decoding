
import autoLayout0 from './autoLayout'

//字符串转html字符串，参数：html传入的字符串，type是否返回标签结构，默认只返回内容，secape标签是否需要转义
function escapeHtml(html,type,escape){ //type:false表示content,true表示html,escape:转义/不转义
  let objE = document.createElement("div");
  objE.innerHTML = html;
  type 
    ? (escape 
      ? (html.includes('&') ? (objE.innerText = html) : (objE.innerText = new Option(html).innerHTML)) 
      : (html.includes('<') && (objE.innerText = html)))
    : (objE.innerHTML = objE.innerText);
  return objE.innerText;
}


function layoutFailOperate(Vue,nodes,lines,panelObj){
  console.warn('流图自动布局出错，切换布局算法');
  let layoutBorder = autoLayout0(nodes,lines,Vue.flow.node.x0,Vue.flow.node.y0,Vue.flow.layout.colSpace,Vue.flow.layout.rowSpace);
  Vue.panelLayoutBorder = { x: layoutBorder.col*Vue.flow.layout.colSpace+Vue.flow.layout.fixed.x+Vue.flow.layout.marginRight, y: layoutBorder.row*Vue.flow.layout.rowSpace+Vue.flow.layout.fixed.marginBottom+Vue.flow.layout.fixed.y };
  Vue.svg_div = "";
  panelObj.reSizePanel(Vue.panelLayoutBorder);
  Vue.flowLoading = false;
  setTimeout(() => { Vue.flow.foreignObjectStyle = "" }, Vue.flow.transitionCancelTime);
}

function autoLayout(Vue,nodes,lines,panelObj){
  Vue.flow.foreignObjectStyle = Vue.flow.layoutTransition;
  // 拼接绘图指令
  let maxNodeHeight = 0;
  let data = `digraph G { rankdir=${Vue.flow.layout.rankdir}; node[shape=box];`;  
  for(let k in nodes){
    if(nodes[k].visible){
      data += `"${k}"[height=${nodes[k].height/Vue.flow.layout.ratioHeight},width=${nodes[k].width > Vue.flow.layout.widthBorder ? Vue.flow.layout.wide : Vue.flow.layout.narrow}]`;
      (nodes[k].height > maxNodeHeight) && (maxNodeHeight = nodes[k].height)
    }
  }
  for(let i=0; i<lines.length; i++){
    if(nodes[lines[i][0]].visible && nodes[lines[i][1]].visible){
      data += `"${lines[i][0]}"->"${lines[i][1]}";`;
    }
  }
  data += "}";

  Vue.flowLoading = true;
  let vizLayout = true;
  try{
    Vue.svg_div = Viz(data, "svg");
  }catch(e){
    vizLayout = false;
  }
  if(vizLayout){
    //先对节点进行布局
    //因为dom节点的渲染不会立即生效，故需要延迟操作
    Vue.$nextTick(()=>{
      let domMinY = 0;
      Vue.panelLayoutBorder = { x: 0, y: 0 };
      let nodesDom = document.querySelectorAll(`#svg_div${Vue.index} .node`);
      for(let i=0; i<nodesDom.length; i++){
        let node = nodesDom[i].querySelector("text");
        let nodeId = escapeHtml(node.innerHTML.replace(/&nbsp;/g,' '),true);
        try{
          nodes[nodeId].x = Number(node.getAttribute('x')) + Vue.flow.layout.fixed.x;
          domMinY = Number(node.getAttribute('y')) < domMinY ? Number(node.getAttribute('y')) : domMinY;
          (nodes[nodeId].x > Vue.panelLayoutBorder.x) && (Vue.panelLayoutBorder.x = nodes[nodeId].x);
        }catch(err){
          return layoutFailOperate(Vue,nodes,lines,panelObj);
        }  
      }
      for(let i=0; i<nodesDom.length; i++){
        let node = nodesDom[i].querySelector("text");
        let nodeId = escapeHtml(node.innerHTML.replace(/&nbsp;/g,' '),true);
        try{
          nodes[nodeId].y = Number(node.getAttribute('y')) - domMinY + Vue.flow.layout.fixed.y - nodes[nodeId].height/2 + maxNodeHeight/2;
          ((nodes[nodeId].y + maxNodeHeight) > Vue.panelLayoutBorder.y) && (Vue.panelLayoutBorder.y = (nodes[nodeId].y + maxNodeHeight))
        }catch(err){
          return layoutFailOperate(Vue,nodes,lines,panelObj);
        }
        
      }
      Vue.svg_div = "";
      panelObj.reSizePanel(Vue.panelLayoutBorder);
      Vue.flowLoading = false;
      setTimeout(() => { Vue.flow.foreignObjectStyle = "" }, Vue.flow.transitionCancelTime);
    })
  }else{
    layoutFailOperate(Vue,nodes,lines,panelObj);
  }
}

export default autoLayout