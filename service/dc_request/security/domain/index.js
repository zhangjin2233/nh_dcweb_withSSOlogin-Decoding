const Class = 'DomainMgr'

module.exports = {
    async list(ctx) {
        let data = await createRequest(Class, 'listAllDomain').send(ctx)
        return data.CONTENT.map(item => {
            return {
                ID: item.ID,
                description: item.description,
                name: item.name,
                parentID: item.parentID
            }
        })
    },
    async all(ctx) {
        let data = (await createRequest(Class, 'listAllDomain').send(ctx)).CONTENT
        let newData = [{
            pId: -1,
            data: []
        }]
        function getNode(item) {
            return {
                label: item.name,
                link: 'domain' + item.ID,
                id: item.ID,
                type: 'dataField',
                children: [],
                description: item.description,
                icon: utils.getNodeIcon('dataField')
            }
        }
        data.forEach(item => {
            let index = newData.findIndex(n => n.pId == item.parentID)
            if(index > -1) {
                newData[index].data.push(getNode(item))
            }else{
                newData.push({
                    pId: item.parentID,
                    data: [getNode(item)]
                })
            }
        })
        newData.forEach(item => {
            item.data.forEach(d => {
                let index = newData.findIndex(n => 'domain' + n.pId === d.link)
                if(index > 0) {
                    d.children = newData[index].data
                }
            })
        })
        if(ctx.reqData.hasRoot) {
            data = [{
                id: 'dataFieldFolder',
                label: '数据域管理',
                link: 'dataFieldFolder',
                type: 'dataFieldFolder',
                children: newData[0].data,
                icon: utils.getNodeIcon('dataFieldFolder')
            }]
        }else {
            data = newData[0].data
        }
        return data
    },
    async update(ctx) {
        let body = ctx.reqData
        let domain = (await createRequest(Class, 'getDomain', { name: body.oldName }).send(ctx)).CONTENT
        domain.name = body.name
        domain.description = body.desc
        await createRequest(Class, 'updateDomain', { domain }).send(ctx)
        return 'OK'
    },
    async create(ctx) {
        let newNewDomain = (await createRequest(Class, 'newDomain').send(ctx)).CONTENT
        return newNewDomain
    }
}