const Class = 'EnumDefMgr'
module.exports = {
    async list(ctx) {
        let list = await createRequest(Class, 'listAllEnumDef').send(ctx)
        let tableData = list.CONTENT.map(item => {
            return {
                Label: item.Lable,
                name: item.localName,
                id: item.ID,
                SMDomainID: item.SMDomainID,
                SMUserID: item.SMUserID
            }
        })
        let tableHead = Table.createHeads(['name', '枚举名'], ['Label', '描述'])
        return {tableData, tableHead}
    },
    async detail(ctx) { //获取单个枚举数据
        let data = null
        if (ctx.reqData.name) {
            data = await createRequest(Class, 'getEnumDefByName', { enumName: ctx.reqData.name }).send(ctx)
        } else {
            data = await createRequest(Class, 'newEnumDef').send(ctx)
        }
        let items = [['localName', '枚举名', 'string', [], ctx.reqData.name ? true : false], ['Lable', '枚举描述', 'textarea']]
        let formData = {}
        let values = data.CONTENT
        let tableData = values.Info
        let structure = items.map(item => {
            if (values[item[0]]) {
                formData[item[0]] = values[item[0]]
            }
            return Form.createRow(...item)
        })
        let tableHead = Table.createHeads(['intValue', '整数值', 'number'], ['name', '英文值'], ['label', '标签'])
        tableHead = JSON.stringify(tableHead).replace(/\\b/g, '')
        tableHead = JSON.parse(tableHead)
        return { formData, structure, tableData, tableHead }
    },
    async create(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'newEnumDef').send(ctx)).CONTENT
        data = Object.assign(data, body.formData)
        data.Info = body.tableData
        await createRequest(Class, 'createEnumDef', { enumDef: data }, 'POST').send(ctx)
        return 'OK'
    },
    async update(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'getEnumDefByName', { enumName: body.formData.localName }).send(ctx)).CONTENT
        data = Object.assign(data, body.formData)
        data.Info = body.tableData
        await createRequest(Class, 'updateEnumDef', { enumDef: data}, 'POST').send(ctx)
        return 'OK'
    },
    async delete(ctx) {
        await createRequest(Class, 'deleteEnumDef', { enumName: ctx.reqData.name }).send(ctx)
        return 'OK'
    },
}