class Row {
    constructor(obj) {
        this.name = ''
        this.label = ''
        this.option = []
        this.type = 'string'
        this.tableHead = []
        this.readOnly = false
        this.value = ''
        this.toolTips = ''
        this.canBeEmpty = true
        if (typeof obj === 'object') {
            for (let key in obj) {
                this[key] = obj[key]
            }
        }
    }
}
module.exports = {
    createRow(...params) {
        if(params.length === 1) {
            return new Row(params[0])
        }else if(params.length > 1) {
            let props = ['name', 'label', 'type', 'option', 'readOnly', 'canBeEmpty', 'toolTips', 'tableHead', 'value']
            let row = new Row()
            params.forEach((item, index) => {
                row[props[index]] = item
            })
            let i = 6
            props.slice(-3).forEach((item, index) => {
                row[item] = params[i + index] 
            })
            if(row.option.length < 1) {
                delete row.option
            } 
            return row
        }
    }
}