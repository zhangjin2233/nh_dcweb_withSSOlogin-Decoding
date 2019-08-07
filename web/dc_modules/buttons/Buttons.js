class Buttons{
    constructor(obj) {
        this.show = true
        this.data = []
        this.style = {}
        this.spaceBetween = 0
        this.fontColor = ''
        this.background = ''
        this.size = 'mini'
        this.type = ''
        this.params = []
        if(typeof obj === 'object') {
            for(let key in obj) {
                this[key] = obj[key]
            }
        }
    }
}

export default Buttons