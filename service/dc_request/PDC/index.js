const pdcClass = 'PDCMgr';
const dqClass = 'com.leavay.dataquality.DataQualityAction'; //数据质量框架的接口Class
const CDC = require('../CDC/index.js')
const tableEntityTypeStr = 'TableEntity';
const fileEntityType = ['FileEntity'];
const udfType = ['UDF'];
const javaType = ['javaCode','JavaCode']; //java代码
const actionType = ['action','Action']; //执行器
// const ignoreAttr = ['ClassName','ID','env'];
const ignoreAttr = [];
const nodeMap = require('./nodeMap.js');
const treeModule = require('../tree/index.js')

async function getCDCId(ctx,query){
  let res = await createRequest('CDCMgr','getCDCbyName',query).send(ctx);
  return res.CONTENT.ID;
}

async function getPDCByCDCNameOrCDCId(ctx,cdcName,cdcId){
  let params = {cdcName: cdcName};
  let res = await createRequest('CDCMgr','getCDCbyName',params,'GET','',true).send(ctx);
  if(!res.ERR_MSG){
    res = await getPDC(ctx,{cdcId:res.CONTENT.ID});
  }else{
    res = await getPDC(ctx,{cdcId:cdcId});
  }
  return res;
}

//对获取PDC的请求参数进行解析，决定其真正请求的路径和参数
async function getPDCParams(ctx,query){
  let req = { func: 'newPDCByCDC', params: {} };
  if(query.id){
    req.func = 'getPDC';
    req.params.pdcId = query.id;
  }else if(query.guid){
    req.func = 'getPDCbyName';
    req.params.pdcName = query.guid;
  }else if(query.cdcId || query.cdcName || query.cdc){
    let cdcId = query.cdcId || (query.cdc ? query.cdc.ID : await getCDCId(ctx,{cdcName:query.cdcName}) )
    req.params.cdcId = cdcId;
  }
  return req;
}

//将请求的内容输出为枚举选项格式
function outputOption(list,value,label){
  return list.map(item=>{
    return {
      value: value ? item[value] : item,
      label: label ? (item[label] || item[value]) : item,
    }
  })
}

//拼装数据源的选项
function getDataSourceOption(res){
  return outputOption(res.CONTENT,'name','desc')
}

//拼装服务器的选项
function getServerOption(res){
  return outputOption(res.CONTENT,'name','desc')
}

//拼装表实体的数据类型选项
function getTableEntityDataTypeOption(res){
  return outputOption(res.CONTENT)
}

//所有枚举的映射
function getEnumMap(res){
  return res.CONTENT.map(enumItem=>{
    return { 
      name: enumItem.localName,
      desc: enumItem.Label,
      option: enumItem.Info.map(opItem=>{
        return {
          value: opItem.intValue+'',
          label: opItem.label || opItem.name
        }
      })
    }
  })
}

//所有表实体的映射
function getTableEntityMap(tableEntityMapRes,defaultTableEntityRes,enumMap,tableEntityDataTypeOption,hiddenAttr){
  tableEntityMapRes.CONTENT.push(defaultTableEntityRes.CONTENT);
  let enumOption = enumMap.map(enumItem=>{return {label:enumItem.desc, value:enumItem.name}});
  return tableEntityMapRes.CONTENT.map(tableEntityItem=>{
    //去掉不显示的列
    tableEntityItem.attributes = tableEntityItem.attributes.filter(headItem=>!hiddenAttr.includes(headItem.name));
    return { 
      name: tableEntityItem.localName,
      tableHead: tableEntityItem.attributes.map(headItem=>{
        if(enumOption.some(item=>item.value==headItem.type)){
          headItem.option = enumMap.find(item=>item.name==headItem.dataType).option;
          headItem.dataType = 'SingleEnum';
          try{headItem.value = headItem.option[0].value}catch(e){};
        }else if(headItem.name.toLowerCase().includes('type')){
          headItem.option = tableEntityDataTypeOption;
          headItem.dataType = 'select_input';
          try{headItem.value = headItem.option[0].value}catch(e){headItem.value = ''};
        }else if(headItem.dataType.toLowerCase().includes('bool')){
          headItem.value = false;
        }
        return headItem
      })
    }
  })
}

//输出为树节点的结构
function outputTreeNode(item,obj={}){
  let node = {
    "label": item.label ? `${item.label}(${item.name})` : item.name,
    "id": item.name,
    "link": "",
    "type": "",
    "children": [],
  };
  return dataTool.clone(obj,node);
}

//获取Java树节点数据
function getJavaTreeNode(item){
  return outputTreeNode(item,{type:"java",link:item.name});
}

//获取action树节点数据
function getActionTreeNode(item){
  return outputTreeNode(item,{type:"action",link:item.name});
}

