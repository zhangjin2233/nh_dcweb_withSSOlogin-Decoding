const adcClass = 'ADCMgr';
const dcClass = 'CDCMgr';
const fixAttrsFunc = 'getFixedAttr';
const hiddenAttrsFunc = 'getHiddenAttr';

//获取ADC表单的结构
function getDemo(){
  let demo = {
    "head": [{
      "canBeEmpty": false,
      "label": "ADC名称",
      "name": "name"
    },{
      "canBeEmpty": true,
      "label": "ADC标签",
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

//对获取ADC的请求参数进行解析，决定其真正请求的路径和参数
function getADCParams(query){
  let req = { func: 'newADC', params: {} };
  if(query.id){
    req.func = 'getADC';
    req.params.adcId = query.id;
  }else if(query.name){
    req.func = 'getADCByName';
    req.params.adcName = query.name;
  }
  return req;
}

//解析数据为前端所需的格式
function formatADCToUse(res){
  let fixAttrs = res.fixAttrsRes.CONTENT;
  let hiddenAttrs = res.hiddenAttrsRes.CONTENT;
  let adcData = res.adcData.CONTENT;
  let adc = {
    attr: {
      head: {
        label: adcData.label,
        name: adcData.name
      },
      hiddenRows: [],
      tabs: [{
        tableData: []
      },{
        value: adcData.desc,
      }]
    },
    demo: getDemo(),
  }
  adcData.attribute.forEach(item=>{
    item.READONLY = fixAttrs.includes(item.name);
    if(hiddenAttrs.includes(item.name)){
      adc.attr.hiddenRows.push(item);
    }else{
      adc.attr.tabs[0].tableData.push(item);
    }
  })
  adc = dataTool.clone(adcData,adc,['label','name','attribute','desc']);
  return dataTool.resJsonPackage(adc);
}

//解析数据为后台所需的格式
async function formatADCToSave(ctx,query){
  let adc = dataTool.clone(query.head);
  adc.label = adc.label || adc.name;
  adc.attribute = [...query.tabs[0].tableData,...query.hiddenRows].map(item=>{
    item.id || (item.id=-1);
    item = dataTool.clone(item,{},['READONLY','HIDDEN']);
    return item;
  });
  adc.desc = query.tabs[1].value;
  adc = dataTool.clone(query,adc,['head','hiddenRows','tabs','saveData']);
  let ret = {};
  if(query.saveData.id){ //有值表示更新
    ret = { adc: adc };
  }else{ //新增
    adc.storyId = query.saveData.storyId;
    let storyRes = await createRequest('StoryMgr','getStory',{storyId:adc.storyId}).send(ctx);
    ret = { adc: adc, story: storyRes.CONTENT };
  }
  return ret
}

//对获取ADC的请求参数进行解析,决定其真正请求的路径和参数
async function saveADCParams(ctx,query){
  let params = await formatADCToSave(ctx,query);
  let req = { func: 'overwriteADC', params: params };
  if(!query.saveData.id){
    req.func = 'createADC';
  }
  return req;
}

//获取ADC的原始数据
async function getADCOriginalData(ctx,query){
  let req = getADCParams(query);
  return await createRequest(adcClass,req.func,req.params,'GET').send(ctx);
}

module.exports = {
  async get(ctx,query){
    query = query || ctx.reqData
    let req = getADCParams(query);
    
    let res = await createRequest(dcClass,fixAttrsFunc,{},'GET','fixAttrsRes')
              .and(createRequest(dcClass,hiddenAttrsFunc,{},'GET','hiddenAttrsRes'))
              .and(createRequest(adcClass,req.func,req.params,'GET','adcData')).coSend(ctx);
    let data = formatADCToUse(res);
    
    return data;
  },
  async getOriginalData(ctx,query){
    query = query || ctx.reqData
    return await getADCOriginalData(ctx,query);
  },
  async getSaveData(ctx,query){
    query = query || ctx.reqData
    let res = await formatADCToSave(ctx,query);
    return dataTool.resJsonPackage(res);
  },
  async save(ctx,query){
    query = query || ctx.reqData
    let req = await saveADCParams(ctx,query);
    let res = await createRequest(adcClass,req.func,req.params,'POST').send(ctx);
    if(!query.saveData.id && query.saveData.folderId){//目录转移
      let folderRes = await createRequest('CatalogMgr','getCatalog',{catalogId:query.saveData.folderId}).send(ctx);
      let moveCatalogRes = await createRequest('CatalogMgr','moveCatalogByRealMoId',{realMoNodeType:res.CONTENT.moType, realMoId:res.CONTENT.ID, targetCatalog:folderRes.CONTENT},'POST').send(ctx);
      if(moveCatalogRes.ERR_MSG){
        console.error('移动目录报错',moveCatalogRes.ERR_MSG);
      }else{
        console.log('移动成功');
      }
    }
    return res;
  }
}