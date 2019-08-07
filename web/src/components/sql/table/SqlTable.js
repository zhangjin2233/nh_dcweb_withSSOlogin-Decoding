
let sum = 0
let rowSum = 0
let btnColor = '#ccd9ff'
let deleteBtn = {
    title: '删除',
    icon: 'fa fa-times',
    type: 'primary',
    color: 'red',
    click(table) {
        VUE.$emitEvent('clearRelation', table, table.currentRow)
        VUE.$nextTick(() => {
            VUE.$emitEvent('redraw') 
        })          
    }
}
let upRowBtn = {
    title: '上移',
    icon: 'fa fa-arrow-up',
    type: 'primary',
    color: btnColor,
    click(table) {
        table.exchangeRow(table, 'up')
        setTimeout(() => {
            VUE.$emitEvent('redraw')
        }, 40)
    }
}
let downRowBtn = {
    title: '下移',
    icon: 'fa fa-arrow-down',
    type: 'primary',
    color: btnColor,
    click(table) {
        table.exchangeRow(table, 'down')
        setTimeout(() => {
            VUE.$emitEvent('redraw')
        }, 40)
    }
}
let editRowBtn = {
    title: '编辑',
    icon: 'fa fa-edit',
    type: 'primary',
    color: btnColor,
    click(table) {
        VUE.$store.commit('setCurrentTable', table)
        VUE.$emitEvent('showSqlForm')
    } 
}
let addRowBtn = {
    title: '新增',
    icon: 'fa fa-plus',
    type: 'primary',
    color: 'green',
    click(table) {
        let name = 'Field'
        table.rows.forEach(item => {
            let value = item.data[0].value
            if(value === name) {
                name = 'Field' + (value.slice(5) ? parseInt(value.slice(5)) + 1 : 1)
            }
        })
        
        let row = new Row({
            data: [{
                value: name
            }, {
                value: 4
            }]
        })
        table.rows.push(row)
    }
}
let getUUID = () => {
    let now = new Date()
    let fillTwo = (val) => {
        if(val < 10) {
            return '0' + val
        }
        return val
    }
    let getEndStr = () => {
        let arr = []
        for(let i = 0; i < 20; i++) {
            arr.push((Math.round(Math.random() * 15)).toString(16))
        }
        return arr.join('')
    }
    let preStr = now.getFullYear() + '' + fillTwo(now.getMonth() + 1) + fillTwo(now.getDate()) + fillTwo(now.getHours()) + fillTwo(now.getMinutes()) + fillTwo(now.getSeconds())
    let fullStr = 'C' + parseInt(preStr).toString(16) + getEndStr()
    fullStr = fullStr.slice(0, 9) + '_' + fullStr.slice(9, 13) + '_' + fullStr.slice(13, 17) + '_' + fullStr.slice(17, 21) + '_' + fullStr.slice(21)
    return fullStr
}

class SqlTable {
    constructor(obj) {
        this.title = ''
        this.desc = '基础组件流'
        this.width = 360
        this.height = 200
        this.currentRow = []
        this.x = 0
        this.addTableHeight = 0
        this.y = 0
        this.id = new Date().getTime() + sum + '' + 't'
        this.rows = []
        this.buttonGroup = []
        this.raw = {}
        this.form = {}
        this.viewType = ''
        this.form = {
            groupBy: '',
            joinExt: [],
            fromExt: '',
            whereExt: [],
            limit: '',
            orderBy: []
        }
        if(typeof obj === 'object') {
            for(let key in obj) {
                this[key] = obj[key]
            }
        }
        sum++
    }
    move(x, y, flag) {
        this.x = x
        this.y = y
        if(flag) {
            VUE.$emitEvent('resizeDraw', this.id)
        }
    }
    resize(width, height) {
        this.width = width
        this.height = height
        VUE.$emitEvent('resizeDraw', this.id)
    }
    exchangeRow(table, type) {
        if(!table.currentRow || table.currentRow.length > 1) return
        let index = table.rows.findIndex(r => r.id === table.currentRow[0])
        if(type === 'up') {
            if(index > 0) {
                let swap = table.rows[index - 1]
                VUE.$set(table.rows, index - 1, table.rows[index])
                VUE.$set(table.rows, index, swap)
            }
        }else if(type === 'down') {
            if(index < this.rows.length - 1) {
                let swap = table.rows[index + 1]
                VUE.$set(table.rows, index + 1, table.rows[index])
                VUE.$set(table.rows, index, swap)
            }
        }
    }
}

