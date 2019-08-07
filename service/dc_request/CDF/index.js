const cdfClass = 'CDCMgr';
const cdcClass = 'CDCMgr';
const dcClass = 'CDCMgr';
const hiddenAttrsFunc = 'getHiddenAttr';

//对获取CDC的请求参数进行解析，决定其真正请求的路径和参数
function getCDFParams(query){
  let req = { func: 'newCDF', params: {} };
  if(query.id){
    req.func = 'getCDF';
    req.params.cdfId = query.id;
  }else if(query.name){
    req.func = 'getCDFByName';
    req.params.cdfName = query.name;
  }
  return req;
}

//解析数据为前端所需的格式
function formatCDFToUse(dfRes,dcsRes,hiddenAttrRes){
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
async function getCDFOriginalData(ctx,query){
  let req = getCDFParams(query);
  let res = await createRequest(cdfClass,req.func,req.params).send(ctx);
  return res;
}

function formatCDFToSave(query){
  let data = {
    positionMap: query.nodes,
    links: query.links.map(item=>{
      return {src:item[0], dst:item[1], position:{}}
    })
  };
  data = dataTool.clone(query,data,['saveData','nodes','links']);
  return data;
}

async function saveCDFParams(ctx,query){
  let params = formatCDFToSave(query);
  let req = { func: 'updateCDF', params: {cdf: params} };
  if(!query.saveData.id){
    req.func = 'createCDF';
  }
  return req;
}

module.exports = {
  async get(ctx,query){
    query = query || ctx.reqData
    let res = await getCDFOriginalData(ctx,query);
    let hiddenAttrRes = await createRequest(dcClass,hiddenAttrsFunc,{}).send(ctx);
    let dcsRes;
    if(!res.ERR_MSG){
      let req;
      Object.keys(res.CONTENT.positionMap).forEach((key,index)=>{
        if(index){
          req.colletion.push(createRequest(cdcClass,'getCDC',{cdcId:key},'GET',key));
        }else{
          req = createRequest(cdcClass,'getCDC',{cdcId:key},'GET',key);
        }
      });  
      if(req){
        dcsRes = await req.coSend(ctx);
      }
    }
    let data = formatCDFToUse(res,dcsRes,hiddenAttrRes);
    return data;
  },
  async getOriginalData(ctx,query){
    query = query || ctx.reqData
    return await getCDFOriginalData(ctx,query);
  },
  async getSaveData(ctx,query){
    query = query || ctx.reqData
    let res = formatCDFToSave(query);
    return dataTool.resJsonPackage(res);
  },
  async save(ctx,query){
    query = query || ctx.reqData
    let req = await saveCDFParams(ctx,query);
    let res = await createRequest(cdfClass,req.func,req.params,'POST').send(ctx);
    if(!query.saveData.id && query.saveData.folderId){//目录转移
      let folderRes = await createRequest('CatalogMgr','getCatalog',{catalogId:query.saveData.folderId}).send(ctx);
      let moveCatalogRes = await createRequest('CatalogMgr','moveCatalogByRealMoId',{realMoNodeType:res.CONTENT.moType, realMoId:res.CONTENT.ID, targetCatalog:folderRes.CONTENT},'POST').send(ctx);
      if(moveCatalogRes.ERR_MSG){
        console.error('移动目录报错',moveCatalogRes.ERR_MSG);
      }
    }
    return res;
  }
}