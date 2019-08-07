const Class = 'AgentMgr'
module.exports = {
    async list(ctx) {
        let list = await createRequest(Class, 'listAllAgentStatus').send(ctx)
        let tableData = list.CONTENT.map(item => {
            item.memory = [item.memoryUsed / 1000 / 1000, item.memoryMax / 1000 / 1000]
            return item
        })
        let tableHead = Table.createHeads(['name', '代理程序'], ['isConnected', '状态'], ['IPAddr', 'IP地址'], ['RMIPort', '端口'], ['isOnline', '在线'], ['loadding', '负载'], ['startTime', '启动时间'], ['processId', '进程号'], ['threadCount', '线程数'], ['memory', '内存'], ['detail', '详情'])
        return {tableData, tableHead}
    },
    async detail(ctx) {
        let data = null
        if (ctx.reqData.name) {
            data = await createRequest(Class, 'getAgent', { agentName: ctx.reqData.name }).send(ctx)
        } else {
            data = await createRequest(Class, 'newAgent').send(ctx)
        }
        let ApplicationType = [{
            label: '传统代理',
            value: 'Traditional'
        }, {
            label: '流式代理',
            value: 'Streaming'
        }, {
            label: '调度中心',
            value: 'FlowCenter'
        }]
        let items = [['Application', '代理机类型', 'singleEnum', ApplicationType], ['name', '名称'], ['isLocalHost', '是否本机代理', 'boolean'], ['IPAddr', 'IP地址'], ['RMIPort', '端口'], ['sshUser', '用户'], ['sshPwd', '密码'], ['sshJDKPath', 'JDK路径'], ['sshDstPath', '安装目录'], ['useKeyFile', '是否使用授权文件登陆']]
        let formData = {}
        let values = data.CONTENT
        let structure = items.map(item => {
            if (values[item[0]]) {
                formData[item[0]] = values[item[0]]
            }
            return Form.createRow(...item)
        })
        return { formData, structure }
    },
    async create(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'newAgent').send(ctx)).CONTENT
        data = Object.assign(data, body.formData)
        let res = await createRequest(Class, 'createAgent', { agent: data }, 'POST').send(ctx)
        return 'OK'
    },
    async update(ctx) {
        let body = ctx.reqData
        let data = (await createRequest(Class, 'getAgent', { agentName: body.name}).send(ctx)).CONTENT
        data = Object.assign(data, body.formData)
        let res = await createRequest(Class, 'updateAgent', { agent: data}, 'POST').send(ctx)
        return 'OK'
    },
    async delete(ctx) {
        await createRequest(Class, 'deleteAgent', { agentName: ctx.reqData.name }).send(ctx)
        return 'OK'
    },
    async jobAgentsList(ctx) {
        let body = ctx.reqData
        let keyword = body.keyword || ''
        let data = (await createRequest(Class, 'listAgent', { keyword }).send(ctx)).CONTENT
        let list = await this.list(ctx)
        let tableData = list.tableData.filter(item => {
            let index = data.findIndex(d => item.name === d.name)
            if(index > -1) {
                data.splice(index, 1)
                return true
            }
        })
        let showCols = [ 'name', 'isConnected', 'loadding', 'memory']
        let tableHead = list.tableHead.filter(item => {
            return showCols.includes(item.name)
        })
        return { tableHead, tableData }   
    }
}