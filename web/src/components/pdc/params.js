export default {
  guid: 'guid',
  id: 'id',
  attrName: 'attrName',
  getJudgeTypeOption:{ //获取判断类型的枚举选项
    url: '/api/PDC/getJudgeTypeOption',
  },
  getParamsOption:{ //获取系统变量的枚举选项
    url: '/api/PDC/getParamsOption'
  },
  getTable:{ //获取PDC列表
    url: "/api/PDC/list",
  },
  export: { //导出PDC列表
    Class: 'PDCMgr',
    FUNC: 'exportPDC'
  },
  getForm:{ //获取PDC表单
    url: '/api/PDC/get',
  },
  removeForm: { //删除PDC表单
    Class: 'PDCMgr',
    FUNC: 'deletePDCByName',
    data: {
      formId: 'pdcName',
    }
  },
  saveForm:{ //保存PDC
    url: '/api/PDC/save',
  },
  importTableEntity: {
    Class: 'PDCMgr',
    FUNC: 'importTableEntityColumn',
  },
  exportTableEntity: {
    Class: 'PDCMgr',
    FUNC: 'exportTableEntityColumn'
  },
  showSQL: {
    Class: 'PDCMgr',
    FUNC: 'getCreateSql',
  },
  testSQL: {
    Class: 'PDCMgr',
    FUNC: 'testCreateSql'
  },
  importDataSet:{
    Class: 'PDCMgr',
    FUNC: 'importDataSetContent',
  },
  exportDataSet:{
    url: 'action=DCView.callJavaFunc2&Class=PDCMgr&FUNC=exportDataSetContent',
  },
  getCDCOfPDC:{
    url: '/api/CDC/getOriginalData'
  },
  getSourceTableStructure:{ //获取抽取来源的列表，某个PDC下的表实体的部分内容
    // url: 'UDF=DhWebPDCMgrUDF&FUNC=getSourceTableStructure',
    url: '/api/PDC/getSourceTableEntity',
  },
  getSourcePDCList:{ //获取来源列表，来自某个CDC
    // url: 'UDF=DhWebPDCMgrUDF&FUNC=showSourcePDCList',
    url: '/api/PDC/getSourcePDCList',
  },

}