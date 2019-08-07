
//获取节点状态信息的请求
function getNodesTip(Vue,flow){
  let params = {};
  params[flow.req.getNodesTip.data.flowName] = flow.flowName;
  //发送数据
  if(flow.nodesTipErrTimes < 3){
    DCHttp.req({url:flow.req.getNodesTip.url, params:params, cancel:true}).then(res => {
      if(res){
        flow.nodesTipErrTimes = 0;
        let nodesTip = res.CONTENT.nodes;
        Vue.$set(Vue.nodesTip,'CONTENT',nodesTip);
      }else{
        flow.nodesTipErrTimes++;
      }
    }).catch(err=>{
      flow.nodesTipErrTimes++;
    });
  }else if(flow.nodesTipErrTimes === 3){
    console.warn('接口错误次数较多,建议检查网络',flow.req.getNodesTip.url);
    flow.nodesTipErrTimes++;
  }
}

export default getNodesTip;
