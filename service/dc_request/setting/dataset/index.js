const Class = 'GlobalDataSetDefMgr'
module.exports = {
    async list(ctx) {
        let list = await createRequest(Class, 'listAllGlobalDataSetDef').send(ctx)
        function formatValue(arr) {
            let str = '<'
            arr.forEach(item => {
                str += (item.label || item.name) + ','
            })
            return (str.slice(0, -1) ? str.slice(0, -1) : '<') + '>'
        }
        let tableData = list.CONTENT.map(item => {
            return {
                name: item.name,
                value: formatValue(item.headerDef),
                id: item.ID,
                SMUserID: item.SMUserID,
                SMDomainID: item.SMDomainID
            }
        })
        let tableHead = Table.createHeads(['name', '名称'], ['value', '定义'])
        return {tableData, tableHead}
    },
    async detail(ctx) { 
        let data = null
        if (ctx.reqData.name) {
            data = await createRequest(Class, 'getGlobalDataSetDefByName', { name: ctx.reqData.name }, 'GET', 'form').and(createRequest('EnumDefMgr', 'listAllEnumDef', {}, 'GET', 'option')).coSend(ctx)
        } else {
            data = await createRequest(Class, 'newGlobalDataSetDef', {}, 'GET', 'form').and(createRequest('EnumDefMgr', 'listAllEnumDef', {}, 'GET', 'option')).coSend(ctx)
        }
        let values = data.form.CONTENT
        let option = [{
            label: '文本',
            value: 'String'
        }, {
            label: '布尔值',
            value: 'Boolean'
        }, {
            label: '变量结构',
            value: 'PARAMS_STRUCT'
        }]
        let temOption = data.option.CONTENT.map(item => {
            return {
                label: '枚举: ' + item.localName,
                value: item.localName
            }
        })
        option.push(...temOption)
        let tableData = values.headerDef.map(item=>{
            const enumstr = 'ENUM_';
            if(item.type.substr(0,enumstr.length) == enumstr){
                item.type = item.type.substr(enumstr.length);
            }
            return item;
        })
        let tableHead = Table.createHeads(['name', '列名'], ['label', '标签'], ['type', '逻辑类型', 'singleEnum', option])
        let formData = { name: values.name || 'NewGTable' }
        let structure = [{name: 'name', type: 'string', label: '名字'}]
        return { formData, structure, tableData, tableHead }
    },
    async create(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'newGlobalDataSetDef').send(ctx)).CONTENT
        data.name = body.formData.name
        data.headerDef = body.tableData.map(item => {
            item.id = item.id || -1
            return item
        })
        await createRequest(Class, 'createGlobalDataSetDef', { gDataSetDef: data }, 'POST').send(ctx)
        return 'OK'
    },
    async update(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'getGlobalDataSetDefByName', { name: body.name }).send(ctx)).CONTENT
        data.name = body.formData.name
        data.headerDef = body.tableData.map(item => {
            item.id = item.id || -1
            return item
        })
        await createRequest(Class, 'updateGlobalDataSetDef', { gDataSetDef: data}, 'POST').send(ctx)
        return 'OK'
    },
    async delete(ctx) {
        await createRequest(Class, 'deleteGlobalDataSetDef', { id: ctx.reqData.id }).send(ctx)
        return 'OK'
    },
}