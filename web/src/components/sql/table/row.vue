<template>
    <div class="row" :id="row.id"  :class="{active: currentId.indexOf(row.id)>-1}">
        <span v-if="table.type==='source'||table.type==='set'">
            <span 
            v-for="(item, index) in row.data" 
            :key="index" 
            class="row-cell"
            @mouseover="cellHover($event, index, item.value)"
            @mouseout="cellHover()"
            :style="`width: ${row.cellWidth[index] ? row.cellWidth[index] : 'auto'}`">
                <span v-if="!showTip&&index!==1">{{item.value}}</span>
                <span v-if="index===1">{{ rowMap[item.value] }}</span>
                <el-tooltip :content="item.value" placement="top" v-if="index!==1&&showTip">
                   <span >{{item.value}}</span> 
                </el-tooltip>
            </span>
        </span>
        <span v-else>
            <span  
            class="row-cell" 
            :style="`min-width: ${row.cellWidth[0]}`">
                <el-popover
                placement="top-start"
                width="300"
                @show="tipsShow"
                v-model="row.showTips"
                trigger="click">
                    <el-input type="textarea" v-model="row.data[0].value" ></el-input>
                    <input 
                    type="text"  
                    slot="reference" 
                    v-model="row.data[0].value" 
                    :class="{active: currentId.indexOf(row.id)>-1}"
                    @click="rowInputClick">
                </el-popover>
            </span>
            <span   class="row-cell" :style="`min-width: ${row.cellWidth[1]}`">
                <select size="mini" v-if="row.data[1]" v-model="row.data[1].value" :class="{active: currentId.indexOf(row.id)>-1}">
                    <option :value="item.value" :label="item.label" v-for="item in rowOption" :key="item.value" ></option>
                </select>
            </span>

            <span @click="showDetail"  class="row-cell fa fa-ellipsis-h" v-if="dotType.includes(table.type)"></span>
        </span>
        
    </div>
</template>

<script>
export default {
    components: {},
    props: ['row', 'currentId', 'id', 'table', 'tables'],
    data() {
        let rowOption = [{
                value: 1,
                label: 'NUMBER1'  
            }, {
                value: 2,
                label: 'INTEGER2'  
            }, {
                value: 3,
                label: 'LONG3'
            }, {
                value: 4,
                label: 'STRING4'
            }, {
                value: 5,
                label: 'RAW5'
            }, {
                value: 6,
                label: 'TIMESTAMP6'
            }, {
                value: 7,
                label: 'DATE7'
            }, {
                value: 8,
                label: 'TIME8'
        }]
        let rowMap = rowOption.reduce((a, b) => {
            a[b.value] = b.label
            return a
        }, {})
        return {
            dotType: ['target', 'view'],
            rowOption: rowOption,
            rowMap: rowMap,
            showTip: false,
            changeRowTimeout: null,
            oldName: ''
        }
    },
    created() {
        this.row.table = this.table
        this.row.tableId = this.table.id
        if(!this.row.data[1]) {
            this.row.data[1] = {
                value: 4
            }
        }
        // console.log(this.row)
    },
    watch: {
        fieldName(val, oldVal) {
            if(this.changeRowTimeout) {
                clearTimeout(this.changeRowTimeout)
            }else {
                this.oldName = oldVal
            }
            this.changeRowTimeout = setTimeout(() => {
                this.lines.forEach(item => {
                    if(item.output.row === this.row) {
                        item.input.row.expression = item.input.row.expression.replace('.' + this.oldName, '.' + val)
                    }
                })
                this.changeRowTimeout = null
            }, 1000)
        }
    },
    computed: {
        lines() {
            return this.$store.state.lines
        },
        fieldName() {
            return this.row.data[0].value
        }
    },
    methods: {
        showDetail() {
            let index = this.lines.findIndex(f => f.input.row === this.row)
            let outRow = null
            let outTable = null
            let expression = 'null'
            let name = this.row.data[0].value
            let row = this.row
            expression = row.expression
            if(index > -1) {
                outRow = this.lines[index].output.row
                outTable = this.lines[index].output.table
                let tableName = outTable.name ? outTable.name : outTable.title
                expression = `${tableName}."${outRow.data[0].value}"`
            }
            let dialog = new dc.Dialog({
                width: '500px',
                title: '编辑数据',
                component: 'sqlEditRow',
                data: {
                    row: row,
                    tables: this.tables,
                }
            })
            VUE.$openDialog(dialog)
        },
        calcStringPixels(str, strFontSize) {
            if (!str) {
                return 0
            }
            let stringCharsCount = (str + '').length
            let stringPixelsCount = 0
            let element = document.createElement("span")
            element.style.fontSize = strFontSize
            element.style.visibility = "hidden"
            element.style.display = "inline-block"
            element.style.wordBreak = "break-all !important";
            document.body.appendChild(element)

            for (let i = 0; i < stringCharsCount; i++) {
                if (str[i] == " ") {
                    element.innerHTML = "&nbsp;"
                } else {
                    element.innerHTML = str[i]
                }
                stringPixelsCount += element.offsetWidth
            }
            document.body.removeChild(element)
            return stringPixelsCount

        },
        watchInput(val, index) {
            let size = this.calcStringPixels(val, '12px') ? this.calcStringPixels(val, '12px') : 0
            let width = this.row.cellWidth[index] ? this.row.cellWidth[index] : '140px'
            width = parseInt(width) + 12
            if (size >= width) {
                this.showTip = true
            }
        },
        cellHover(event, index, value) {
            if(index === 1) return 
            if(!event) {
                this.showTip = false
            }else {
                this.watchInput(value, index)
            }
        },
        tipsShow() {
            setTimeout(() => {
                this.$store.commit('setShowTipsRow', this.row)
            }, 500)
        },
        rowInputClick() {
            if(!this.row.showTips) {
                setTimeout(() => {
                    this.row.showTips = true
                }, 100)
            }
        }
    },
}
</script>
<style scoped>
.row{
    min-width: 280px;
    font-size: 0;
    width: 100%;
    box-sizing: border-box;
    border-bottom: 1px solid #333;
    height: 20px;
    box-sizing: border-box;
    white-space: nowrap;
}
.row-cell{
    display: inline-block;
    font-size: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    box-sizing: border-box;
    padding-left: 2px;
}
.active{
    background: #b3ccff;
}
.active .row-cell{
    border-right: 1px solid #fff;
}
.fa-ellipsis-h{
    padding: 0 4px;
    cursor: pointer;
}
.fa-ellipsis-h:hover{
    color: blue;
}
select{
    background: #fff;
    border: none;
    margin-right: 2px;
    width: 100%;
}
input{
    width: 100%;
    border: none;
}
</style>