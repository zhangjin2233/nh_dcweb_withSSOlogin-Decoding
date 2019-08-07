const adfClass = 'ADCMgr';
const adcClass = 'ADCMgr';
const dcClass = 'CDCMgr';
const hiddenAttrsFunc = 'getHiddenAttr';

//对获取ADC的请求参数进行解析，决定其真正请求的路径和参数
function getADFParams(query){
  let req = { func: 'newADF', params: {} };
  if(query.id){
    req.func = 'getADF';
    req.params.adfId = query.id;
  }else if(query.name){
    req.func = 'getADFByName';
    req.params.adfName = query.name;
  }
  return req;
}

//解析数据为前端所需的格式
function formatADFToUse(dfRes,dcsRes,hiddenAttrRes){
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
async function getADFOriginalData(ctx,query){
  let req = getADFParams(query);
  let res = await createRequest(adfClass,req.func,req.params).send(ctx);
  return res;
}

function formatADFToSave(query){
  query.links || (query.links = []);
  let data = {
    positionMap: query.nodes,
    links: query.links.map(item=>{
      return {src:item[0], dst:item[1], position:{}}
    })
  };
  data = dataTool.clone(query,data,['saveData','nodes','links']);
  return data;
}

async function saveADFParams(ctx,query){
  let params = formatADFToSave(query);
  let req = { func: 'updateADF', params: {adf: params} };
  if(!query.saveData.id){
    req.func = 'createADF';
    let storyRes = await createRequest('StoryMgr','getStory',{storyId:query.saveData.storyId}).send(ctx);
    req.params.story = storyRes.CONTENT;
    req.params.adfName = query.name;
  }
  return req;
}

module.exports = {
  async get(ctx,query){
    query = query || ctx.reqData
    let res = await getADFOriginalData(ctx,query);
    let hiddenAttrRes = await createRequest(dcClass,hiddenAttrsFunc,{}).send(ctx);
    let dcsRes;
    if(!res.ERR_MSG){
      let req;
      Object.keys(res.CONTENT.positionMap).forEach((key,index)=>{
        if(index){
          req.colletion.push(createRequest(adcClass,'getADC',{adcId:key},'GET',key));
        }else{
          req = createRequest(adcClass,'getADC',{adcId:key},'GET',key);
        }
      });  
      if(req){
        dcsRes = await req.coSend(ctx);
      }
    }
    let data = formatADFToUse(res,dcsRes,hiddenAttrRes);
    return data;
  },
  async getOriginalData(ctx,query){
    query = query || ctx.reqData
    return await getADFOriginalData(ctx,query);
  },
  async getSaveData(ctx,query){
    query = query || ctx.reqData
    let res = formatADFToSave(query);
    return dataTool.resJsonPackage(res);
  },
  async save(ctx,query){
    query = query || ctx.reqData
    let req = await saveADFParams(ctx,query);
    let res = await createRequest(adfClass,req.func,req.params,'POST').send(ctx);
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