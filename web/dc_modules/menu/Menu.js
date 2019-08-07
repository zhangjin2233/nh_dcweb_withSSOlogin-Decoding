class Menu {
    constructor(obj) {
        this.type = 'vertical'
        this.width = '240px'
        this.collapse = false
        this.backgroundColor = '#ffffff'
        this.textColor = '#303133'
        this.activeColor = '#409EFF'
        this.default = ''
        this.defaultOpened = []
        this.uniqueOpened = false
        this.trigger = 'hover'
        this.router = false
        this.transition = true
        this.data = []
        if(obj && typeof obj === 'object') {
            for(let key in obj) {
                this[key] = obj[key]
            }
        }
    }
    select(index) {

    }
    set(attra, val) {
        this[attra] = val
        return this
    }
    get(attra) {
        return this[attra]
    }
}
export default Menu