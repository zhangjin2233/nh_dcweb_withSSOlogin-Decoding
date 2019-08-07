import axios from 'axios'
import config from '../config/DCHttp.json'
import store from '@/vuex/store.js'
import { Message, Loading } from 'element-ui'

let CancelToken = axios.CancelToken
let instance = axios.create()
let checkRequest = (params, obj, isCancel=true) => { //同一请求拦截或移出队列
    let index = obj.queues.findIndex(q => q.params === JSON.stringify(params))
    if(index > -1) {
        isCancel && obj.queues[index].cancel()
        obj.queues.splice(index, 1)
    }
}
let loading = null
class DCHttp {
    constructor() {
        this.axios = axios
        this.queues = []
    }
    req(option) {
        let _this = this
        if(option.loading) {
            loading = Loading.service(option.loadingOption || config.loadingOption)
        }
        if(window.dcConfig && option.url === dcConfig.publicPath && !option.notHandle) {
            let data = option.params
            data.Class = dcConfig.Class[data.Class] || data.Class
            data.action = data.action || dcConfig.action
            if(option.method && option.method.toLowerCase() === 'post') {
                option.url += `?Class=${data.Class}&FUNC=${data.FUNC}&action=${data.action}`
                option.params = `${dcConfig.paramsKey}=${encodeURIComponent(JSON.stringify(data[dcConfig.paramsKey]))}`
            }
        }
        return new Promise((resolve, reject) => {
            let data = typeof option.params == 'object' ? Object.assign({}, option.params) : option.params
            checkRequest([data, option.url], this, true)
            let aOption = {
                url: option.url,
                timeout: option.timeout || config.timeout,
                cancelToken: new CancelToken(function executor(c) { //请求拦截
                    if(option.repeat) { return }
                    _this.queues.push({
                        cancel: c,
                        params: JSON.stringify([data, option.url])
                    })
                })
            }
            if(option.method && option.method.toLowerCase() === 'post') { //post请求
                aOption.data = data
                aOption.method = 'post'
            }else { //get请求
                for(let key in data) {
                    if(typeof data[key] === 'object') {
                        data[key] = JSON.stringify(data[key])
                    }
                }
                aOption.params = data
            }
            instance(aOption).then(res => {
                checkRequest([data, option.url], this, false)
                loading && loading.close()
                if(window.dcConfig && option.url === dcConfig.publicPath && !option.notHandle) { 
                    if(res.data.STATE !== 1 && !option.ingornError) {
                        if(res.data.ERR_MSG === '请先登录') {
                            store.commit('loginToggle', false, res.config.method)
                        }else {
                            try{
                                option.info.error && Message({ message: option.info.error, type: 'error', showClose: true })
                            }catch(err) {}
                            let params = res.config.method === 'get' ? res.config.params : res.config.data
                            store.commit('updateErrorInfoList', { url: res.config.url, params, message: res.request.response, time: new Date() })
                            option.ingornError
                        }
                        return reject(res.data)
                    }
                    try{ option.info.success && Message({ message: option.info.success, type: 'success', showClose: true })}catch(err){}
                    return resolve(res.data)
                }
                try{
                    option.info.success && Message({ message: option.info.success, type: 'success', showClose: true })
                }catch(err) {}
                return resolve(res.data)
            }).catch(err => {
                if(err.config) {
                    checkRequest([err.config.params || err.config.data, err.config.url], this, false)
                }
                loading && loading.close()
                if(!err.response) {
                    return
                }
                if(err.response.status === 401) {
                    store.commit('loginToggle', false, err.config.method)
                }else if(err.response.status === 406) {
                    reject(err)
                } else {
                    try{
                        option.info.error && Message({ message: option.info.error, type: 'error', showClose: true })
                    }catch(err) {}
                    let params = err.config.method === 'get' ? err.config.params : err.config.data
                    store.commit('updateErrorInfoList', { url: err.config.url, params, message: err.response.data, time: new Date() })
                }
                !option.ingornError ? reject(err) : resolve(err)
            })
        })
    }
    export(params) {
        let url = ''
        if(!params.data && params.method && params.method.toLowerCase() !== 'post') {
            url = params.url + '?'
            let data = Object.assign({}, params.params)
            if(!params.notHandle) {
                params.Class = dcConfig.Class[params.Class]
                data.action || (data.action = dcConfig.action)
            } 
            for(let key in data) {
                url += `${key}=${ typeof data[key] === 'object' ? encodeURI(JSON.stringify(data[key])).replace(/#/g, '%23') : data[key] }&`
            }
            data.Class && (url = url.replace(/Class=(\S)+?&/, `Class=${dcConfig.Class[data.Class] || data.Class}&`))
            url = url.slice(0, -1)
        }else if(params.method.toLowerCase() === 'post') {
            url = params.url +  '?'
            for(let key in params.params) {
                if(key !== dcConfig.paramsKey) {
                    url += `${key}=${ params.params[key] }&`
                }
            }
            params.params.Class && (url = url.replace(/Class=(\S)+?&/, `Class=${dcConfig.Class[params.params.Class] || params.params.Class}&`))
            url = url.slice(0, -1)
            instance({
                url: url,
                data: `${dcConfig.paramsKey}=${encodeURIComponent(JSON.stringify(params.params[dcConfig.paramsKey]))}`,
                method: 'post',
                responseType: 'arraybuffer'
            }).then(res => {
                let reg = /filename=\"(.+)\"/
                let blob = new Blob([res.data], { type: 'zip'})
                url = URL.createObjectURL(blob)
                let link = document.createElement('a')
                link.download = reg.exec(res.headers['content-disposition'])[1]
                link.href = url
                link.click()
            })
            return 
        }else {
            let blob = new Blob([params.data]);
            url = URL.createObjectURL(blob);
        }
        let link = document.createElement('a')
        link.download = params.fileName || ''
        link.href = url
        link.click()
       
    }
    import(form) {
        return new Promise((resolve, reject) => {
            instance({
                url: dcConfig.publicPath,
                method: 'post',
                data: form,
                headers: {'Content-Type':'multipart/form-data'}
            }).then(res=>{ 
                if(res.data.STATE === 1) {
                    resolve(res)
                }
                reject(res)
            }).catch(err=>{reject(err)})
        })
    }
}
window.DCHttp = new DCHttp()

// instance.interceptors.response.use(data => {
//     console.log(data)
//     return data
// }, error => {
// })
