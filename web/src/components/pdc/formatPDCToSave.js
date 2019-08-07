function formatPDCToSave(query){
  const flowData = query.flowData;
  // 要素类型
  let paramsData = objClone(query.data); //要素类型的数据替换外部数据
  Object.keys(paramsData).forEach(key=>{
    if((typeof paramsData[key] == 'object') && paramsData[key].hasOwnProperty("exist")){ //表格实体类型
      if(paramsData[key].exist){
        delete paramsData[key].exist;
        paramsData[key] = objClone(paramsData[key].head,paramsData[key]);
        delete paramsData[key].head;
        paramsData[key].colRows = objClone(paramsData[key].tableData);
        delete paramsData[key].tableData;
        paramsData[key] = objClone(paramsData[key].advSetting,paramsData[key]);
        delete paramsData[key].advSetting;
      }else{
        paramsData[key] = undefined;
      }
    }else if((typeof paramsData[key] == 'object') && paramsData[key].hasOwnProperty("choseRow")){ //UDF类型
      let udfData = {};
      udfData[paramsData[key].choseRow] = {};
      paramsData[key].tableData.forEach(item=>{
        udfData[paramsData[key].choseRow][item.name] = item.value;
      })
      paramsData[key] = udfData;
    }else if(key == 'MainJob'){ //mainJjob
      delete paramsData[key];
    }else if(key == 'AllPeriodicFlowDef' && flowData){
      let mainJobFlow = {};
      mainJobFlow.jobLinks = flowData.lines.map(item=>{return{"src": item[0], "dst": item[1]}});
      mainJobFlow.gotoLinks = flowData.jumpLinks.map(item=>{return{"src": item[0], "dst": item[1]}});
      mainJobFlow.jobNodeMap = {};
      Object.keys(flowData.nodes).forEach(id=>{
        mainJobFlow.jobNodeMap[id] = {
          "name": id,
          "joinType": flowData.nodes[id].status,
          "nodeType": flowData.nodes[id].data.nodeType,
          "job": {
            "className": flowData.nodes[id].data.job.className,
            "name": flowData.nodes[id].label.replace(/(.*)\((.*)\)$/,'$2'), //若有括号，则取括号里的内容
            "attrName": flowData.nodes[id].type=='udf' ? flowData.nodes[id].data.job.attrName : undefined, //当udf类型时才有的数据
            "sourceKey": flowData.nodes[id].data.job.sourceKey, //暂定为空字符串
            "isSaved2JobXML": flowData.nodes[id].data.job.isSaved2JobXML, // 暂定为true
            "script": flowData.nodes[id].data.job.script,
            "branch": flowData.nodes[id].type=='branch' ? getBranchData(flowData.branchData[id]) : undefined, //报送的分支特有的数据
            "sqlCmp": flowData.nodes[id].data.job.sqlCmp || undefined,
          }
        }
      });
      paramsData[key] = mainJobFlow;
    }else if(key == 'sqlMapping'){ //SQL数据配置
      let item = paramsData[key].viewMetas.find(item=>item.name=='MainOutput');
      if(item){
        item.ds = paramsData.featureType.tarLink_;
        item.schema = paramsData.featureType.schema_;
        item.table = paramsData.featureType.table_;
      }
    }else if(key == 'mirrorSource_'){ //后期处理
      paramsData.featureType.mirrorSource = paramsData[key];
      delete paramsData.featureType.mirrorSource_;
    }
  });
  //要素类型
  paramsData = objClone(paramsData.featureType,paramsData);
  delete paramsData.featureType;
  return paramsData;
}

export default formatPDCToSave;