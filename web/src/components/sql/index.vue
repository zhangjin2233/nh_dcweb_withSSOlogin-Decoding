<template>
    <div>
        <div 
        class="container" 
        :class="{reflect: type==='reflect'}"
        :style="`height: ${height}; width: 100%`" v-show="!showForm">
            <panel-header :tables="tables" :allData="propData.data" :sqlData="sqlData" :type="type" :dipName="propData.dipName"/>
            <div class="sql-left-side">
                <sql-draw :table="tables" :type="propData.type" :sqlData="sqlData" ref="sqlDraw"></sql-draw>
            </div>
            <!-- <div class="sql-right-side" v-if="type!=='reflect'">
                <div>&nbsp;&nbsp;&nbsp;&nbsp;配置执行：</div>
                <div>
                    <span>&nbsp;&nbsp;执行类型</span>
                    <el-select size="mini" v-model="sqlData.executeType">
                        <el-option 
                        v-for="item in preformOptions" 
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"></el-option>
                    </el-select>
                    <component 
                    :is="preformOptions[sqlData.executeType - 1].component" 
                    :data="sqlData[preformOptions[sqlData.executeType - 1].key]" 
                    :delAdvSql="sqlData.delAdvSql"
                    :updateRelat="sqlData.updateRelat"
                    :tables="tables"
                    style="font-size: 12px"/>
                </div>
            </div> -->
        </div>
        <div v-if="showForm">
            <edit-form :tables="tables"></edit-form>
        </div>
    </div>
</template>

