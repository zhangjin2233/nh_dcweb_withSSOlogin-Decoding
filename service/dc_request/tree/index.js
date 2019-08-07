const sdcClass = 'SDCMgr';
const adcClass = 'ADCMgr';
const cdcClass = 'CDCMgr';
const udfClass = 'SUDFMgr';
const pdcClass = 'PDCMgr';
const pdfClass = 'PDFMgr';
const dcClass = 'CDCMgr';
const hiddenAttrsFunc = 'getHiddenAttr';
const catalog = require('../catalog/index.js')
const CDC = require('../CDC/index.js')

function filterTree(tree,query){
  tree.forEach(item=>item.children=[]);
  let filter = { allLoad:['Story'], remove:[] };
  switch(query.type){
    case 'SDC':
      filter = {
        allLoad: ['Story','RequirementRoot','SDCRoot','SDCFolder'],
        remove: ['SDFRoot','DesignAndDevelopRoot','RuntimeRoot']
      }
      break;
    case 'ADC':
      filter = {
        allLoad: ['Story','DesignAndDevelopRoot','ADCRoot','ADCFolder'],
        remove: ['ADFRoot','SUDFRoot','RequirementRoot','RuntimeRoot']
      }
      break;
    case 'CDC':
      filter = {
        allLoad: ['Story','DesignAndDevelopRoot','ADCRoot','ADCFolder','ADC','CDCFolder'],
        remove: ['ADFRoot','SUDFRoot','RequirementRoot','RuntimeRoot']
      }
      break;
    case 'PDF':
      filter = {
        allLoad: ['Story','DesignAndDevelopRoot','ADFRoot','ADFFolder','ADF','CDFFolder','CDF'],
        remove: ['SUDFRoot','RequirementRoot','RuntimeRoot','ADCRoot']
      }
      break;
    case 'UDF':
      filter = {
        allLoad: ['Story','DesignAndDevelopRoot','SUDFRoot','SUDFFolder'],
        remove: ['ADFRoot','RequirementRoot','RuntimeRoot','ADCRoot']
      }
      break; 
    default:
      break;
  }
  return filter;
}

async function getChildren(ctx,tree,allLoad,filterType){
  for(let i=tree.length-1; i>=0; i--){
    if(allLoad.includes(tree[i].type)){
      ctx.reqData = {id:tree[i].id};
      let childrenData = await catalog.children(ctx);
      tree[i].children.splice(0,0,...childrenData.data);
      await getChildren(ctx,tree[i].children,allLoad,filterType);
    }else if(filterType.includes(tree[i].type)){
      tree.splice(i,1)
    }
  }
}

async function getDcsRes(ctx,nodesId,type){
  let req;
  let dcsRes = {};
  nodesId.forEach((key,index)=>{
    if(index){
      req.colletion.push(createRequest(eval(type.toLowerCase()+'Class'),'get'+type.toUpperCase(),{[type.toLowerCase()+'Id']:key},'GET',key));
    }else{
      req = createRequest(eval(type.toLowerCase()+'Class'),'get'+type.toUpperCase(),{[type.toLowerCase()+'Id']:key},'GET',key);
    }
  })
  if(req){
    dcsRes = await req.coSend(ctx);
  }
  return dcsRes;
}

function getNodes(nodesId,dcsRes,hiddenAttrRes){
  let nodes = {};
  nodesId.forEach((key)=>{
    nodes[key] = {
      "id": key,
      "x": 0,
      "y": 0,
      "title": dcsRes[key].CONTENT.label,
      "textList": dcsRes[key].CONTENT.attribute.filter(item=>!hiddenAttrRes.CONTENT.includes(item.name)).map(item=>{
        return dataTool.clone(item,{},['dataType','label'],true)
      })
    }
  })
  return nodes;
}

function formatPDCDataToNode(pdcsRes,node,flowId,checkExit){
  let nodes = {};
  Object.keys(pdcsRes).forEach(key=>{
    const id = pdcsRes[key].CONTENT.guid;
    if(!checkExit || (!pdcsRes[key].CONTENT.parentDFP || pdcsRes[key].CONTENT.parentDFP==flowId)){ //parentDFP不为空表示没被占用
      nodes[id] = {
        id: id,
        pdcId: key,
        guid: pdcsRes[key].CONTENT.guid,
        label: pdcsRes[key].CONTENT.guid,
        type: "node",
        type1: node.type || "Instance", //后台数据需要
        moType: node.moType || "PDC",
        imgSrc: node.icon,
        img: node.icon ? undefined : node.img,
        icon: node.icon,
      }
    }else{
      console.log(`引入PDC,${pdcsRes[key].CONTENT.guid}已被占用`)
    }
  })
  return nodes;
}

async function getMirrorPdcsRes(ctx,query){
  let req;
  let pdcsRes;
  query.pdcs.forEach((item,index)=>{
    if(index){
      req.colletion.push(createRequest(pdcClass,'createMirrorPDC',{pdcId:item.id,targetPdfId:query.flowId},'GET',item.id));
    }else{
      req = createRequest(pdcClass,'createMirrorPDC',{pdcId:item.id,targetPdfId:query.flowId},'GET',item.id);
    }
  })
  if(req){
    pdcsRes = await req.coSend(ctx);
  }
  return pdcsRes;
}

