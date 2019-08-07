export default {
    content: {},
    set() {
        this.get() || DCHttp.req({
            url: dcConfig.publicPath,
            params: {
                Class: 'com.leavay.dc.setting.UserIconMgr',
                FUNC: 'listAllIcon'
            }
        }).then(res => {
            let obj = {
                view: 'static/images/node/view.png', 
                node: 'static/images/node/node.png', 
                mirror: 'static/images/node/mirror.png', 
                reference: 'static/images/node/reference.png',
                exit: 'static/images/node/exit.png',
                sqlAdapter: 'static/images/node/sqlAdapter.png',
                entry: 'static/images/node/entry.png'
            }
            res.CONTENT.forEach(item => {
                obj[item.iconName] = `data:image/x-icon;base64,${item.imageData}`
            })
            this.content = obj
            localStorage.setItem('icons', JSON.stringify(obj))
        })
    },
    get() {
        if(localStorage.getItem('icons')) {
            this.content = JSON.parse(localStorage.getItem('icons'))
            return this.content
        }   
    },
    clear() {
        localStorage.removeItem('icons')
    }
}