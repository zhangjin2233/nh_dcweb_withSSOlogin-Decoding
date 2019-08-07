const adcClass = 'ADCMgr';
const cdcClass = 'CDCMgr';
const dcClass = 'CDCMgr';
const udfClass = 'SUDFMgr';
const fixAttrsFunc = 'getFixedAttr';
const hiddenAttrsFunc = 'getHiddenAttr';
const tableEntityTypeStr = 'TableEntity';
const cdcHeadOption = [{label:'常规CDC',value:'Normal CDC'},{label:'SQL映射配置CDC',value:'SQL Config CDC'}];
const tabsFormStructure = [{ //CDC个性化配置的结构
  "canBeEmpty": true,
  "name": "displayAttr",
  "readOnly": false,
  "label": "选择显示标签的属性",
  "type": "String",
  "toolTips": ""
}, {
  "canBeEmpty": true,
  "name": "icon",
  "label": "选择显示的图标",
  "type": "String",
  "toolTips": ""
}];
const ADC = require('../ADC/index.js')
// const PDC = require('../PDC/index.js')
const dataTypeMap = {
  String: '字符串',
  Boolean: '布尔值',
  Integer: '整数',
  Long: '长整数',
  Double: '小数',
  AttachObject: '附件'
}

//获取CDC表单的结构
function getDemo(elementTypeOption,dataTypeOption,udfTableHead,enumMap,dataSetTypeOption,gtableMap){
  let demo = {
    "head": [{
      "canBeEmpty": false,
      "label": "CDC名称",
      "name": "name"
    },{
      "canBeEmpty": true,
      "label": "CDC标签",
      "name": "label"
    },{
      "label": "CDC类型",
      "name": "cdcType",
      "type": "SingleEnum",
      "option": cdcHeadOption,
    }],
    "tabs": [{
      "tableHead": [{
        "canBeEmpty": false,
        "name": "name",
        "readOnly": false,
        "label": "字段名称",
        "type": "String",
        "value": "attr_",
      }, {
        "canBeEmpty": true,
        "name": "label",
        "readOnly": false,
        "label": "中文标签",
        "type": "String",
        "value": "属性_",
      }, {
        "canBeEmpty": true,
        "name": "desc",
        "readOnly": false,
        "label": "描述",
        "type": "String",
        "value": "",
      }, {
        "canBeEmpty": false,
        "name": "elementType",
        "readOnly": false,
        "label": "要素类型",
        "type": "SingleEnum",
        "value": "staticValue",
        "option": elementTypeOption,
        "udf": {
          "tableHead": udfTableHead
        },
        "gtable": gtableMap,
        "dataSet": {
          "tableHead": [{
            "canBeEmpty": false,
            "name": "id",
            "readOnly": false,
            "label": "id",
            "type": "Int",
            "value": 0,
          }, {
            "canBeEmpty": false,
            "name": "name",
            "readOnly": false,
            "label": "列名",
            "type": "String",
            "value": "attr_",
          }, {
            "canBeEmpty": false,
            "name": "label",
            "readOnly": false,
            "label": "标签",
            "type": "String",
            "value": "",
          }, {
            "canBeEmpty": false,
            "name": "type",
            "readOnly": false,
            "label": "逻辑类型",
            "type": "SingleEnum",
            "value": "STRING",
            "option": dataSetTypeOption
          }]
        },
      }, {
        "canBeEmpty": false,
        "name": "dataType",
        "enumDef": {
          "tableData": enumMap,
          "tableHead": [{
            "canBeEmpty": false,
            "name": "name",
            "readOnly": true,
            "label": "枚举名",
            "type": "String",
          }, {
            "canBeEmpty": false,
            "name": "desc",
            "readOnly": true,
            "label": "描述",
            "type": "String",
          }]
        },
        "readOnly": false,
        "label": "数据类型",
        "type": "SingleEnum",
        "value": "String",
        "option": dataTypeOption,
      }, {
        "canBeEmpty": true,
        "name": "size",
        "readOnly": false,
        "label": "长度",
        "type": "String",
        "value": "256",
      }, {
        "canBeEmpty": true,
        "name": "canBeEmpty",
        "readOnly": false,
        "label": "允许空值",
        "type": "Boolean",
        "value": true,
      }, {
        "canBeEmpty": true,
        "name": "defaultValue",
        "readOnly": false,
        "label": "默认值",
        "type": "String",
        "value": "",
      }],
      "readOnly": false,
      "title": "定义要素",
      "type": "Table"
    },{
      "title": "个性化配置",
      "type": "Form",
      "readOnly": false,
      "structure": tabsFormStructure,
    }]
  }
  return demo;
}

