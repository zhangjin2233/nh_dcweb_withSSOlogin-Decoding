const Class = 'com.leavay.dc.security.RoleMgr'

module.exports = {
    async list(ctx) {
        let tableData = (await createRequest(Class, 'listAllRole').send(ctx)).CONTENT
        return {
            tableData,
            tableHead: Table.createHeads(['name', '名称'], ['description', '描述'], ['system', '状态'])
        }
    },
    async createAndUpdate(ctx) {
        let body = ctx.reqData
        let newRole = null
        if(body.id) {
            newRole = (await createRequest(Class, 'getRole', { roleId: body.id }).send(ctx)).CONTENT
            newRole.name = body.name
            newRole.description = body.desc
            newRole = (await createRequest(Class, 'updateRole', { role: newRole,  privileges: body.privilege || []}, 'POST').send(ctx)).CONTENT
        }else {
            newRole = (await createRequest(Class, 'createRole', {
                role: {
                    system: false,
                    name: body.name,
                    description: body.desc,
                    ID: -1,
                    status: 0,
                    ClassName: "com.leavay.dc.security.Role"
                },
                privileges: body.privilege || []
            }, 'POST').send(ctx)).CONTENT
        }
       
        await createRequest(Class, 'assignDomain', {
            role: newRole,
            domainIds: body.domain
        }).send(ctx)
        return 'OK'
    },
    async getPrivilegeAndDomain(ctx) {
        let data = (await createRequest(Class, 'getRoleAndPrivilege', { roleId:  ctx.reqData.id }).send(ctx)).CONTENT
        let role = data.left
        let domain = (await createRequest(Class, 'listDomainsByRole', { role }).send(ctx)).CONTENT
        let privileges = data.right
        return {
            domain, privileges
        }
    }
}