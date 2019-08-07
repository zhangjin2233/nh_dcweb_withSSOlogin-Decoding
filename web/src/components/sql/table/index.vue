<template>
    <div 
    :style="`left: ${object.x}px; top: ${object.y}px; border: 1px solid ${object.id === currentId ? '#ff0000' : '#000'}; width: ${object.width}px; height: ${object.height}px`" 
    class="sql-table"
    draggable="true"
    @dragend="moveTable"
    @dragstart.stop="moveStart"
    :id="object.id">
        <div 
        class="header" 
        :style="`background:${object.background}`">
            <span v-if="object.name">
                {{ '别名：' + object.name}}
            </span>
            <i :class="object.icon" :style="`color: ${object.iconColor}`"></i>
            <span>
                {{object.desc + '{' + object.title + '}'}}
            </span>
            <div class="btns-wrapper">
                <dc-buttons :object="object.buttonGroup" class="btns" :class="{'option-btns': object.option}"></dc-buttons>
                <el-select v-if="object.option" size="mini" v-model="object.setOpType" class="select">
                    <el-option v-for="item in object.option" :key="item.value" :value="item.value" :label="item.label"></el-option>
                </el-select>
            </div>
           
        </div>
        <div class="add-set" 
        v-if="object.type==='set'"
        ref="addTable"> 
            <el-popover
            placement="right"
            width="160"
            trigger="hover"
            v-model="addTableVisible">
                <ul>
                    <li 
                    v-for="item in tables.filter(item => {
                        return item.type!=='set'&&item.type!=='target'
                    })" 
                    :key="item.id" 
                    @click="selectTable(item)">{{item.name ? item.name : item.title}}</li>
                </ul>
                <el-button  class="add-set-btn" slot="reference" size="mini">
                    <i class="fa fa-plus"></i>
                </el-button>    
            </el-popover>
            <el-tag
            v-for="(tag, index) in tags"
            :key="index"
            @close="tagClose(tag)"
            class="add-set-tags"
            closable
            :type="tag.type">
            {{tag.name}}
            </el-tag>
        </div>
        <div
        class="table-body"
        :style="` height: calc(100% - ${object.type==='set'?24+object.addTableHeight:24}px)`"
        @scroll="tableScroll">
            <sql-row 
            v-for="(row, index) in object.rows" 
            :key="index" 
            :row="row" 
            :tables="tables" 
            :table='object' 
            :currentId="object.currentRow"></sql-row>
        </div>
        <div v-if="object.id === currentId">
            <div 
            class="drag" 
            v-for="item in dragList" 
            :key="item" 
            :class="{[item]: true}"
            draggable="true"
            @dragend.stop="dragEnd"
            @dragstart.stop="dragStart($event, item)"></div>
        </div>
        <div 
        class="add-btn" 
        @click.stop="addRows" 
        v-if="object.type!=='reflect'&&object.type!=='source'&&object.type!=='set'&&currentId&&currentId!==object.id&&currentRows.length>0">
            <i class="fa fa-plus-square-o"></i>
        </div>
    </div>
</template>