async function getADC(ctx,query){
  let req = { func:'getADC', params:{} };
  if(query.id){
    req.func = 'getADC';
    req.params.adcId = query.id;
  }else if(query.name){
    req.func = 'getADCByName';
    req.params.adcName = query.name;
  }
  let res = await createRequest(adcClass,req.func,req.params).send(ctx);
  return res.CONTENT;
}

async function getOriginalPDCData(ctx,query){
  let req = {params:{}};
  if(query.id){
    req.func = 'getPDC';
    req.params.pdcId = query.id;
  }else if(query.guid){
    req.func = 'getPDCbyName';
    req.params.pdcName = query.guid;
  }
  return await createRequest('PDCMgr',req.func,req.params,'POST').send(ctx);
}

//对获取CDC的请求参数进行解析，决定其真正请求的路径和参数
async function getCDCParams(ctx,query){
  let req = { func: 'getCDC', params: {} };
  if(query.id){
    req.func = 'getCDC';
    req.params.cdcId = query.id;
  }else if(query.name){
    req.func = 'getCDCbyName';
    req.params.cdcName = query.name;
  }else if(query.pdc || query.guid || query.pdcId){
    req.func = 'getCDCbyName';
    let pdcRes = query.pdc ? {CONTENT:pdc} : await getOriginalPDCData(ctx,{id:query.pdcId,guid:query.guid});
    // let pdcRes = query.pdc ? {CONTENT:pdc} : await PDC.getOriginalData(ctx,{id:query.pdcId,guid:query.guid});
    let pdc = pdcRes.CONTENT;
    req.params.cdcName = pdc.ClassName.substr(pdc.ClassName.lastIndexOf('.')+1);
  }else if(query.adc || query.adcId || query.adcName){
    req.func = 'newCDC';
    req.params.basicAdc = query.adc || await getADC(ctx,{id:query.adcId,name:query.adcName});
    query.adcId = req.params.basicAdc.ID;
  }
  return req;
}

//CDC数据类型的选项
function getDataTypeOption(res){
  return [{value:'SingleEnum',label:'枚举'},...res.CONTENT.map(dataTypeItem=>{
    return {
      value: dataTypeItem.key,
      label: dataTypeMap[dataTypeItem.key],
    }
  })]
}

//CDC要素类型的选项
function getElementTypeOption(res){
  return res.CONTENT.map(elementTypeItem=>{
    return {
      value: elementTypeItem.key || 'staticValue',
      label: elementTypeItem.value,
    }
  })
}

//UDF的表格结构
function getUDFTableHead(fixOptionRes,attrOptionRes){
  let udfTableHead = [{
    "canBeEmpty": false,
    "name": "name",
    "readOnly": true,
    "label": "参数",
    "type": "String",
  }, {
    "canBeEmpty": true,
    "name": "type",
    "readOnly": true,
    "label": "类型",
    "type": "String",
  }, {
    "canBeEmpty": true,
    "name": "value",
    "readOnly": false,
    "label": "传入值",
    "type": "SingleEnum",
    "option": [{value:'',label:''},...fixOptionRes.CONTENT.map(optionItem=>{
      return {
        value: optionItem.key,
        label: optionItem.value
      }
    })],
    "optionMap": attrOptionRes.CONTENT
  }];
  return udfTableHead;
}

//枚举的表格映射
function getEnumMap(res){
  return res.CONTENT.map(enumItem=>{
    return { 
      name: enumItem.localName,
      desc: enumItem.Lable,
      option: enumItem.Info.map(opItem=>{
        return {
          value: opItem.intValue+'',
          label: opItem.label || opItem.name
        }
      })
    }
  })
}

//数据集的拓展逻辑类型选项
function getDataSetExtTypeOption(res){
  return res.CONTENT.map(item=>{
    return {
      value: item.key,
      label: item.value || item.key,
    }
  })
}

