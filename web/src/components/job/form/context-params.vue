<template>
    <div class="context-params">
        <el-button-group>
            <el-button title="新建" class="fa fa-plus" style="color: green" size="mini" @click="add"></el-button>
            <el-button title="删除" class="fa fa-remove" style="color: red" size="mini"  @click="remove"></el-button>
        </el-button-group>
        <dc-table :object="table"></dc-table>
    <p v-if="propData" class="btn-group">
        <el-button type="primary" @click="submit">确定</el-button>
        <el-button @click="$closeDialog">取消</el-button>
    </p>
    </div>
</template>

<script>
export default {
    name: 'contextParams',
    data () {
      return {
        tableData: [{
            key: '',
            value: ''
        }],
        tableHeight: '100px',
        currentRow: null,
        flowContext: {
        },
        table: new dc.Table({
            height: '220px',
            hasPage: false,
            tableData: this.contextData && this.contextData.tableData,
            tableHead: this.contextData && this.contextData.tableHead,
            editable: true
        })
      }
    },
    created() {
       if(this.propData) {
            DCHttp.req({
                url: '/api/Job/flowContext',
                params: {
                    id: this.propData.jobId,
                    type: this.propData.type
                }
            }).then(res => {
                this.flowContext = res
                this.table.tableHead = res.tableHead
                this.table.tableData = res.tableData
            })
       }else{
           this.flowContext = this.contextData
       }
       this.$nextTick(() => {
           let contentHeight = document.querySelector('.context-params').offsetHeight
           this.tableHeight = contentHeight - 120 + 'px'
       })
    },
    props: ['propData', 'contextData'],
    methods: {
        rowClick(row) {
            this.currentRow = row
        },
        add() {
            this.flowContext.tableData.push({
                k: '',
                v: ''
            })
        },
        remove() {
            let tableData = this.table.tableData
            let index = tableData.findIndex(t => this.table.currentRow === t)
            tableData.splice(index, 1)
            this.tableData.currentRow = null
        },
        submit() {
            DCHttp.req({
                url: '/api/Job/updateFlowContext',
                params: {
                    jobId: this.propData.jobId,
                    tableData: this.table.tableData,
                    type: this.propData.type
                },
                method: 'post'
            }).then(res => {
                this.$message({
                    message: '修改成功',
                    type: 'success',
                    showClose: true
                })
                this.$closeDialog()
            })
            
                    
        } 
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3{
    margin: 0;
    padding: 0;
    margin-bottom: 10px;
}
.btn-group{
    text-align: right
}
@media screen and (min-height: 660px) and (max-height: 2000px){
    .el-table{
        margin-top: 10px;
        height: 420px;
    }
}
@media screen and (max-height: 660px) {
    .el-table{
        height: 220px;
    }
}
</style>
