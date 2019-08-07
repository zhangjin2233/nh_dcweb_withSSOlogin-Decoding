let Class = 'PDFMgr'
const pdfClass = 'PDFMgr';
const jobClass = 'JobMgr';
const pdcStatusMaps = require('../job/PDCStatusMaps.js');
const statusMap = dataTool.arrayToObj(pdcStatusMaps,'index','status');

const imgMap = {
  Instance: "node",
  Reference: "reference",
  Mirror: "mirror"
}
//将数据格式化为前端所需的格式
function formatDataToUse(pdf,groups){
  let nodes = {};
  Object.keys(pdf.nodes).forEach(key=>{
    let id = key;
    let item = pdf.nodes[key]
    const icon = item.icon;
    nodes[id] = dataTool.clone(item,{
      id: id,
      type: "node",
      pdcId: item.id,
      imgSrc: icon,
      img: icon ? undefined : imgMap[item.type1],
    },['guid','label','type1','moType','icon'],true);
  })
  pdf.nodes = nodes;
  pdf.links = pdf.links.map(line=>[line.src,line.dst]);
  pdf.groups = groups.map(item=>{
    pdf.nodes[item.name] = {
      id: item.name,
      type: "view",
      pdcId: item.ID,
      imgSrc: "view",
      label: item.name,
    }
    let member = [];
    item.pdcSet.split(',').forEach(id=>{
      let key = Object.keys(pdf.nodes).find(key=>pdf.nodes[key].pdcId == id);
      if(key){
        member.push(pdf.nodes[key].id)
      }
    })
    return [item.name,...member]
  })
  return pdf;
}

//返回最新的流图数据
function formatDataToSave(query,oldFlowData){
  let links = query.links.map(line=>{return {src:line[0], dst:line[1]}});
  let newFlowData = dataTool.clone(oldFlowData,{nodes:query.nodes,links,groups:query.groups},['nodes','links','groups']);
  return newFlowData
}

//记录被删除的实例节点
function computeLackNodes(oldFlowData,newFlowData){
  let lackNodes = [];
  Object.keys(oldFlowData.nodes).forEach(key=>{
    if(!newFlowData.nodes[key] && oldFlowData.nodes[key].type1 == 'Instance'){
      lackNodes.push(key);
    }
  })
  return lackNodes;
}

//获取流图的数据
async function getFlow(ctx,query){
  let pdfRes = await createRequest(pdfClass,query.id ? 'getPDF' : 'getPDFByName',{pdfId:query.id,pdfName:query.name}).send(ctx);
  let groupsRes = await createRequest(pdfClass, 'listAllView',{pdfId:pdfRes.CONTENT.ID}).send(ctx);
  let flowData = formatDataToUse(pdfRes.CONTENT,groupsRes.CONTENT);
  return dataTool.resJsonPackage(flowData);
}

//获取视图的数据
async function getViewFlow(ctx,query){
  let res = await createRequest(pdfClass,'getPDF',{pdfId:query.pdfId},'GET','pdf')
            .and(createRequest(pdfClass,'listAllSubView',{viewId:query.viewId},'GET','groups'))
            .and(createRequest(pdfClass,'getPDFView',{viewId:query.viewId},'GET','view')).coSend(ctx);
  let nodes = {};
  res.view.CONTENT.pdcSet.split(',').forEach(id=>{
    let key = Object.keys(res.pdf.CONTENT.nodes).find(key=>res.pdf.CONTENT.nodes[key].id == id);
    if(key){
      const nodeId = res.pdf.CONTENT.nodes[key].guid;
      const icon = res.pdf.CONTENT.nodes[key].icon;
      nodes[nodeId] = dataTool.clone(res.pdf.CONTENT.nodes[key],{
        id: nodeId,
        type: "node",
        pdcId: res.pdf.CONTENT.nodes[key].id,
        imgSrc: icon,
        img: icon ? undefined : imgMap[res.pdf.CONTENT.nodes[key].type1],
      },['guid','label','type1','moType','icon'],true);
    }
  })
  let links = [];
  const nodesId = Object.keys(nodes);
  res.pdf.CONTENT.links.forEach(line=>{
    if(nodesId.includes(line.src) && nodesId.includes(line.dst)){
    // if(nodesId.includes(line.src) || nodesId.includes(line.dst)){
      links.push([line.src,line.dst]);
    }
  });
  // links.forEach(line=>{
  //   if((nodes[line[0]] && !nodes[line[1]]) || (!nodes[line[0]] && nodes[line[1]])){
  //     let key = Object.keys(res.pdf.CONTENT.nodes).find(key=>res.pdf.CONTENT.nodes[key].guid == (nodes[line[0]] ? line[1] : line[0]));
  //     const nodeId = res.pdf.CONTENT.nodes[key].guid;
  //     const icon = res.pdf.CONTENT.nodes[key].icon;
  //     nodes[nodeId] = dataTool.clone(res.pdf.CONTENT.nodes[key],{
  //       id: nodeId,
  //       type: (nodeId == line[0]) ? 'src' : 'dst',
  //       pdcId: res.pdf.CONTENT.nodes[key].id,
  //       imgSrc: icon,
  //       img: icon ? undefined : imgMap[res.pdf.CONTENT.nodes[key].type1],
  //     },['guid','label','type1','moType','icon'],true);
  //   }
  // });

  let groups = res.groups.CONTENT.map(item=>{
    nodes[item.name] = {
      id: item.name,
      type: "view",
      pdcId: item.ID,
      imgSrc: "view",
      label: item.name,
    }
    let member = [];
    item.pdcSet.split(',').forEach(id=>{
      let key = Object.keys(nodes).find(key=>nodes[key].pdcId == id);
      if(key){
        member.push(nodes[key].id)
      }
    })
    return [item.name,...member]
  })

  return dataTool.resJsonPackage({nodes,links,groups})
}

