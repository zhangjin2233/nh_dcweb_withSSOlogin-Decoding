const fs = require('fs')
let reqPost = async (ctx, fn) => {
    let body = ''
    ctx.req.on('data', (data) => {
        body += data
    })
    return new Promise((resolve, reject) => {
        ctx.req.on('end', async () => {
            fn(body, resolve)
        })
    })
}
router.post('/test/saveDoc', async (ctx, next) => {
    try {
        let res = await reqPost(ctx, async (body, resolve) => {
            body = JSON.parse(body)
            let fileName = body.url.slice(5, body.url.indexOf('/', 5))
            let str = '\r\n'
            if(body.url.includes('?')) {
                let params = body.url.split('?')[1].split('=')
                body.params = {}
                params.forEach((item, index) => {
                    if(index % 2 === 0) {
                        body.params[item] = params[index + 1]
                    }
                })
            }
            body.params = JSON.stringify(body.params)
            let arr = [ 
                {k: 'name', label: '接口名称'}, 
                {k: 'url', label: '请求URL'},
                {k: 'method', label: '请求方式'}, 
                {k: 'params', label: '请求参数'}, 
                {k: 'response', label: '响应内容'}
            ]
            arr.forEach(item => {
                str += `${item.label}: ${body[item.k] !== undefined ? body[item.k] : ''}\r\n`
            })
            fs.appendFile(`${__dirname}/doc/${fileName}.txt`, str, (err) => {
                if (err) throw err
                resolve()
            }) 
        })
        ctx.body = 'OK'
    } catch (err) {
        ctx.status = 500
        ctx.body = err
    }


})