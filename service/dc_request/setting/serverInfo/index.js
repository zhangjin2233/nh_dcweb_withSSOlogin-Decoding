const Class = 'ServerInfoMgr'
function formatValue(arr) {
    let str = ''
    let keyType = ['Address', 'Password', 'Port', 'User']
    arr.forEach(item => {
        if(keyType.includes(item.k) && item.v) {
            str += ':' + item.v
        }
    })
    return str
}
module.exports = {
    async list(ctx) {
        let keyword = ctx.reqData.keyword !== undefined ? ctx.reqData.keyword : ''
        let list = await createRequest(Class, 'listServerInfoByKeyword', {keyword}).send(ctx)
        let tableData = list.CONTENT.map(item => {
            return {
                name: item.name,
                value: formatValue(item.value),
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
        let list = await createRequest(Class, 'listServerInfoByCondition', { nvQuery: body || {} }, 'POST').send(ctx)
        list = list.CONTENT.map(item => {
            return {
                name: item.name,
                desc: item.desc ? item.desc : '',
                value: formatValue(item.value)
            }
        })
        let tableHead = Table.createHeads(['name', '变量名'], ['desc', '描述'], ['value', '值'])
        return { tableData: list, tableHead }
    },
    async detail(ctx) { //获取单个服务器数据
        let data = null
        if (ctx.reqData.name) {
            data = await createRequest(Class, 'getServerInfo', { serverName: ctx.reqData.name }).send(ctx)
        } else {
            data = await createRequest(Class, 'newServerInfo').send(ctx)
        }
        let items = [['name', '变量名', 'string', [], ctx.reqData.name ? true : false], ['desc', '描述', 'textarea'], ['Address', '地址'], ['Port', '端口'], ['User', '用户'], ['Password', '密码', 'password']]
        let formData = {}
        let values = data.CONTENT
        let arr = values.value
        let structure = items.map(item => {
            if (values[item[0]]) {
                formData[item[0]] = values[item[0]]
            }else {
                let index = arr.findIndex(a => a.k === item[0])
                index > -1 && (formData[item[0]] = arr[index].v ? arr[index].v : '')
            }
            return Form.createRow(...item)
        })
        let exKeys = ['Address', 'KEY_THIS_CLASS', 'Password', 'Port', 'User']
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
        let data = (await createRequest(Class, 'newServerInfo').send(ctx)).CONTENT
        data.name = body.formData.name
        data.desc = body.formData.desc
        for (let key in body.formData) {
            if(key !== 'name' && key !== 'desc') {
                body.tableData.push({
                    k: key,
                    v: body.formData[key]
                })
            }
        }
        data.value = data.value.concat(body.tableData)
        await createRequest(Class, 'createServerInfo', { newServer: data }, 'POST').send(ctx)
        return 'OK'
    },
    async update(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'getServerInfo', { serverName: body.formData.name }).send(ctx)).CONTENT
        data.desc = body.formData.desc
        for (let key in body.formData) {
            if(key !== 'name' && key !== 'desc') {
                body.tableData.push({
                    k: key,
                    v: body.formData[key]
                })
            }
        }
        data.value = data.value.concat(body.tableData)
        await createRequest(Class, 'updateServerInfo', { serverInfo: data}, 'POST').send(ctx)
        return 'OK'
    },
    async delete(ctx) {
        await createRequest(Class, 'deleteServerInfo', { serverName: ctx.reqData.name }).send(ctx)
        return 'OK'
    },
}