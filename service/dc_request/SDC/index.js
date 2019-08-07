const sdcClass = 'SDCMgr';
const dcClass = 'CDCMgr';
const fixAttrsFunc = 'getFixedAttr';
const hiddenAttrsFunc = 'getHiddenAttr';

//获取SDC表单的结构
function getDemo(){
  let demo = {
    "head": [{
      "canBeEmpty": false,
      "label": "SDC名称",
      "name": "name"
    },{
      "canBeEmpty": true,
      "label": "SDC标签",
      "name": "label"
    }],
    "tabs": [{
      "tableHead": [{
        "canBeEmpty": false,
        "label": "字段名称",
        "name": "name",
        "readOnly": false,
        "type": "String",
        "value": "attr_"
      },{
        "canBeEmpty": true,
        "label": "中文标签",
        "name": "label",
        "readOnly": false,
        "type": "String",
        "value": "属性_"
      },{
        "canBeEmpty": true,
        "label": "描述",
        "name": "desc",
        "readOnly": false,
        "type": "String",
        "value": ""
      },{
        "canBeEmpty": false,
        "label": "要素类型",
        "name": "dataType",
        "option": [{
          "label": "方法",
          "value": "UDF"
        },{
          "label": "属性",
          "value": "String"
        }],
        "readOnly": false,
        "type": "SingleEnum",
        "value": "String"
      },{
        "label": "属性长度",
        "name": "size",
        "type": "String",
        "value": "256",
        "readOnly": false,
        "hidden": true
      },{
        "label": "能否为空",
        "name": "canBeEmpty",
        "type": "Boolean",
        "value": true,
        "readOnly": false,
        "hidden": true
      }],
      "readOnly": false,
      "title": "定义要素",
      "type": "Table"
    },{
      "readOnly": false,
      "title": "模型开发指导",
      "type": "String"
    }]
  }
  return demo;
}

//对获取SDC的请求参数进行解析，决定其真正请求的路径和参数
function getSDCParams(query){
  let req = { func: 'newSDC', params: {} };
  if(query.id){
    req.func = 'getSDC';
    req.params.sdcId = query.id;
  }else if(query.name){
    req.func = 'getSDCByName';
    req.params.sdcName = query.name;
  }
  return req;
}

//解析数据为前端所需的格式
function formatSDCToUse(res){
  let fixAttrs = res.fixAttrsRes.CONTENT;
  let hiddenAttrs = res.hiddenAttrsRes.CONTENT;
  let sdcData = res.sdcData.CONTENT;
  let sdc = {
    attr: {
      head: {
        label: sdcData.label,
        name: sdcData.name
      },
      hiddenRows: [],
      tabs: [{
        tableData: []
      },{
        value: sdcData.desc || "",
      }]
    },
    demo: getDemo(),
  }
  sdcData.attribute.forEach(item=>{
    item.READONLY = fixAttrs.includes(item.name);
    if(hiddenAttrs.includes(item.name)){
      sdc.attr.hiddenRows.push(item);
    }else{
      sdc.attr.tabs[0].tableData.push(item);
    }
  })
  sdc = dataTool.clone(sdcData,sdc,['label','name','attribute','desc']);
  return dataTool.resJsonPackage(sdc);
}

//解析数据为后台所需的格式
async function formatSDCToSave(ctx,query){
  let sdc = dataTool.clone(query.head);
  sdc.label = sdc.label || sdc.name;
  sdc.attribute = [...query.tabs[0].tableData,...query.hiddenRows].map(item=>{
    item.id || (item.id=-1);
    item = dataTool.clone(item,{},['READONLY','HIDDEN']);
    return item;
  });
  sdc.desc = query.tabs[1].value;
  sdc = dataTool.clone(query,sdc,['head','hiddenRows','tabs','saveData']);
  let ret = {};
  if(query.saveData.id){ //有值表示更新
    ret = { sdc: sdc };
  }else{ //新增
    sdc.storyId = query.saveData.storyId;
    let storyRes = await createRequest('StoryMgr','getStory',{storyId:sdc.storyId}).send(ctx);
    ret = { sdc: sdc, story: storyRes.CONTENT };
  }
  return ret
}

//对获取SDC的请求参数进行解析,决定其真正请求的路径和参数
async function saveSDCParams(ctx,query){
  let params = await formatSDCToSave(ctx,query);
  let req = { func: 'overwriteSDC', params: params };
  if(!query.saveData.id){
    req.func = 'createSDC';
  }
  return req;
}

async function getSDCOriginalData(ctx,query){
  let req = getSDCParams(query);
  return await createRequest(sdcClass,req.func,req.params,'GET','sdcData').send(ctx);
}

module.exports = {
  async get(ctx,query){
    query = query || ctx.reqData
    let req = getSDCParams(query);
    let res = await createRequest(dcClass,fixAttrsFunc,{},'GET','fixAttrsRes')
              .and(createRequest(dcClass,hiddenAttrsFunc,{},'GET','hiddenAttrsRes'))
              .and(createRequest(sdcClass,req.func,req.params,'GET','sdcData')).coSend(ctx);
    let data = formatSDCToUse(res);
    return data;
  },
  async getOriginalData(ctx,query){
    query = query || ctx.reqData
    return await getSDCOriginalData(ctx,query);
  },
  async getSaveData(ctx,query){
    query = query || ctx.reqData
    let res = await formatSDCToSave(ctx,query);
    return dataTool.resJsonPackage(res);
  },
  async save(ctx,query){
    query = query || ctx.reqData
    let req = await saveSDCParams(ctx,query);
    let res = await createRequest(sdcClass,req.func,req.params,'POST').send(ctx);
    if(!res.ERR_MSG && !query.saveData.id && query.saveData.folderId){//目录转移
      let folderRes = await createRequest('CatalogMgr','getCatalog',{catalogId:query.saveData.folderId}).send(ctx);
      let moveCatalogRes = await createRequest('CatalogMgr','moveCatalogByRealMoId',{realMoNodeType:res.CONTENT.moType, realMoId:res.CONTENT.ID, targetCatalog:folderRes.CONTENT},'POST').send(ctx);
      if(moveCatalogRes.ERR_MSG){
        console.error('移动目录报错',moveCatalogRes.ERR_MSG);
      }
    }
    return res;
  }
}