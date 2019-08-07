const webSockets = {
    AgentList(params) {
        return {
            url: '/AgentList', 
            interval: 4000, 
        }
    },
    JobGetPDCStatus(params) {
        return {
            url: '/JobGetPDCStatus',
            interval: 3000,
            params
        }
    },
    JobStatisticsList(params) {
        return {
            url: '/JobStatisticsList',
            interval: 3000,
            params
        }
    },
    getAllPDCJobStatus(params){ //job流图的运行状态
        return {
            url: '/getAllPDCJobStatus',
            interval: 3000,
            params
        }
    },
    getStatus(params){ //pdf流图的运行状态
        return {
            url: '/getStatus',
            interval: 3000,
            params
        }
    },
    PDFStatisticsList(params){ //PDF状态列表
        return {
            url: '/PDFStatisticsList',
            interval: 3000,
            params
        }
    },
    PDCRunInfo(params){ //PDC状态列表
        return {
            url: '/PDCRunInfo',
            interval: 3000,
            params
        }
    }
}

export default webSockets