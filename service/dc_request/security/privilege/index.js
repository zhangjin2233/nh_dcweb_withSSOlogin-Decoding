const Class = 'com.leavay.dc.security.PrivilegeMgr'

module.exports = {
    async tree(ctx) {
        let data = await createRequest(Class, 'getPrivilegeTree').send(ctx)
        return data
    }
}