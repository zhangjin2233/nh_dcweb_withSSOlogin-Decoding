<template>
    <div>
        <span>输入挂起时长（秒）</span>
        <el-input v-model="pendSec" style="width: 160px"></el-input>
        <dc-table :object="table"></dc-table>
        <div style="text-align: right">
            <el-button size="mini" type="primary" @click="confirm">确定</el-button>
            <el-button size="mini" @click="$closeDialog">取消</el-button>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['propData'],
    data() {
      return {
            pendSec: 60,
            table: new dc.Table({
                editable: true,
                hasPage: false,
                height: '160px'
            })
      }
    },
    created() {
        DCHttp.req({
            url: '/api/resourcePool/listForBind'
        }).then(res => {
            this.table.tableHead = res.tableHead
            this.table.tableData = res.tableData
        })
    },
    watch: {},
    computed: {},
    methods: {
        confirm() {
            let mapRes = {}
            this.table.tableData.forEach(item => {
                mapRes[item.id] = parseInt(item.count) 
            })
            DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                    Class: 'JobMgr',
                    FUNC: 'changePDCResourceByPDCJobName',
                    [dcConfig.paramsKey]: {
                        jobId: this.propData.jobId,
                        pdcJobNames: this.propData.pdcNames,
                        mapRes,
                        pendSec: this.pendSec
                    }
                }
            }).then(res => {
                VUE.$successMessage('操作成功')
                VUE.$closeDialog()
            })
        }
    },
}
</script>
<style scoped>
</style>