//获取表实体的树节点数据
function getTableEntityTreeNode(item,tableEntityMap,dataSourceOption){
  let obj = {
    "tableEntityStructrue": {
      "head": [{
        "canBeEmpty": false,
        "name": "schema",
        "label": "schema",
      }, {
        "canBeEmpty": false,
        "name": "tableName",
        "label": "表名",
      }, {
        "canBeEmpty": false,
        "name": "dataSource",
        "label": "数据源",
        "type": "SingleEnum",
        "option": dataSourceOption
      }],
      "advSetting": [{
        "canBeEmpty": true,
        "name": "multiSet",
        "label": "MultiSet",
        "type": "Boolean",
      }, {
        "canBeEmpty": true,
        "name": "partition",
        "label": "分区",
        "type": "Text",
      }],
      "tableHead": tableEntityMap.find(head=>head.name==item.elementType.substr(tableEntityTypeStr.length+1)).tableHead.map(h=>{
        h.type = h.dataType;
        return h;
      }),
    },
    "link": item.name,
    "type": tableEntityTypeStr,
  }
  return outputTreeNode(item,obj);
}

//获取文件实体的树节点数据
function getFileEntityTreeNode(item){
  let obj = {
    "link": item.name,
    "type": "FileEntity",
    "structure": [{
      "label": "文件路径名",
      "name": "filePath",
    }, {
      "label": "文件分隔符",
      "name": "seperator",
    }],
  };
  return outputTreeNode(item,obj);
}

//获取UDF的树节点数据
function getUDFTreeNode(item,cdcData){
  const udfTableHead = cdcData.demo.tabs[0].tableHead.find(h=>h.name=='elementType').udf.tableHead;
  let obj = {
    "link": item.name,
    "type": "SUDF",
    "tableHead": udfTableHead,
  }
  return outputTreeNode(item,obj);
}

//特殊类型的处理
function getSpecialAttrData(item,tableHead,enumMap,serverOption,dataSourceOption){
  let enumOption = enumMap.map(enumItem=>{return {label:enumItem.desc, value:enumItem.name}});
  let option = [];
  let type = item.dataType;
  let dataSetTableHead = [];
  if(item.dataType == 'SingleEnum'){
    option = enumMap.find(enumItem=>enumItem.name==item.enumDef.choseRow).option;
  }else{
    switch(item.elementType){
      case 'Server':
        option = serverOption;
        type = 'SingleEnum';
        break;
      case 'DataSource':
        option = dataSourceOption;
        type = 'SingleEnum';
        break;
      case 'DataSet':
        type = item.elementType;
        dataSetTableHead = item.dataSet.tableData.map(r=>{
          r.label = r.label || r.name;
          if(enumOption.some(enumItem=>enumItem.value == r.type)){
            r.option = enumMap.find(enumItem=>enumItem.name == r.type).option;
            r.type = 'SingleEnum';
          }
          return r;
        });
        break;
      case 'gtable':
        type = 'DataSet';
        dataSetTableHead = tableHead.find(h=>h.name=='elementType').gtable.tableData.find(row=>row.id==item.gtable.choseRow).tableData.map(r=>{
          r.label = r.label || r.name;
          const enumStr = 'ENUM_';
          if(r.type.substr(0,enumStr.length) == enumStr){
            r.type = r.type.substr(enumStr.length);
          }
          if(enumOption.some(enumItem=>enumItem.value == r.type)){
            r.option = enumMap.find(enumItem=>enumItem.name == r.type).option;
            r.type = 'SingleEnum';
          }
          return r;
        });
        break;
      default:
        break;
    }
  }
  let data = {
    option: option,
    toolTip: tableHead.map(h=>{
      let val = (item[h.name] === undefined) ? "" : item[h.name];
      try{ val = h.option.find(op=>op.value==item[h.name]).label }catch(e){ }
      return `${h.label}：${val}`
    }).join('\n'),
    type: type,
    tableHead: dataSetTableHead,
  }
  return data;
}

//获取要素类型的结构
function getFeatureTypeStructure(item,tableHead,enumMap,serverOption,dataSourceOption){
  let attrData = getSpecialAttrData(item,tableHead,enumMap,serverOption,dataSourceOption);
  return {
    "canBeEmpty": item.canBeEmpty,
    "label": item.label,
    "name": item.name,
    "readOnly": false,
    "option": attrData.option,
    "toolTip": attrData.toolTip,
    "type": attrData.type,
    "tableHead": attrData.tableHead
  }
}

//获取SQL数据映射的树节点数据
function getSqlMappingTreeNode(){
  return {
    "children": [],
    "link": "sqlMapping",
    "id": "sqlMapping",
    "label": "SQL数据映射",
    "type": "sqlMapping",
  }
}

//获取MainJob的树节点数据
function getMainJobTreeNode(){
  return {
    "id": 'MainJob',
    "label": "MainJob",
    "link": 'MainJob',
    "children": [],
    "type": "MainJob",
  }
}

//获取节点的图片
// function getNodeImgSrc(nodeData){
//   let imgSrc;
//   if(nodeData.job.className.split('.').slice(-1)[0].toLowerCase().includes('branch')){
//     imgSrc = 'branch'; 
//   }else if(nodeData.job.className.split('.').slice(-1)[0].toLowerCase().includes('bom')){
//     imgSrc = 'udf';
//   }else if(nodeData.job.className.split('.').slice(-1)[0].toLowerCase().includes('sql')){
//     imgSrc = 'sql';
//   }else if(nodeData.job.className.split('.').slice(-1)[0].toLowerCase().includes('java')){
//     imgSrc = 'java';
//   }
//   return imgSrc;
// }

