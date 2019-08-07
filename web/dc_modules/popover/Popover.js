class Popover {
    constructor(obj) {
        this.visiable = false
        this.trigger = 'hover'
        this.title = ''
        this.content = ''
        this.width = 180
        this.placement = 'right'
        this.disabled = false
        this.offset = 0
        this.delay = 0
        this.component = ''
        this.data = {}
        if(obj && typeof obj === 'object') {
            for(let key in obj) {
                this[key] = obj[key]
            }
        }
    }
    show() {

    }
    hide() {
        
    }
    reset(obj) {
        let newObj = Object.assign(new dc.Popover(), obj)
        for(let key in newObj) {
            this[key] = newObj[key]
        }
        return this
    }
    set(attra, val) {
        this[attra] = val
        return this
    }
    get(attra) {
        return this[attra]
    } 
}

export default Popover