//表格的逻辑类型选项
function getDataSetTypeOption(enumMap,dataSetExtTypeOption){
  return [{
    "label": "文本",
    "value": "STRING"
  }, {
    "label": "布尔值",
    "value": "BOOLEAN"
  },
  ...enumMap.map(enumItem=>{return {label:'枚举：'+(enumItem.desc || enumItem.name), value:enumItem.name}}),
  ...dataSetExtTypeOption
  ]
}

//全局数据集的映射关系
function getGTableMap(enumMap,dataSetExtTypeOption,res){
  let gtableMap = {
    tableHead: [{
      label: 'id',
      name: 'id',
      type: 'String',
      readOnly: true,
    },{
      label: '名称',
      name: 'name',
      type: 'String',
      readOnly: true,
    },{
      label: '定义',
      name: 'def',
      readOnly: true,
      type: 'String'
    }],
    tableData: res.CONTENT.map(gtableItem=>{
      return {
        id: gtableItem.globalUuid,
        name: gtableItem.name || gtableItem.globalUuid,
        def: '<'+Object.keys(gtableItem.headerDef).map(key=>gtableItem.headerDef[key].label || key).join(',')+'>',
        tableData: Object.keys(gtableItem.headerDef).map(key=>{
          let item = enumMap.find(item=>item.name == gtableItem.headerDef[key].type);
          if(item){
            gtableItem.headerDef[key].option = item.option;
            gtableItem.headerDef[key].type = 'SingleEnum';
          }else if(dataSetExtTypeOption.some(op=>op.value == gtableItem.headerDef[key].type)){
            //未被处理的特殊类型
          }
          return gtableItem.headerDef[key]
        })
      }
    })
  }
  return gtableMap;
}

//获取已选择的UDF数据
async function getUDFData(ctx,cdcData){
  let udfNames = [];
  let res = {};
  cdcData.attribute.forEach(row=>{
    try{
      if(row.dataType == 'UDF' && row.customerExtension && Object.keys(row.customerExtension)[0] && !udfNames.includes(Object.keys(row.customerExtension)[0])){
        udfNames.push(Object.keys(row.customerExtension)[0]);
      }
    }catch(e){
      console.warn('未知错误');
    }
  });
  if(udfNames.length){
    let req;
    udfNames.forEach((item,index)=>{
      if(index){
        req.colletion.push(createRequest(udfClass,'getUDFByName',{udfName:item},'GET',item));
      }else{
        req = createRequest(udfClass,'getUDFByName',{udfName:item},'GET',item);
      }
    });  
    if(req){
      res = await req.coSend(ctx);
    }
  }
  return res;
}