//获取节点的类型
// function getNodeType(nodeData){
//   let nodeType;
//   if(nodeData.job.className.split('.').slice(-1)[0].toLowerCase().includes('branch')){
//     nodeType = 'branch'; 
//   }else if(nodeData.job.className.split('.').slice(-1)[0].toLowerCase().includes('bom')){
//     nodeType = 'udf';
//   }else if(nodeData.job.className.split('.').slice(-1)[0].toLowerCase().includes('sql')){
//     nodeType = 'sql';
//   }else if(nodeData.job.className.split('.').slice(-1)[0].toLowerCase().includes('java')){
//     nodeType = 'java';
//   }
//   return nodeType;
// }

//转化高级过滤器的树数据
function transferAdvFilterDataToGet(advFilterData){
  if(advFilterData.length == 0){

  }else{
    advFilterData.forEach((item,itemIndex)=>{
      if(item.op == 'cond'){ //后台的错误数据
        advFilterData.splice(itemIndex,1);
      }else{
        item.flag = item.op;
        item.name = (item.leftV && item.leftV.split(':')[0]=='MANUL:') ? item.leftV.split(':').slice(-1)[0] : item.leftV;
        item.value = item.rightV;
        item.id = new Date().getTime();
        item.label = `${item.name} ${item.flag} ${item.value}`;
        item.children = transferAdvFilterDataToGet(objClone(item.conditions));
        delete item.op;
        delete item.leftV;
        delete item.rightV;
        delete item.conditions;
      }
    })
  }
  return advFilterData;
}

//获取MainJob的数据
function getMainJobData(jobData){
  let nodes = {};
  let branchData = {};
  Object.keys(jobData.jobNodeMap).forEach(key=>{
    nodes[key] = {
      "id": key,
      "label": jobData.jobNodeMap[key].name,
      "status": jobData.jobNodeMap[key].joinType || 'any',
      "data": jobData.jobNodeMap[key],
      // "imgSrc": getNodeImgSrc(jobData.jobNodeMap[key]),
      "img": nodeMap[jobData.jobNodeMap[key].job.className.split('.').slice(-1)[0]],
      // "type": getNodeType(jobData.jobNodeMap[key]),
      "type": nodeMap[jobData.jobNodeMap[key].job.className.split('.').slice(-1)[0]],
      "animate": "",
    };
    if(nodes[key].type == 'branch'){
      //将高级过滤器的值类型进行转换
      if(!jobData.jobNodeMap[key].job.branch){
        jobData.jobNodeMap[key].job.branch = {
          "desc":"",
          "branchCases":[]
        }
      };
      jobData.jobNodeMap[key].job.branch.branchCases.forEach(item=>{
        try{
          item.condition = transferAdvFilterDataToGet(item.condition.conditions);
        }catch(err){
          item.condition = [];
        }
      })
      branchData[key] = {
        "formData":{
          "Describe": jobData.jobNodeMap[key].job.branch.desc,
        },
        "tableData": jobData.jobNodeMap[key].job.branch.branchCases
      }
    }
  });
  return {
    "CONTENT": {
      "nodes": nodes,
      "branchData": branchData,
      "groups": [],
      "links": jobData.jobLinks.map(item=>{return [item.src,item.dst]}),
      "jumpLinks": jobData.gotoLinks.map(item=>{return [item.src,item.dst]}),
    }
  }
}

