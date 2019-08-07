
import proxyTable from '../config/proxyTable.json'
import webSockets from '../assets/js/index/webSocket.js'
const ipjson = require('../../../service/conf/config.json')

let DCWebSocketList = []
let createWebSocket = (option) => {
    let instance = new DCWebSocket(option)
    DCWebSocketList.push(instance)
    return instance
}
class DCWebSocket{
    
    constructor(option) {
        var ipAddress = 'ws:'+ipjson.origin.split(':')[1]+':'+ipjson.port;
        this.url = ipAddress+(option.type || '/interval') + option.url
        // this.url = 'ws://' + window.dcConfig.ip + ':' + window.dcConfig.port +  (option.type || '/interval') + option.url
        this.data = { sessionId: (document.cookie + ' ').match(/sessionId=(.+?)[;\s]/)[1], params: option.params, interval: option.interval }
    }
    send(resHandle=() => {}, errHandle=() => {}) {
        this.ws = new WebSocket(this.url)
        this.ws.onopen = () => {
            this.ws.send(JSON.stringify(this.data))
        }
        this.ws.onerror = errHandle
        this.ws.onmessage = (data) => {
            try{
                resHandle(JSON.parse(data.data))
            }catch(err) {
                resHandle(data.data)
            }
        }
    }
    reSend(params={}) {
        if(this.ws) {
            this.data.params = params
            this.data.isResend = true
            this.ws.send(JSON.stringify(this.data))
        }  
    }
    close(closeHandle=() => {}) {
        this.ws.close()
        DCWebSocketList.splice(DCWebSocketList.indexOf(this), 1)
        this.ws.onclose = closeHandle
       
    }
}

window.closeWebSocket  = function(url, closeHandle=() => {}) {
    let index = DCWebSocketList.findIndex(item => item.url.slice(item.url.lastIndexOf('/') + 1) === url )
    if(index > -1) {
        DCWebSocketList[index].close(closeHandle)
    }
}

window.getWebSocket = (url, params) => {
    return createWebSocket(webSockets[url](params))
}