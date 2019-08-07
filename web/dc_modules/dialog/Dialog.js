class Dialog {
    constructor(obj) {
        this.show = true
        this.width = '30%'
        this.fullscreen = false
        this.top = '15vh'
        this.modal = true
        this.showClose = true
        this.center = false
        this.verticalCenter = false //是否垂直居中
        this.class = '' //自定义样式
        this.component = ''
        this.appendTop = ''
        this.appendBottom = ''
        this.data = {}
        this.title = ''
        this.btnAlign = 'right'
        this.hasBtn = false
        this.btnGroup = [{
            text: '确定',
            type: 'primary',
            size: 'small',
            click(dialog, component) {
               
            }
        }, {
            text: '取消',
            type: 'default',
            size: 'small',
            click(dialog, component) {
                dialog.show = false
            }
        }]
        if(obj && typeof obj === 'object') {
            for(let key in obj) {
                this[key] = obj[key]
            }
        }
    }
    close() {
        
    }
    set(attra, val) {
        this[attra] = val
        return this
    }
    get(attra) {
        return this[attra]
    }
    add(attra, item, index) {
        let target = this[attra]
        if(target instanceof Array) {
            if(index === undefined) {
                target.push(item)
            }else {
                target.splice(index, 0, item)
            }
        }
        return this
    }
    delete(attra, fn) {
        let target = this[attra]
        if(typeof fn === 'function') {
            this[attra] = target.filter((item, index) => {
                return !fn(item, index)
            })
        }else {
            this[attra] = []
        }
        return this
    }
    update(attra, fn) {
        let target = this[attra]
        if(typeof fn === 'function') {
            this[attra] = target.map((item, index) => {
                if(fn(item, index)) {
                    return fn(item, index)
                }
                return item
            })
        }
        return this
    }
    reset(obj) {
        let newObj = Object.assign(new dc.Dialog(), obj)
        for(let key in newObj) {
            this[key] = newObj[key]
        }
        return this
    }  
}

export default Dialog