//解析数据为前端所需的格式
function formatPDCToUse(res){
  let pdcDataContent = res.pdcData.CONTENT;
  const cdcData = res.cdcDataRes.CONTENT;
  const dataSourceOption = getDataSourceOption(res.dbOptionRes);
  const serverOption = getServerOption(res.serverOptionRes);
  const enumMap = getEnumMap(res.enumMapRes);
  const tableEntityDataTypeOption = getTableEntityDataTypeOption(res.tableEntityDataTypeOptionRes);
  const tableEntityMap = getTableEntityMap(res.tableEntityMapRes ,res.defaultTableEntityRes,enumMap,tableEntityDataTypeOption,res.hiddenAttrRes.CONTENT);
  let content = {
    adcName: pdcDataContent.ClassName,
    adcNameStructure: {
      "name": "adcName",
      "readOnly": true,
      "label": "模型全路径",
      "toolTips": "CDR名字:"+cdcData.attr.head.name+"\nCDR标签 :"+cdcData.attr.head.label+"\n模型全路径:"+pdcDataContent.ClassName
    },
    data: dataTool.clone(pdcDataContent,{"featureType":{}}),
    treeList: [{
      "children": [],
      "link": "featureType",
      "id": "featureType",
      "label": "常规要素",
      "type": "featureType",
      "structure": []
    },{
      "link": "",
      "id": "entityDefinition",
      "label": "实体定义",
      "type": "entityDefinition",
      "children": [],
    },{
      "link": "",
      "id": "SUDF",
      "label": "SUDF",
      "type": "SUDFFolder",
      "children": [],
    },{
      "label": "作业定义",
      "id": "jobDefinition",
      "link": "",
      "type": "jobDefinition",
      "children": []
    },{
      "label": "动作",
      "id": "actionFolder",
      "link": "",
      "type": "actionFolder",
      "children": [],
    },{
      "label": "JAVA代码",
      "id": "java",
      "link": "",
      "type": "codeFolder",
      "children": [],
    }],
    agents: res.agents.CONTENT.map(item=>{ return { value:item.key, label:item.value }})
  };
  cdcData.attr.tabs[0].tableData.forEach(item=>{
    if(ignoreAttr.includes(item.name)){ //隐藏的键值
      
    }else if(javaType.includes(item.elementType)){
      content.treeList[5].children.push(getJavaTreeNode(item));
    }else if(actionType.includes(item.elementType)){
      content.treeList[4].children.push(getActionTreeNode(item));
    }else{
      delete content.data[item.name]; //删除该字段避免数据重复
      if(item.elementType.includes(tableEntityTypeStr)){ //如果是表实体类型
        content.treeList[1].children.push(getTableEntityTreeNode(item,tableEntityMap,dataSourceOption));
        if(!pdcDataContent[item.name]){ //如果为空则为其初始化空值
          content.data[item.name] = {
            head: { schema: "", tableName: "", dataSource: "" },
            tableData: [],
            advSetting: { isMultiSet: false, partition: "" },
            exist: false,
          }
        }else{
          content.data[item.name] = {
            "exist": true,
            "head": {
              "schema": pdcDataContent[item.name].schema,
              "tableName": pdcDataContent[item.name].tableName,
              "dataSource": pdcDataContent[item.name].dataSource,
            },
            "tableData": pdcDataContent[item.name].colRows,
            "advSetting": {
              "isMultiSet": pdcDataContent[item.name].isMultiSet,
              "partition": pdcDataContent[item.name].partition
            },
            "tableEntityDefName": pdcDataContent.tableEntityDefName
          }
        }
      }else if(fileEntityType.includes(item.elementType)){ //如果是文件实体类型
        content.treeList[1].children.push(getFileEntityTreeNode(item));
        content.data[item.name] = pdcDataContent[item.name] || {"filePath": "", "seperator": ""};
      }else if(udfType.includes(item.elementType)){ //如果是UDF类型
        content.treeList[2].children.push(getUDFTreeNode(item,cdcData));
        content.data[item.name] = item.udf;
        //当PDC的UDF不可更改
        try{
          let udfName = Object.keys(pdcDataContent[item.name])[0];
          content.data[item.name].choseRow = udfName;
          content.data[item.name].tableData.forEach(r=>{
            r.value = pdcDataContent[item.name][udfName][r.name];
          })
        }catch(e){}
      }else{
        //如果是要素类型
        content.treeList[0].structure.push(getFeatureTypeStructure(item,cdcData.demo.tabs[0].tableHead,enumMap,serverOption,dataSourceOption));
        content.data.featureType[item.name] = pdcDataContent[item.name];
        if(item.name == 'env'){
          content.data.featureType[item.name] || (content.data.featureType[item.name] = 'env_dc')
        }
        if(['DataSet','gtable'].includes(item.elementType) && !content.data.featureType[item.name]){
          content.data.featureType[item.name] = [];
        }
        if(item.dataType.toLowerCase().includes('bool')){ //对布尔类型进行数据强转换
          content.data.featureType[item.name] = eval(content.data.featureType[item.name])
        }
      }
    }
  });
  const sqlMapping = 'sqlMapping';
  if(pdcDataContent[sqlMapping]){ //SQL配置
    content.treeList.push(getSqlMappingTreeNode());
    content.data[sqlMapping] = pdcDataContent[sqlMapping];
  }
  if(pdcDataContent.AllPeriodicFlowDef){ //mainjob
    content.treeList[3].children.push(getMainJobTreeNode());
    content.data.MainJob = getMainJobData(pdcDataContent['AllPeriodicFlowDef']);
  }
  
  dataTool.setTreeIcon(content.treeList); //增加树的图标
  return dataTool.resJsonPackage(content);
}

//转化高级过滤器的数据
function transferAdvFilterDataToSave(advFilterData){
  if(advFilterData.length == 0){

  }else{
    advFilterData.forEach(item=>{
      item.op = item.flag;
      item.leftV = (item.name && item.name.split(':').length==1) ? 'MANUL:'+item.name : item.name;
      item.rightV = item.value;
      item.conditions = transferAdvFilterDataToSave(dataTool.clone(item.children));
      delete item.flag;
      delete item.name;
      delete item.value;
      delete item.children;
      delete item.id;
      delete item.label;
    })
  }
  return advFilterData;
}

//获取分支节点的数据
function getBranchData(branchData){
  return {
    "desc": branchData.formData.Describe,
    "branchCases": branchData.tableData.map(item=>{
      return {
        "name": item.name,
        "desc": item.desc,
        "nextAction": item.nextAction,
        "isloopCase": item.isloopCase,
        "condition": {
          "op":"and",
          "leftV":"",
          "rightV":"",
          "conditions": transferAdvFilterDataToSave(dataTool.clone(item.condition)),
        }
      }
    })
  }
}