<script>
import sqlRow from './row.vue'
import SqlTable from './sqlTable.js'
export default {
    components: {
        'sql-row': sqlRow
    },
    props: ['object', 'currentId', 'currentRows', 'tables', 'type'],
    data() {
    let _this = this
      return {
          dragList: ['top', 'rigthTop', 'right', 'rightBottom', 'bottom', 'leftBottom', 'left', 'leftTop'],
          currentDrag: '',
          moveStartX: 0,
          moveStartY: 0,
          moveFn: {
              top(event) {
                  _this.object.move(_this.object.x, _this.object.y + event.movementY)
                  _this.object.resize(_this.object.width, _this.object.height - event.movementY)
              },
              rigthTop(event) {
                    _this.object.move(_this.object.x, _this.object.y + event.movementY)
                    _this.object.resize(_this.object.width + event.movementX, _this.object.height - event.movementY)
              },
              right(event) {
                    _this.object.resize(_this.object.width + event.movementX, _this.object.height)
              },
              left(event) {
                    _this.object.move(_this.object.x + event.movementX, _this.object.y)
                    _this.object.resize(_this.object.width - event.movementX, _this.object.height)
              },
              rightBottom(event) {
                    _this.object.move(_this.object.x, _this.object.y)
                    _this.object.resize(_this.object.width + event.movementX, _this.object.height + event.movementY)
              },
              bottom(event) {
                    _this.object.resize(_this.object.width, _this.object.height + event.movementY)
              },
              leftBottom(event) {
                    _this.object.move(_this.object.x + event.movementX, _this.object.y)
                    _this.object.resize(_this.object.width - event.movementX, _this.object.height + event.movementY)
              },
              leftTop(event) {
                    _this.object.move(_this.object.x + event.movementX, _this.object.y + event.movementY)
                    _this.object.resize(_this.object.width - event.movementX, _this.object.height - event.movementY)
              }
          },
          lazyScroll: null,
          addTableVisible: false,
          handle: 0,
          tags: [],
      }
    },
    created() {
        this.$nextTick(() => {
            let lines = this.$store.state.lines
            if(this.object.type.toLowerCase().includes('set')) {
                this.object.setOpType = this.object.raw.setOpType
                let id = this.object.id
                lines.forEach(item => {
                    if(item.input.table.id === id && this.tags.findIndex(i => i.table === item.output.table) === -1) {
                        this.tags.push({
                            name: item.output.table.raw.aliasName || item.output.table.raw.name,
                            table: item.output.table
                        })
                    }
                })
            }
        })
        
    },
    watch: {
        tagsLength(val) {
            this.$nextTick(() => {
                let height = this.$refs.addTable && this.$refs.addTable.offsetHeight
                this.object.addTableHeight =  height
                this.object.tags = this.tags.map(item => {
                    return item.name
                })
            })
        }
    },
    computed: {
        tagsLength() {
            return this.tags.length
        }
    },
    methods: {
        moveTable(event) {
            this.object.move(this.object.x + event.offsetX - this.moveStartX, this.object.y + event.offsetY - this.moveStartY, true)
            setTimeout(() => {
                this.$emitEvent('redraw')
            }, 40)
        },
        moveStart(event) {
           this.moveStartX = event.offsetX
           this.moveStartY = event.offsetY
        },
        dragEnd(event) {
            this.moveFn[this.currentDrag] && this.moveFn[this.currentDrag]({
                movementX: event.offsetX - this.moveStartX, 
                movementY: event.offsetY - this.moveStartY
            })
            setTimeout(() => {
                this.$emitEvent('redraw')
            }, 40)
        },
        dragStart(event, item) {
            this.moveStartX = event.offsetX
            this.moveStartY = event.offsetY
            this.currentDrag = item
        },
        mouseDown() {
            this.$parent.currentTableId = this.object.id
        },
        tableScroll() {
            if(!this.lazyScroll) {
                this.lazyScroll = setTimeout(() => {
                this.$emitEvent('redraw')
                this.lazyScroll = null
                }, 500)
            }
            
        },
        addRows() {
            this.currentRows.forEach(item => {
                this.object.rows.push(this.newRow(item))
                this.$nextTick(() => {
                    this.$emitEvent('redraw')
                })
            })
        },
        newRow(item) {
            let row = new SqlTable.Row({
                data: this.$handleData(item.data, {} , () => {})
            })
            let rowName = this.$store.state.sqlViewType = 'business' ? item.data[0].value : item.data[2].value
            row.expression = (item.table.name ? item.table.name : item.table.title) + '.' + rowName
            this.$store.commit('addLine', {
                output: {
                    table: item.table,
                    row: item
                },
                input: {
                    table: this.object,
                    row: row
                }
            })
            return row
        },
        selectTable(table) {
            this.addTableVisible = false
            if(this.tags.length === 0) {
                table.rows.length && table.rows.forEach(item => {
                    let row = this.newRow(item)
                    row.formTable = table.id
                    this.object.rows.push(row)
                })
            }else {
                table.rows.length && table.rows.forEach((item, index) => {
                    this.$store.commit('addLine', {
                        output: {
                            table: item.table,
                            row: item
                        },
                        input: {
                            table: this.object,
                            row: this.object.rows[index]
                        }
                    })
                })
            }
            this.tags.push({
                name: table.name ? table.name : table.title,
                table: table
            })
            this.$nextTick(() => {
                this.$emitEvent('redraw')
            })
        },
        tagClose(tag) {
            let tableId = tag.table.id
            let relativeRows = this.object.rows.filter(item => {
                return item.formTable = tableId
            })
            VUE.$emitEvent('clearRelation', this.object, relativeRows)
            this.tags.splice(this.tags.indexOf(tag), 1)
            this.$nextTick(() => {
                setTimeout(() => {
                    VUE.$emitEvent('redraw')        
                }, 40)
            })
           
        }
    },
}
</script>
<style scoped>
.sql-table{
    position: absolute;
    box-sizing: border-box;
    background: #fff;
    border-radius: 4px
}
.fa{
    font-size: 16px;
    line-height: 22px;
    margin-left: 2px;
}
.drag{
    position: absolute;
    width: 12px;
    height: 12px;

}
.header{
    position: relative;
    width: 100%;
    height: 24px;
    border-bottom: 1px solid #000;
    box-sizing: border-box;
    overflow: hidden;
    cursor: move;
    font-size: 12px;
    line-height: 22px;
    border-radius: 4px 4px 0 0 
}
.top{
    top: -6px;
    left: 50%;
    cursor: n-resize;
}
.bottom{
    bottom: -6px;
    left: 50%;
    cursor: s-resize
}
.top,.bottom{
    transform: translateX(-50%);
    width: calc(100% - 12px);
}
.left{
    top: 50%;
    left: -6px;
    cursor: w-resize
}
.right{
    top: 50%;
    right: -6px;
    cursor: e-resize
}
.left,.right{
    transform: translateY(-50%);
    height: calc(100% - 12px);
}
.rigthTop{
    right: -6px;
    top: -6px;
    cursor: ne-resize;
    
}
.rightBottom{
    right: -6px;
    bottom: -6px;
    cursor: se-resize
}
.leftBottom{
    left: -6px;
    bottom: -6px;
    cursor: sw-resize
}
.leftTop{
    left: -6px;
    top: -6px;
    cursor: nw-resize;
}

.btns-wrapper{
    position: absolute;
    right: 2px;
    top: 0;
}
.table-body{
    overflow: auto;
}
.add-btn{
    position: absolute;
    top: 0px;
    left: -20px;
    cursor: pointer;
    color: green
}
.fa-plus{
    color: green
}
.btns{
    display: inline-block;
}
.select{
    width: 86px;
    top: -2px;
    transform: scale(0.84)
}
.option-btns{
    position: relative;
    top: -3px;
}
.add-set-btn{
    padding: 0px 8px;
    margin: 2px 4px;
}
.add-set{
    border-bottom: 1px solid #ccc;
}
.add-set-tags{
    position: relative;
    top: -2px
}
ul{
    margin: 0;
    padding: 0;
    list-style: none;
}
li{
    cursor: pointer;
    border-bottom: 1px solid #ccc;
}
li:hover{
    background: #cce5ff;
}
</style>