<template>
    <div class="delete">
        <div>
            <span>高级模式：</span>
            <el-switch
            v-model="advance">
            </el-switch>
            <el-button size="mini" v-if="advance" type="primary" class="confirm">确定</el-button>
            <div v-if="!advance">
                <dc-buttons :object="buttons"></dc-buttons>
                <dc-table :object="table"></dc-table>
            </div>
            <div v-else style="margin-top: 10px;">
                <el-input type="textarea" v-model="sqlText" :autosize="{ minRows: 14}"/>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    components: {},
    props: ['data', 'delAdvSql'],
    data() {
      return {
            advance: false,
            buttons: new dc.Buttons({
                data: [{
                    title: '新增行',
                    icon: 'fa fa-plus',
                    color: 'green',
                    click(table) {
                        VUE.$openDialog(new dc.Dialog({
                            title: '',
                            width: '400px',
                            component: 'sql-relation',
                            data: {
                                table: table
                            }
                        }))
                    }
                }, {
                    title: '删除行',
                    icon: 'fa fa-times',
                    color: 'red',
                    click(table) {
                        table.tableData.splice(table.tableData.indexOf(table.currentRow), 1)
                    }
                }, ]
            }),
            table: new dc.Table({
                hasPage: false,
                tableHead: [{
                    label: '与上一条关系',
                    name: 'op1',
                    type: 'string'
                }, {
                    label: '判断条件',
                    name: 'op2',
                    type: 'string'
                }],
                rowDbClick(data, row) {
                    VUE.$openDialog(new dc.Dialog({
                        title: '',
                        width: '400px',
                        component: 'sql-relation',
                        data: {
                            currentRow: row
                        }
                    }))
                }
            }),
            sqlText: '',
            newRow:  {
                op: 'and',//and or操作
                leftV: '',
                rightV: '',
                conditions: [
                    {
                        leftV: '',
                        rightV: '',
                        op: '=', //= > < >= <= 之类的操作
                        conditions: [] //为空即可
                    }
                ]
            }
      }
    },
    created() {
        let tableHeight = window.innerHeight - 160
        this.buttons.params = [this.table]
        this.table.height = tableHeight
        this.table.tableData = []
        this.data.forEach(item => {
            this.tableData.push({
                op1: item.op,
                op2: item.conditions[0].op,
                value1: item.conditions[0].leftV,
                value2: item.conditions[0].rightV
            })
        })
        if(this.delAdvSql[0]) {
            this.advance = true
            this.sqlText = this.delAdvSql[0]
        }
    },
    watch: {
        tableData: {
            deep: true,
            handler(val) {
                this.setDate(val, this.data)
            }
        },
        advance(val) {
            if(!val) {
                this.sqlText = ''
                this.table.tableData = []
            }
        },
        sqlText(val) {
            this.delAdvSql[0] = val
        }
    },
    computed: {
        tableData(val, target) {
            return this.table.tableData
        },
    },
    methods: {
        setDate(val, target) {
            target.splice(0, target.length)
            val.forEach(item => {
                target.push({
                    op: item.op1,
                    leftV: '',
                    rightV: '',
                    conditions: [{
                        conditions: [],
                        op: item.op2,
                        leftV: item.value1,
                        rightV: item.value2
                    }]
                })
            })
        }
    },
}
</script>
<style scoped>
.delete{
    box-sizing: border-box;
    padding: 10px;
}
.confirm{
    padding: 2px 8px;
    font-size: 12px;
    margin-left: 6px;
}
</style>