<script>
import panelHeader from './header.vue'
import sqlComputed from './computed.vue'
import sqlDelete from './delete.vue'
import sqlStorage from './storage.vue'
import sqlUpdate from './update.vue'
import draw from './draw.vue'
import SqlTable from './table/sqlTable.js'
const editForm = () => import('./edit-form.vue')
export default {
    components: {
        'panel-header': panelHeader,
        'sql-computed': sqlComputed,
        'sql-delete': sqlDelete,
        'sql-storage': sqlStorage,
        'sql-update': sqlUpdate,
        'sql-draw': draw,
        'edit-form': editForm
    },
    props: ['propData'],
    data() {
        return {
            sqlData: {},
            preformType: 'sql-computed',
            leftWidth: 0,
            height: 0,
            showForm: false,
            preformOptions: [{
                component: 'sql-computed',
                value: 1,
                label: '计算中间集',
                key: 'variableOperations'
            }, {
                component: 'sql-storage',
                value: 2,
                label: '入库到目标表',
                key: ''
            }, {
                component: 'sql-delete',
                value: 3,
                label: '删除目标表数据',
                key: 'delConds'
            }, {
                component: 'sql-update',
                value: 4,
                label: '更新目标表数据',
                key: 'updateValue'
            }],
            tables: [],
            type: ''
        }
    },
    created() {
        this.type = this.propData.type
        if(this.type === 'reflect') {
            this.sqlData = this.propData.data
        }else {
            this.sqlData = this.propData.data.job.sqlCmp
        }
        this.height = window.innerHeight  + 'px'
        this.$addListener('showSqlForm', () => {
            let sqlDraw = this.$refs.sqlDraw
            let type = this.$store.state.currentTable.type
            // if(type === 'target') {
            this.$openDialog({
                title: '',
                width: '680px',
                top: '2vh',
                component: 'sqlOutputForm',
                data: {
                    table: this.$store.state.currentTable
                }
            })
            // }else {
            //     this.showForm = true
            // } 
        })
        // if(this.sqlData.viewMetas.length !== 0) {
        //     this.tables = this.formatTable(this.mappingTables)
        // }else {
            this.tables = this.formatTable(this.sqlData.viewMetas)
        // }
        this.$nextTick(() => {
            this.$store.commit('setLines', this.formatRelation(this.sqlData.fieldRelations))
        })
    },
    destroyed() {
        this.$cancelEvent('showSqlForm')
        this.$store.state.viewNames = []
        this.$store.state.outputNames = []
    },
    watch: {
        viewType(val) {
           this.exchangeView(this.tables)
        }
    },
    computed: {
        viewType() {
            return this.$store.state.sqlViewType
        },
        mappingTables() {
            return this.$store.state.PDCData.data.sqlMapping.viewMetas
        }
    },
    methods: {
        formatTable(data) {
            let tables = []
            data.forEach(item => {
                let table = null
                switch(item.streamType) {
                    case 'external':
                    table = this.getNewTable(item, 'SourceTable')
                    tables.push(table)
                    break
                    case 'internal':
                    if(item.viewType === 'normal') {
                        table = this.getNewTable(item, 'ViewTable')
                        tables.push(table)
                    }else {
                        table = this.getNewTable(item, 'SetTable')
                        tables.push(table)
                    }
                    this.$store.commit('updateTableName', item.name)
                    break
                    case 'output':
                    if(item.viewType === 'normal') {
                        table = this.getNewTable(item, 'TargetTable')
                        tables.push(table)
                    }else {
                        table = this.getNewTable(item, 'OutputSetTable')
                        tables.push(table)
                    }
                    this.$store.commit('updateTableName', item.name, 'Output')
                }
            })
            return tables
        },
        getNewTable(data, type) {
            let table = null
            table = new SqlTable[type]({
                x: data.x,
                y: data.y,
                height: data.height,
                width: data.width,
                title: data.name,
                name: data.aliasName,
                raw: data,
                form: {
                    groupBy: data.groupBy,
                    joinExt: data.joinExt,
                    fromExt: data.fromExt ? data.fromExt : '',
                    whereExt: data.whereExt,
                    limit: data.limit,
                    orderBy: data.orderBy
                },
                tags: data.setOpViews,
                setOpType: data.setOpType,
                viewType: data.viewType
            })
            table.rows = data.fields.map(row => {
                let newRow = new SqlTable.Row({
                    data: [{
                        value: row.label
                    }, {
                        value: row.dataType
                    }, {
                        value: row.fieldName
                    }],
                    raw: row,
                
                    expression: row.expression,
                    canBeNull: row.canBeNull,
                    extend: row.extend,
                    defaultV: row.defaultV,
                    isPrimaryKey: row.isPrimaryKey,
                    userType: row.userType
                }) 
                row.uuid && (newRow.id = row.uuid)
                return newRow
            })
            return table
        },
        formatRelation(data) {
            let relation = data.map(item => {
                let line = {}
                let outputRow = this.findRow(item.srcFieldUuid)
                let inputRow = this.findRow(item.dstFieldUuid, 'input')
                line.output = {
                    row: outputRow,
                    table: outputRow.table
                }
                line.input = {
                    row: inputRow,
                    table: inputRow.table
                }
                return line
            })
            return relation
        },
        findRow(id, type='output') {
            // let tableType = {
            //     output: ['source', 'set', 'view'],
            //     input: ['target', 'set', 'view']
            // }
            let tables = this.tables
            for(let i = 0; i < tables.length; i++) {
                let item = tables[i]
                // if(!tableType[type].includes(item.type)) {
                //     continue
                // }
                let index = item.rows.findIndex(r => r.id === id)
                if(index > -1) {
                    return item.rows[index]
                }
            }
            return {}
        },
        exchangeView(tables) {
            tables.forEach(item => {
                item.rows.forEach(row => {
                    let temp = row.data[0].value
                    if(row.data[2]) {
                        row.data[0].value = row.data[2].value
                        row.data[2].value = temp
                    }else {
                        row.data[2] = {
                            value: row.data[0].value
                        }
                        row.data[0].value = ''
                    }
                })
            })
        }
    },
}
</script>
<style scoped>
.container{
    width: calc(100% - 260px);
    position: absolute;
    top: 0;
    left: 0;
    /* overflow: hidden; */
}
.reflect{
    width: 100%
}
.sql-left-side{
    width: 100%;
    box-sizing: border-box; 
    padding-top: 66px;
    height: 100%;
}
.sql-right-side{
    position: fixed;
    width: 260px;
    right: 0;
    top:0;
    bottom: 0;
    background-color: #fff;
    border-left: 1px solid #ccc;
}
</style>