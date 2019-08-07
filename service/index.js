const Koa = require('koa')
const Router = require('koa-router')
const path = require('path')
const static = require('koa-static')
const Koax = require('koa2-request-middleware')
let config = require( path.join(__dirname,'conf/config.json'))
config.address = config.origin + config.publicPath
const fs = require('fs')
const iconv = require('iconv-lite') //解释GBK编码文件
const proxy = require('koa-proxies')
let os = require('os')
const websockify = require('koa-websocket')
const websocketMethod = require(path.join(__dirname, 'dc_request/websocket.js'))
const route = require('koa-route')
const Project = require(path.join(__dirname, 'conf/project.json'))

const configPath = path.join(__dirname, 'conf/app_zh_CN.properties')
global.dcsConfig = {}
fs.readFile(configPath, (err, file) => { //获取dcs的配置文件 
    if (err) {
        console.log(err);
    } else {
        str = iconv.decode(file, 'GBK')
        let arr = str.split('#').map(item => {
            return item.split('\r\n').filter(i => {
                if(i.includes(' ') || i === '') {
                    return false
                }else {
                    return true
                }
            })
        })
        arr = arr.forEach(item => {
            if (item.length > 1) {
                item.forEach(i => {
                    if(i.includes('=')) {
                        let mapArr = i.split('=')
                        global.dcsConfig[mapArr[0]] = mapArr[1]
                    }
                })
            }
            
        })
    }
})


global.config = config
global.koax = new Koax()
global.router = new Router()
global.path = path
global.dcClass = require(path.join(__dirname, 'conf/dc_Class.json'))

global.setBody = (ctx, content) => { //设置请求返回内容
    if(!ctx.isError) {
        ctx.body = content
    }else {
        console.log('error')
    }
}

global.hostIp = showObj(os.networkInterfaces());

function showObj(obj){
    for(let devName in obj){
        let iface = obj[devName];
        for(let i=0;i<iface.length;i++){
            let alias = iface[i];
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                return alias.address;
            }
        }
    }
}
const app = websockify(new Koa())
app.use(proxy(config.dcsReplyPath, {  //转发到dcs平台处理
    target: config.origin,
    changeOrigin: true,
    rewrite: path => path,
    logs: true,
    events: {
        proxyReq (proxyReq) { 
            try {
                let cookie = proxyReq.getHeaders().cookie.split(';')
                let sessionId = cookie.find(i => i.includes('sessionId'))
                sessionId = sessionId.split('=')[1]
                proxyReq.setHeader('Cookie', `JSESSIONID=${sessionId}`)
            }catch(err) {}
        }
    }
}))


Project.forEach(item => {
    router.get(item.path, async (ctx) => {
        ctx.redirect(item.file)
    })
})


    

require(path.join(__dirname, 'dc_request/index.js'))
require(path.join(__dirname, 'test/index.js'))

// websocket实现定时器
app.ws.use(route.all('/interval/:type', function (ctx) {
    try{
        let type = ctx.url.split('/')[2]
        let interval = null
        ctx.websocket.on('message', function(message) {
            let params = JSON.parse(message)
            if(params.isResend) {
                interval && clearInterval(interval)
            }
            let lastData = null
            function setData() {
                websocketMethod[type](params).then(data => {
                    if(lastData !== JSON.stringify(data)) {
                        lastData = JSON.stringify(data)
                        ctx.websocket.send(JSON.stringify({content: data, errMsg: null})) 
                    }
                }).catch(err => {
                    ctx.websocket.send(JSON.stringify({content: null, errMsg: err}))
                })
            }
            if(params.interval) {
                interval = setInterval(() => {
                    setData()
                }, params.interval)
            }
            setData()
        })
        ctx.websocket.on('close', function() {
            clearInterval(interval)
        })
    }catch(err) {
        console.log(err)
    }
   
}))

app.use(static(path.join(__dirname, config.staticPath)))

app.use(router.routes())
app.listen(config.port)

console.log(`listening port: ${config.port};   link to address: ${config.address}`)

