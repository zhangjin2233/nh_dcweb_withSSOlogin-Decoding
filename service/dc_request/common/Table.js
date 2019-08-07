class Head {
    constructor(obj) {
        this.name = ''
        this.type = 'string'
        this.label = ''
        this.option = []
        this.readOnly = false
        this.canBeEmpty = true
        if(typeof obj === 'object') {
            for(let key in obj) {
                this[key] = obj[key]
            }
        }
    }
}
module.exports = {
    createHead(...params) {
        if(params.length === 1) {
            return new Head(params[0])
        } else if (params.length > 1){
            let head = new Head()
            head.name = params[0]
            head.label = params[1]
            params[2] && (head.type = params[2])
            head.option = params[3]
            head.readOnly = params[4]
            head.canBeEmpty = params[5]
            return head
        }
    },
    createHeads(...params) {
        let heads = []
        params.forEach(item  => {
            if(item instanceof Array) {
                heads.push(this.createHead(...item))
            }else {
                heads.push(new Head(item))
            }
        })
        return heads
    }
}