const Class = 'SystemMgr'

module.exports = {
    async detail(ctx) {
        let formData = (await createRequest(Class, 'getBackupTaskConfig').send(ctx)).CONTENT
        let option1 = Array.apply(null, {length: 48}).map((item, index) => {
            let i = index % 2
            let value = `${((index - i) / 2 + '').length > 1 ? (index - i) / 2 : '0' + (index - i) / 2}:${i === 0 ? '00' : '30'}`
            return {
                value,
                label: value
            }
        })
        let option2 = Array.apply(null, { length: 12 }).map((item, index) => {
            let value = index + 1
            return {
                value,
                label: value
            }
        })
        let items = [['backupFilePath', '归档路径（服务器）'], ['enable', '是否启用自动备份', 'boolean'], ['scheduleTime', '每天何时归档', 'singleEnum', option1], ['keepMonth', '保留前几个月', 'singleEnum', option2]]
        let structure = items.map(item => {
            return Form.createRow(...item)
        })
        return { formData, structure }
    },
    async update(ctx) {
        let body = ctx.reqData
        await createRequest(Class, 'saveBackupTaskConfig', { backupConfig: body.formData }).send(ctx)
        return 'OK'
    },
    async manualBackup(ctx) {
        await createRequest(Class, 'manualBackup').send(ctx)
        return 'OK'
    }
}