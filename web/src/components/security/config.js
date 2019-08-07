let method = {
    initData(table) {
        let url = ''
        let params = {}
        params.id = VUE.$route.query.id
        let type = VUE.$route.query.type
        if(type === 'user') {
            url = '/api/user/listUserInGroup'
        }else {
            url = '/api/role/list'
        }
        DCHttp.req({
            url,
            params
        }).then(res => {
            table.tableHead = res.tableHead
            table.tableData = res.tableData
            table.currentRow = null
        })
       
    },
    refresh(type) {
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
        let handle = {
            user(table) {
                 DCHttp.req({
                    url: '/api/user/listRoles'
                }).then(res => {
                    let form = new dc.Form({
                        size: 'mini',
                        inline: true,
                        inputStyle: 'width: 180px',
                        structure: [{
                            name: 'name',
                            label: '用户名',
                            type: 'string'
                        }, {
                            name: 'fullName',
                            label: '姓名',
                            type: 'string'
                        }, {
                            name: 'password',
                            label: '密码',
                            type: 'password'
                        }, {
                            name: 'locked',
                            label: '状态',
                            type: 'singleEnum',
                            option: [{
                                value: false,
                                label: '解锁'
                            }, {
                                value: true,
                                label: '锁定'
                            }]
                        }, {
                            name: 'firstLoginChangePassword',
                            label: '首次登陆',
                            type: 'singleEnum',
                            option: [{
                                value: true,
                                label: '修改密码'
                            }, {
                                value: false,
                                label: '直接进入'
                            }]
                        },  {
                            name: 'gender',
                            label: '性别',
                            type: 'singleEnum',
                            option: [{
                                value: 0,
                                label: '男'
                            }, {
                                value: 1,
                                label: '女'
                            }]
                        }, {
                            name: 'phone',
                            label: '电话',
                            type: 'string'
                        }, {
                            name: 'email',
                            label: '邮箱',
                            type: 'string'
                        }, {
                            name: 'groupId',
                            label: '用户组',
                            readOnly: true,
                            type: 'singleEnum',
                            option: [{
                                label: VUE.$route.query.label,
                                value: VUE.$route.query.id
                            }]
                        }, {
                            name: 'roles',
                            label: '角色',
                            type: 'quickselect',
                            option: res.list
                        }],
                        data: {
                            firstLoginChangePassword: true,
                            locked: false,
                            gender: 0,
                            groupId: VUE.$route.query.id,
                            roles: []
                        }
                    })
                    let dialog = new dc.Dialog({
                        title: '新建用户',
                        component: 'dc-form',
                        width: '600px',
                        data: {
                            object: form
                        },
                        hasBtn: true,
                        btnGroup: [{
                            text: '确定',
                            type: 'primary',
                            click() {
                                DCHttp.req({
                                    url: '/api/user/createAndUpdate',
                                    params: form.data
                                }).then(res => {
                                    VUE.$closeDialog()
                                    table.initData(table)
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
                })
                
            },
            roles(table) {
                let dialog = new dc.Dialog({
                    title: '新增角色',
                    width: '700px',
                    component: 'addRole',
                    top: '2vh',
                    data: {
                        table
                    }
                })
                VUE.$openDialog(dialog)
            }
        }
        return {
            icon: 'fa fa-plus',
            title: '新增',
            color: 'green',
            click(data, row, head, table) {
                handle[type](table)
            }
        }
    },
    update(type) {
         let handle = {  
            user(table) {
                let row = JSON.parse(JSON.stringify(table.currentRow))
                DCHttp.req({
                    url: '/api/user/listRoles',
                    params: {
                        id: row.id
                    }
                }).then(res => {
                    row.roles = res.roles
                    let form = new dc.Form({
                        size: 'mini',
                        inline: true,
                        inputStyle: 'width: 180px',
                        structure: [{
                            name: 'name',
                            label: '用户名',
                            readOnly: true,
                            type: 'string'
                        }, {
                            name: 'fullName',
                            label: '姓名',
                            type: 'string'
                        }, {
                            name: 'password',
                            label: '密码',
                            type: 'password'
                        }, {
                            name: 'locked',
                            label: '状态',
                            type: 'singleEnum',
                            option: [{
                                value: false,
                                label: '解锁'
                            }, {
                                value: true,
                                label: '锁定'
                            }]
                        }, {
                            name: 'firstLoginChangePassword',
                            label: '首次登陆',
                            type: 'singleEnum',
                            option: [{
                                value: true,
                                label: '修改密码'
                            }, {
                                value: false,
                                label: '直接进入'
                            }]
                        },  {
                            name: 'gender',
                            label: '性别',
                            type: 'singleEnum',
                            option: [{
                                value: 0,
                                label: '男'
                            }, {
                                value: 1,
                                label: '女'
                            }]
                        }, {
                            name: 'phone',
                            label: '电话',
                            type: 'string'
                        }, {
                            name: 'email',
                            label: '邮箱',
                            type: 'string'
                        }, {
                            name: 'email',
                            label: '邮箱',
                            type: 'string'
                        }, {
                            name: 'groupId',
                            label: '用户组',
                            readOnly: true,
                            type: 'singleEnum',
                            option: [{
                                label: VUE.$route.query.label,
                                value: parseInt(VUE.$route.query.id)
                            }]
                        }, {
                            name: 'roles',
                            label: '角色',
                            type: 'quickselect',
                            option: res.list
                        }],
                        data: row
                    })
                    let dialog = new dc.Dialog({
                        title: '新建用户',
                        component: 'dc-form',
                        width: '600px',
                        data: {
                            object: form
                        },
                        hasBtn: true,
                        btnGroup: [{
                            text: '确定',
                            type: 'primary',
                            click() {
                                DCHttp.req({
                                    url: '/api/user/createAndUpdate',
                                    params: form.data
                                }).then(res => {
                                    VUE.$closeDialog()
                                    table.initData(table)
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
                })
            },
            roles(table) {
                let row = table.currentRow
                DCHttp.req({
                    url: '/api/role/getPrivilegeAndDomain',
                    params: {
                        id: row.ID
                    }
                }).then(res => {
                    let dialog = new dc.Dialog({
                        title: '编辑角色',
                        width: '700px',
                        component: 'addRole',
                        top: '2vh',
                        data: {
                            form: {
                                name: row.name,
                                desc: row.description
                            },
                            selection: res,
                            row,
                            table
                        }
                    })
                    VUE.$openDialog(dialog)
                })
            }
        }
        return {
            icon: 'fa fa-edit',
            title: '修改',
            color: 'blue',
            needRow: true,
            click(data, row, head, table) {
                handle[type](table)
            }
        }
    },
    delete(type) {
        return {
            icon: 'fa fa-times',
            title: '删除',
            color: 'red',
            needRow: true,
            click(data, row, head, table) {
                let type = VUE.$route.query.type
                let params
                if(type === 'user') {
                    params = {
                        Class: 'UserMgr',
                        FUNC: 'deleteUser',
                        [dcConfig.paramsKey]: {
                            userId: row.id
                        }
                    }
                }else {
                    params = {
                        Class: 'RoleMgr',
                        FUNC: 'deleteRole',
                        [dcConfig.paramsKey]: {
                            roleId: row.ID
                        }
                    }
                } 
                VUE.$confirm('你确定要删除所选的对象以及其子对象吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                    }).then(() => {
                        DCHttp.req({
                            url: dcConfig.publicPath,
                            params
                        }).then(res => {
                            method.initData(table)
                        }).catch(err => {
                            VUE.$message.error(err.ERR_MSG)
                        })  
                }).catch(() => {})
            }
        }
    },
    lock: {
        icon: 'fa fa-lock',
        title: 'lock',
        color: 'blue',
        needRow: true,
        click(data, row, head, table) {
            DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                    Class: 'UserMgr',
                    FUNC: 'lockUser',
                    [dcConfig.paramsKey]: {
                        userIds: table.rowClickSelections.map(item => item.id),
                        blLock: true
                    }
                }
            }).then(res => {
                VUE.$successMessage('锁定成功')
            }).catch(err => {
                VUE.$message.error(err.ERR_MSG)
            })
        } 
    },
    unlock: {
        icon: 'fa fa-unlock',
        title: 'unlock',
        color: 'red',
        needRow: true,
        click(data, row, head, table) {
             DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                    Class: 'UserMgr',
                    FUNC: 'lockUser',
                    [dcConfig.paramsKey]: {
                        userIds: table.rowClickSelections.map(item => item.id),
                        blLock: false
                    }
                }
            }).then(res => {
                VUE.$successMessage('解锁成功')
            }).catch(err => {
                VUE.$message.error(err.ERR_MSG)
            })
        } 
    },
    assign: {
        icon: 'fa fa-users',
        title: 'Assign User',
        color: 'blue',
        needRow: true,
        click(data, row, head, table) {
            let dialog = new dc.Dialog({
                title: 'Assign User',
                width: '780px',
                component: 'assignUsers',
                data: {
                    row
                }
            })
            VUE.$openDialog(dialog)
        } 
    }
}



let option = {
    user(table) {
        return {
            btnGroup: [method.refresh('user'), method.add('user'), method.update('user'), method.delete('user'), method.lock, method.unlock],
            initData: method.initData,
            filterSetting: [{
                prop: 'locked',
                value: false,
                show(val) {
                    if(val) {
                        return '锁定'
                    }
                    return '解锁'
                }
            }],
            rowDbClick(data, row, head) {
                method.update('user').click(data, row, head, table)
            }
        }
        
    },
    roles(table) {
        return {
            btnGroup: [method.refresh('roles'), method.add('roles'), method.update('roles'), method.delete('roles'), method.assign],
            initData: method.initData,
            filterSetting: [{
                prop: 'system',
                value: false,
                show(val) {
                    if(val) {
                        return '系统'
                    }
                    return '自定义'
                }
            }],
            rowDbClick(data, row, head) {
                method.update('roles').click(data, row, head, table)
            }
        }
        
    }
}

export default option