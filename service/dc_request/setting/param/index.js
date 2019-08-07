const Class = 'ParamMgr'
module.exports = {
    async list(ctx) {
        let nv = ctx.reqData.keyword !== undefined ? {
            type: 'or',
            value: [{
                type: 'like',
                isIgnoreCase: true,
                name: 'name',
                value: '%' + ctx.reqData.keyword + '%'
            }, {
                type: 'like',
                isIgnoreCase: true,
                name: 'desc',
                value: '%' + ctx.reqData.keyword + '%'
            }] 
        } : {}
        let orderBy = ctx.reqData.orderBy ? JSON.parse(ctx.reqData.orderBy) : undefined
        if(orderBy) {
            let arr = []
            for (let key in orderBy) {
                arr.push({
                    name: key,
                    isAsc: orderBy[key]
                })
            }
            orderBy = arr[0]
        }
        let list = []
        if(nv !== undefined || orderBy !== undefined) {
            if(!orderBy) {
                orderBy = {
                    name: 'name',
                    isAsc: false
                }
            }
            list = await createRequest(Class, 'listParamsByCondition', {nv, orderBy}, 'POST').send(ctx)
        }else {
            list = await createRequest(Class, 'listAllParams').send(ctx)
        }
        let tableData = list.CONTENT.map(item => {
            return {
                desc: item.desc,
                name: item.name,
                format: item.format,
                method: item.method,
                params: item.params,
                id: item.ID,
                SMDomainID: item.SMDomainID,
                SMUserID: item.SMUserID
            }
        })
        let tableHead = Table.createHeads(['name', '名称'], ['desc', '描述'], ['format', '格式'], ['method', '方法'], ['params', '参数'])
        return {tableData, tableHead}
    },
    async detail(ctx) { //获取单个参数定义数据
        let data = null
        if (ctx.reqData.name) {
            data = await createRequest(Class, 'getParamByName', { name: ctx.reqData.name }, 'GET', 'list')
                    .and(createRequest(Class, 'getFormats', {}, 'GET', 'formats'))
                    .and(createRequest(Class, 'getMethods', {}, 'GET', 'params')).coSend(ctx)
        } else {
            data = await createRequest(Class, 'newParam', {}, 'GET', 'list')
            .and(createRequest(Class, 'getFormats', {}, 'GET', 'formats'))
            .and(createRequest(Class, 'getMethods', {}, 'GET', 'params')).coSend(ctx)
        }
        let options = [data.params.CONTENT, data.formats.CONTENT]
        options = options.map(item => {
            let arr = []
            for (let key in item) {
                arr.push({
                    label: item[key],
                    value: key
                })
            }
            return arr
        })
        let items = [['name', '名称'], ['desc', '描述', 'textarea'], ['format', '格式', 'singleEnum', options[1]], ['method', '取值方法', 'singleEnum', options[0]]]
        let formData = {}
        let values = data.list.CONTENT
        ctx.reqData.name || (values.method = 'getConstant')
        let tableData = []
        let ParamMetaOfMethod = (await createRequest(Class, 'getParamMetaOfMethod', { method: values.method }).send(ctx)).CONTENT
        tableData = ParamMetaOfMethod.map((item, index) => {
            return {
                name: item,
                value: values.params ? values.params[index] : ''
            }
        })
        let structure = items.map(item => {
            if (values[item[0]]) {
                formData[item[0]] = values[item[0]]
            }
            return Form.createRow(...item)
        })

        let tableHead = Table.createHeads(['name', '参数', 'span'], ['value', '值'])
        return { formData, structure, tableData, tableHead }
    },
    async create(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'newParam').send(ctx)).CONTENT
        data = Object.assign(data, body.formData)
        data.params = body.tableData.map(item => item.value)
        await createRequest(Class, 'createParam', { param: data }, 'POST').send(ctx)
        return 'OK'
    },
    async update(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'getParamByName', { name: body.name }).send(ctx)).CONTENT
        data = Object.assign(data, body.formData)
        data.params = body.tableData.map(item => item.value)
        await createRequest(Class, 'updateParam', { param: data}, 'POST').send(ctx)
        return 'OK'
    },
    async delete(ctx) {
        let data = await createRequest(Class, 'getParamByName', { name: ctx.reqData.name }).send(ctx)
        await createRequest(Class, 'deleteParam', { param: data.CONTENT }).send(ctx)
        return 'OK'
    },
    async testParams(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'getParamByName', { name: body.name }).send(ctx)).CONTENT
        data = Object.assign(data, body.formData)
        data.params = body.tableData.map(item => item.value)
        return (await createRequest(Class, 'evalValue', { param: data, timeMills: new Date().getTime()}, 'POST').send(ctx)).CONTENT
        
    }
}