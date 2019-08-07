
import { typeMap, classMap, exportMap, importMap, labelMap } from './map.js'
import merge from 'webpack-merge'
let method = {
    initData(type, table) {
        DCHttp.req({
            url: `/api/${typeMap[type]}/list`,
            params: {keyword: table.keyword}
        }).then(res => {
            table.tableHead = res.tableHead
            table.tableData = res.tableData
            table.currentRow = null
        })
    },
    refresh() {
        return {
            icon: 'fa fa-refresh',
            title: '刷新',
            color: 'green',
            click(data, row, head, table) {
                table.initData(table)
            }
        }
    },
    add(type) {
        return {
            icon: 'fa fa-plus',
            title: '新增',
            color: 'green',
            click(data, row) {
                VUE.$router.push({
                    path: '/settingForm',
                    query: {
                        type,
                        handle: 'create',
                    }
                })
            }
        }
    },
    update(type) {
        return {
            icon: 'fa fa-edit',
            title: type !== 'agent' ? '修改' : '重建代理',
            color: 'blue',
            needRow: true,
            click(data, row) {
                VUE.$router.push({
                    path: '/settingForm',
                    query: {
                        type,
                        handle: 'update',
                        name: row.name
                    }
                })
            }
        }
    },
    dalete(type) {
        return {
            icon: 'fa fa-times',
            title: '删除',
            color: 'red',
            needRow: true,
            click(data, row, head, table) {
                let params = {
                    name: row.name
                }
                if(type === 'globaldataset') {
                    params = {
                        id: row.id
                    }
                }else if(type === 'icon') {
                    params = {
                        name: row.iconName
                    }
                }
                VUE.$affirm('是否删除该条数据').then(() => {
                    table.loading = true
                    DCHttp.req({
                        url: `/api/${typeMap[type]}/delete`,
                        params
                    }).then(res => {
                        table.loading = false
                        table.initData(table)
                        if(type === 'icon') {
                            VUE.$icons.clear()
                            VUE.$icons.set()
                        }
                    }).catch(err => {
                        table.loading = false
                    })
                })
            }
        }
    },
    import(type) {
        return {
            icon: 'fa fa-upload',
            title: '导入',
            color: 'blue',
            click(data, row, head, table) {
                let name = 'xmlFile'
                if(type === 'dataSource') {
                    name = 'dataSourceFile'
                }
                VUE.$importFile.open({
                    name,
                    params: {
                        Class: classMap[type],
                        FUNC: importMap[type]
                    }
                })
                VUE.$importFile.handleSuccess = () => {
                    method.initData(type, table)
                }
            }
        }
    },
    export(type) {
        let needRow = false
        type === 'enum' && (needRow = true)
        return {
            icon: 'fa fa-download',
            title: '导出',
            needRow,
            color: 'blue',
            click(data, row) {
                let enumName
                if(type === 'enum') {
                    enumName = row.name
                }
                DCHttp.export({
                    url: dcConfig.publicPath,
                    params: {
                        Class: classMap[type],
                        FUNC: exportMap[type],
                        [dcConfig.paramsKey]: {
                            enumName
                    }
                }})
            }
        }
    },
    filter(type) {
        return {
            icon: 'fa fa-filter',
            title: '高级过滤器',
            color: 'green',
            click(data, row, head, table) {
                let advFilter = new dc.AdvFilter({
                    attr: {
                        option: head.map(item => {
                            return {
                                label: item.label,
                                value: item.name
                            }
                        }),
                        placeholder: '请选择'
                    }
                })
                VUE.$openDialog(new dc.Dialog({
                    component: 'dc-advFilter',
                    width: '691px',
                    hasBtn: true,
                    btnGroup: [{
                        text: '确定',
                        type: 'primary',
                        size: 'mini',
                        click() {
                            DCHttp.req({
                                url: `/api/${typeMap[type]}/listByFilter`,
                                params: advFilter.treeData[0],
                                method: 'post'
                            }).then(res => {
                                table.tableData = res.tableData
                            })
                            table.treeData = advFilter.treeData
                            VUE.$closeDialog()
                        }
                    }, {
                        text: '取消',
                        size: 'mini',
                        click() {
                            VUE.$closeDialog()
                        }
                    }],
                    data: {
                        object: advFilter,
                        data: table.treeData,
                    }
                }))
            }
        }
    },
    back(type) {
        return {
            icon: 'fa fa-reply',
            title: '返回列表',
            color: 'green',
            size: 'mini',
            click() {
                VUE.$router.push({
                    path: 'setting',
                    query: {
                        content: type,
                        label: labelMap[type]
                    }
                })
            }
        }
    },
    save(type, handle) {
        return {
            icon: 'fa fa-save',
            title: '保存',
            color: 'blue',
            size: 'mini',
            click(table, form, name) {
                DCHttp.req({
                    url: `/api/${typeMap[type]}/${handle}`,
                    method: 'post',
                    params: {
                        tableData: table.tableData,
                        formData: form.data,
                        name
                    }
                }).then(res => {
                    type && method.back(type).click()
                })
            }
        }
    },
    getData(type, table, form, name) {
        DCHttp.req({
            url: `/api/${typeMap[type]}/detail`,
            params: {
                name: name
            }
        }).then(res => {
            res.tableData && (table.tableData = res.tableData)
            res.tableHead && (table.tableHead = res.tableHead)
            res.structure && (form.structure = res.structure)
            res.formData && (form.data = res.formData)
            if(type === 'dataSource') {
                let dbOptions = res.dbOptions
                let index = form.structure.findIndex(f => f.name === 'dbType')
                form.structure[index].change = (form, item) => {
                    let val = form.data[item.name]
                    index = dbOptions.findIndex(d => d.dbType === val)
                    form.data = Object.assign(form.data, dbOptions[index])
                }
            }else if(type === 'params') {
                let index = form.structure.findIndex(f => f.name === 'method')
                form.structure[index].change = (form, item) => {
                    let val = form.data[item.name]
                    DCHttp.req({
                        url: dcConfig.publicPath,
                        params: {
                            FUNC: 'getParamMetaOfMethod',
                            Class: 'ParamMgr',
                            [dcConfig.paramsKey]: {
                                method: val
                            }
                        }
                    }).then(res => {
                        table.tableData = res.CONTENT.map(item => {
                            return {
                                name: item,
                                value: ''
                            }
                        })

                    })
                }
            }   

        })
    },
    removeRow() {
        return {
            icon: 'fa fa-times',
            title: '删除',
            color: 'red',
            size: 'mini',
            needRow: true,
            click(data, row, head, table) {
                let index = data.indexOf(row)
                data.splice(index, 1)
            }
        }
    },
    addRow(type) {
        return {
            icon: 'fa fa-plus',
            title: '新增',
            color: 'green',
            size: 'mini',
            click(data, row) {
                if(type === 'entity') {
                     data.push({
                        id: -1,
                        dataType: 'String',
                        size: '255',
                        canBeEmpty: true
                     })
                }else {
                    data.push({})
                }
            }
        }
    },
    formRefresh(type) {
        return {
            icon: 'fa fa-refresh',
            title: '重载',
            color: 'green',
            click(table, form, name) {
                method.getData(type, table, form, name)
            }
        }
    },
    BDTest(testObj, table, form) {    
        testObj.loading = true
        DCHttp.req({
            url: `/api/DBDataSource/testConnect`,
            method: 'post',
            params: {
                tableData: table.tableData,
                formData: form.data
            }
        }).then(res => {
            VUE.$message('测试通过！')
            testObj.loading = false
        }).catch(err => {
            VUE.$message({
                type: 'error',
                message: '测试失败！',
                showClose: true
            })
            testObj.loading = false
        })
    },
    importDefaultParams() {
        return {
            icon: 'fa fa-sign-in',
            title: '导入默认参数',
            color: 'blue',
            click(data, row, head, table) {
                VUE.$affirm('此操作将导入一份默认参数定义的常用参数，遇到同名参数将会覆盖，你要继续吗？').then(() => {
                    table.loading = true
                    DCHttp.req({
                        url: dcConfig.publicPath,
                        params: {
                            Class: 'ParamMgr',
                            FUNC: 'loadDefaultParams'
                        }
                    }).then(res => {
                        table.loading = false
                        table.initData(table)
                    }).catch(err => {
                        table.loading = false
                    })
                })
            }
        }
    },
    copy(type) {
        return {
            icon: 'fa fa-copy',
            title: '复制',
            color: 'blue',
            needRow: true,
            click(data, row) {
                VUE.$router.push({
                    path: '/settingForm',
                    query: {
                        type,
                        handle: 'create',
                        name: row.name
                    }
                })
            }
        }
    },
    upRow() {
        return {
            icon: "fa fa-level-up", 
            color: "green",
            title: "上移",
            needRow: true,
            click(data, row) {
                data.splice(0,data.length, ...data.swap(row,-1));
            }
        }
    },
    downRow() {
        return {
            icon: "fa fa-level-down", 
            color: "green",
            title: "下移",
            needRow: true,
            click(data, row, rowIndex) {
                data.splice(0,data.length, ...data.swap(row,1));
            }
        }
    },
    resourceEdit(type, hanlde) {
        let handles = {
            create: {
                icon: 'fa fa-plus',
                title: '新增',
                color: 'green',
            },
            update: {
                icon: 'fa fa-edit',
                title: '修改',
                color: 'blue',
                needRow: true,
            }
        }
        handles[hanlde].click = (data, row, head, table) => {
            let form = new dc.Form({
                structure: [{
                    name: 'newName',
                    label: '名称',
                    canBeEmpty: false,
                },{
                    type: 'Integer',
                    canBeEmpty: false,
                    name: 'poolSize',
                    label: '并发数',
                }],
                data: {
                    poolSize: hanlde === 'update' ? row.poolSize : 100,
                    name: hanlde === 'update' ? row.name : '',
                    newName: hanlde === 'update' ? row.name : ''
                },
                btns: [{
                    label: '确定',
                    type: 'primary',
                    click:(form)=>{
                        let url = `/api/${typeMap[type]}/${hanlde}`
                        let params = hanlde === 'update' ? Object.assign({}, form.data) : {
                            name: form.data.newName,
                            poolSize: form.data.poolSize
                        }
                        DCHttp.req({
                            url,
                            params
                        }).then(res => {
                            VUE.$closeDialog(),
                            method.initData(type, table)
                        })
                    }
                }, {
                    label: '取消',
                    click:()=>{ VUE.$closeDialog() }
                }]
                })
                VUE.$openDialog(new dc.Dialog({
                    component: 'dc-form',
                    width: '400px',
                    data: {object: form},
                }))
        }
        return handles[hanlde]
    },
    iconEdit(type, handle) {
        let handles = {
            create: {
                icon: 'fa fa-plus',
                title: '新增',
                color: 'green',
            },
            update: {
                icon: 'fa fa-edit',
                title: '修改',
                color: 'blue',
                needRow: true,
            }
        }
        handles[handle].click = (data, row, head, table) => {
            let params = {
                Class: 'UserIconMgr',
                FUNC: 'createIcon'
            }
            let formData = {}
            let structure = [{
                name: 'iconName',
                type: 'string',
                label: '名称：'
            }]
            let submitForm = {}
            if(handle === 'create') {
                formData = { iconName: '' }
            }else {
                formData = { newIconName: row.iconName }
                structure[0].name = 'newIconName'
                submitForm = { iconName: row.iconName }
                params.FUNC = 'updateIcon'
            }
            VUE.$importFile.open({
                title: (handle === 'create' ? '新增' : '修改') + '图标',
                form: new dc.Form({
                    data: formData,
                    structure
                }),
                multiple: false,
                type: 'image',
                params,
                submitForm,
                name: 'imageFile',
                handleSuccess(data) {
                    VUE.$icons.clear()
                    VUE.$icons.set()
                    if(data[0].res) {
                        VUE.$importFile.close()
                        method.initData(type, table)
                    }   
                }
            })
        }
        return handles[handle]
    },
    domain() {
        return {
            icon: "fa fa-building-o", 
            color: "green",
            title: "绑定数据域",
            show() {
                return dcConfig.customModule.securityManager
            },
            needRow: true,
            click(data, row, rowIndex) {
                let domainTree = new dc.Tree({
                    selectType: 'dataField',
                    expandAll: true
                })
                DCHttp.req({
                    url: '/api/domain/all',
                    params: {
                        hasRoot: true
                    }
                }).then(res => {
                    domainTree.data = res
                })
                let dialog = new dc.Dialog({
                    title: '绑定数据域',
                    width: '400px',
                    data: {
                        object: domainTree,
                    },
                    component: 'dc-tree',
                    hasBtn: true,
                    btnGroup: [{
                        text: '确定',
                        type: 'primary',
                        click() {
                            let dsDomain = domainTree.get('nodeSelection')[0]
                            DCHttp.req({
                                url: dcConfig.publicPath,
                                params: {
                                    Class: 'SystemMgr',
                                    FUNC: 'bindingDomainId',
                                    [dcConfig.paramsKey]: {
                                        id: row.id || row.ID,
                                        domainId: dsDomain.id
                                    }
                                }
                            }).then(res => {
                                VUE.$successMessage('绑定成功')
                                VUE.$closeDialog()
                            }).catch(err => {
                                VUE.$message.error(err.ERR_MSG)
                            })
                        }
                        }, {
                            text: '取消',
                            click() {
                                VUE.$closeDialog()
                            }
                        }
                    ],
                })
                VUE.$openDialog(dialog)
            }
        }
    },
}
export default method