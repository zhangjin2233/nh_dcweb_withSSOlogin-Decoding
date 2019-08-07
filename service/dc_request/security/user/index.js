const Class = 'UserMgr'

module.exports = {
    async list(ctx) {
        let data = await createRequest(Class, 'listAllUser').send(ctx)
        return data.CONTENT.map(item => {
            return {
                firstLoginChangePassword: item.firstLoginChangePassword,
                fullName: item.fullName,
                genderLabel: item.genderLabel,
                groupId: item.groupId,
                id: item.id,
                locked: item.locked,
                name: item.name,
                password: item.password
            }
        })
    },
    async listGroup(ctx) {
        let data = await createRequest(Class, 'listAllUserGroups').send(ctx)
        return data.CONTENT.map(item => {
            return {
                label: item.name,
                description: item.description,
                id: item.ID,
                type: 'user',
                link: item.ID,
                icon: utils.getNodeIcon('user'),
                isLeaf: true
            }
        })
    },
    async updateGroup(ctx) {
        let body = ctx.reqData
        let userGroup = (await createRequest(Class, 'getUserGroup', { groupId: parseInt(body.id) }).send(ctx)).CONTENT
        userGroup.name = body.name
        userGroup.description = body.desc
        await createRequest(Class, 'updateUserGroup', { userGroup }).send(ctx)
        return 'OK'
    },
    async listUserInGroup(ctx) {
        let tableData = (await createRequest(Class, 'listUserInGroup', { groupId: ctx.reqData.id }).send(ctx)).CONTENT
        let tableHead = Table.createHeads(['name', '用户名'], ['fullName', '姓名'], ['genderLabel', '性别'], ['email', '邮箱'], ['phone', '电话'], ['locked', '状态'])
        return {
            tableData,
            tableHead
        }
    },
    async createAndUpdate(ctx) {
        let body = ctx.reqData
        let newUser = null
        let func = ''
        if(body.id !== undefined) {
            func = 'updateUser'
            newUser = (await createRequest(Class, 'getUser', { userId: parseInt(body.id) }).send(ctx)).CONTENT
        }else {
            func = 'createUser'
            newUser = (await createRequest(Class, 'newUser').send(ctx)).CONTENT
        }
        for(let key in newUser) {
            if(key === 'roles') continue
            body[key] !== undefined && (newUser[key] = body[key])
        }
        return  await createRequest(Class, func, {
            user: newUser,
            roles: body.roles
        }, 'POST').send(ctx)
    },
    async listRoles(ctx) {
        let id = parseInt(ctx.reqData.id)
        let list = (await createRequest('RoleMgr', 'listAllRole').send(ctx)).CONTENT
        let role = null
        if(id) {
            role = (await createRequest(Class, 'getUserAndRoles', { userId: id }).send(ctx)).CONTENT
        }
        return {
            list: list.map(item => { return { label: item.name, value: JSON.stringify(item) } }),
            roles: role ? role.right.map(item => JSON.stringify(item)) : []
        }
    }
}