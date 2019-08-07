<template>
    <div>
        <dc-form :object="form"></dc-form>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['propData'],
    data() {
        let _this = this
        return {
                form: new dc.Form({
                    size: 'mini',
                    bottomBtnStyle: 'text-align: right',
                    data: {row1: 'and', row3: '='},
                    structure: [{
                        label: '与上一条关系',
                        type: 'singleEnum',
                        name: 'op1',
                        option: [{
                            label: 'and',
                            value: 'and'
                        }, {
                            label: 'or',
                            value: 'or'
                        }]
                    }, {
                        label: '判断要素1',
                        name: 'value1',
                        type: 'textArea',
                    }, {
                        label: '判断方式',
                        type: 'singleEnum',
                        name: 'op2',
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
                        }]
                    }, {
                        label: '判断要素2',
                        name: 'value2',
                        type: 'textArea',
                    },],
                    btns: [{
                        label: '确定',
                        type: 'primary',
                        size: 'mini',
                        click() {
                            if(_this.propData.type === 'form-edit') {
                                _this.propData.row.row1 =  _this.form.data.op1
                                _this.propData.row.row2 =  _this.form.data.value1
                                _this.propData.row.row3 =  _this.form.data.op2
                                _this.propData.row.row4 =  _this.form.data.value2
                            }
                            if(_this.propData.type === 'form-add') {
                                let row = {
                                    row1: _this.form.data.op1,
                                    row2: _this.form.data.value1,
                                    row3: _this.form.data.op2,
                                    row4: _this.form.data.value2,
                                }
                                _this.propData.tableData.push(row)
                            }
                            if(_this.propData.table) {
                                _this.propData.table.tableData.push(_this.form.data)
                            }
                            if(_this.propData.currentRow) {
                                for(let key in _this.form.data) {
                                    _this.propData.currentRow[key] = _this.form.data[key]
                                }
                            }
                            _this.$closeDialog()
                        }
                    }, {
                        label: '取消',
                        size: 'mini',
                        click() {
                            VUE.$closeDialog()
                        }
                    }]
                })
        }
    },
    created() {
        if(this.propData.tableData || this.propData.table) {
            this.form.data = {
                op1: 'and', 
                op2: '>'
            }
        }
        if(this.propData.row) {
            let row = this.propData.row
            this.form.data = {
                op1: row.row1,
                op2: row.row3,
                value1: row.row2,
                value2: row.row4
            } 
        }
        if(this.propData.currentRow) {
            this.form.data = Object.assign({}, this.propData.currentRow)
        }
    },
    watch: {},
    computed: {},
    methods: {},
}
</script>
<style scoped>
</style>