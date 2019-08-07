let typeMap = {
    dataSource: 'DBDataSource',
    enum: 'enumDef',
    entity: 'tableEntity',
    agent: 'agent',
    icon: 'userIcon',
    params: 'param',
    attrsTable: 'propertiesTable',
    service: 'serverInfo',
    resource: 'resourcePool',
    globaldataset: 'dataset',
}
let classMap = {
    dataSource: 'DBDataSourceMgr',
    enum: 'EnumDefMgr',
    entity: 'TableEntityDefMgr',
    agent: 'AgentMgr',
    icon: 'UserIconMgr',
    params: 'ParamMgr',
    attrsTable: 'PropertiesTableMgr',
    service: 'ServerInfoMgr',
    resource: 'ResourcePoolMgr',
    globaldataset: 'GlobalDataSetDefMgr',
}

let exportMap = {
    dataSource: 'exportDBDataSource2',
    enum: 'exportEnumDef2',
    entity: 'exportTableEntityDef2',
    params: 'exportParam2',
    attrsTable: 'exportPropertiesTable2',
    service: 'exportServerInfo2',
}

let importMap = {
    dataSource: 'importDBDataSource',
    enum: 'importEnumDef',
    entity: 'importTableEntityDef2',
    params: 'importParam',
    attrsTable: 'importPropertiesTable',
    service: 'importServerInfo',
}

let labelMap = {
    dataSource: '数据源定义',
    enum: '枚举定义',
    entity: '表实体定义',
    agent: '代理机管理',
    icon: '自定义图标',
    params: '参数定义',
    attrsTable: '属性表定义',
    service: '服务器定义',
    resource: '全局资源管控',
    globaldataset: '全局数据集',
}


export { typeMap, classMap, exportMap, importMap, labelMap }