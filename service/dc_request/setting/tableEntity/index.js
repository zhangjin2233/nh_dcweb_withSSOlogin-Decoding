const Class = 'TableEntityDefMgr'
module.exports = {
    async list(ctx) {
        let list = await createRequest(Class, 'listAllTableEntityDef').send(ctx)
        let tableData = list.CONTENT.map(item => {
            return {
                label: item.Lable ? item.Lable  : '',
                name: item.localName,
                id: item.ID,
                SMDomainID: item.SMDomainID,
                SMUserID: item.SMUserID
            }
        })
        let tableHead = Table.createHeads(['name', '实体类型'], ['label', '描述'])
       return {tableData, tableHead}
    },
    async detail(ctx) { //获取单个枚举数据
        let data = null
        if (ctx.reqData.name) {
            data = await createRequest(Class, 'getTableEntityDef', { tableEntityDefName: ctx.reqData.name }, 'GET', 'form').and(createRequest('EnumDefMgr', 'listAllEnumDef', {}, 'GET', 'option')).and(createRequest(Class, 'getFixedAttr', {}, 'GET', 'attrs')).coSend(ctx)
        } else {
            data = await createRequest(Class, 'newTableEntityDef', {}, 'GET', 'form').and(createRequest('EnumDefMgr', 'listAllEnumDef', {}, 'GET', 'option')).coSend(ctx)
        }
        let items = [['localName', '实体类型', 'string'], ['Lable', '枚举类型描述', 'textarea']]
        let formData = {}
        let values = data.form.CONTENT
        let tableData = values.attributes
        if(data.attrs) {
            let readOnlyKeys = data.attrs.CONTENT
            tableData = tableData.map(item => {
                if(readOnlyKeys.includes(item.name)) {
                    item.READONLY = true
                }
                return item
            })
        }
        
        let structure = items.map(item => {
            if (values[item[0]]) {
                formData[item[0]] = values[item[0]]
            }
            return Form.createRow(...item)
        })
        let option = [{
            label: '字符串',
            value: 'String'
        }, {
            label: '布尔值',
            value: 'Boolean'
        }, {
            label: '短整数',
            value: 'Integer'
        }, {
            label: '整数',
            value: 'Long'
        }, {
            label: '小数',
            value: 'Double'
        }]
        let temOption = data.option.CONTENT.map(item => {
            return {
                label: item.localName + '(枚举)',
                value: item.localName,
            }
        })
        option.push(...temOption)
        let tableHead = Table.createHeads(['name', '字段名称'], ['label', '中文名称'], ['desc', '描述'], 
            ['dataType', '数据类型', 'singleEnum', option], ['size', '长度', 'number'], ['canBeEmpty', '允许空值', 'boolean'])
       return { formData, structure, tableData, tableHead }
    },
    async create(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'newTableEntityDef').send(ctx)).CONTENT
        data = Object.assign(data, body.formData)
        data.attributes = body.tableData
        await createRequest(Class, 'createTableEntityDef', { entityDef: data }, 'POST').send(ctx)
        return 'OK'
    },
    async update(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'getTableEntityDef', { tableEntityDefName: body.name }).send(ctx)).CONTENT
        data = Object.assign(data, body.formData)
        data.attributes = body.tableData
        await createRequest(Class, 'updateTableEntityDef', { entityDef: data }, 'POST').send(ctx)
        return 'OK'
    },
    async delete(ctx) {
        await createRequest(Class, 'deleteTableEntityDef', { tableEntityDefName: ctx.reqData.name }).send(ctx)
        return 'OK'
    },
}