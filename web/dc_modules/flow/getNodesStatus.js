
//去除字符串中的空格
function removeStringSpace(nodes){
  for(let k in nodes){
    nodes[k].status = nodes[k].status ? nodes[k].status.replace(/\s+/g,"").toLowerCase() : 'unkown';
  }
}

function failFn(res,flow,Vue){ //请求失败的操作
  flow.statusErrTimes++;
  if(flow.statusErrTimes >= 3){
    flow.stopGetStatus();
    console.warn('请求错误次数已超过3次,停止请求,建议检查网络',res);
  }
}

function resHandle(res,err,flow,Vue){ //请求成功的操作
  if(flow.statusErrTimes < 3 && res){
    flow.statusErrTimes = 0;
    let nodes = res.CONTENT.nodes;
    removeStringSpace(nodes);
    Vue.$set(Vue.nodesStatus,'CONTENT',nodes);
  }else{
    failFn(err,flow,Vue)
  }
}

//获取节点状态信息的请求
function getNodesStatus(Vue,flow){
  let params = {
    [flow.req.getStatus.data.flowName]: flow.flowName,
    [flow.req.getStatus.data.name]: flow.name
  };
  if(flow.flowRun == 'interval'){ //轮询请求
    DCHttp.req({url:flow.req.getStatus.url, params:params}).then(res => {
      resHandle(res.content,res.ERR_MSG,flow,Vue);
    }).catch(err=>{
      failFn(err,flow,Vue);
    });
  }else if(flow.flowRun == 'websocket'){ // websocket替换Interval
    let url = flow.req.getStatus.url.split('/').slice(-1);
    flow.statusContorl = getWebSocket(url, params);
    flow.statusContorl.send(res => { resHandle(res.content,res.errMsg,flow,Vue) })
  }
}

export default getNodesStatus;