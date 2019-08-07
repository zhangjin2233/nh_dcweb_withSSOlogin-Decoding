<template>
    <div class="header" :class="{'reflect-header': type === 'reflect'}">
        <dc-buttons :object="buttons"></dc-buttons>
        <div class="btn-group">
            <el-button type="primary" size="mini" @click="saveSql">确定</el-button>
            <el-button size="mini" @click="toBack()">取消</el-button>
        </div> 
        <div class="right-part">
            <data-time ref="dataTime"></data-time>
            <!-- <el-popover
            trigger="hover"
            placement="left"
            v-model="visible">
                <data-time></data-time>
                <i class="fa fa-navicon" slot="reference" v-show="showNav"></i>
            </el-popover> -->
        </div>
    </div>
</template>

<script>
import SqlTable from './table/sqlTable.js'
import dataTime from './data-time.vue'
import FormatTable from './formatTable.js'
export default {
    components: {
        'data-time': dataTime
    },
    props: ['tables', 'sqlData', 'type', 'allData', 'dipName'],
    data() {
        let _this = this
        return {
            buttons: new dc.Buttons({
                params: [],
                spaceBetween: '4px',
                data: []
            }),
            visible: false,
            showNav: false
        }
    },
    created() {
        this.buttons.params.push(this.tables)
        // window.addEventListener('resize', () => {
        //     this.navToggle()
        // })
        let _this = this
        let tryRunSql = () => {
            let table = _this.currentTable
            function getSQL(params) {
                DCHttp.req({
                    url: dcConfig.publicPath,
                    params: {
                        Class: 'PDCMgr',
                        FUNC: 'buildSqlOfSqlPdc',
                        [dcConfig.paramsKey]: params
                    },
                    method: 'post'
                }).then(res => {
                    if(res.STATE === 1) {
                        VUE.$openDialog(new dc.Dialog({
                            title: '查询：' + table.title,
                            fullscreen: true,
                            component: 'sqlQueryPanel',
                            data: {
                                sql: res.CONTENT,
                                pdc: params.pdc,
                                viewName: params.viewName,
                                rows: table.rows
                            }
                        }))
                    }else {
                        alert(res.ERR_MSG)
                    }
                })
            }
            if(table) {
                let viewName = table.raw.name
                let opTime = this.$refs.dataTime.time.getTime()
                let pdcName = VUE.$route.query.guid
                DCHttp.req({
                    url: dcConfig.publicPath,
                    params: {
                        Class: 'PDCMgr',
                        FUNC: 'getPDCbyName',
                        [dcConfig.paramsKey]: {
                            pdcName
                        }
                    }
                }).then(res => {
                    let pdc = res.CONTENT
                    let dipName = this.dipName
                    if(dipName) {
                        pdc.AllPeriodicFlowDef.jobNodeMap[dipName].job.sqlCmp.viewMetas = this.formatTable(this.tables)
                        pdc.AllPeriodicFlowDef.jobNodeMap[dipName].job.sqlCmp.fieldRelations = this.formatLines()
                    }else {
                        pdc.sqlMapping.viewMetas = this.formatTable(this.tables)
                        pdc.sqlMapping.fieldRelations = this.formatLines()
                    }
                    getSQL({
                        pdc,
                        viewName,
                        opTime,
                        dpiName: dipName
                    })
                })
            }else {
                VUE.$message({
                    message: '请选中目标表',
                    type: 'warning',
                    showClose: true
                })
            }
        }
        if(this.type !== 'reflect') {
            this.buttons.data =  [{
                text: '新建临时视图',
                    click(tables) {
                        _this.addTable(tables, 'ViewTable')
                    }
                }, {
                    text: '集合操作',
                    click(tables) {
                        _this.addTable(tables, 'SetTable')
                    }
                }, {
                    text: '新建输出表',
                    click(tables) {
                        let outputTables = _this.tables.filter(item => {
                            return item.role === 'output'
                        })
                        // if(outputTables.length) {
                        //     _this.$message({
                        //         type: 'warning',
                        //         message: '已存在输出表',
                        //         duration: 1500,
                        //         showClose: true
                        //     })
                        // }else {
                            _this.addTable(tables, 'TargetTable')
                        // }
                        
                    }
                }, {
                    text: '集合输出表',
                    click(tables) {
                        let outputTables = _this.tables.filter(item => {
                            return item.role === 'output'
                        })
                        // if(outputTables.length) {
                        //     _this.$message({
                        //         type: 'warning',
                        //         message: '已存在输出表',
                        //         duration: 1500,
                        //         showClose: true
                        //     })
                        // }else {
                            _this.addTable(tables, 'OutputSetTable')
                        // }
                    }
                }, {
                    text: '删除',
                    click(tables) {
                        VUE.$emitEvent('deleteTable', tables)
                    }
                },  
                {
                    text: '试运行SQL',
                    click(tables) {
                       tryRunSql()
                    }
            }]
        }else {
            this.buttons.data =  [{
                text: '配置来源表',
                click(tables) {
                    VUE.$openDialog(new dc.Dialog({
                        fullscreen: true,
                        component: 'sourceTable',
                    }))
                }
                }, {
                text: '新建临时视图',
                click(tables) {
                    _this.addTable(tables, 'ViewTable')
                }
                }, {
                    text: '集合操作',
                    click(tables) {
                        _this.addTable(tables, 'SetTable')
                    }
                }, {
                    text: '新建输出表',
                    click(tables) {
                        let outputTables = _this.tables.filter(item => {
                            return item.role === 'output'
                        })
                        // if(outputTables.length) {
                        //     _this.$message({
                        //         type: 'warning',
                        //         message: '已存在输出表',
                        //         duration: 1500,
                        //         showClose: true
                        //     })
                        // }else {
                            _this.addTable(tables, 'TargetTable')
                        // }
                        
                    }
                }, {
                    text: '集合输出表',
                    click(tables) {
                        let outputTables = _this.tables.filter(item => {
                            return item.role === 'output'
                        })
                        // if(outputTables.length) {
                        //     _this.$message({
                        //         type: 'warning',
                        //         message: '已存在输出表',
                        //         duration: 1500,
                        //         showClose: true
                        //     })
                        // }else {
                            _this.addTable(tables, 'OutputSetTable')
                        // }
                    }
                }, {
                    text: '删除',
                    click(tables) {
                        VUE.$emitEvent('deleteTable', tables)
                    }
                },  
                {
                    text: '试运行SQL',
                    click(tables) {
                        tryRunSql()
                    }
            }]
        }
       
        this.$nextTick(() => {
            this.navToggle()
        })
    },
    destroyed() {
        // window.removeEventListener('resize')
    },
    watch: {

    },
    computed: {
        lines() {
            return this.$store.state.lines
        },
        currentTable() {
            return this.$store.state.currentSqlTable
        }
    },
    methods: {
        addTable(table, type) {
            let name = (type === 'ViewTable' || type === 'SetTable' ? 'IV' : 'Output')
            VUE.$prompt('请输入流名称', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputValue: this.generateName(name)
                }).then(({ value }) => {
                    let height = document.getElementById('myCanvas').offsetHeight
                    let drawEl = document.getElementsByClassName('draw')[0]
                    let newTable = new SqlTable[type]({
                        title: value,
                        y: height + 20,
                        x: 20,
                        background: '#cceeff'
                    })
                    table.push(newTable)
                    VUE.$emitEvent('resizeDraw', newTable.id)
                    setTimeout(() => {
                        VUE.$emitEvent('redraw')
                            drawEl.scrollTop = height
                    }, 40)
                }).catch(() => {    
            })
        },
        navToggle() {
            // if(this.$parent.$el.offsetWidth < 1200) {
            //     this.showNav = true
            // }else {
                this.showNav = false
            // }
        },
        generateName(name = 'IV') {
            let arr
            if (name.includes('IV')) {
                arr = this.$store.state.viewNames
            } else {
                arr = this.$store.state.outputNames
            }
            if (arr.includes(name)) {
                let count = name.length > 2 ? parseInt(name.slice(2)) : 0
                return this.generateName('IV' + (count + 1))
            } else {
                this.$store.commit('updateTableName', name)
                return name
            }
        },
        toBack() {
            this.$closeDialog()
        },
        saveSql() {
            this.sqlData.viewMetas = this.formatTable(this.tables)
            this.sqlData.fieldRelations = this.formatLines()
            this.$closeDialog()
        },
        formatTable(source) {
            let target = []
            source.forEach(item => {
                let type = item.type
                let table = FormatTable[type](item)
                if(table.name === 'MainOutput') {
                    table.isAutoRebuild = true
                    table.isGlobalTable = true
                    table.groupBy = null
                }
                target.push(table)
            })
            return target
        },
        formatLines() {
            return this.lines.map(item => {
                return {
                    srcFieldUuid: item.output.row.raw.uuid ? item.output.row.raw.uuid : item.output.row.id, //来源字段的uuid
                    dstFieldUuid: item.input.row.raw.uuid? item.input.row.raw.uuid : item.input.row.id, //目标字段的uuid
                    srcView: item.output.table.title,//来源视图的名称
                    srcField: item.output.row.data[0].value, //来源视图的字段(非uuid，直接是字段)
                    dstView: item.input.table.title, //目标视图的名称
                    dstField: item.input.row.data[0].value, //目标视图的字段(非uuid，直接是字段)
                }
            })
        }
       
    },
}
</script>
<style scoped>
.header{
    width: 100%;
    position: fixed;
    padding-top: 4px;
    padding-bottom: 5px;
    box-sizing: border-box;
    top: 0;
    left: 0;
    border-bottom: 1px solid #ccc;
}
.reflect-header{
    width: 100%;
}
.right-part{
    position: absolute;
    right: 10px;
    top: 2px;
}
.fa-navicon{
    cursor: pointer;
}
.btn-group {
    padding-top: 4px;
    padding-left: 4px;
}
</style>