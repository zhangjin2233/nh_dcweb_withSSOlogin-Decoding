<template>
    <div class="edit-form">
        <div class="back" @click="back">
            <i class="fa fa-mail-reply"></i>
        </div>
        <h3>常规设置</h3>
        <dc-form :object="form"></dc-form>
        <h3>关联配置：</h3>
        <div>
            <span>选择主数据集:</span>
            <el-select size="mini" v-model="table.form.fromExt">
                <el-option v-for="(item, index) in datasetOption" :value="item.value" :label="item.label" :key="index"></el-option>
            </el-select>
        </div>
        <div class="table-wrapper">
            <dc-table :object="contactTable"></dc-table>
        </div>
        <h3 style="position: relative">过滤设置：
            <div class="advanced-mode">
                <el-checkbox label="Advanced Mode" v-model="advancedMode"></el-checkbox>
            </div>
        </h3>
        <div class="table-wrapper" v-show="!advancedMode">
            <dc-table :object="filterTable"></dc-table>
        </div>
        <div v-show="advancedMode">
            <el-input type="textarea" v-model="advanceCode" :autosize="{minRows: 8, maxRows: 8}"></el-input>
        </div>
        <div>
            <span>行数限制：（输入行数限制，如：10或3，10）</span>
            <el-input type="textarea" v-model="table.form.limit"></el-input>
        </div>
        <h3>排序配置：</h3>
        <div>
            <el-popover
            placement="right"
            width="160"
            trigger="hover"
            v-model="addRowVisible">
                <ul>
                    <li v-for="item in rows.filter(item => item.type!=='set')" class="table-tag" :key="item.id" @click="selectTable(item)">{{item.title}}</li>
                </ul>
                <el-button type="primary" class="add-set-btn" slot="reference" size="mini">
                    <i class="fa fa-plus"></i>
                </el-button>    
            </el-popover>
            <el-tag
            v-for="(tag, index) in tags"
            :key="index"
            @close="tagClose(tag)"
            class="add-row-tags"
            closable
            :type="tag.type">
            {{tag.name}}
            </el-tag>
        </div>
        <hr>
        <div class="btns">
            <el-button type="primary" size="mini" @click="submitForm">确定</el-button>
            <el-button size="mini" @click="back">取消</el-button>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: [ 'tables' ],
    data() {
        let _this = this
        let form = new dc.Form({
            size: 'mini',
            data: {},
            structure: [{
                name: 'name',
                label: 'name',
                canBeEmpty: false,
                type: 'string'
            }, 
            {
                name: 'dependRows',
                label: '统计依据列',
                type: 'textarea',
                palceholder: '输入分组字段（逗号分隔）'
            }],
        })
        let contactTable = new dc.Table({
            hasPage: false,
            height: '160px',
            btnGroup: [{
                icon: 'fa fa-plus',
                color: 'green',
                click(data, row, head, table) {
                    VUE.$openDialog(new dc.Dialog({
                        width: '500px',
                        component: 'add-contact',
                        data: {
                            option: _this.datasetOption,
                            tableData: data,
                            tableHead: head
                        }
                    }))
                }
            }, {
                icon: 'fa fa-times',
                color: 'red',
                click(data, row, head, table) {
                    data.splice(data.indexOf(row), 1)
                    table.currentRow = null
                }
            }, {
                icon: 'fa fa-edit',
                color: 'blue',
                needRow: true,
                click(data, row, head, table) {
                    VUE.$openDialog(new dc.Dialog({
                        width: '500px',
                        component: 'add-contact',
                        data: {
                            option: _this.datasetOption,
                            tableData: data,
                            tableHead: head,
                            row: row
                        }
                    }))
                }
            }],
            tableHead: [{
                name: 'row1',
                label: '关联',
                type: 'singleEnum',
                option: [{
                    value: 'join',
                    label: '关联'
                }, {
                    value: 'left join',
                    label: '左关联'
                }, {
                    value: 'right join',
                    label: '右关联'
                }]
            }, {
                name: 'row2',
                label: '数据集1',
                type: 'string'
            }, {
                name: 'row3',
                label: '数据集1列',
                type: 'string'
            }, {
                name: 'row4',
                label: '数据集2',
                type: 'string'
            }, {
                name: 'row5',
                label: '数据集2列',
                type: 'string'
            }],
            tableData: [],
        })
        let filterTable = new dc.Table({
            hasPage: false,
            height: '160px',
            btnGroup: [{
                icon: 'fa fa-plus',
                color: 'green',
                click(data, row, head, table) {
                    VUE.$openDialog(new dc.Dialog({
                        title: '',
                        width: '400px',
                        component: 'sql-relation',
                        data: {
                            tableData: data,
                            tableHead: head,
                            type: 'form-add'
                        }
                    }))
                }
            }, {
                icon: 'fa fa-times',
                color: 'red',
                click(data, row, head, table) {
                    data.splice(data.indexOf(row), 1)
                    table.currentRow = null
                }
            }, {
                icon: 'fa fa-edit',
                color: 'blue',
                needRow: true,
                click(data, row, head, table) {
                    VUE.$openDialog(new dc.Dialog({
                        title: '',
                        width: '400px',
                        component: 'sql-relation',
                        data: {
                            tableData: data,
                            tableHead: head,
                            row: row,
                            type: 'form-edit'
                        }
                    }))
                }
            }],
            tableHead: [{
                name: 'row1',
                label: '与一条关系',
                type: 'singleEnum',
                option: [{
                    label: 'and',
                    value: 'and'
                }, {
                    label: 'or',
                    value: 'or'
                }]
            }, {
                name: 'row2',
                label: '判断要素1',
                type: 'string'
            }, {
                name: 'row3',
                label: '判断方式',
                type: 'singleEnum',
                option: [{
                    label: '>',
                    value: '>'
                }, {
                    label: '>=',
                    value: '>='
                }, {
                    label: '<',
                    value: '<'
                }, {
                    label: '<=',
                    value: '<='
                }, {
                    label: '=',
                    value: '='
                }, {
                    label: '!=',
                    value: '!='
                }, {
                    label: 'is null',
                    value: 'is null'
                }, {
                    label: 'is not null',
                    value: 'is not null'
                }, {
                    label: 'in',
                    value: 'in'
                }, {
                    label: 'not in',
                    value: 'not in'
                }, {
                    label: 'like',
                    value: 'like'
                }
                ]
            }, {
                name: 'row4',
                label: '判断要素2',
                type: 'string'
            }],
            tableData: [],
        })
        return {
            form: form,
            mainDataset: '',
            datasetOption: [],
            contactTable: contactTable,
            filterTable: filterTable,
            advancedMode: false,
            addRowVisible: false,
            rows: [],
            tags: [],
            table: null,
            advanceCode: '',
            limitRows: '',
            groupTips: '输入分组字段（逗号分隔）'
        }
    },
    created() {
        this.table = this.$store.state.currentTable
        this.rows = this.table.rows.map(item => {
            return {
                title: item.expression,
                value: item.expression
            }
        })
        this.form.data.name = this.table.title
        this.form.data.desc = this.table.desc
        this.form.data.dependRows = this.table.form.groupBy
        this.tables.forEach(item => {
            if(item.type === 'source') {
                this.datasetOption.push({label: item.name, value: item.id, table: item})
            }else if(item.type === 'view') {
                this.datasetOption.push({label:item.title, value: item.id, table: item})
            }
        })
        this.contactTable.tableData = this.table.form.joinExt.map(item => {
            return {
                row1: item.type ? item.type : '-',
                row2: item.table1 ? item.table1 : '-',
                row3: item.column1 ? item.column1 : '-',
                row4: item.table2 ? item.table2 : '-',
                row5: item.column2 ? item.column2 : '-'
            }
        })
        this.filterTable.tableData = this.table.form.whereExt.map(item => {
            return {
                row1: item.op ? item.op : '-',
                row2: item.conditions[0].leftV ? item.conditions[0].leftV : '-',
                row3: item.conditions[0].op ? item.conditions[0].op : '-',
                row4: item.conditions[0].rightV ? item.conditions[0].rightV : '-',
            }
        })
        this.mainDataset = this.datasetOption[0].value
    },
    watch: {},
    computed: {},
    methods: {
        tagClose(tag) {
            this.tags.splice(this.tags.indexOf(tag), 1)
        },
        back() {
            this.$parent.showForm = false
        },
        selectTable(item) {
            if(this.tags.findIndex(t => t.name === item.value) == -1) {
                this.tags.push({
                    name: item.value
                })
            } 
           
            this.addRowVisible = false
        },
        submitForm() {
            this.table.form.joinExt = this.contactTable.tableData.map(item => {
                return {
                    type: item.row1,
                    table1: item.row2,
                    column1: item.row3,
                    table2: item.row4,
                    column2: item.row5
                }
            })
            this.table.form.whereExt = this.filterTable.tableData.map(item => {
                return {                            
                    op: item.row1,
                    leftV: '',
                    rightV: '',
                    conditions: [
                        {
                            op: item.row3,
                            leftV: item.row2,
                            rightV: item.row4,
                            conditions: []
                        }
                    ]          
                }
            })
            this.table.form.groupBy = this.form.data.dependRows
            if(this.table.title !== this.form.data.name) {
                let lines = this.$store.state.lines
                lines.forEach(item => {
                    let table = null
                    if(item.output.table === this.table) {
                        let expression = item.input.row.expression
                        item.input.row.expression = expression.replace(this.table.title + '.', this.form.data.name + '.')
                    }
                })
                this.table.title = this.form.data.name
            }
            this.back()
        }
    },
}
</script>
<style scoped>
h3{
    margin: 0 10px;
}
.table-wrapper{
    margin-top: 8px;
}
.edit-form{
    margin: 0 10px 20px 10px;
    position: relative;
}
.advanced-mode{
    position: absolute;
    right: 10px;
    top: 2px;
}
.add-row-tags{
    display: inline-block;
}
.btns{
    text-align: center
}
.back{
    position: absolute;
    right: 20px;
    top: 6px;
    cursor: pointer;
    color: blue;
    font-size: 20px;
}
.table-tag{
    cursor: pointer;
}
</style>