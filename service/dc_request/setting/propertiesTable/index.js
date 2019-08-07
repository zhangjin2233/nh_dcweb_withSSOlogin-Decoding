const Class = 'PropertiesTableMgr'
function formatValue(arr) {
    let str = ''
    arr.length > 0 && arr.forEach(item => {
        str += `[${item.k}]=${item.v},`
    })
    return str ? str.slice(0, -1) : str
}
module.exports = {
    async list(ctx) {
        let keyword = ctx.reqData.keyword !== undefined ? ctx.reqData.keyword : ''
        let list = await createRequest(Class, 'listPropertiesTableByKeyword', {keyword}).send(ctx)
        let tableData = list.CONTENT.map(item => {
            return {
                name: item.name,
                value: formatValue(item.value.filter((item, index) => index !== 0)),
                desc: item.desc ? item.desc : '',
                id: item.ID,
                SMDomainID: item.SMDomainID,
                SMUserID: item.SMUserID
            }
        })
        let tableHead = Table.createHeads(['name', '变量名'], ['desc', '描述'], ['value', '值'])
        return {tableData, tableHead}
    },
    async listByFilter(ctx) {
        let body = ctx.reqData
        body = advanceFilter.getFilter(body)
        let list = await createRequest(Class, 'listPropertiesTableByCondition', { nvQuery: body || {} }, 'POST').send(ctx)
        list = list.CONTENT.map(item => {
            return {
                name: item.name,
                desc: item.desc ? item.desc : '',
                value: formatValue(item.value.filter((item, index) => index !== 0)),
            }
        })
        let tableHead = Table.createHeads(['name', '变量名'], ['desc', '描述'], ['value', '值'])
        return { tableData: list, tableHead }
    },
    async detail(ctx) { //获取单个服务器数据
        let data = null
        if (ctx.reqData.name) {
            data = await createRequest(Class, 'getPropertiesTable', { propTblName: ctx.reqData.name }).send(ctx)
        } else {
            data = await createRequest(Class, 'newPropertiesTable').send(ctx)
        }
        let items = [['name', '变量名', 'string', [], ctx.reqData.name ? true : false], ['desc', '描述', 'textarea']]
        let formData = {}
        let values = data.CONTENT
        let arr = values.value
        let structure = items.map(item => {
            if (values[item[0]]) {
                formData[item[0]] = values[item[0]]
            }
            return Form.createRow(...item)
        })
        let exKeys = ['KEY_THIS_CLASS']
        let tableData = arr.filter(item => {
            if (!exKeys.includes(item.k)) {
                return true
            }
            return false
        })
        let tableHead = Table.createHeads(['k', '键'], ['v', '值'])
        return { formData, structure, tableData, tableHead }
    },
    async create(ctx) {
        let body = ctx.reqData
        let data = { name: body.formData.name, desc: body.formData.desc ? body.formData.desc : '', properties: body.tableData }
        await createRequest(Class, 'createPropertiesTable', data, 'POST').send(ctx)
        return 'OK'
    },
    async update(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'getPropertiesTable', { propTblName: body.formData.name }).send(ctx)).CONTENT
        data.desc = body.formData.desc
        for (let key in body.formData) {
            if(key !== 'name' && key !== 'desc') {
                body.tableData.push({
                    k: key,
                    v: body.formData[key]
                })
            }
        }
        data.value = [data.value[0]].concat(body.tableData)
        await createRequest(Class, 'updatePropertiesTable', { propTbl: data}, 'POST').send(ctx)
        return 'OK'
    },
    async delete(ctx) {
        await createRequest(Class, 'deletePropertiesTable', { propTblName: ctx.reqData.name }).send(ctx)
        return 'OK'
    },
}