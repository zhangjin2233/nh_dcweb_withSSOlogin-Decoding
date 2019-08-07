const sdfClass = 'SDCMgr';
const sdcClass = 'SDCMgr';
const dcClass = 'CDCMgr';
const hiddenAttrsFunc = 'getHiddenAttr';

//对获取SDC的请求参数进行解析，决定其真正请求的路径和参数
function getSDFParams(query){
  let req = { func: 'newSDF', params: {} };
  if(query.id){
    req.func = 'getSDF';
    req.params.sdfId = query.id;
  }else if(query.name){
    req.func = 'getSDFByName';
    req.params.sdfName = query.name;
  }
  return req;
}

//解析数据为前端所需的格式
function formatSDFToUse(dfRes,dcsRes,hiddenAttrRes){
  let df = {
    nodes: {},
    links: dfRes.CONTENT.links.map(item=>[item.src,item.dst])
  }
  Object.keys(dfRes.CONTENT.positionMap).forEach(key=>{
    df.nodes[key] = {
      "id": key,
      "x": dfRes.CONTENT.positionMap[key].x,
      "y": dfRes.CONTENT.positionMap[key].y,
      "title": dcsRes[key].CONTENT.label || key,
      "textList": dcsRes[key].CONTENT.attribute.filter(item=>!hiddenAttrRes.CONTENT.includes(item.name)).map(item=>{
        return dataTool.clone(item,{},['dataType','label'],true)
      })
    } 
  })
  df = dataTool.clone(dfRes.CONTENT,df,['positionMap','links']);
  return dataTool.resJsonPackage(df);
}

//获取接口原始数据
async function getSDFOriginalData(ctx,query){
  let req = getSDFParams(query);
  let res = await createRequest(sdfClass,req.func,req.params).send(ctx);
  return res;
}

function formatSDFToSave(query){
  let testArr = [ ['1','2'] ];
  // query.links || (query.links = []);
  let data = {
    positionMap: query.nodes,
    links: query.links.map(item=>{
      return {src:item[0], dst:item[1], position:{}}
    })
  };
  data = dataTool.clone(query,data,['saveData','nodes','links']);
  return data;
}

async function saveSDFParams(ctx,query){
  let params = formatSDFToSave(query);
  let req = { func: 'updateSDF', params: {sdf: params} };
  if(!query.saveData.id){
    req.func = 'createSDF';
    let storyRes = await createRequest('StoryMgr','getStory',{storyId:query.saveData.storyId}).send(ctx);
    req.params.story = storyRes.CONTENT;
    req.params.sdfName = query.name;
  }

  return req;
}

async function getFlowName(ctx,query){
  const sdfRes = await getSDFOriginalData(ctx,query);
  return sdfRes.CONTENT.name
}

function formatAttchList(content){
  const tableHead = [{
    label: '文件名',
    name: 'name',
    type: 'String'
  },{
    label: '上传时间',
    name: 'uploadTime',
    type: 'String'
  }]
  const tableData = content.map(item=>{
    item.uploadTime = dataTool.formatTime(item.uploadTime);
    return dataTool.clone(item,{},['attachFile'])
  })
  return {
    tableHead: tableHead,
    tableData: tableData
  }
}

module.exports = {
  async get(ctx,query){
    query = query || ctx.reqData
    let res = await getSDFOriginalData(ctx,query);
    let hiddenAttrRes = await createRequest(dcClass,hiddenAttrsFunc,{}).send(ctx);
    let dcsRes;
    if(!res.ERR_MSG){
      let req;
      Object.keys(res.CONTENT.positionMap).forEach((key,index)=>{
        if(index){
          req.colletion.push(createRequest(sdcClass,'getSDC',{sdcId:key},'GET',key));
        }else{
          req = createRequest(sdcClass,'getSDC',{sdcId:key},'GET',key);
        }
      });
      if(req){
        dcsRes = await req.coSend(ctx);
      }
    }
    let data = formatSDFToUse(res,dcsRes,hiddenAttrRes);
    return data;
  },
  async getOriginalData(ctx,query){
    query = query || ctx.reqData
    return await getSDFOriginalData(ctx,query);
  },
  async getSaveData(ctx,query){
    query = query || ctx.reqData
    let res = formatSDFToSave(query);
    return dataTool.resJsonPackage(res);
  },
  async save(ctx,query){
    query = query || ctx.reqData
    let req = await saveSDFParams(ctx,query);
    let res = await createRequest(sdfClass,req.func,req.params,'POST').send(ctx);
    if(!query.saveData.id && query.saveData.folderId){//目录转移
      let folderRes = await createRequest('CatalogMgr','getCatalog',{catalogId:query.saveData.folderId}).send(ctx);
      let moveCatalogRes = await createRequest('CatalogMgr','moveCatalogByRealMoId',{realMoNodeType:res.CONTENT.moType, realMoId:res.CONTENT.ID, targetCatalog:folderRes.CONTENT},'POST').send(ctx);
      if(moveCatalogRes.ERR_MSG){
        console.error('移动目录报错',moveCatalogRes.ERR_MSG);
      }
    }
    return res;
  },
  async attchList(ctx,query){
    query = query || ctx.reqData;
    let sdfName = query.name || await getFlowName(ctx,query);
    let res = await createRequest(sdcClass,'listAllAttach',{sdfName:sdfName}).send(ctx);
    let table = formatAttchList(res.CONTENT);
    return dataTool.resJsonPackage(table);
  }
}