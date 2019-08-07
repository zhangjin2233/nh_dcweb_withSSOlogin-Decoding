<template>
    <div>
        <div>
            作业变量操作
            <hr>
            <dc-buttons :object="buttons"></dc-buttons>
            <dc-table :object="table"></dc-table>
            <div class="form-wrapper" v-if="showForm">
                <dc-form :object="form"></dc-form>
                <div class="tips" @click="showTips">
                    <i class="fa fa-info-circle">参数说明</i>
                </div>
            </div>
            
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: [ 'data' ],
    data() {
        let _this = this
      return {
            buttons: new dc.Buttons({
                data: [{
                    title: '新增行',
                    icon: 'fa fa-plus',
                    color: 'green',
                    click(table) {
                        _this.showForm = true
                        _this.form.data = Object.assign({}, _this.newRow) 
                    }
                }, {
                    title: '删除行',
                    icon: 'fa fa-times',
                    color: 'red',
                    click(table) {
                       table.tableData.splice(table.tableData.indexOf(table.currentRow), 1)
                       table.currentRow = null
                    }
                }, ]
            }),
            table: new dc.Table({
                hasPage: false,
                tableData: [],
                tableHead: [{
                    name: 'varName',
                    label: '变量名',
                    type: 'string'
                }, {
                    name: 'opDesc',
                    label: '操作说明',
                    type: 'string'
                }],
                rowDbClick(data, row) {
                    this.showForm = true
                    _this.form.data = Object.assign({}, row)
                },
                filterSetting: [
                    {   prop: 'varName', 
                        value: '', 
                        show: '-'
                    }
                ]
            }),
            form: new dc.Form({
                size: 'mini',
                labelWidth: '70px',
                structure: [{
                    type: 'singleEnum',
                    option: [],
                    label: '变量名',
                    name: 'varName'
                }, {
                    type: 'string',
                    label: '操作说明',
                    name: 'opDesc',
                }, {
                    type: 'singleEnum',
                    option: [{
                        label: '赋值',
                        value: 'assignment',
                    }, {
                        label: '追加',
                        value: 'append',
                    }, {
                        label: '单值传递',
                        value: 'increment',
                    }],
                    name: 'function',
                    label: '方法'
                }, {
                    type: 'textarea',
                    label: '参数',
                    name: 'value',
                    autosize: {minRows: 4, maxRows: 4}
                }],
                btns: [{
                    label: '确定',
                    type: 'primary',
                    click(form) {
                        _this.table.tableData.push(Object.assign({},form.data))
                    }
                }]
            }),
            showForm: false,
            newRow: {
                name: '', //变量名称，这个是从本PDC中的jobParamsDef_中获取
                opDesc: '', //这个操作的描述
                function: 'assignment', //assignment:赋值,append:追加,increment:单值递增
                value: ''
            }
      }
    },
    created() {
        let tableHeight = window.innerHeight - 420
        this.buttons.params = [this.table]
        this.table.height = tableHeight
        this.table.tableData = this.data
    },
    watch: {},
    computed: {},
    methods: {
        showTips() {
            let str = '参数填写规则如下：<br>当参数需要是本节点的输出集时，仅填写$this$关键字<br>当参数是静态值时，直接填写数据，多列时使用逗号分隔，多行时使用换行分隔'
            this.$confirm(str, '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                dangerouslyUseHTMLString: true,
                showConfirmButton: false,
                showCancelButton: true,
                }).then(() => {
                })      
        }
    },
}
</script>
<style scoped>
.form-wrapper{
    position: relative;
}
.tips{
    position: absolute;
    cursor: pointer;
    left: 10px;
    bottom: 50px
}
.tips:hover{
    color: blue
}
</style>