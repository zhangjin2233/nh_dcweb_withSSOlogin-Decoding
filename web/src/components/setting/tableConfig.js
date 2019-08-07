import method from './method.js'
export default {
    dataSource: {
        title: '数据源定义',
        initData(table) {
            method.initData('dataSource', table)
        },
        search(val, table) {
            method.initData('dataSource', table)
        },
        rowDbClick(data, row) {
            method.update('dataSource').click(data, row)
        },
        hasSearch: true,
        hasPage: false,
        height: window.innerHeight - 150 + 'px',
        btnGroup: [method.refresh('dataSource'), method.add('dataSource'), method.update('dataSource'), method.dalete('dataSource'), method.import('dataSource'), method.export('dataSource'), method.filter('dataSource'), method.domain()]
    },
    enum: {
        title: '枚举定义',
        initData(table) {
            method.initData('enum', table)
        },
        rowDbClick(data, row) {
            method.update('enum').click(data, row)
        },
        hasPage: false,
        height: window.innerHeight - 150 + 'px',
        btnGroup: [method.refresh('enum'), method.add('enum'), method.update('enum'), method.dalete('enum'), method.import('enum'), method.export('enum'), method.domain()]
    },
    entity: {
        title: '表实体定义',
        initData(table) {
            method.initData('entity', table)
        },
        rowDbClick(data, row) {
            method.update('entity').click(data, row)
        },
        hasPage: false,
        height: window.innerHeight - 150 + 'px',
        btnGroup: [method.refresh('entity'), method.add('entity'), method.update('entity'), method.dalete('entity'), method.import('entity'), method.export('entity'), method.domain()]
    },
    icon: {
        title: '自定义图标',
        initData(table) {
            method.initData('icon', table)
        },
        hasPage: false,
        height: window.innerHeight - 150 + 'px',
        cellAppend: [ {prop: 'imageData', condition: true, component: 'iconWrapper'}],
        btnGroup: [method.refresh('icon'), method.iconEdit('icon', 'create'), method.iconEdit('icon', 'update'), method.dalete('icon')]
    },
    params: {
        title: '参数定义',
        initData(table) {
            method.initData('params', table)
        },
        search(val, table) {
            method.initData('params', table)
        },
        rowDbClick(data, row) {
            method.update('params').click(data, row)
        },
        hasSearch: true,
        sortable: true,
        hasPage: false,
        height: window.innerHeight - 150 + 'px',
        btnGroup: [method.refresh('params'), method.add('params'), method.update('params'), method.copy('params'), method.dalete('params'), method.importDefaultParams(), method.import('params'), method.export('params'), method.domain()]
    },
    attrsTable: {
        title: '属性表定义',
        initData(table) {
            method.initData('attrsTable', table)
        },
        search(val, table) {
            method.initData('attrsTable', table)
        },
        rowDbClick(data, row) {
            method.update('attrsTable').click(data, row)
        },
        hasSearch: true,
        hasPage: false,
        height: window.innerHeight - 150 + 'px',
        btnGroup: [method.refresh('attrsTable'), method.add('attrsTable'), method.update('attrsTable'), method.dalete('attrsTable'), method.import('attrsTable'), method.export('attrsTable'), method.filter('attrsTable'), method.domain()]
    },
    service: {
        title: '服务器定义',
        initData(table) {
            method.initData('service', table)
        },
        search(val, table) {
            method.initData('service', table)
        },
        rowDbClick(data, row) {
            method.update('service').click(data, row)
        },
        hasSearch: true,
        sortable: false,
        hasPage: false,
        height: window.innerHeight - 150 + 'px',
        btnGroup: [method.refresh('service'), method.add('service'), method.update('service'), method.dalete('service'), method.import('service'), method.export('service'), method.filter('service'), method.domain()]
    },
    resource: {
        title: '全局资源管控',
        initData(table) {
            method.initData('resource', table)
        },
        rowDbClick(data, row, head, table) {
            method.resourceEdit('resource', 'update').click(data, row, head, table)
        },
        hasPage: false,
        height: window.innerHeight - 150 + 'px',
        btnGroup: [method.refresh('resource'), method.resourceEdit('resource', 'create'), method.resourceEdit('resource', 'update'), method.dalete('resource'), method.domain()]
    },
    globaldataset: {
        title: '全局数据集',
        initData(table) {
            method.initData('globaldataset', table)
        },
        rowDbClick(data, row) {
            method.update('globaldataset').click(data, row)
        },
        hasPage: false,
        height: window.innerHeight - 150 + 'px',
        btnGroup: [method.refresh('globaldataset'), method.add('globaldataset'), method.update('globaldataset'), method.dalete('globaldataset'), method.domain()]
    },
    agent: {
        title: '代理机管理',
        initData(table) {
            // method.initData('agent', table)
            getWebSocket('AgentList').send((res) => {
                if(res.content) {
                    table.tableData = res.content.tableData
                    table.tableHead = res.content.tableHead
                }
                
            })
        },
        hasPage: false,
        height: window.innerHeight - 150 + 'px',
        colsWidth: [
            {
                prop: 'name',
                width: '140px'
            },
            {
                prop: 'memory',
                width: '170px'
            }, {
                prop: 'port',
                width: '60px'
            }, {
                prop: 'loadding',
                width: '50px'
            }, {
                prop: 'isOnline',
                width: '100px'
            }, {
                prop: 'isConnected',
                width: '78px'
            }, {
                prop: 'procId',
                width: '70px'
            }, {
                prop: 'threadCount',
                width: '70px'
            }, {
                prop: 'startTime',
                width: '84px'
            }, {
                prop: 'IPAddr',
                width: '100px'
            }
        ],
        cellAppend: [{
            prop: 'memory',
            condition: 'true',
            component: 'memory'
        }],
        cellImages: [{
            prop: 'isOnline',
            icon: [{
                value: true,
                class: 'fa fa-link',
                color: 'green'
            }, {
                value: false,
                class: 'fa fa-unlink',
                color: 'red'
            }]
        }, {
            prop: 'name',
            icon: [{
                    class: 'fa fa-desktop',
                    condition: 'row.name==="Server Internal Process"',
                    color: 'green'
            }, {
                class: 'fa fa-ban',
                condition: 'row.isDisabled===false',
                color: 'red'
            }, {
                class: 'fa fa-check-square-o',
                condition: 'row.isDisabled===true',
                color: 'green'
            }]
        }],
        cellStyle(value, prop, row) {
            if (prop === 'isConnected' && value === true) {
                return { 'background-color': '#b3ff99' }
            } else if (prop === 'isConnected' && value === false) {
                return { 'background-color': '#ff8080' }
            }
        },
        filterSetting: [
            {
                prop: 'isConnected',
                value: false,
                show: '断开'
            }, {
                prop: 'isConnected',
                value: true,
                show: '已连接'
            }, {
                prop: 'isOnline',
                value: true,
                show: '在线'
            }, {
                prop: 'isOnline',
                value: false,
                show: '离线'
            }, {
                prop: 'startTime',
                show(val) {
                    if(val > 0) {
                        let value = Math.round(val/1000)
                        let hour = parseInt(value / 3600)
                        value %= 3600
                        let min = parseInt(value / 60)
                        value %= 60
                        let sec = value
                        return hour + ':' + ((min + '').length < 2 ? '0' + min : min)  + ':' + ((sec + '').length < 2 ? '0' + sec : sec) 
                    }
                    return 0
                }
            }, {
                prop: 'name',
                show(val) {
                    if(val === 'Server Internal Process') return '主控进程'
                    return val
                }
            }
        ],
        btnGroup: [ method.refresh('agent'), method.add('agent'), method.copy('agent'), method.update('agent'), method.dalete('agent'), {
            title: '设为在线（参与任务自动分配）',
            icon: 'fa fa-chain',
            color: 'rgb(91, 154, 44)',
            needRow: true,
            click(data, row, head, table) {
                VUE.$affirm('请确保您已清楚知道此次操作的危险性再继续。你确定要继续吗？').then(() => {
                    DCHttp.req({
                        url: dcConfig.publicPath,
                        params: {
                            Class: 'AgentMgr',
                            FUNC: 'setAgentOnline',
                            [dcConfig.paramsKey]: {
                                agentName: row.name,
                                online: true
                            }
                        }
                    }).then(res => {
                        setTimeout(() => {
                            method.refresh('agent').click(data, row, head, table)
                        }, 500)
                        
                    })
                })
            }
        }, {
            title: '设置为离线（不参与自动分配）',
            icon: 'fa fa-chain-broken',
            color: 'red',
            needRow: true, 
            click(data, row, head, table) {
                VUE.$affirm('请确保您已清楚知道此次操作的危险性再继续。你确定要继续吗？').then(() => {
                    DCHttp.req({
                        url: dcConfig.publicPath,
                        params: {
                            Class: 'AgentMgr',
                            FUNC: 'setAgentOnline',
                            [dcConfig.paramsKey]: {
                                agentName: row.name,
                                online: false
                            }
                        }
                    }).then(res => {
                        setTimeout(() => {
                            method.refresh('agent').click(data, row, head, table)
                        }, 500)
                    })
                })
            }
        },
        {
            title: '启用代理',
            icon: 'fa fa-check-square-o',
            color: 'rgb(91, 154, 44)',
            needRow: true,
            click(data, row, head, table) {
                VUE.$affirm('请确保您已清楚知道此次操作的危险性再继续。你确定要继续吗？').then(() => {
                    DCHttp.req({
                        url: dcConfig.publicPath,
                        params: {
                            Class: 'AgentMgr',
                            FUNC: 'setAgentDisable',
                            [dcConfig.paramsKey]: {
                                agentName: row.name,
                                disable: false
                            }
                        }
                    }).then(res => {
                        setTimeout(() => {
                            method.refresh('agent').click(data, row, head, table)
                        }, 500)
                    })
                })
            }
        }, {
            title: '禁用代理',
            icon: 'fa fa-ban',
            color: 'red',
            needRow: true,
            click(data, row, head, table) {
                VUE.$affirm('请确保您已清楚知道此次操作的危险性再继续。你确定要继续吗？').then(() => {
                    DCHttp.req({
                        url: dcConfig.publicPath,
                        params: {
                            Class: 'AgentMgr',
                            FUNC: 'setAgentDisable',
                            [dcConfig.paramsKey]: {
                                agentName: row.name,
                                disable: true
                            }
                        }
                    }).then(res => {
                        setTimeout(() => {
                            method.refresh('agent').click(data, row, head, table)
                        }, 500)
                    })
                })
            }
        }, {
            title: '重启代理',
            icon: 'fa fa-play-circle',
            color: 'rgb(91, 154, 44)',
            needRow: true,
            click(data, row, head, table) {
                VUE.$affirm('强制重启工作进程，将导致其上正在运行的节点陆续出错异常。你确定要继续吗？').then(() => {
                    DCHttp.req({
                        url: dcConfig.publicPath,
                        params: {
                            Class: 'AgentMgr',
                            FUNC: 'restartAgent',
                            [dcConfig.paramsKey]: {
                                agentName: row.name
                            }
                        }
                    }).then(res => {
                        setTimeout(() => {
                            method.refresh('agent').click(data, row, head, table)
                        }, 500)
                    })
                })
            }
        }, 
        {
            title: '读取最近的控制台打印',
            icon: 'fa fa-television',
            color: 'blue',
            needRow: true,
            click(data, row, head, table) {
                DCHttp.req({
                    url: dcConfig.publicPath,
                    params: {
                        FUNC: 'getLastOutput',
                        Class: 'AgentMgr',
                        [dcConfig.paramsKey]: {
                            agentName: row.name,
                            lineCount: 100
                        }
                    }
                }).then(res => {
                    if(res) {
                        let content = res.CONTENT
                        let html = content.replace(/\n/g,'<br>')
                        VUE.$openFrame(new dc.Frame({
                            title: '主控进程',
                            width: '600px',
                            height: '400px',
                            html: html
                        }))
                    }
                })
            }
        }, method.domain('agent')],
    },
    
}
