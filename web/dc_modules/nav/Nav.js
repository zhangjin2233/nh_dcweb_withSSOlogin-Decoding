class Nav{
    constructor(obj) {
        this.menu = []
        this.color = '#000'
        this.fontSize = '16px'
        this.backgroundColor = '#ccc'
        this.height = '40px'
        this.menuWidth = 120
        this.indent = 20
        this.marginRight = 12
        this.align = 'left'
        this.key = 'index'
        this.hoverColor = '#409eff'
        this.trigger = 'hover'
        this.activeItemKey = ''
        this.activeColor = '#409eff'
        this.hightlineActive = false
        if(obj && typeof obj === 'object') {
            for(let key in obj) {
                this[key] = obj[key]
            }
        }   
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
        let newObj = Object.assign(new dc.Nav(), obj)
        for(let key in newObj) {
            this[key] = newObj[key]
        }
        return this
    }  
}

export default Nav