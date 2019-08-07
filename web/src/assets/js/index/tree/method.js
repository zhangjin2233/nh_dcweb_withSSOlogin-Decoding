let getChildren = (node) => {
    let refreshParent = ['SUDF', 'queue', 'user', 'roles', 'dataField']
    if( refreshParent.includes(node.data.type)) {
        node = node.parent
    }
    if(type === 'dataField') {
        while(node.data.type !== 'dataField') {
            node = node.parent
        }
    }
    let data = node.data
    let params = {id: data.id, type: data.type, showDomain: JSON.parse(sessionStorage.getItem('domain'))}
    node.childNodes = []
    let type = data.type.toLowerCase()
    if(type === 'job' || type === 'pdfjob' || type === 'historyjob' || type === 'queuegroup') {
        params = {
            jobId: data.jobId || data.link,
            groupPath: data.groupPath,
            type: data.type,
            showDomain: JSON.parse(sessionStorage.getItem('domain')),
        }
    }
    DCHttp.req({
        url: '/api/catalog/children', 
        params
    }).then(res => {
        data.children = res.data
    })
}
let getParentNode = (node, type='Story', isInclude) => {
    if(isInclude) {
        while(!node.data.type.includes(type)) {
            node = node.parent
        }
    }else {
        while(node.data.type !== type) {
            node = node.parent
        }
    }
   
    return node
}
let getExportParams = (node) => {
    let map = {
        Story: {
            Class: 'StoryMgr',
            FUNC: 'exportStory',
        },
        SDC: {
            Class: 'SDCMgr',
            FUNC: 'exportSDC',
        },
        SDF: {
            Class: 'SDCMgr',
            FUNC: 'exportSDF',
        },
        ADC: {
            Class: 'ADCMgr',
            FUNC: 'exportADC',
        },
        ADF: {
            Class: 'ADCMgr',
            FUNC: 'exportADF',
        },
        CDC: {
            Class: 'CDCMgr',
            FUNC: 'exportCDC',
        },
        CDF: {
            Class: 'CDCMgr',
            FUNC: 'exportCDF',
        },
        PDF: {
            Class: 'PDFMgr',
            FUNC: 'exportPDF',
        },
        SUDF: {
            Class: 'SUDFMgr',
            FUNC: 'exportSUDF'
        }
    }
    let type = node.data.type
    let filter =  map[type][dcConfig.paramsKey] = {}
    type !== 'PDF' ? (filter[type.toLowerCase() + 'Ids'] = [ node.data.link ]) : (map[type][dcConfig.paramsKey] = { pdfId: node.data.link, isExportCdcPdc: true})
    return { params: map[type], url: dcConfig.publicPath }
}
export default {
    refresh() {
        return {
            text: '刷新',
            icon: 'fa fa-refresh',
            iconColor: 'green',
            click(tree) {
                getChildren(tree.currentNode)
                tree.hideMenu()
            }
        }
    },
    rename() {
        return {
            text: '重命名',
            icon: 'fa fa-pencil',
            iconColor: 'blue',
            click(tree) {
                let node = tree.currentNode
                let form = new dc.Form()
                form.set({
                    structure: [{
                        type: 'string',
                        readOnly: false,
                        canBeEmpty: false,
                        name: 'newName',
                        label: '名称',
                        length: 256,
                    }],
                    data: {
                        newName: tree.currentNode.data.label
                    },
                    btns: [{
                        label: '确定',
                        type: 'primary',
                        click(form, btn, index){
                            let data = node.data
                            DCHttp.req({ 
                                url: '/api/catalog/rename',
                                params: {
                                    name: node.label,
                                    newName: form.data.newName,
                                    type: data.type,
                                    id: data.id,
                                    link: data.link,
                                    jobId: data.jobId,
                                    groupPath: data.groupPath
                                }
                            }).then(res => {
                                VUE.$closeDialog()
                                node.data.label = form.data.newName
                            })
                        }
                        }, {
                        label: '取消',
                        click(form,btn,index){
                            VUE.$closeDialog()
                        }
                        }]
                })
                VUE.$openDialog({
                    title: '重命名',
                    width: '400px',
                    component: 'dc-form',
                    data: {
                        object: form
                    }
                })
            }
        }
    },
    delete() {
        return {
            text: '删除',
            icon: 'fa fa-minus-square',
            iconColor: 'red',
            click(tree) {
                let data = tree.currentNode.data
                let node = tree.currentNode
                let str = ''
                if(data.type === 'Story') {
                    str = '删除Story属于危险操作，将导致底下的所有数据一同被删除。您确定要删除所选的Story吗？'
                }else if(data.type.includes('Folder')) {
                    str = '此操作将永久删除该文件夹, 是否继续?'
                }else if(data.type === 'queue') {
                    str = '此操作将永久删除该队列, 是否继续?'
                }else if(data.type === 'user') {
                    str = '此操作将永久删除该用户组及所有组内的用户，是否继续？'
                }else if(data.type === 'dataField') {
                    str = '此操作将永久删除当前数据域及子数据域，是否继续？'
                }
                else{
                    str = `此操作将永久删除该${data.type}, 是否继续?`
                }
                VUE.$confirm(str, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).then(() => {
                    DCHttp.req({ 
                        url: '/api/catalog/delete',
                        params: {
                            type: data.type,
                            id: data.id,
                            link: data.link,
                            jobId: data.jobId,
                            groupPath: data.groupPath,
                            name: data.label
                        }
                    }).then(res => {
                        VUE.$closeDialog()
                        let index = tree.defaultExpandedKeys.findIndex(i => i === data.id)
                        index > -1 && tree.defaultExpandedKeys.splice(index, 1)
                        getChildren(node.parent)
                    })
                }).catch(() => {})
            }
        }
    },
    create(type='') {
        let label = type
        let structure = [{
            type: 'string',
            canBeEmpty: false,
            name: 'name',
            label: '名称',
        }]
        if(type === 'Story') {
            structure.push({
                type: 'string',
                canBeEmpty: true,
                name: 'enLabel',
                label: '英文名',
            })
        }else if(type === 'queue') {
            structure.push({
                type: 'number',
                canBeEmpty: true,
                name: 'threadNum',
                label: '并发数',
            })
        } 
        let otherFolder = ['userFolder', 'dataFieldFolder']
        if(type.includes('Folder') && !otherFolder.includes(type)) {
            label = '文件夹'
        }else if(type === 'queueGroup') {
            label = '队列组'
        }else if(type === 'queue') {
            label = '队列'
        }else if(type === 'userFolder') {
            label = '用户组'
            structure.push({
                type: 'textarea',
                canBeEmpty: false,
                name: 'desc',
                label: '描述',
            })
        }else if(type === 'dataFieldFolder' || type === 'dataField') {
            label = '数据域'
            structure.push({
                type: 'textarea',
                canBeEmpty: false,
                name: 'desc',
                label: '描述',
            })
        }
        return {
            text: '创建' + label,
            icon: 'fa fa-plus',
            iconColor: 'green',
            click(tree) {
                let form = new dc.Form()
                let node = tree.currentNode
                form.set({
                    structure,
                    data: {
                        threadNum: 1
                    },
                    btns: [{
                        label: '确定',
                        type: 'primary',
                        click(form){
                            let storyId
                            let pLink
                            let data = node.data
                            let pId = data.id
                            if(type === 'ADF' || type === 'SDF') {
                                storyId = getParentNode(node).data.link
                            }else if(type == 'CDF') {
                                pLink = getParentNode(node, 'ADF').data.link
                            }else if(type == 'PDF') {
                                pLink = getParentNode(node, 'CDF').data.link
                            }
                            if(!data.type.includes('Folder') && !data.type.includes('Root') && data.type !== 'dataField') {
                                pId = undefined
                            }
                            let params = {
                                storyId,
                                pId,
                                jobId: data.jobId || data.link,
                                groupPath: data.groupPath,
                                type,
                                pLink: pLink,
                                threadNum: form.data.threadNum
                            }
                            DCHttp.req({
                                url: '/api/catalog/create',
                                params: Object.assign(params, form.data)
                            }).then(res => {
                                VUE.$closeDialog()
                                getChildren(node)
                            }).catch(err => {
                                try {
                                    VUE.$message.error(err.response.data.ERR_MSG)
                                }catch(err) {}
                                
                            })
                        }
                        }, {
                            label: '取消',
                            click(form,btn,index){
                                VUE.$closeDialog()
                            }
                        }]
                })
                VUE.$openDialog({
                    title: '创建' + label,
                    width: '400px',
                    component: 'dc-form',
                    data: {
                        object: form
                    }
                })
            }
        }
    },
    move(text) {
        return {
            text: text || '移动到文件夹',
            icon: 'fa fa-sign-out',
            iconColor: 'blue',
            click(tree) {
                let newTree = new dc.Tree({
                    height: '200px',
                    expandAll: true,
                    selectionKey: 'link',
                })
                let node = tree.currentNode
                let data = node.data
                if(data.type === 'queue') {
                    newTree.lazy = true
                    newTree.loadType = ['queueGroup']
                    newTree.loadNode = (node, resolve) => {
                        let data = node.data
                        let type = data.type.toLowerCase()
                        let params = {
                            id: data.id
                        }
                        if(type === 'queuegroup') {
                            params = {
                                jobId: data.jobId,
                                groupPath: data.groupPath,
                                type
                            }
                        }
                        DCHttp.req({url: '/api/catalog/children', params}).then(res => {
                            let list = res.data.filter(item => {
                                return item.type !== 'queue'
                            })
                            resolve(list)
                        }).catch(err => {
                            resolve([])
                        })
                    }
                }
                DCHttp.req({
                    url: '/api/catalog/folderTree',
                    params: {
                        type: data.type,
                        storyCatalogId: getParentNode(node).data.id,
                        jobId: data.jobId,
                        jobCatalogId: data.type === 'queue' ?  getParentNode(node, 'Job', true).data.id : undefined
                    }
                }).then(res => {
                    newTree.data = res
                })
                VUE.$openDialog(new dc.Dialog({
                title: '移动到文件夹',
                component: 'dc-tree',
                width: '480px',
                hasBtn: true,
                btnGroup: [{
                    text: '确定',
                    type: 'primary',
                    click() {
                        let dsNode = newTree.get('nodeSelection')[0]
                        DCHttp.req({
                            url: '/api/catalog/moveNode',
                            params: {
                                catalogId: data.id,
                                folderId: dsNode.id,
                                type: data.type,
                                jobId: data.jobId,
                                groupPath: data.groupPath,
                                dstGroupPath: dsNode.groupPath,
                                name: data.label
                            }
                        }).then(res => {
                            VUE.$closeDialog()
                            if(data.type !== 'queue') {
                                getChildren(getParentNode(node, data.type + 'Root'))
                            }else {
                                getChildren(getParentNode(node, 'Job', true))
                            }
                            
                        })
                    }
                    }, {
                        text: '取消',
                        click() {
                            VUE.$closeDialog()
                        }
                    }],
                    data: {
                        object: newTree
                    }
                    }))
                }
            }
    },
    export(type = '') {
        return {
            text: '导出' + type,
            icon: 'fa fa-download',
            iconColor: 'blue',
            click(tree) {
                DCHttp.export(getExportParams(tree.currentNode))
                tree.hideMenu()
            },
        }
    },
    editJob(handle, catalogType) {
        let types = {
            create: {
                text: '新增',
                name: 'add',
                icon: 'fa fa-plus',
                color: 'green'
            },
            update: {
                text: '修改',
                name: 'edit',
                icon: 'fa fa-edit',
                color: 'blue'
            }
        }
        return {
            text: types[handle].text + 'Job',
            icon: types[handle].icon,
            iconColor: types[handle].color,
            click(tree) {
                let node = tree.currentNode
                let story = tree.getParentNode(node, 'Story')
                let parentId = node.parent.data.link
                VUE.$openDialog(new dc.Dialog({
                    title: types[handle].text + 'Job',
                    width: '500px',
                    component: 'jobForm',
                    data: {
                        type: types[handle].name,
                        storyId: story.data.link,
                        tree: tree,
                        node: node,
                        catalogId: catalogType === 'folder' ? node.data.id : undefined,
                        refreshNode: getChildren,
                        jobId: catalogType === 'Job' || catalogType === 'historyJob' ? node.data.link : undefined,
                        jobName: handle === 'create' ? undefined : node.label,
                        catalogType,
                        parentId
                    }
                }))  
            }
    }
    },
    createSUDF(type) {
        return {
            text: '创建SUDF',
            icon: 'fa fa-plus',
            iconColor: 'green',
            click(tree) {
                let storyNode = tree.getParentNode(tree.currentNode.data.link, 'Story')
                DCHttp.req({
                    url: '/api/SUDF/create',
                    params: {
                        storyId: storyNode.data.link,
                        catalogId: type === 'root' ? undefined : tree.currentNode.data.id
                    }
                }).then(res => {
                    getChildren(tree.currentNode)
                    VUE.$store.commit('handleSUDFTabs', 'add', {
                        name: res.name
                    })
                    VUE.$store.commit('handleSUDFTabs', {
                        type: 'add', val: {
                            name: res.name,
                            raw: res,
                            code: res.code,
                            arguments: res.arguments,
                            label: res.label,
                            desc: res.desc
                        }
                    })
                    VUE.$router.push({ path: '/sudf', query: { label: 'SUDF' } })
                })
            }
    }
    },
    update(type) {
        let option = {
            user: {
                url: '/api/user/updateGroup',
                label: '修改用户级'
            },
            domain: {
                url: '/api/domain/update',
                label: '修改数据域'
            }
        }
        return {
            text: '修改',
            icon: 'fa fa-edit',
            iconColor: 'blue',
            click(tree) {
                let node = tree.currentNode
                let form = new dc.Form()
                form.set({
                    structure: [{
                        type: 'string',
                        readOnly: false,
                        canBeEmpty: false,
                        name: 'newName',
                        label: '名称',
                        length: 256,
                    }, {
                        type: 'string',
                        readOnly: false,
                        canBeEmpty: false,
                        name: 'desc',
                        label: '描述',
                        length: 256,
                    }],
                    data: {
                        newName: tree.currentNode.data.label,
                        desc: tree.currentNode.data.description
                    },
                    btns: [{
                        label: '确定',
                        type: 'primary',
                        click(form, btn, index){
                            let data = node.data
                            DCHttp.req({ 
                                url: option[type].url,
                                params: {
                                    desc: form.data.desc,
                                    name: form.data.newName,
                                    id: data.link,
                                    oldName: data.label
                                }
                            }).then(res => {
                                VUE.$closeDialog()
                                node.data.label = form.data.newName
                                node.data.description = form.data.desc
                            })
                        }
                        }, {
                        label: '取消',
                        click(form,btn,index){
                            VUE.$closeDialog()
                        }
                    }]
                })
                VUE.$openDialog({
                    title: option[type].label,
                    width: '400px',
                    component: 'dc-form',
                    data: {
                        object: form
                    }
                })
            }
        }
    },
    domain() {
        return {
            text: '绑定数据域',
            icon: 'fa fa-building-o',
            iconColor: 'green',
            show() {
                return dcConfig.customModule.securityManager
            },
            click(tree) {
                let node = tree.currentNode
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
                                        id: node.data.id === node.data.link ? node.data.id : node.data.link,
                                        domainId: dsDomain.id
                                    }
                                }
                            }).then(res => {
                                VUE.$successMessage('绑定成功')
                                VUE.$closeDialog()
                                JSON.parse(sessionStorage.getItem('domain')) && getChildren(node.parent)
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
    }
}