async function getPdcsRes(ctx,query){
  // let req;
  // let pdcsRes;
  // query.pdcs.forEach((item,index)=>{
  //   if(index){
  //     req.colletion.push(createRequest(pdcClass,'getPDCbyName',{pdcName:item.guid},'GET',item.id));
  //   }else{
  //     req = createRequest(pdcClass,'getPDCbyName',{pdcName:item.guid},'GET',item.id);
  //   }
  // })
  // if(req){
  //   pdcsRes = await req.coSend(ctx);
  // }
  let pdcsRes = {};
  let res = await createRequest(pdcClass,'listPDCsByName',{guids:query.pdcs.map(item=>item.guid)}).send(ctx);
  res.CONTENT.forEach(item=>{
    pdcsRes[item.ID] = {CONTENT: item};
  })
  return pdcsRes;
}

async function getPdfsRes(ctx,query){
  let req;
  let pdfsRes;
  query.pdcs.forEach((item,index)=>{
    if(index){
      req.colletion.push(createRequest(pdfClass,'getPDF',{pdfId:item},'GET',item));
    }else{
      req = createRequest(pdfClass,'getPDF',{pdfId:item},'GET',item);
    }
  })
  if(req){
    pdfsRes = await req.coSend(ctx);
  }
  return pdfsRes;
}

async function getMirrorPdfsRes(ctx,query){
  let req;
  let pdfsRes;
  query.pdcs.forEach((item,index)=>{
    if(index){
      req.colletion.push(createRequest(pdfClass,'createMirrorPDF',{pdfId:item,targetPdfId:query.flowId},'GET',item));
    }else{
      req = createRequest(pdfClass,'createMirrorPDF',{pdfId:item,targetPdfId:query.flowId},'GET',item);
    }
  })
  if(req){
    pdfsRes = await req.coSend(ctx);
  }
  return pdfsRes;
}

module.exports = {
  async getAllTree(ctx,query){ //获取特定类型的树
    query = query || ctx.reqData;
    ctx.reqData = query;
    let tree = await catalog.nodeTree(ctx);
    tree.forEach(item=>item.children=[]);
    const filter = filterTree(tree,query);
    await getChildren(ctx,tree,filter.allLoad,filter.remove);
    return dataTool.resJsonPackage({treeList:tree});
  },
  async getUDFData(ctx,query){ //获取UDF的数据
    query = query || ctx.reqData;
    const res = await createRequest(udfClass,'getUDF',{udfId:query.id}).send(ctx);
    let udfData = res.CONTENT;
    const udf = {
      choseRow: udfData.name,
      label: udfData.desc,
      tableData: udfData.arguments.map(udfDataItem=>{
        return {
          name: udfDataItem.name,
          type: udfDataItem.fullClass.substr(udfDataItem.fullClass.lastIndexOf('.')+1),
          value: ""
        }
      })
    }
    return dataTool.resJsonPackage(udf);
  },
  async getAddFlow(ctx,query){ //获取添加生成的子流图
    query = query || ctx.reqData;
    const nodesId = query.nodesId;
    const type = query.type.toUpperCase();
    let nodes = {};
    let pdcsRes = {};
    let cdcRes;
    let imgSrc;
    if(['SDC','ADC','CDC'].includes(type)){
      let hiddenAttrRes = await createRequest(dcClass,hiddenAttrsFunc,{}).send(ctx);
      let dcsRes = await getDcsRes(ctx,nodesId,type);
      nodes = getNodes(nodesId,dcsRes,hiddenAttrRes);
    }else if(['PDC'].includes(type)){
      switch(query.flag){
        case 'pdc':
          cdcRes = await CDC.getOriginalData(ctx,{id:query.cdcId});
          imgSrc = cdcRes.CONTENT.extendCfg.icon;
          pdcsRes = await getPdcsRes(ctx,query);
          nodes = formatPDCDataToNode(pdcsRes,{icon:imgSrc || "node"},query.flowId);
          break;
        case 'reference':
          pdcsRes = await getPdcsRes(ctx,query);
          nodes = formatPDCDataToNode(pdcsRes,{icon:"reference",type1:"Reference"},query.flowId,true);
          break;
        case 'mirror':
          pdcsRes = await getMirrorPdcsRes(ctx,query);
          nodes = formatPDCDataToNode(pdcsRes,{icon:"mirror",type1:"Mirror"},query.flowId);
          break;
        default:
          break;
      }
    }else if(['PDF'].includes(type)){
      switch(query.flag){
        case 'mirror':
          pdfsRes = await getMirrorPdfsRes(ctx,query);
          nodes = formatPDCDataToNode(pdfsRes,{type1: "Mirror",moType:"PDF",icon:"mirror"},query.flowId);
          break;
        default:
          pdfsRes = await getPdfsRes(ctx,query);
          nodes = formatPDCDataToNode(pdfsRes,{type1: "Reference",moType:"PDF",icon:"reference"},query.flowId,true);
          break;
      }
    }
    return dataTool.resJsonPackage({nodes:nodes});
  },
}