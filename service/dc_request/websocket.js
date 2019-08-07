function getData(req, model, fn) {
    let data = {
        reqData: req.params,
        cookies: {
            get(key) {
                return req[key]
            }
        }
    }
    return dcModule[model][fn](data)
}
module.exports = {
    async AgentList(req) {
        return getData(req, 'agent', 'list')
    },
    async JobGetPDCStatus(req) {
        return getData(req, 'Job', 'getPDCStatus')
    },
    async JobStatisticsList(req) {
        return getData(req, 'Job', 'statisticsList')
    },
    async getAllPDCJobStatus(req){ //job流图的运行状态
        return getData(req, 'Job', 'getAllPDCJobStatus')
    },
    async getStatus(req){ //pdf流图的运行状态
        return getData(req, 'PDF', 'getStatus')
    },
    async PDFStatisticsList(req){ //PDF状态列表
        return getData(req, 'Job', 'PDFStatisticsList')
    },
    async PDCRunInfo(req){ //PDC状态列表
        return getData(req, 'Job', 'PDCRunInfo')
    }
}