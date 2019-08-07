let net = require('net')
const path = require('path')
let config = require( path.join(__dirname,'conf/config.json'))

// 检测端口是否被占用
let portIsOccupied = (port) => {
    let server = net.createServer().listen(port)
    server.on('listening', () => { // 执行这块代码说明端口未被占用
        server.close() // 关闭服务
        require('./index.js')
    })
    server.on('error', (err) => {
    if(err.code === 'EADDRINUSE') { // 端口已经被使用
        console.log('端口【' + port + '】 被占用，请设置另外一个端口号')
    }
 })
}

portIsOccupied(config.port)


