const Class = 'ResourcePoolMgr'
module.exports = {
    async list(ctx) {
        let list = await createRequest(Class, 'listAllResourcePools', {}, 'GET', 'data').and(createRequest(Class, 'listAllResourcePool', {}, 'GET', 'pools')).coSend(ctx)
        let pools = list.pools.CONTENT
        let tableData = list.data.CONTENT.map(item => {
            let index = pools.findIndex(p => p.resName === item.name)
            let used = pools[index].used
            pools.splice(index, 1)
            return {
                status: [used, parseInt(item.poolSize)],
                name: item.name,
                poolSize: item.poolSize,
                id: item.ID,
                SMDomainID: item.SMDomainID,
                SMUserID: item.SMUserID
            }
        })
        let tableHead = Table.createHeads(['name', '资源池'], ['status', '状态'])
        return {tableData, tableHead}
    },
    async create(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'newResourcePool').send(ctx)).CONTENT
        data = Object.assign(data, body)
        await createRequest(Class, 'createResourcePool', { res: data }, 'POST').send(ctx)
        return 'OK'
    },
    async update(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'getResourcePoolByName', { resName: body.name }).send(ctx)).CONTENT
        body.newName && (data.name = body.newName) 
        data.poolSize = body.poolSize
        await createRequest(Class, 'updateResourcePool', { res: data}, 'POST').send(ctx)
        return 'OK'
    },
    async delete(ctx) {
        let data = (await createRequest(Class, 'getResourcePoolByName', { resName: ctx.reqData.name }).send(ctx)).CONTENT
        await createRequest(Class, 'deleteResourcePool', { resId: data.ID }).send(ctx)
        return 'OK'
    },
    async listForBind(ctx) {
        let list = await createRequest(Class, 'listAllResourcePools', {}, 'GET', 'data').and(createRequest(Class, 'listAllResourcePool', {}, 'GET', 'pools')).coSend(ctx)
        let pools = list.pools.CONTENT
        let tableData = list.data.CONTENT.map(item => {
            let index = pools.findIndex(p => p.resName === item.name)
            let used = pools[index].used
            pools.splice(index, 1)
            return {
                status: [used, parseInt(item.poolSize)],
                name: item.name,
                poolSize: item.poolSize,
                id: item.ID,
                count: 0
            }
        })
        let tableHead = Table.createHeads(['name', '资源池', 'span'], ['status', '状态', 'span'], ['count', '申请数', 'number'])
        return {tableData, tableHead}
    }
}