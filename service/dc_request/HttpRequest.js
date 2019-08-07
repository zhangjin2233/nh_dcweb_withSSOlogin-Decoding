const rp = require('request-promise')

class HttpRequest{
    constructor(request) {
        this.method = 'GET'
        this.action = config.action
        this.params = {}
        this.Class = ''
        this.FUNC = ''
        this.respond = {}
        this.address = config.address
        this.sessionId = ''
        this.option = {}
        this.sendParams = []
        this.ignoreError = false
        this.name = 'request' + new Date().getTime()
        this.colletion = [this]
        if(typeof request === 'object') {
            for(let key in request) {
                this[key] = request[key]
            }
        }
    }
    async req(ctx) {
        let url = this.getUrl()
        let obj = {
            uri: url,
            method: this.method,
            headers: { Cookie: `JSESSIONID=${ctx.cookies.get('sessionId')}` }
        }  
        if (this.method.toLowerCase() === 'post') {
            obj.form = {
                FILTER: JSON.stringify(this.params)
            }
        }
        let option = Object.assign(obj, this.option)
        return rp(option)
    }
    async send(ctx) {
        let res = null
        res = await this.req(ctx)
        return new Promise((resolve, reject) => {
            res = JSON.parse(res)
            if (!this.ignoreError && (res.ERR_MSG  || res.STATE !== 1) && ctx) {
                ctx.isError = true
                ctx.body = { ERR_MSG: res.ERR_MSG, url: this.getUrl(), params: typeof this.params === 'object' ? JSON.stringify(this.params) : this.params }
                ctx.status = 500
                if(res.ERR_MSG === '请先登录') {
                    ctx.status = 401
                    ctx.body = res.ERR_MSG
                }
                reject(res)
            }
            resolve(res)
        })
    }
    getUrl() {
        this.Class = dcClass[this.Class] || this.Class;
        if (this.method === 'GET') {
            return `${this.address}?action=${this.action}&Class=${this.Class}&FUNC=${this.FUNC}&FILTER=${encodeURIComponent(JSON.stringify(this.params))}`
            // return `${this.address}?action=${this.action}&Class=${this.Class}&FUNC=${this.FUNC}&FILTER=${JSON.stringify(this.params)}`
        } else if (this.method === 'POST') {
            return `${this.address}?action=${this.action}&Class=${this.Class}&FUNC=${this.FUNC}`
        }
    }
    set(key, val) {
        if(this[key] !== undefined) {
            this[key] = val
        }
    }
    and(req) {
        if(req instanceof HttpRequest) {
            this.colletion.push(req)
        }else if(req instanceof Array) {
            if(req.length > 0) {
                this.colletion.push(...req)
            }
        }else if(typeof req === 'object') {
            this.colletion.push(new HttpRequest(req))
        }
        return this
    }
    async coSend(ctx) {
        try{
            let reqList = this.colletion.map(item => {
                return item.req(ctx)
            })
            let res = await Promise.all(reqList)
            let result = {}
            return new Promise((resolve, reject) => {
                res.forEach((item, index) => {
                    item = JSON.parse(item)
                    if (!this.ignoreError && (item.ERR_MSG  || item.STATE !== 1) && ctx) {
                        ctx.isError = true
                        ctx.body = { ERR_MSG: item.ERR_MSG }
                        ctx.status = 500
                        if(item.ERR_MSG === '请先登录') {
                            ctx.status = 401
                            ctx.body = item.ERR_MSG
                        }
                        reject(item)
                    }
                    result[this.colletion[index].name] = item
                })
                resolve(result)
            })
        }catch(err) {
        }
        return Promise.reject()
    }
}


module.exports = HttpRequest