//创建视图的请求
function createViewReq(query){
  let req;
  if(!query.layer){
    req = {
      func: "createPDFView",
      params: {
        pdfId: query.flowName,
        viewName: query.viewName,
        pdcNames: query.pdcNames
      }
    }
  }else{
    req = {
      func: "createSubView",
      params:{
        viewId: query.layer,
        subViewName: query.viewName,
        pdcNames: query.pdcNames
      }
    }
  }
  return req;
}

//删除视图的请求
function deleteViewReq(query){
  let req;
  if(!query.layer){
    req = {
      func: "deletePDFViewByName",
      params: {
        pdfId: query.flowName,
        viewName: query.viewName,
      }
    }
  }else{
    req = {
      func: "deleteSubViewByName",
      params:{
        viewId: query.layer,
        subViewName: query.viewName,
      }
    }
  }
  return req;
}

module.exports = {
  async get(ctx,query){
    query = query || ctx.reqData;
    return await getFlow(ctx,query);
  },
  async save(ctx,query){
    query = query || ctx.reqData;
    let oldFlowRes = await getFlow(ctx,query);
    let oldFlowData = oldFlowRes.CONTENT;
    let newFlowData = formatDataToSave(query,oldFlowData);
    let res = await createRequest(pdfClass,'updatePDF',{pdf:newFlowData},'POST').send(ctx);
    let lackNodes = computeLackNodes(oldFlowData,newFlowData);
    if(query.hasOwnProperty('removeRefAndMirror') && lackNodes.length){
      res = await createRequest(pdfClass,'movePdcOutOfPDF',{pdfId:query.id, pdcNames:lackNodes, removeRefAndMirror:query.removeRefAndMirror}).send(ctx);
    }
    return res;
  },
  async createView(ctx,query){
    query = query || ctx.reqData;
    let req = createViewReq(query);
    let res = await createRequest(pdfClass,req.func,req.params).send(ctx);
    if(!res.ERR_MSG){
      res.CONTENT = {
        id: res.CONTENT.name,
        pdcId: res.CONTENT.ID,
        label: res.CONTENT.name,
        type: "view",
        imgSrc: "view",
      }
    }
    return res;
  },
  async deleteView(ctx,query){
    query = query || ctx.reqData;
    let req = deleteViewReq(query);
    return await createRequest(pdfClass,req.func,req.params).send(ctx);
  },
  async getView(ctx,query){
    query = query || ctx.reqData;
    return await getViewFlow(ctx,query);
  },
  async intoView(ctx,query){
    query = query || ctx.reqData;
    let res = await createRequest(pdfClass,'movePDCInToView',query).send(ctx);
    return res
  },
  async getStatus(ctx,query){
    query = query || ctx.reqData;
    let res = await createRequest(jobClass,'getPDFStatus',Object.assign({ignoreView:false},query),'GET','hasView')
              .and(createRequest(jobClass,'getPDFStatus',Object.assign({ignoreView:true},query),'GET','noView')).coSend(ctx);
    const allNodes = Object.assign(res.hasView.CONTENT,res.noView.CONTENT);
    let nodes = {};
    Object.keys(allNodes).forEach(k=>{
      nodes[k] = {
        status: statusMap[allNodes[k]],
      }
    })
    return dataTool.resJsonPackage({nodes});
  },
  async detail(ctx) {
    let param = []
    if(ctx.reqData.id) {
      param = [Class, 'getPDF', {pdfId: ctx.reqData.id}, 'GET', 'info']
    }else if(ctx.reqData.name) {
      param = [Class, 'getPDFByName', {pdfName: ctx.reqData.name}, 'GET', 'info']
    }
    let data = (await createRequest(...param).send(ctx)).CONTENT
    let pdfId = data.ID
    let groups = (await createRequest(Class, 'listAllView', { pdfId: data.ID }).send(ctx)).CONTENT
    let { nodes, links } = data
    links = links.map(item => {
      return [item.src, item.dst]
    })
    let nodesInfo = Object.values(data.nodes)
    for(let key in nodes) {
      let item = nodes[key]
      nodes[key] = {
        id: item.id,
        guid: item.guid,
        label: item.label,
        type: item.moType.toLowerCase(),
        imgSrc: utils.getFlowIcon(item)
      }
    }
    groups = groups.map(item => {
      let pdcSet = item.pdcSet.split(',')
      nodes[item.ID] = {
        id: item.ID,
        type: 'view',
        label: item.name,
        imgSrc: 'view'
      }
      pdcSet = pdcSet.map(pdc => {
        let index = nodesInfo.findIndex(n => n.id === pdc)
        return nodesInfo[index].label
      })
      pdcSet.unshift(item.ID)
      return pdcSet
    })
    return dataTool.resJsonPackage({nodes, links, groups, pdfId, iconProfix: `${hostIp}:${config.port}/images/nodes`})
  },
  async create(ctx) {
    let param = []
    if(ctx.reqData.id) {
      param = ['CDCMgr', 'getCDF', { cdfId: ctx.reqData.id }]
    } else if(ctx.reqData.pdcName) {
      param = ['CDCMgr', 'getCDFByName', { cdfName: ctx.reqData.pdcName }]
    }
    let CDF = (await createRequest(...param).send(ctx)).CONTENT
    await createRequest(Class, 'createPDF', { cdf: CDF, pdfName: ctx.reqData.name }).send(ctx)
    return 'OK'
  },
  async addPDC(ctx) {
    let body = ctx.reqData
    let guids = body.guids
    let data = await createRequest('PDCMgr', 'listPDCsByName', { guids }, 'POST', 'pdcList')
          .and(createRequest('PDFMgr', 'getPDF', { pdfId: body.pdfId }, 'GET', 'pdf')).coSend(ctx)
    let pdcList = data.pdcList.CONTENT.map(item => {
      return {
        id: item.ID,
        guid: item.guid,
        type1: body.type,
        label: item.guid,
        moType: 'PDC'
      }
    })
    let pdf = data.pdf.CONTENT
    pdcList.forEach(item => {
      pdf.nodes[item.guid] = item
    })
    await createRequest('PDFMgr', 'updatePDF', { pdf }, 'POST').send(ctx)
    return 'OK'
  },
  async addMirrorPDF(ctx) {
    let body = ctx.reqData
    let mirror = (await createRequest(Class, 'createMirrorPDF', { pdfId: body.pdfId, targetPdfId: body.targetPdfId }).send(ctx)).CONTENT
    return { 
       guid: mirror.guid,
       id: mirror.ID,
       label: '',
       imgSrc: 'designCell_instance',
       type: 'pdc' 
    }
  },
  async update(ctx) {
    let pdf = null
    let body = ctx.reqData
    if(body.pdfId) {
      pdf = (await createRequest(Class, 'getPDF', { pdfId: body.pdfId }).send(ctx)).CONTENT
    }else if(body.pdfName) {
      pdf = (await createRequest(Class, 'getPDFByName', { pdfName: body.pdfName }).send(ctx)).CONTENT
    }

    let nodes = body.nodes
    let links = body.links
    let newNodes = {}
    for(let key in nodes) {
      pdf.nodes[key] && (newNodes[key] = {
        type1: pdf.nodes[key].type1,
        label: pdf.nodes[key].label,
        moType: pdf.nodes[key].moType,
        id: pdf.nodes[key].id,
        icon: pdf.nodes[key].icon,
        guid: pdf.nodes[key].guid
      })
    }
    pdf.nodes = newNodes
    pdf.links = links.map(item => {
      return {
        src: item[0],
        dst: item[1]
      }
    })
    let data = (await createRequest(Class, 'updatePDF', { pdf }, 'POST').send(ctx)).CONTENT
    nodes = data.nodes
    links = data.links
    links = links.map(item => {
      return [item.src, item.dst]
    })
    let nodesInfo = Object.values(data.nodes)
    let groups = (await createRequest(Class, 'listAllView', { pdfId: data.ID }).send(ctx)).CONTENT
    for(let key in nodes) {
      let item = nodes[key]
      nodes[key] = {
        id: item.id,
        guid: item.guid,
        label: item.label,
        type: item.moType.toLowerCase(),
        imgSrc: utils.getFlowIcon(item)
      }
    }
    groups = groups.map(item => {
      let pdcSet = item.pdcSet.split(',')
      nodes[item.ID] = {
        id: item.ID,
        type: 'view',
        label: item.name,
        imgSrc: 'view'
      }
      pdcSet = pdcSet.map(pdc => {
        let index = nodesInfo.findIndex(n => n.id === pdc)
        return nodesInfo[index].label
      })
      pdcSet.unshift(item.ID)
      return pdcSet
    })
    return {nodes, links, groups, data }
  }
}