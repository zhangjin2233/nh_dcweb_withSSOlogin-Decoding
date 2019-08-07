<template>
    <div 
    class="draw"
    @click.prevent.stop="clickDraw">
        <canvas 
        id="myCanvas"
        :width="width"
        :height="height">   
        </canvas>
        <div 
        class="table-container"
        :style="`width: ${width}; height: ${height}`">
            <sql-table 
            :type="type"
            :object="item" 
            :currentRows="currentRows" 
            :currentId="currentTableId" 
            :tables="table"
            v-for="(item, index) in table" :key="index"></sql-table>
        </div>
    </div>
</template>

<script>
import sqlTable from './table/index.vue'
export default {
    components: { 'sql-table': sqlTable },
    props: ['table', 'type'],
    data() {
      return {
          width: '1000px',
          height: 0,
          ctx: null,
          currentTableId: '',
          currentRows: [],
          keyValue: '',
          maxTables: [],
      }
    },
    created() {
        this.table.forEach(item => {
            this.tableTouch(item.id)
        })
        let position = this.getMaxPosition()
        this.setSize(position.x, position.y)
        this.$addListener('resizeDraw', (id=this.currentTableId) => {  //改变画板的尺寸
            let index = this.maxTables.findIndex(t => t.id === this.currentTableId)
            this.tableTouch(id)
            let newPosition = this.getMaxPosition()
            this.setSize(newPosition.x, newPosition.y)
        })
        this.$addListener('redraw', () => { //重新画线
            this.ctx && this.drawRalation(this.table)
        })
        this.$addListener('clearRelation', (table, rows) => {
            if(rows) {
                this.deleteRow(table, rows)
            }else {
                this.deleteTable(table)
            }
           
        })
        this.$addListener('deleteTable', (table) => {
            if(!this.currentTableId) {
                return
            }
            let index = this.table.findIndex(t => t.id === this.currentTableId)
            if(index > -1) {
                this.deleteTable(this.table[index])
                this.$nextTick(() => {
                    this.drawRalation()
                })
            }
        })
        this.$nextTick(() => {
            this.ctx = document.getElementById('myCanvas').getContext('2d')
            this.drawRalation(this.table)
        })
        window.addEventListener('keydown', this.keyDown)
        window.addEventListener('keyup', this.keyUp)
        
    },
    destroyed() {
        this.$cancelEvent('resizeDraw')
        this.$cancelEvent('redraw')
        this.$cancelEvent('clearRelation')
        this.$cancelEvent('deleteTable')
        window.removeEventListener('keydown', this.keyDown)
        window.removeEventListener('keyup', this.keyUp)
    },
    watch: {},
    computed: {
        lines() {
            return this.$store.state.lines
        }
    },
    methods: {
        drawLine(ctx, p1, p2, color='#999') {
            ctx.strokeStyle = p1.color ?  p1.color : color;
            p2.color
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            p1.isLeft ?  ctx.lineTo(p1.x - 14, p1.y) : ctx.lineTo(p1.x + 14, p1.y)
            p2.isRight ? ctx.lineTo(p2.x + 14, p2.y) : ctx.lineTo(p2.x - 14, p2.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
            ctx.closePath()
            ctx.shadowBlur = 0
            if(p2.isRight) {
                this.drawArrow(ctx, {x: p2.x, y: p2.y + 3}, {x: p2.x - 6, y: p2.y}, {x: p2.x, y: p2.y - 3}, ctx.strokeStyle)
            }else{
                this.drawArrow(ctx, {x: p2.x, y: p2.y + 3}, {x: p2.x + 6, y: p2.y}, {x: p2.x, y: p2.y - 3}, ctx.strokeStyle)
            }  
        },
        drawArrow(ctx, p1, p2, p3, color='blue') {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.lineTo(p3.x, p3.y)
            ctx.fillStyle = color
            ctx.closePath()
            ctx.fill()
        }, 
        clickDraw(event) {
            let table = null
            let srcNode = event.srcElement
            let rowNode = null
            this.currentTableId = ''
            this.$store.commit('hideRowTips')
            while (srcNode.className !== 'sql-table' && srcNode.className !== 'draw') {
                if(srcNode.className === 'row' || srcNode.className === 'row active') {
                    rowNode = srcNode
                }
                srcNode = srcNode.parentNode
            }
            if(srcNode.className === 'draw') {
                return
            }
            table = srcNode
            this.currentTableId = table.id
            let index = this.table.findIndex(item => item.id === table.id)
            this.$store.commit('setCurrentSqlTable', this.table[index])
            if(rowNode) {
                if(this.keyValue === 'Meta' || this.keyValue === 'Control') {
                    let i = this.table[index].currentRow.indexOf(rowNode.id)
                    if(i > -1) {
                        this.table[index].currentRow.splice(i, 1)
                    }else {
                        this.table[index].currentRow.push(rowNode.id)
                    } 
                }else if(this.keyValue === 'Shift') {
                    if(this.table[index].currentRow.length === 1) {
                        let i = this.table[index].rows.findIndex(r => r.id ===  this.table[index].currentRow[0])
                        let k = this.table[index].rows.findIndex(r => r.id === rowNode.id)
                        let count = k - i
                        for(let j = 1; j <= Math.abs(count); j++) {
                            this.table[index].currentRow.push(this.table[index].rows[ i + count / Math.abs(count) * j].id)
                        }
                    }else {
                        this.table[index].currentRow = []

                        this.table[index].currentRow.push(rowNode.id)
                    }
                } else {
                    this.table[index].currentRow = []
                    if(this.table[index].currentRow > 0) {
                        this.$set(this.table[index].currentRow, 0, rowNode.id)
                    }else {
                        this.table[index].currentRow.push(rowNode.id)
                    }
                }
            }
            this.currentRows = this.table[index].rows.filter(item=> {
                item.table = this.table[index]
                return this.table[index].currentRow.findIndex(r => r === item.id) > -1
            })
            if(rowNode) { 
                this.drawRalation(this.table)
            }
            
        },
        setSize(width, height) {
            this.width = width + 20 + 'px'
            this.height = height + 20 + 'px'
        },
        getMaxPosition() {
            if(this.table instanceof Array) {
                this.maxTables = []
                return this.table.reduce((a, b) => {
                    let x = b.x + b.width
                    let y = b.y + b.height
                    if(x > a.x) {
                        a.x = x
                        this.maxTables.push(b)
                    }
                    if(y > a.y) {
                        a.y = y
                        this.maxTables.push(b)
                    }
                    return a
                }, {x: 0, y: window.innerHeight - 40})
            }
            return {x: 900, y: 600}
        },
        tableTouch(id) {
            let index = this.table.findIndex(t => id === t.id)
            let currentTable = this.table[index]
            let tablePoints = [{
                x: currentTable.x,
                y: currentTable.y
            }, {
                x: currentTable.x + currentTable.width,
                y: currentTable.y
            }, {
                x: currentTable.x,
                y: currentTable.y + currentTable.height
            }, {
                x: currentTable.x + currentTable.width,
                y: currentTable.y + currentTable.height
            }]
            let tableArr = this.table.filter((item, i) => {
                if(i === index) return false
                return tablePoints.some(point => {
                    return item.x <= point.x && (item.x + item.width) >= point.x && item.y <= point.y && (item.y + item.height) >= point.y
                })
            })
            tableArr.forEach(item => {
                item.move(item.x, currentTable.y + currentTable.height + 10, true)
            })
        },
        drawRalation() {
            this.ctx.clearRect(0, 0, parseInt(this.width), parseInt(this.height))
            if(this.lines.length < 1) return
            this.lines.forEach(line => {
                let outputTable = line.output.table
                let inputTable = line.input.table
                let outputRow = line.output.row
                let inputRow = line.input.row
                inputRow.outInfo = {
                    row: outputRow,
                    table: outputTable
                }
                let end = this.getNodePosition(inputRow.id, inputTable)
                let endTable = end.table
                let start = this.getNodePosition(outputRow.id, outputTable)
                let startTable = start.table
                let rowIndex = this.currentRows.findIndex(r => r === outputRow) 
                if(rowIndex > -1 || this.currentRows.includes(inputRow)) {
                    start.color = '#ffb84d'
                }
                start.isLeft = true
                if(startTable.x + startTable.width < endTable.x || startTable.x < endTable.x + endTable.width) {
                    start.x += startTable.width
                    start.isLeft = false
                    end.x -= 6
                }else if(endTable.x + endTable.width < startTable.x) {
                    end.x += endTable.width
                    end.isRight = true
                    end.x += 6
                }
                this.drawLine(this.ctx, start, end)
            })
        },
        getNodePosition(id, table) {
            let dom = document.getElementById(id)
            let parentNode = dom.parentNode
            let x = 0
            let y = 0
            if(table) {
                x += dom.offsetLeft  + table.x
                y += dom.offsetTop + 10 + table.y - parentNode.scrollTop
                if(y < table.y + 24 + table.addTableHeight) {
                    y = table.y + 24 + table.addTableHeight
                }
                if(y > table.height + table.y) {
                    y = table.height + table.y - 1
                }
            }else{
                let rowDom = dom
                let tableId
                let tableDom = null
                while(dom.className !== 'draw') {
                    x += dom.offsetLeft
                    y += dom.offsetTop
                    if(dom.className === 'sql-table') {
                        tableDom = dom
                        tableId = tableDom.id
                    }
                    dom = dom.parentNode
                }
                let tableIndex = this.table.findIndex(t => t.id === tableId)
                table = this.table[tableIndex]
                x = x
                y = y - 12 - parentNode.scrollTop - table.addTableHeight
                if(parentNode.scrollTop > rowDom.offsetTop - 24 + 10 - table.addTableHeight) {
                    y = 24 + tableDom.offsetTop + table.addTableHeight
                }
                if(y > table.height + table.y) {
                    y = table.height + table.y - 1 
                }
            }
            return {
                x: x,
                y: y,
                table: table
            }
        },
        getRow(tables, rowId) {
            for(let i = 0; i < tables.length; i++) {
                let index = tables[i].rows.findIndex(r => r.id === rowId)
                if(index > -1) {
                    return tables[i].rows[index]
                }
            }
        },
        deleteRow(table, rows) {
            rows.forEach(item => {
                let index = 0
                if(typeof item === 'string') {
                    index = table.rows.findIndex(r => r.id === item)
                    item = table.rows[index]
                }else if(typeof item === 'object'){
                    index = table.rows.findIndex(r => r.id === item.id)
                }
                table.rows.splice(index, 1)
                this.$store.commit('setLines', this.lines.filter(line => {
                    return line.output.row !== item && line.input.row !== item
                }))
            })
        },
        deleteTable(table) {
            this.table.splice(this.table.indexOf(table), 1)
            this.$store.commit('setLines', this.lines.filter(line => {
                return line.output.table !== table && line.input.table !== table
            }))
        },
        keyDown(event) {
            this.keyValue = event.key
        },
        keyUp(event) {
            this.keyValue = ''
        }
    },
}
</script>
<style scoped>
.draw{
    position: relative;
    overflow: auto;
    height: 100%;
}
.table-container{
    position: absolute;
    top: 0;
    left: 0;
}
</style>