//解析数据为后台所需的格式
function formatPDCToSave(query){
  const flowData = query.flowData;
  // 要素类型
  let paramsData = dataTool.clone(query.data); //要素类型的数据替换外部数据
  Object.keys(paramsData).forEach(key=>{
    if((typeof paramsData[key] == 'object') && paramsData[key].hasOwnProperty("exist")){ //表实体类型
      if(paramsData[key].exist){
        delete paramsData[key].exist;
        paramsData[key] = dataTool.clone(paramsData[key].head,paramsData[key]);
        delete paramsData[key].head;
        paramsData[key].colRows = dataTool.clone(paramsData[key].tableData);
        delete paramsData[key].tableData;
        paramsData[key] = dataTool.clone(paramsData[key].advSetting,paramsData[key]);
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
  paramsData = dataTool.clone(paramsData.featureType,paramsData);
  delete paramsData.featureType;
  return paramsData;
}

//对获取PDC的请求参数进行解析,决定其真正请求的路径和参数
function savePDCParams(query,params){
  let req = { func: 'createPDC', params: {} };
  if(query.SAVE){
    req.func = 'updatePDC';
    req.params.pdc = params;
  }else{
    req.params.newPdc = params;
  }
  return req;
}

//获取PDC原始数据
async function getPDCOriginalData(ctx,query){
  let req = await getPDCParams(ctx,query);
  return await createRequest(pdcClass,req.func,req.params,'POST').send(ctx);
}

//输出为列表的数据格式
function outputPDCList(cdcRes,pdcsRes,serverOptionRes,keyword){
  //统一pdcsRes的格式
  Array.isArray(pdcsRes.CONTENT) && (pdcsRes.CONTENT={datas: pdcsRes.CONTENT})
  const serverOption = getServerOption(serverOptionRes);
  let tableHead = cdcRes.CONTENT.attr.tabs[0].tableData.map(item=>{
    let type = 'String';
    let option = [];
    switch(item.dataType){
      case 'Server':
        type = 'SingleEnum';
        option = serverOption;
        break;
      case 'SingleEnum':  
        type = 'SingleEnum';
        option = cdcRes.CONTENT.demo.tabs[0].tableHead.find(h=>h.name=='dataType').enumDef.tableData.find(d=>d.name == item.enumDef.choseRow).option
        break;
      default:
        type = item.dataType;
        break;
    }
    let row = {
      type: type,
      name: item.name,
      label: item.label,
      option: option,
    }
    return row;
  })
  let tableData = pdcsRes.CONTENT.datas.map(row=>{
    Object.keys(row).forEach(key=>{
      typeof row[key] == 'object' && (row[key] = JSON.stringify(row[key]));
      let h = tableHead.find(h=>h.name==key); //对布尔类型的数据进行处理
      if(h && h.type.toLowerCase().includes('bool')){
        row[key] = eval(row[key]);
      }
    })
    return row;
  })
  let listData = {
    total: pdcsRes.CONTENT.totalCount || tableData.length,
    tableHead: tableHead,
    tableData: tableData,
    keyword: keyword,
  }
  return listData;
}

//获取PDC列表所需的结构CDC
async function getListCDC(ctx,query){
  let reqQuery = {
    id: query.cdcId || (query.cdcIds ? query.cdcIds[0] : undefined),
    name: query.cdcName || (query.cdcNames ? query.cdcNames[0] : undefined),
    pdcId: query.pdcIds ? query.pdcIds[0] : undefined,
    guid: query.guids ? query.guids[0] : undefined,
  }
  let cdcRes = await CDC.get(ctx,reqQuery);
  return cdcRes;
}

//解析高级过滤器的数据
async function getKeyword(keyword,ctx,query){
  if(typeof keyword == 'object'){
    keyword = advanceFilter.getFilter(keyword);
  }else if(keyword && query){
    let cdcId = query.cdcId || (query.cdcIds ? query.cdcIds[0] : undefined) || await getCDCId(ctx,{cdcName:query.cdcName || query.cdcNames[0]});
    let res = await createRequest(pdcClass,'getContentNVQuery',{cdcId:cdcId,sSearchText:keyword}).send(ctx);
    keyword = res.CONTENT;    
  }else{
    keyword = null;
  }
  return keyword
}

//获取cdcNames
async function getCDCNames(ctx,query){
  let cdcNames = query.cdcNames;
  if(query.cdcName){
    cdcNames = [query.cdcName];
  }else if(query.cdcId){
    let cdcRes = await CDC.getOriginalData(ctx,{id:query.cdcId});
    cdcNames = [cdcRes.CONTENT.name];
  }else if(query.cdcIds){
    let req;
    query.cdcIds.forEach((item,index)=>{
      if(index){
        req.colletion.push(createRequest('CDCMgr','getCDC',{cdcId:item},'GET',item));
      }else{
        req = createRequest(createRequest('CDCMgr','getCDC',{cdcId:item},'GET',item));
      }
    });  
    let cdcsRes = await req.coSend(ctx);
    cdcNames = Object.keys(cdcsRes).map(key=>cdcsRes[key].CONTENT.name);
  }
  return cdcNames;
} 

//获取PDC列表数据
async function getListPDCs(ctx,query){
  let req;
  let cdcNames = await getCDCNames(ctx,query);
  let keyword = await getKeyword(query.keyword,ctx,query);
  let pageNo = query.pageNo ? query.pageNo-1 : 0;
  if(query.pageSize){ //具备分页效果的列表
    req = {
      func: "pagingPDCByCondition",
      params: {
        // cdcNameLst: cdcNames,
        cdcName: cdcNames[0],
        nvQuery: keyword,
        orderBy: query.orderBy,
        startPos: pageNo,
        pageSize: query.pageSize
      }
    }
  }else if(query.orderBy){ //不分页但具备查询的列表
    req = {
      func: "listPDCByCondition",
      params: {
        cdcName: cdcNames[0],
        nvQuery: keyword,
        orderBy: query.orderBy
      }
    }
  }else if(cdcNames){ //不分页且不查询,根据cdcName/cdcNames/cdcId/cdcIds获取的列表
    req = {
      func: "listAllPDCbyCDCName",
      params: {
        cdcNameLst: cdcNames,
      }
    }
  }else if(query.pdcIds){ //不分页且不查询,根据pdcIds获取的列表
    req = {
      func: "listPDCs",
      params: {
        pdcIds: query.pdcIds,
      }
    }
  }else if(query.guids){ //不分页且不查询,根据guids获取的列表
    req = {
      func: "listPDCsByName",
      params: {
        guids: query.guids,
      }
    }
  }
  let pdcsRes = await createRequest(pdcClass,req.func,req.params,'POST').send(ctx);
  return {pdcsRes,keyword};
}

//获取配置来源表的请求参数
async function saveSourceTableParams(ctx,query){
  let pdc = query.pdc;
  let pdfId = query.pdfId;
  if(query.data){ //如果有该字段，表示传过来的pdc数据未经过转换
    pdc = formatPDCToSave(query)
  }
  if(query.pdfName){
    let pdf = await createRequest('PDFMgr','getPDFByName',{pdfName:query.pdfName}).send(ctx);
    pdfId = pdf.CONTENT.ID;
  }
  return {
    pdc: pdc,
    pdfId: pdfId,
    pdcIds: query.pdcIds,
  }
}

//获取PDC列表
async function pdcList(ctx,query){
  let cdcRes = await getListCDC(ctx,query);
  let res = await getListPDCs(ctx,query);
  let pdcsRes = res.pdcsRes;
  let keyword = res.keyword;
  let serverOptionRes = await createRequest('ServerInfoMgr','listAllServerInfo',{}).send(ctx);
  let listData = outputPDCList(cdcRes,pdcsRes,serverOptionRes,keyword);
  return listData;
}

async function getStoryId(ctx,query){
  let storyId = query.storyId;
  if(query.cdcName){
    const cdcRes = await CDC.get(ctx,{name:query.cdcName});
    storyId = cdcRes.CONTENT.storyId;
  }
  return storyId;
}

//获取CDC选项列表
async function getCDCsOption(ctx,storyRes){
  let cdcsRes = await createRequest('CDCMgr','listAllCDC',{story:storyRes.CONTENT},'POST').send(ctx);
  let option = cdcsRes.CONTENT.map(item=>{
    return {
      value: item.ID,
      label: item.label || item.name,
    }
  })
  return option
}

//获取已配置过的列表
function getSelectedList(pdfData,pdcId){
  let list = [];
  const nodeId = Object.keys(pdfData.nodes).find(key=>pdfData.nodes[key].id == pdcId).guid;
  pdfData.links.forEach(item=>{
    if(item.dst == nodeId){
      list.push({guid:item.src, ID:pdfData.nodes[item.src].id})
    }
  })
  return list;
}

//输出来源表所需数据格式
function outputSourceTable(cdcsOption,pdcListData,selectedList,pafName,pdfTreeRes){
  return {
    option: cdcsOption,
    table: pdcListData,
    pdfName: pafName,
    selected: selectedList,
    treeList: pdfTreeRes.CONTENT.treeList,
  }
}

//获取PDC
async function getPDC(ctx,query){ 
  let req = await getPDCParams(ctx,query);
  let res = await createRequest('DBDataSourceMgr','listAllDBDataSource',{},'GET','dbOptionRes')
            .and(createRequest('ServerInfoMgr','listAllServerInfo',{},'GET','serverOptionRes'))
            .and(createRequest('TableEntityDefMgr','getAllColumnDataType',{},'GET','tableEntityDataTypeOptionRes'))
            .and(createRequest('TableEntityDefMgr','listAllTableEntityDef',{},'GET','tableEntityMapRes'))
            .and(createRequest('TableEntityDefMgr','getTableEntityDef',{tableEntityDefName:'BasicDBEntity'},'GET','defaultTableEntityRes'))
            .and(createRequest('EnumDefMgr','listAllEnumDef',{},'GET','enumMapRes'))
            .and(createRequest('CDCMgr','getHiddenAttr',{},'GET','hiddenAttrRes'))
            .and(createRequest(pdcClass,'listAllSelectableAgents',{},'GET','agents'))
            .and(createRequest(pdcClass,req.func,req.params,'POST','pdcData')).coSend(ctx);
  if(res.pdcData.CONTENT.hasOwnProperty('mirrorSource')){
    res.pdcData.CONTENT.mirrorSource_ = res.pdcData.CONTENT.mirrorSource;
    let mirrorGuid = await createRequest(pdcClass,'getGuidByPDCID',{pdcId:res.pdcData.CONTENT.mirrorSource_}).send(ctx);
    res.pdcData.CONTENT.mirrorSource = mirrorGuid.CONTENT;
  }
  let cdcName = res.pdcData.CONTENT.ClassName.substr(res.pdcData.CONTENT.ClassName.lastIndexOf('.')+1);
  res.cdcDataRes = await CDC.get(ctx,{name:cdcName});
  let data = formatPDCToUse(res);
  return data;
}

module.exports = {
  async get(ctx,query){
    query = query || ctx.reqData
    return await getPDC(ctx,query)
  },
  async tryToGet(ctx,query){ //通过guid、cdcName、cdcId尝试获取PDC
    query = query || ctx.reqData;
    let params;
    let res;
    if(!query.guid && !query.cdcName && query.cdcId){
      params = {cdcId: query.cdcId};
    }else if(!query.guid && !query.cdcId && query.cdcName){
      params = {cdcName: query.cdcName};
    }else if(!query.cdcName && !query.cdcId && query.guid){
      params = {guid: query.guid};
    }
    if(params){
      res = await getPDC(ctx,params);
    }else{
      if(query.guid){
        params = {guid: query.guid};
        res = await createRequest(pdcClass,'getPDCbyName',params,'GET','',true).send(ctx);
        if(!res.ERR_MSG){
          res = await getPDC(ctx,params);
        }else if(query.cdcName){
          res = await getPDCByCDCNameOrCDCId(ctx,query.cdcName,query.cdcId)
        }
      }else if(query.cdcName){
        res = await getPDCByCDCNameOrCDCId(ctx,query.cdcName,query.cdcId)
      }
    }
    return res;
  },
  async getSaveData(ctx,query){
    query = query || ctx.reqData
    return dataTool.resJsonPackage(formatPDCToSave(query));
  },
  async getOriginalData(ctx,query){
    query = query || ctx.reqData
    return await getPDCOriginalData(ctx,query);
  },
  async save(ctx,query){
    query = query || ctx.reqData
    let pdcData = formatPDCToSave(query);
    let res = await createRequest(pdcClass,'beforeSavedPDC',{pdc:pdcData},'POST').send(ctx);
    if(!res.ERR_MSG){
      let req = savePDCParams(query,res.CONTENT);
      res = await createRequest(pdcClass,req.func,req.params,'POST').send(ctx);
      if(!res.ERR_MSG){
        let res0 = await createRequest(pdcClass,'onAfterSavedPDC',{guid:res.CONTENT.guid},'GET', '', true).send(ctx);
        res.ERR_MSG = res0.ERR_MSG;
      }
    }
    return res;
  },
  async list(ctx,query){
    query = query || ctx.reqData
    let listData = await pdcList(ctx,query);
    return dataTool.resJsonPackage(listData);
  },
  async getNvQuery(ctx,query){
    query = query || ctx.reqData;
    let nvQuery = await getKeyword(query.keyword,ctx,query);
    return dataTool.resJsonPackage(nvQuery);
  },
  async getSourceTable(ctx,query){
    query = query || ctx.reqData;
    const storyId = await getStoryId(ctx,query);
    const pdfTreeRes = await treeModule.getAllTree(ctx,{storyId:storyId,type:'PDF'})
    const storyRes = await createRequest('StoryMgr','getStory',{storyId:storyId}).send(ctx);
    const cdcsOption = await getCDCsOption(ctx,storyRes);
    //根据CDC拿到PDC列表
    let pdcListData = {
      total: 0,
      tableData: [],
      tableHead: [],
    }
    if(cdcsOption.length){
      pdcListData = await pdcList(ctx,{cdcId:cdcsOption[0].value,keyword:'',orderBy:{},currentPage:1,pageSize:25});
    }
    //获取已配置的来源表
    let selectedList = [];
    let pdfName = "";
    if(query.pdfId){
      const pdfRes = await createRequest('PDFMgr','getPDF',{pdfId:query.pdfId},'POST').send(ctx);
      pdfName = pdfRes.CONTENT.guid;
      selectedList = getSelectedList(pdfRes.CONTENT,query.pdcId);
    }
    //返回最终的结构数据
    const data = outputSourceTable(cdcsOption,pdcListData,selectedList,pdfName,pdfTreeRes);
    return dataTool.resJsonPackage(data);
  },
  async saveSourceTable(ctx,query){
    query = query || ctx.reqData;
    let params = await saveSourceTableParams(ctx,query);
    let res = await createRequest(pdcClass,'configSourceTableOfSqlPdc',params,'POST').send(ctx);
    return res;
  },
  async getParamsOption(ctx,query){
    query = query || ctx.reqData;
    let res = await createRequest('ParamMgr','listAllParams',{}).send(ctx);
    const option = res.CONTENT.map(item=>{
      let label = item.desc ? `${item.desc}:` : '';
      label += item.format;
      return {
        value: item.name,
        label: label
      }
    })
    return dataTool.resJsonPackage({option:option})
  },
  async getJudgeTypeOption(ctx,query){
    query = query || ctx.reqData;
    const option = ['=','>=','<=','>','<','!=','is not null','is null','in','not in'].map(item=>{
      return {
        value: item,
        label: item
      }
    })
    return dataTool.resJsonPackage({option:option})
  },
  async getSourceTableEntity(ctx,query){ //监管报送的接口，获取来源表的表实体
    query = query || ctx.reqData;
    const entityName = "tableEntity_";
    let pdcRes = await getPDC(ctx,{guid:query.source});
    let table = {
      tableData: pdcRes.CONTENT.data[entityName].tableData,
      tableHead: pdcRes.CONTENT.treeList[1].children.find(item=>item.id == entityName).tableEntityStructrue.tableHead
    }
    return dataTool.resJsonPackage(table)
  },
  async getSourcePDCList(ctx,query){ //监管报送的接口，选择来源
    query = query || ctx.reqData;
    if(query.pdcCdcName.includes('DATABASE')){
      query.cdcName = "TEST_CDC_SOURCE_DATABASE";
    }else{
      query.cdcName = "TEST_CDC_SOURCE_FILE";
    }
    query.orderBy = null;
    let listData = await pdcList(ctx,query);
    return dataTool.resJsonPackage(listData);
  },
  async pagingRuleCfgPDCByCondition(ctx,query){ //数据质量框架的接口
    query = query || ctx.reqData;
    //获取表头
    let cdcRes = await createRequest(dqClass,'getRuleCfgCdc',{},'GET','cdcRes').send(ctx);
    cdcRes = await CDC.get(ctx,{id:cdcRes.CONTENT.ID});
    let tableHead = cdcRes.CONTENT.attr.tabs[0].tableData.map(item=>{
      let type = 'String';
      let option = [];
      switch(item.dataType){
        case 'SingleEnum':  
          type = 'SingleEnum';
          option = cdcRes.CONTENT.demo.tabs[0].tableHead.find(h=>h.name=='dataType').enumDef.tableData.find(d=>d.name == item.enumDef.choseRow).option
          break;
        default:
          type = item.dataType;
          break;
      }
      let row = {
        type: type,
        name: item.name,
        label: item.label,
        option: option,
      }
      return row;
    })

    //获取列表数据
    let params = {
      nvQuery: await getKeyword(query.keyword,ctx,{cdcId:cdcRes.CONTENT.ID}),
      orderBy: query.orderBy,
      startPos: query.pageNo-1,
      pageSize: query.pageSize,
      dataGuid: query.dataGuid
    }
    let pdcsRes = await createRequest(dqClass,'pagingRuleCfgPDCByCondition',params,'POST').send(ctx);
    let tableData = pdcsRes.CONTENT.datas.map(row=>{
      Object.keys(row).forEach(key=>{
        typeof row[key] == 'object' && (row[key] = JSON.stringify(row[key]));
        let h = tableHead.find(h=>h.name==key); //对布尔类型的数据进行处理
        if(h && h.type.toLowerCase().includes('bool')){
          row[key] = eval(row[key]);
        }
      })
      return row;
    })
    let resData = {
      tableHead: tableHead,
      tableData: tableData,
      total: pdcsRes.CONTENT.totalCount,
      keyword: params.nvQuery,
      cdcId: cdcRes.CONTENT.ID,
    }
    return dataTool.resJsonPackage(resData);
  },
  async pagingMetaRulePDCByCondition(ctx,query){ //数据质量框架的接口
    query = query || ctx.reqData;
    let params = {
      dataCdcName: query.dataCdcName,
      metaRuleCdcName: query.cdcName,
      nvQuery: await getKeyword(query.keyword,ctx,{cdcName:query.cdcName}),
      orderBy: query.orderBy,
      startPos: query.pageNo-1,
      pageSize: query.pageSize,
    }
    let res = await createRequest('CDCMgr','getCDCbyName',{cdcName:query.cdcName},'GET','cdcRes')
                  .and(createRequest('CDCMgr','getHiddenAttr',{},'GET','hiddenAttrRes'))
                  .and(createRequest(dqClass,'pagingMetaRulePDCByCondition',params,'POST','pdcsRes')).coSend(ctx);
    //获取表头
    let tableHead = [];
    res.cdcRes.CONTENT.attribute.forEach(item=>{
      if(!res.hiddenAttrRes.CONTENT.includes(item.name)){
        tableHead.push({ label: item.label || item.name, name: item.name, type: 'String'})
      }
    });
    let resData = {
      tableHead: tableHead,
      tableData: res.pdcsRes.CONTENT.datas,
      total: res.pdcsRes.CONTENT.totalCount,
      keyword: params.nvQuery,
      cdcId: res.cdcRes.CONTENT.ID,
    }
    return dataTool.resJsonPackage(resData);
  }
}