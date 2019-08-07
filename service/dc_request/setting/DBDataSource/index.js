const Class = 'DBDataSourceMgr'
module.exports = {
    async list(ctx) { //创建story
        let keyword = ctx.reqData.keyword
        let list =  await createRequest(Class, 'listDBDataSourceByKeyword', { keyword: keyword ? keyword : ''}).send(ctx)
        if(list.CONTENT instanceof Array) {
            list = list.CONTENT.map(item => {
                return {
                    name: item.name,
                    desc: item.desc ? item.desc : '',
                    dbUrl: item.value.dbUrl,
                    id: item.ID,
                    SMDomainID: item.SMDomainID,
                    SMUserID: item.SMUserI
                }
            })
        }
        let tableHead = Table.createHeads(['name', '变量名'], ['desc', '描述'], ['dbUrl', '值'])
        return {
            tableHead: tableHead,
            tableData: list
        }
    },
    async detail(ctx) { //获取单个数据源数据
        let db = null
        if(ctx.reqData.name) {
            db = await createRequest(Class, 'getDBDataSource', { dsName: ctx.reqData.name }).send(ctx)
        }else{
            db = await createRequest(Class, 'newDBDataSource', ).send(ctx)
        }
        let dbOptions = (await createRequest(Class, 'getSupportDBOptions').send(ctx)).CONTENT
        let dbTypes = dbOptions.map(item => {
            return {
                label: item.dbType,
                value: item.dbType
            }
        } )
        let items = [['name', '变量名', 'string', [], ctx.reqData.name ? true : false], ['desc', '描述', 'textarea'], ['dbType', '数据库类型', 'singleEnum', dbTypes], ['driverClass', '驱动'], ['dbUrl', '字符连接串(URL)'], ['user', '用户'], ['password', '密码', 'password']]
        let formData = {}
        let values = db.CONTENT
        let structure = items.map(item => {
            formData[item[0]] = values.value[item[0]] ? values.value[item[0]] : values[item[0]]
            return Form.createRow(...item)
        })
        let tableData = values.value.userMap
        let tableHead = Table.createHeads(['k', '键'], ['v', '值'])
        return { formData, structure, tableData, tableHead, dbOptions}
    },
    async update(ctx) {//更新数据源
        let body = ctx.reqData
        let db = await createRequest(Class, 'getDBDataSource', { dsName: body.formData.name }).send(ctx)
        db.CONTENT.value.userMap = body.tableData
        for (let key in body.formData) {
            if (db.CONTENT.value.hasOwnProperty(key)) {
                db.CONTENT.value[key] = body.formData[key]
            } else if (key === 'name' || key === 'desc') {
                db.CONTENT[key] = body.formData[key]
            }
        }
        await createRequest(Class, 'updateDBDataSource', { dataSource: db.CONTENT }, 'POST').send(ctx)
        return 'OK'
    },
    async create(ctx) {
        let body = ctx.reqData
        let db = await createRequest(Class, 'newDBDataSource').send(ctx)
        db.CONTENT.value.userMap = body.tableData
        for (let key in body.formData) {
            if (db.CONTENT.value.hasOwnProperty(key)) {
                db.CONTENT.value[key] = body.formData[key]
            } else if (key === 'name' || key === 'desc') {
                db.CONTENT[key] = body.formData[key]
            }
        }
        await createRequest(Class, 'createDBDataSource', { ds: db.CONTENT }, 'POST').send(ctx)
        return 'OK'
    },
    async delete(ctx) {
        await createRequest(Class, 'deleteDBDataSource', { dsName: ctx.reqData.name }).send(ctx)
        return 'OK'
    },
    async listByFilter(ctx) {
        let body = ctx.reqData
        body = advanceFilter.getFilter(body)
        let list = await createRequest(Class, 'listDBDataSourceByCondition', { nvQuery: body || {}}, 'POST').send(ctx)
        list = list.CONTENT.map(item => {
            return {
                name: item.name,
                desc: item.desc ? item.desc : '',
                dbUrl: item.value.dbUrl
            }
        })
        let tableHead = Table.createHeads(['name', '变量名'], ['desc', '描述'], ['dbUrl', '值'])
        return  {tableData: list, tableHead} 
    },
    async testConnect(ctx) {
        let body = ctx.reqData
        let db = await createRequest(Class, 'newDBDataSource').send(ctx)
        db.CONTENT.value.userMap = body.tableData
        for (let key in body.formData) {
            if (db.CONTENT.value.hasOwnProperty(key)) {
                db.CONTENT.value[key] = body.formData[key]
            } else if (key === 'name' || key === 'desc') {
                db.CONTENT[key] = body.formData[key]
            }
        }
        await createRequest(Class, 'testConnectDB', { ds: db.CONTENT }, 'POST').send(ctx)
        return 'OK'
    }
}