//解析数据为前端所需的格式
async function formatCDCToUse(res,ctx){
  const fixAttrs = res.fixAttrsRes.CONTENT;
  const hiddenAttrs = res.hiddenAttrsRes.CONTENT;
  const dataTypeOption = getDataTypeOption(res.dataTypeRes);
  const elementTypeOption = getElementTypeOption(res.elementTypeRes);
  const udfTableHead = getUDFTableHead(res.udfOptionRes,res.udfOptionMapRes);
  const enumMap = getEnumMap(res.enumMapRes);
  const dataSetExtTypeOption = getDataSetExtTypeOption(res.dataSetExtRes);
  const dataSetTypeOption = getDataSetTypeOption(enumMap,dataSetExtTypeOption);
  const gtableMap = getGTableMap(enumMap,dataSetExtTypeOption,res.gtableMapRes);
  const initData = { choseRow: "", label: "", tableData: [] };
  let udfData = await getUDFData(ctx,res.cdcData.CONTENT);
  let cdcData = res.cdcData.CONTENT;
  let cdc = {
    attr: {
      head: {
        label: cdcData.label,
        name: cdcData.name,
        cdcType: cdcData.cdcType,
      },
      hiddenRows: [],
      tabs: [{
        tableData: []
      },{
        formData: cdcData.extendCfg,
      }]
    },
    demo: getDemo(elementTypeOption,dataTypeOption,udfTableHead,enumMap,dataSetTypeOption,gtableMap),
  }
  cdcData.attribute.forEach(row=>{
    row.READONLY = fixAttrs.includes(row.name);
    row.INHERIT = res.adcData.CONTENT.attr.tabs[0].tableData.some(item=>item.name == row.name);
    row.dataSet = dataTool.clone(initData);
    row.enumDef = dataTool.clone(initData);
    row.udf = dataTool.clone(initData);
    row.gtable = dataTool.clone(initData);
    switch(row.dataType){
      case 'DataSet': //数据集类型数据处理
        const enumstr = 'ENUM_';
        row.dataSet.tableData = Object.keys(row.customerExtension).map((key)=>{
          if(row.customerExtension[key].type.substr(0,enumstr.length) == enumstr){
            row.customerExtension[key].type = row.customerExtension[key].type.substr(enumstr.length);
          }
          return row.customerExtension[key];
        })
        break;
      case 'UDF': //UDF类型数据处理
        row.customerExtension || (row.customerExtension = {})
        let udfName = Object.keys(row.customerExtension)[0];
        if(udfName){ //如果UDF存在
          let udf = udfData[udfName].CONTENT;
          row.udf = {
            choseRow: udf.name,
            label: udf.desc,
            tableData: udf.arguments.map(udfDataItem=>{
              return {
                name: udfDataItem.name,
                type: udfDataItem.fullClass.substr(udfDataItem.fullClass.lastIndexOf('.')+1),
                value: row.customerExtension[udf.name][udfDataItem.name]
              }
            })
          }
        }
        break;
      case 'gtable': //全局数据集处理
        const gtableStr = 'gtable';  
        if(row.customerExtension && row.customerExtension.substr(0,gtableStr.length) == gtableStr){
          row.customerExtension = row.customerExtension.substr(gtableStr.length);
        }
        row.gtable.choseRow = row.customerExtension;
        break;
      case 'SingleEnum': //枚举
        row.enumDef.choseRow = row.customerExtension;
        break;
      case tableEntityTypeStr: //表实体类型
        row.dataType += ('='+row.customerExtension);
        break;
      default:
        break;
    }
    if(dataTypeOption.some(dataTypeItem=>dataTypeItem.value == row.dataType)){
      row.elementType = 'staticValue';
    }else{
      row.elementType = row.dataType;
      row.dataType = 'String';
    }
    if(hiddenAttrs.includes(row.name)){
      row.HIDDEN = true;
      cdc.attr.hiddenRows.push(row);
    }else{
      cdc.attr.tabs[0].tableData.push(row);
    }
  })
  cdc = dataTool.clone(cdcData,cdc,['label','name','cdcType','extendCfg','attribute']);
  if(cdcData.ID != "Model=-1"){ //如果不是新增
    cdc.demo.head[2].readOnly = true;
  }else{
    cdc.storyId = res.adcData.CONTENT.storyId;
    cdc.adcId = res.adcData.CONTENT.ID;
  }
  return dataTool.resJsonPackage(cdc);
}

//解析数据为后台所需的格式
async function formatCDCToSave(ctx,query){
  let cdc = dataTool.clone(query.head);
  cdc.label = cdc.label || cdc.name;
  cdc.attribute = [...query.tabs[0].tableData,...query.hiddenRows].map(item=>{
    item.id || (item.id=-1);
    if(!item.HIDDEN){
      switch(item.elementType){
        case 'DataSet':
          item.customerExtension = item.dataSet.tableData;
          break;
        case 'UDF':
          item.customerExtension = {};
          item.customerExtension[item.udf.choseRow] = {};
          item.udf.tableData.forEach(row=>{
            item.customerExtension[item.udf.choseRow][row.name] = row.value;
          })
          break;
        case 'gtable': //全局数据集处理
          item.customerExtension = 'gtable'+item.gtable.choseRow;
          break;
        default:
          if(item.elementType.substr(0,tableEntityTypeStr.length) == tableEntityTypeStr){
            item.customerExtension = item.elementType.substr(tableEntityTypeStr.length+1);
            item.dataType = tableEntityTypeStr;
          }else if(item.dataType == 'SingleEnum'){
            item.customerExtension = item.enumDef.choseRow;
          }
          break;
      }
      if(item.dataType == 'String' && item.elementType && item.elementType!='staticValue'){
        item.dataType = item.elementType;
      }
    }
    item = dataTool.clone(item,{},['enumDef','udf','gtable','dataSet','READONLY','HIDDEN','INHERIT','elementType']);
    return item;
  });
  cdc.extendCfg = query.tabs[1].formData;
  cdc = dataTool.clone(query,cdc,['head','hiddenRows','tabs','saveData']);
  let ret = { cdc: cdc };
  if(!query.saveData.id){ //新增
    let storyRes = await createRequest('StoryMgr','getStory',{storyId:cdc.storyId}).send(ctx);
    let adcRes = await createRequest(adcClass,'getADC',{adcId:cdc.adcId}).send(ctx);
    ret = { cdc: cdc, story: storyRes.CONTENT, basicAdc:adcRes.CONTENT };
  }
  return ret
}

