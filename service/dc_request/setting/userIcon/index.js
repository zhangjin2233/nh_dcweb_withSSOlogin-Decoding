const Class = 'UserIconMgr'
module.exports = {
    async list(ctx) {
        let list = await createRequest(Class, 'listAllIcon').send(ctx)
        let tableData = list.CONTENT
        let tableHead = Table.createHeads(['iconName', '名字'], ['imageData', '图标'])
        return {tableData, tableHead}
    },
    async delete(ctx) {
        await createRequest(Class, 'deleteIcon', { iconName: ctx.reqData.name }).send(ctx)
        return 'OK'
    },
}