

let Class = 'CatalogMgr'
const treeConfig = require('../../conf/dc_tree.json')
let getPid = (PDN) => {
    let pIds = PDN.split(';')
    return pIds[pIds.length - 1]
}
let getCatalog = (id, name = 'catalog') => { //获取目录对象
    return new HttpRequest({
        name: name,
        Class: Class,
        FUNC: 'getCatalog',
        params: {
            catalogId: id
        }
    })
}

function domainString(data, item) {
    if(!data) {
        return ''
    }
    let user = data.user.find(u => u.id == item.SMUserID)
    let domain = data.domain.find(d => d.ID == item.SMDomainID)
    return `(${ user ? user.name : '-' }@${ domain ? domain.name : '-' })`
}

module.exports = {
    async storyList(ctx) { //获取story的列表
        let rootCatalog = await new HttpRequest({
            Class: Class,
            FUNC: 'getRootCatalog',
        }).send(ctx)
        let children = await new HttpRequest({
            Class: Class,
            FUNC: 'listChildCatalogWithData',
            params: {
                catalog: rootCatalog.CONTENT
            }
        }).send(ctx)
        let domainData = null
        if(ctx.reqData.showDomain) {
            domainData = await this.userAndDomain(ctx)
        }
        let storyList = children.CONTENT.map(item => {
            return {
                pId: getPid(item.left.PDN),
                label: item.right.name + domainString(domainData, item.right),
                id: item.left.ID,
                link: item.right.ID,
                type: item.left.nodeType,
                children: [],
                SMDomainID: item.right.SMDomainID,
                SMUserID: item.right.SMUserID,
                icon: utils.getNodeIcon(item.left.nodeType)
            }
        })
        let project = {
            children: storyList,
            id: rootCatalog.CONTENT.ID,
            label: 'Story列表',
            link: rootCatalog.CONTENT.ID,
            type: 'Project',
            icon: utils.getNodeIcon('Project')
        }
        let data = [ project ]
        if(ctx.reqData.showSecurity) {
            data.push(await this.securityList(ctx))
        }
        return { data }
    },
    async children(ctx) { //获取目录子节点
        let id = ctx.reqData.id
        let type = ctx.reqData.type && ctx.reqData.type.toLowerCase()
        let groupPath = ctx.reqData.groupPath || ''
        let children = []
        let jobId = ctx.reqData.jobId
        let domainData = null
        if(ctx.reqData.showDomain) {
            domainData = await this.userAndDomain(ctx)
        }
        if(type === 'job' || type === 'pdfjob' || type === 'historyjob' || type === 'queuegroup') {
            groupPath.charAt(0) === '/' && (groupPath = groupPath.slice(1))
            let historyJob = null
            if(type === 'job' || type === 'pdfjob') {
                children = (await createRequest('JobMgr', 'listChildQueue', { jobId: jobId, groupPath}, 'POST', 'queue')
                        .and(createRequest('JobMgr', 'listChildQueueGroup', { jobId: jobId, groupPath}, 'POST', 'group'))
                        .and(createRequest('JobMgr', 'getJob', {jobID: jobId}, 'GET', 'job' )).coSend(ctx))
                historyJob = (await createRequest('JobMgr', 'listAllHistoryJob', {mainJob: children.job.CONTENT}, 'POST').send(ctx)).CONTENT
            }else if(type === 'historyjob') {
                children = (await createRequest('JobMgr', 'listChildQueue', { jobId: jobId, groupPath}, 'POST', 'queue')
                        .and(createRequest('JobMgr', 'listChildQueueGroup', { jobId: jobId, groupPath}, 'POST', 'group'))
                        .and(createRequest('JobMgr', 'getJob', {jobID: jobId}, 'GET', 'job' )).coSend(ctx))
            }else {
                children = (await createRequest('JobMgr', 'listChildQueue', { jobId: jobId, groupPath}, 'POST', 'queue')
                        .and(createRequest('JobMgr', 'listChildQueueGroup', { jobId: jobId, groupPath}, 'POST', 'group')).coSend(ctx))
            }
            let queues = children.queue.CONTENT.map(item => {
                return {
                    label: item.name,
                    id: item.ID,
                    link: item.ID,
                    jobId: jobId,
                    groupPath: groupPath || '',
                    type: 'queue',
                    poolSize: item.maxRunSize,
                    children: [],
                    SMDomainID: item.SMDomainID,
                    SMUserID: item.SMUserID,
                    active: item.Status == 0 ? false : true,
                    icon: utils.getNodeIcon('queue', item.Status),
                    isLeaf: utils.setLazyNode('queue')
                }
            })
            let groups = children.group.CONTENT.map(item => {
                return {
                    label: item.slice(item.lastIndexOf('/') + 1),
                    id: item,
                    groupPath: item,
                    type: 'queueGroup',
                    jobId: jobId,
                    SMDomainID: item.SMDomainID,
                    SMUserID: item.SMUserID,
                    children: [],
                    icon: utils.getNodeIcon('queueGroup')
                }
            })
            children = []
            if(historyJob) {
                historyJob.forEach(item => {
                    children.push({
                        label: item.name + domainString(domainData, item),
                        id: item.ID,
                        link: item.ID,
                        poolSize: item.MaxPoolSize,
                        active: item.Status === 'active' ? true : false,
                        type: 'HistoryJob',
                        SMDomainID: item.SMDomainID,
                        SMUserID: item.SMUserID,
                        children: [],
                        icon: utils.getNodeIcon('HistoryJob', item.Status),
                    })
                })
            }
            children.push(...groups)
            children.push(...queues)
        }else if(type === 'project') {
            return {data: (await this.storyList(ctx)).data[0].children}
        }else if(type === 'security') {
            children = (await this.securityList(ctx)).children
        }else if(type === 'userfolder') {
            children = await dcModule.user.listGroup(ctx)
        }else if(type === 'datafieldfolder') {
            children = await dcModule.domain.all(ctx)
        }else {
            let parent = id && await getCatalog(id).send(ctx)
            children = (await new HttpRequest({
                name: 'catelogChild',
                Class: Class,
                FUNC: 'listChildCatalogWithData',
                params: {
                    catalog: parent.CONTENT
                }
            }).send(ctx)).CONTENT
            children = children.reduce((data, item) => {
                let left = item.left
                let right = item.right || item.left
                if(!treeConfig.hidden.includes(left.nodeType)) {
                    data.push({
                        pId: getPid(left.PDN),
                        label: (dcsConfig[left.nodeType] ? dcsConfig[left.nodeType] : (right.label || right.name || right.guid)) + domainString(domainData, item.left),
                        id: left.ID,
                        link: right.ID,
                        type: left.nodeType,
                        name: right.name,
                        jobId: left.nodeType.includes('Job') ? right.ID : undefined,
                        poolSize: right.MaxPoolSize !== undefined ? right.MaxPoolSize : undefined,
                        children: [],
                        active: right.Status ? (right.Status === 'active' ? true : false) : undefined,
                        icon: utils.getNodeIcon(left.nodeType, right.Status),
                        isLeaf: utils.setLazyNode(left.nodeType),
                        SMDomainID: right.SMDomainID,
                        SMUserID: right.SMUserID,
                    })
                }
                return data
            }, [])
        }
        return  {data: children}
    },
    async create(ctx) { //创建目录
        let type = ctx.reqData.type
        let param = []
        let name = ctx.reqData.name
        let pId = ctx.reqData.pId
        let parentCatalog = null
        if(type === 'PDF') {
            let CDF = (await createRequest('CDCMgr', 'getCDF', { cdfId: ctx.reqData.pLink}).send(ctx)).CONTENT
            param = ['PDFMgr', 'createPDF', { cdf: CDF, pdfName: name }, 'POST']
            pId && (parentCatalog = true)
        }else if(type === 'CDF') {
            let ADF = (await createRequest('ADCMgr', 'getADF', { adfId: ctx.reqData.pLink }).send(ctx)).CONTENT
            param = ['CDCMgr', 'createCDF', { cdfName: name, adf: ADF }, 'POST']
            pId && (parentCatalog = true)
        }else if(type === 'ADF') {
            let data = await createRequest('StoryMgr', 'getStory', {storyId: ctx.reqData.storyId}, 'POST', 'story')
                        .and(createRequest('ADCMgr', 'newADF', {}, 'GET', 'newADF')).coSend(ctx)
            param = ['ADCMgr', 'createADF', { story: data.story.CONTENT, adfName: name, adf: data.newADF.CONTENT }]
            pId && (parentCatalog = true)
        }else if(type === 'SDF') {
            let data = await createRequest('StoryMgr', 'getStory', {storyId: ctx.reqData.storyId}, 'POST', 'story')
                        .and(createRequest('SDCMgr', 'newSDF', {}, 'GET', 'newSDF')).coSend(ctx)
            pId && (parentCatalog = (await createRequest(Class, 'getCatalog', { catalogId: pId }).send(ctx)).CONTENT)
            param = ['SDCMgr', 'createSDF', { story: data.story.CONTENT, sdfName: name, sdf: data.newSDF.CONTENT }]
            pId && (parentCatalog = true)
        }else if(type === 'queueGroup') {
            param = ['JobMgr', 'createQueueGroup', {jobId: ctx.reqData.jobId, groupPath: (ctx.reqData.groupPath ? ctx.reqData.groupPath + '/': '') + name}]
        }else if(type === 'queue') {
            let groupPath = (ctx.reqData.groupPath && ctx.reqData.groupPath.charAt(0) === '/') ? ctx.reqData.groupPath.slice(1) : ''
            param = ['JobMgr', 'createQueue', { jobId: ctx.reqData.jobId, groupPath, queueName: name, threadNum: parseInt(ctx.reqData.threadNum) }]
        }else if(type === 'Story') {
            param = ['StoryMgr', 'createStory', { storyName: name, enLabel: ctx.reqData.enLabel, desc: '' }]
        }else if(type === 'userFolder') {
            let userGroup = (await createRequest('UserMgr', 'newUserGroup').send(ctx)).CONTENT
            userGroup.name = ctx.reqData.name
            userGroup.description = ctx.reqData.desc
            param = ['UserMgr', 'createUserGroup', {userGroup}]
        }else if(type === 'dataField') {
            let domain = (await createRequest('DomainMgr', 'newDomain').send(ctx)).CONTENT
            domain.name = ctx.reqData.name
            domain.description = ctx.reqData.desc
            domain.parentID = ctx.reqData.pId === 'dataFieldFolder' ? -1 : ctx.reqData.pId 
            param = ['DomainMgr', 'createDomain', { domain }]
        }else {
            param = [Class, 'createCatalog', { nodeType: type, name: name, pCatalogId: pId } ]
        }
        let res = (await createRequest(...param).send(ctx)).CONTENT
        if(parentCatalog) {
            let catalogs = await createRequest(Class, 'getCatalogByRealMoId', { nodeType: type, realMoId: res.ID }, 'GET', 'node').and(createRequest(Class, 'getCatalog', { catalogId: pId }, 'GET', 'parent')).coSend(ctx)
            await createRequest(Class, 'moveCatalog', {nodeType: type, catalog: catalogs.node.CONTENT, targetCatalog: catalogs.parent.CONTENT}, 'POST').send(ctx)
        }
        return 'OK!'
    },
    async rename(ctx) { //重命名目录
        let type = ctx.reqData.type && ctx.reqData.type.toLowerCase()
        let param = []
        if(type === 'story') {
            param = ['StoryMgr', 'renameStory', {
                    storyName: ctx.reqData.name,
                    newStoryName: ctx.reqData.newName
                }]
        } else if(type === 'sdf') {
            let SDF = (await createRequest('SDCMgr', 'getSDF', { sdfId: ctx.reqData.link }).send(ctx)).CONTENT
            SDF.name = ctx.reqData.newName
            param = ['SDCMgr', 'updateSDF', {sdf: SDF}, 'POST']
        }else if(type === 'adf') {
            let ADF = (await createRequest('ADCMgr', 'getADF', { adfId: ctx.reqData.link }).send(ctx)).CONTENT
            ADF.name = ctx.reqData.newName
            param = ['ADCMgr', 'updateADF', {adf: ADF}, 'POST']
        }else if(type === 'cdf') {
            let CDF = (await createRequest('CDCMgr', 'getCDF', { cdfId: ctx.reqData.link }).send(ctx)).CONTENT
            CDF.name = ctx.reqData.newName
            param = ['CDCMgr', 'updateCDF', {cdf: CDF}, 'POST']
        }else if(type === 'pdf') {
            param = ['PDFMgr', 'renamePDF', { pdfName: ctx.reqData.name, newPdfName: ctx.reqData.newName}, 'POST']
        }else if(type === 'queuegroup') {
            ctx.reqData.groupPath.charAt(0) === '/' && (ctx.reqData.groupPath = ctx.reqData.groupPath.slice(1))
            param = ['JobMgr', 'renameQueueGroup', {jobId: ctx.reqData.jobId, groupPath: ctx.reqData.groupPath, newGroupName: ctx.reqData.newName}]
        }else {
            let catalog = (await getCatalog(ctx.reqData.id).send(ctx)).CONTENT
            param = [Class, 'renameCatalog', {catalog: catalog, newName: ctx.reqData.newName}]
        }
        await createRequest(...param).send(ctx)
        return 'OK'
    },
    async delete(ctx) { //删除目录
        let type = ctx.reqData.type && ctx.reqData.type.toLowerCase() 
        let param = []
        let link = ctx.reqData.link
        if(type === 'story') {
            param = ['StoryMgr', 'deleteStory', {storyId: link }]
        }else if(type === 'sdc') {
            param = ['SDCMgr', 'deleteSDC', { sdcId: link }]
        }else if(type === 'sdf') {
            param = ['SDCMgr', 'deleteSDF', { sdfId: link }]
        }else if(type === 'adc') {
            param = ['ADCMgr', 'deleteADC', { adcId: link }]
        }else if(type === 'adf') {
            param = ['ADCMgr', 'deleteADF', { adfId: link }]
        }else if(type === 'cdc') {
            param = ['CDCMgr', 'deleteCDC', { cdcId: link }]
        }else if(type === 'cdf') {
            param = ['CDCMgr', 'deleteCDF', { cdfId: link }]
        }else if(type === 'pdc') {
            param = ['PDCMgr', 'deletePDC', { pdcId: link }]
        }else if(type === 'cdf') {
            param = ['PDFMgr', 'deletePDF', { pdfId: link }]
        }else if(type === 'sudf') {
            param = ['SUDFMgr', 'deleteUDF', { udfId: link }]
        }else if(type === 'job' || type === 'historyjob' || type === 'pdfjob') {
            param = ['JobMgr', 'deleteJob', { jobId: link }]
        }else if(type === 'queuegroup') {
            param = ['JobMgr', 'deleteQueueGroup', {jobId: ctx.reqData.jobId, groupPath: ctx.reqData.groupPath}]
        }else if(type === 'queue') {
            param = ['JobMgr', 'deleteQueue', {jobId: ctx.reqData.jobId, groupPath: ctx.reqData.groupPath, queueName: ctx.reqData.name}]
        }else if(type === 'user') {
            param = ['UserMgr', 'deleteUserGroup', { groupId: parseInt(link) }]
        }else if(type === 'datafield') {
            param = ['DomainMgr', 'deleteDomain', { domainId: parseInt(ctx.reqData.id) }]
        }else {
            let catalog = (await getCatalog(ctx.reqData.id).send(ctx)).CONTENT
            param = [Class, 'deleteCatalog', {catalog: catalog}]
        }
        await createRequest(...param).send(ctx)
        return 'OK'
    },
    async folderTree(ctx) { //获取某种类型文件夹树结构
        let type = ctx.reqData.type
        let list
        if(type === 'queue') {
            let jobId = ctx.reqData.jobId
            if(jobId === ctx.reqData.jobCatalogId) {
                list = await createRequest('JobMgr', 'listChildQueueGroup', { jobId: jobId, groupPath: ''}, 'GET','group')
                        .and(createRequest('JobMgr', 'getHistoryJob', { historyJobId: jobId}, 'GET', 'job')).coSend(ctx)
            }else {
                list = await createRequest('JobMgr', 'listChildQueueGroup', { jobId: jobId, groupPath: ''}, 'GET','group')
                        .and(createRequest(Class, 'getCatalogAndData', { catalogId: ctx.reqData.jobCatalogId }, 'GET', 'job')).coSend(ctx)
            }
            let group = list.group.CONTENT.map(item => {
                return {
                    label: item.slice(item.lastIndexOf('/') + 1),
                    id: item,
                    groupPath: item,
                    type: 'queueGroup',
                    jobId: jobId,
                    children: [],
                    icon: utils.getNodeIcon('queueGroup'),
                }
            })
            let job = list.job.CONTENT
            let nodeType = job.left ? job.left.nodeType : 'HistoryJob'
            let Status = job.Status || job.right.Status
            return [{
                label: job.name || job.right.name,
                type: nodeType,
                id: job.ID || job.left.ID,
                link: job.ID || job.right.ID,
                children: group,
                icon: utils.getNodeIcon(nodeType),
                active: Status == 0 ? false : true,
                groupPath: '',
            }]
        }else {
            let story = (await createRequest(Class, 'getCatalog', { catalogId: ctx.reqData.storyCatalogId }).send(ctx)).CONTENT
            let list = (await createRequest(Class, 'listChildCatalogByType', {catalog: story, nodeType: type + 'Folder'}, 'GET', 'folders')
                        .and(createRequest(Class, 'listChildCatalogByType', {catalog: story, nodeType: type + 'Root'}, 'GET', 'root')).coSend(ctx))
            let root = list.root.CONTENT[0]
            list = list.folders.CONTENT
            let tree = [{
                pId: getPid(root.PDN),
                label: root.name,
                id: root.ID,
                link: root.ID,
                type: root.nodeType,
                children: [],
                icon: utils.getNodeIcon(root.nodeType),
            }]
            let findChild = (tree) => {
                tree.forEach(node => {
                    list = list.filter((child, index) => {
                        let pId = getPid(child.PDN)
                        if(node.id === pId) {
                            node.children.push({
                                pId,
                                label: child.name,
                                id: child.ID,
                                link: child.ID,
                                type: child.nodeType,
                                children: [],
                                icon: utils.getNodeIcon(child.nodeType),
                            })
                            return false
                        }
                        return true
                    })
                    if(node.children.length > 0 && list.length > 0) {
                        findChild(node.children)
                    }
                })
            }
            findChild(tree)
            return tree
        }
        
    },
    async moveNode(ctx) { //移动文件夹操作
        let type = ctx.reqData.type
        if(type === 'queue') {
            let groupPath = ctx.reqData.groupPath
            let dstGroupPath = ctx.reqData.dstGroupPath
            groupPath && groupPath.charAt(0) === '/' ? groupPath = groupPath.slice(1) : ''
            dstGroupPath && dstGroupPath.charAt(0) === '/' ? dstGroupPath = dstGroupPath.slice(1) : ''
            await createRequest('JobMgr', 'moveQueue2Group', {jobId: ctx.reqData.jobId, groupPath, queueName: ctx.reqData.name, dstGroupPath}).send(ctx)
        }else {
            let data = await createRequest(Class, 'getCatalog', { catalogId: ctx.reqData.catalogId }, 'GET', 'catalog')
            .and(createRequest(Class, 'getCatalog', { catalogId: ctx.reqData.folderId }, 'GET', 'targetCatalog')).coSend(ctx)
            let catalog = data.catalog.CONTENT
            let targetCatalog = data.targetCatalog.CONTENT
            await createRequest(Class, 'moveCatalog', {nodeType: ctx.reqData.type, catalog, targetCatalog}, 'POST').send(ctx)
        }
        return 'OK'
    }, 
    async nodeTree(ctx) { //获取某种类型的节点
        let type = ctx.reqData.type
        let storyId = ctx.reqData.storyId
        let all = {
            SDC: 'SDCRoot',
            ADC: 'ADCRoot',
            CDC: 'ADCRoot',
            PDC: 'ADCRoot',
            SDF: 'SDFRoot',
            ADF: 'ADFRoot',
            CDF: 'ADFRoot',
            PDF: 'ADFRoot',
            UDF: 'SUDFRoot',
        }
        if(storyId) {
            let story = await createRequest(Class, 'getCatalogByRealMoId', {nodeType: 'Story', realMoId: storyId}, 'GET', 'catalog')
                        .and(createRequest('StoryMgr', 'getStory', {storyId: storyId}, 'GET', 'data')).coSend(ctx)
            let rootNode = (await createRequest(Class, 'listChildCatalogByType', { catalog: story.catalog.CONTENT, nodeType: all[type] }).send(ctx)).CONTENT[0]
            ctx.reqData.id = rootNode.ID
            let nodes = await this.children(ctx)
            story = {
                id: story.catalog.CONTENT.ID,
                link: story.data.CONTENT.ID,
                label: story.data.CONTENT.name,
                type: 'Story',
                children: nodes.data,
                icon: utils.getNodeIcon('Story')
            }
            return [story]
        }else {
            let root = (await createRequest(Class, 'getRootCatalog').send(ctx)).CONTENT
            let data = await Promise.all([createRequest(Class, 'listChildCatalogByType', { catalog: root, nodeType: all[type]}).send(ctx), this.storyList(ctx)])
            let storyList = data[1].data[0].children
            let rootNodes = data[0].CONTENT
            rootNodes.forEach(item => {
                let index = storyList.findIndex(s => item.PDN.includes(s.id))
                storyList[index].id = item.ID
            })
            return storyList
        }
    }, 
    async securityList(ctx) {
        return {
            children: [{
                id: 'userFolder',
                label: '用户管理',
                link: 'userFolder',
                type: 'userFolder',
                children: [],
                icon: utils.getNodeIcon('userFolder')
            }, {
                id: 'roles',
                label: '角色管理',
                link: 'roles',
                type: 'roles',
                icon: utils.getNodeIcon('roles'),
                children: [],
                isLeaf: true
            }, {
                id: 'dataFieldFolder',
                label: '数据域管理',
                link: 'dataFieldFolder',
                type: 'dataFieldFolder',
                children: [],
                icon: utils.getNodeIcon('dataFieldFolder')
            }],
            id: 'security',
            label: '安全管理',
            link: 'security',
            type: 'security',
            icon: utils.getNodeIcon('security')
        }
    },
    async userAndDomain(ctx) {
        let data = await Promise.all([dcModule.user.list(ctx), dcModule.domain.list(ctx)])
        return {
            user: data[0],
            domain: data[1]
        }
    }
}