class SourceTable extends SqlTable {
    constructor(obj) {
        super(obj)
        this.icon = 'fa fa-sign-out'
        this.iconColor = 'green'
        this.type = 'source'
        this.name = obj.name ? obj.name : ''
        this.background = '#ccc'
        this.role = 'input'
        

        this.canBeNull = true
        this.extend = ''
        this.defaultV = ''
        this.isPrimaryKey = true
        this.userType = ''

        this.buttonGroup = new dc.Buttons({
            params: [this],
            data: [upRowBtn, downRowBtn]
        })
    }
}

class TargetTable extends SqlTable {
    constructor(obj) {
        super(obj)
        this.icon = 'fa fa-sign-in'
        this.iconColor = 'blue'
        this.type = 'target'
        this.background = '#ccddff'
        this.role = 'output'
        this.buttonGroup = new dc.Buttons({
            params: [this],
            data: [deleteBtn, addRowBtn, editRowBtn, upRowBtn, downRowBtn]
        })
        
    }
}

class ViewTable extends SqlTable {
    constructor(obj) {
        super(obj)
        this.icon = 'fa fa-table'
        this.iconColor = 'orange'
        this.type = 'view'
        this.role = 'handle'
        this.buttonGroup = new dc.Buttons({
            params: [this],
            data: [deleteBtn, addRowBtn, editRowBtn, upRowBtn, downRowBtn] 
        })
    }
}

class SetTable extends SqlTable {
    constructor(obj) {
        super(obj)
        this.icon = 'fa fa-object-group'
        this.iconColor = 'blue'
        this.type = 'set'
        this.background = '#b3b3ff'
        this.role = 'handle'
        this.tags = []
        this.setOpType = 'union'
        this.buttonGroup = new dc.Buttons({
            params: [this],
            data: [{
                title: '编辑',
                type: 'primary',
                icon: 'fa fa-pencil',
                color: btnColor,
                click(table) {
                    let form = new dc.Form({
                        structure: [{
                            label: 'name',
                            type: 'string',
                            name: 'name'
                        }, {
                            label: 'desc',
                            type: 'textarea',
                            name: 'desc'
                        }],
                        data: {
                            name: table.title,
                            desc: table.raw.desc
                        },
                        btns: [{
                            label: '确定',
                            type: 'primary',
                            click(form) {
                                table.title = form.data.name
                                table.raw.desc = form.data.desc
                                VUE.$closeDialog()
                            }
                        }, {
                            label: '取消',
                            click(form) {
                                VUE.$closeDialog()
                            }
                        }]
                    })
                    VUE.$openDialog(new dc.Dialog({
                        title: '常规设置',
                        component: 'dc-form',
                        width: '400px',
                        data: {
                            object: form
                        }
                    }))
                }
            }],
        })
        this.addTableHeight = 29
        this.option = [{
            label: '联合',
            value: 'union'
        }, {
            label: '全联合',
            value: 'union_all'
        }, {
            label: '差集',
            value: 'except'
        }, {
            label: '交集',
            value: 'intercect'
        }]
    }
}
class OutputSetTable extends SetTable {
    constructor(obj) {
        super(obj)
        this.role = 'output'
    }
}
class Row {
    constructor(obj) {
        this.tableId = ''
        this.cellWidth = ['140px', '80px']
        this.id = getUUID()
        this.isActive = false
        this.showTips = false
        this.data = []
        this.raw = []
        this.expression = ''

        this.canBeNull = true //true / false
        this.extend = ''
        this.defaultV = '' //默认值
        this.isPrimaryKey = true // true / false
        this.userType = '' //字段类型，如 VARCHAR(225)

        if (typeof obj === 'object') {
            for (let key in obj) {
                this[key] = obj[key]
            }
        }
        rowSum++
    }
}

let sqlTable = {
    SourceTable,
    TargetTable,
    ViewTable,
    SetTable,
    OutputSetTable,
    Row
}
export default sqlTable