//对获取cdc的请求参数进行解析,决定其真正请求的路径和参数
async function saveCDCParams(ctx,query){
  let params = await formatCDCToSave(ctx,query);
  let req = { func: 'overwriteCDC', params: params };
  if(!query.saveData.id && params.cdc.cdcType == 'Normal CDC'){
    req.func = 'createCDC';
  }else if(!query.saveData.id && params.cdc.cdcType == 'SQL Config CDC'){
    req.func = 'createSqlCDC';
  }
  return req;
}

async function getCDCOriginalData(ctx,query){
  let req = await getCDCParams(ctx,query);
  return await createRequest(cdcClass,req.func,req.params,'POST').send(ctx);
}

//获取新增UDF的请求参数
async function getAddUDFParams(ctx,query){
  let res = await createRequest('SUDFMgr','newSUDF',{},'GET','udf')
            .and(createRequest('StoryMgr','getStory',{storyId:query.storyId},'GET','story')).coSend(ctx);
  let udf = res.udf.CONTENT;
  udf.desc = query.desc;
  udf.name = query.name;
  udf.label = query.label;
  udf.arguments = [];
  query.tableData.forEach(item=>{
    if(item.name){
      item.fullClass = "com.leavay.dc.develop."+item.type;
      delete item.type
      udf.arguments.push(item);
    }
  })
  return {
    story: res.story.CONTENT,
    sudf: udf
  }
}


module.exports = {
  async get(ctx,query){
    query = query || ctx.reqData
    let req = await getCDCParams(ctx,query);
    let res = await createRequest(dcClass,fixAttrsFunc,{},'GET','fixAttrsRes')
              .and(createRequest(dcClass,hiddenAttrsFunc,{},'GET','hiddenAttrsRes'))
              .and(createRequest(cdcClass,req.func,req.params,'POST','cdcData'))
              .and(createRequest('EnumDefMgr','listAllEnumDef',{},'GET','enumMapRes'))
              .and(createRequest('GlobalDataSetDefMgr','listAllGlobalDataSetDef',{},'GET','gtableMapRes'))
              .and(createRequest(cdcClass,'getAllFactorType',{},'GET','elementTypeRes'))
              .and(createRequest(cdcClass,'getAllDataType',{},'GET','dataTypeRes'))
              .and(createRequest('SystemMgr','getDataSetDefExtendType',{},'GET','dataSetExtRes'))
              .and(createRequest(cdcClass,'getDefaultInputParams',{},'GET','udfOptionRes'))
              .and(createRequest(cdcClass,'getDCAttribteTypeClassMap',{},'GET','udfOptionMapRes'))
              .coSend(ctx);
    res.adcData = await ADC.get(ctx,{id:query.adcId || res.cdcData.CONTENT.adcId});
    let data = await formatCDCToUse(res,ctx);
    return data;
  },
  async getOriginalData(ctx,query){
    query = query || ctx.reqData
    return await getCDCOriginalData(ctx,query);
  },
  async getSaveData(ctx,query){
    query = query || ctx.reqData
    let res = await formatCDCToSave(ctx,query);
    return dataTool.resJsonPackage(res);
  },
  async save(ctx,query){
    query = query || ctx.reqData
    let req = await saveCDCParams(ctx,query);
    let res = await createRequest(cdcClass,req.func,req.params,'POST').send(ctx);
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
  },
  async addUDF(ctx,query){
    query = query || ctx.reqData
    let params = await getAddUDFParams(ctx,query);
    let res = await createRequest('SUDFMgr','createUDF',params,'POST').send(ctx);
    return res;
  },
  async allCDCTree(ctx) {
    let list = (await createRequest('CDCMgr', 'listAllCDC').send(ctx)).CONTENT
    return list.map(item => {
      return {
        children: [],
        id: item.ID,
        label: item.label,
        type: 'CDC'
      }
    })
  } 
}