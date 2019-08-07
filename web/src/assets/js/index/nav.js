
const nav = {
    menu: [{
        title: '工具',
        index: '1',
        children: [{
            title: 'Job监控',
            index: '1-0',
            click() {
                VUE.$router.push({ path: 'dataFlow' })
            }
        },{
            title: '数据导入/导出',
            index: '1-1',
            children: [{
                title: '数据导入工具',
                index: '1-1-1',
                click() {
                    VUE.$openDialog(new dc.Dialog({
                        title: '数据导入工具',
                        top: '15vh',
                        component: 'exportImport',
                        width: '680px',
                        data: {
                            type: 'import'
                        }
                    }))
                }
            }, {
                title: '数据导出工具',
                index: '1-1-1',
                click() {
                    VUE.$openDialog(new dc.Dialog({
                        title: '数据导出工具',
                        top: '15vh',
                        width: '680px',
                        component: 'exportImport',
                        data: {
                            type: 'export'
                        }
                    }))
                }
            }]
        }, {
            title: '自动备份',
            index: '1-2',
            click() {
                VUE.$openDialog(new dc.Dialog({
                    title: '自动备份',
                    component: 'backup',
                    width: '600px'
                }))
            }
            }, {
                title: '导入自定义文件',
                index: '1-3',
                click() {
                    DCHttp.req({url: '/api/catalog/storyList'}).then(res=>{
                        VUE.$openDialog(new dc.Dialog({
                            title: '导入自定义文件',
                            top: '15vh',
                            width: '680px',
                            component: 'exportImport',
                            data: {
                                type: 'custom',
                                storyList: res.data[0].children.map(item => {
                                    return { value: item.label, label: item.label } 
                                })
                            }
                        }))
                    })
                }
            }, {
                title: '版本管理',
                index: '1-4',
                width: 80,
                show() {
                    return dcConfig.customModule.versionControl
                },
                children: [{
                    title: '版本导出',
                    index: '1-4-1',
                    click() {
                        VUE.$router.push({ path: 'version', query: { type: 'export' } })
                    }
                }, {
                    title: '版本导入',
                    index: '1-4-2',
                    click() {
                        VUE.$router.push({ path: 'version', query: { type: 'import' } })
                    }
                }]
            }]
    }, {
        title: '设置',
        index: '2',
        children: [{
            title: '数据源定义',
            index: '2-1',
            click() {
                VUE.$router.push({
                    path: 'setting',
                    query: {
                        content: 'dataSource',
                        label: '数据源定义'
                    }
                })
            }
        }, {
            title: '枚举定义',
            index: '2-2',
            click() {
                VUE.$router.push({
                    path: 'setting',
                    query: {
                        content: 'enum',
                        label: '枚举定义'
                    }
                })
            }
        }, {
            title: '表实体定义',
            index: '2-3',
            click() {
                VUE.$router.push({
                    path: 'setting',
                    query: {
                        content: 'entity',
                        label: '表实体定义'
                    }
                })
            }
        }, {
            title: '代理机管理',
            index: '2-4',
            click() {
                VUE.$router.push({
                    path: 'setting',
                    query: {
                        content: 'agent',
                        label: '代理机管理'
                    }
                })
            }
        }, {
            title: '自定义图标',
            index: '2-5',
            click() {
                VUE.$router.push({
                    path: 'setting',
                    query: {
                        content: 'icon',
                        label: '自定义图标'
                    }
                })
            }
        }, {
            title: '参数定义',
            index: '2-6',
            click() {
                VUE.$router.push({
                    path: 'setting',
                    query: {
                        content: 'params',
                        label: '参数定义'
                    }
                })
            }
            }, {
                title: '服务器定义',
                index: '2-7',
                click() {
                    VUE.$router.push({
                        path: 'setting',
                        query: {
                            content: 'service',
                            label: '服务器定义'
                        }
                    })
                }
            }, {
                title: '属性表定义',
                index: '2-7',
                click() {
                    VUE.$router.push({
                        path: 'setting',
                        query: {
                            content: 'attrsTable',
                            label: '属性表定义'
                        }
                    })
                }
            },{
                title: '全局资源管控',
                index: '2-8',
                click() {
                    VUE.$router.push({
                        path: 'setting',
                        query: {
                            content: 'resource',
                            label: '全局资源管控'
                        }
                    })
                }
            }, {
                title: '全局数据集',
                index: '2-8',
                click() {
                    VUE.$router.push({
                        path: 'setting',
                        query: {
                            content: 'globaldataset',
                            label: '全局数据集',
                        }
                    })
                }
            }, {
                title: '安全管理',
                index: '2-9',
                width: 150,
                show() {
                    return dcConfig.customModule.securityManager
                },
                children: [{
                    title: '打开安全管理',
                    index: '2-9-1',
                    active: JSON.parse(sessionStorage.getItem('security')),
                    click() {
                        this.active = !this.active
                        sessionStorage.setItem('security', this.active)
                        if(this.active) {
                            DCHttp.req({
                                url: '/api/catalog/securityList'
                            }).then(res => {
                                Tree.data.push(res)
                            })
                        }else {
                            Tree.getNode('security').parent.childNodes.pop()
                        }
                    }
                }, {
                    title: '显示数据所有者及域',
                    index: '2-9-2',
                    active: JSON.parse(sessionStorage.getItem('domain')),
                    click() {
                        this.active = !this.active
                        sessionStorage.setItem('domain', this.active)
                        Tree.refresh()
                    }
                }]
            }]
    }]
}

export default nav