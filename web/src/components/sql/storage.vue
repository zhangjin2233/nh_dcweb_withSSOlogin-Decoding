<template>
    <div class="stroage">
        <el-button type="primary" @click="confirm">通过本输出集构建目标表结构</el-button>
    </div>
</template>

<script>
import FormatTable from './formatTable.js'
export default {
    components: {},
    props: [ 'tables' ],
    data() {
      return {
      }
    },
    created() {},
    watch: {},
    computed: {

    },
    methods: {
        confirm() {
            let str = '注意请先保存本节点编辑信息后再点击确定！！<br>这个操作会将原有的表结构覆盖，并且无法精确到字段的长度、精度等，生成后或需自行修改，是否继续'
            this.$confirm(str, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                dangerouslyUseHTMLString: true,
                type: 'warning'
                }).then(() => {
                    let index = this.tables.findIndex(t => t.role === 'output')
                    let table = this.tables[index]
                    let data = this.$store.state.PDCData.data
                    let sqlMapping = this.$store.state.PDCData.data.sqlMapping
                    let reflectIndex = sqlMapping.viewMetas.findIndex(t => t.streamType === 'output')
                    let reflectTable = sqlMapping.viewMetas[reflectIndex]
                    let temTable = FormatTable.target(table)
                   
                    reflectTable.fields = temTable.fields
                    reflectTable.isAutoRebuild = true
                    reflectTable.isGlobalTable = true
                    reflectTable.groupBy = null
                    reflectTable.env = data.env
                    reflectTable.table = data.table_
                    reflectTable.schema = data.schema_
                    reflectTable.ds = data.tarLink_
                    this.$message({
                        type: 'success',
                        message: '操作成功!'
                    })
                })       
        }
    },
}
</script>
<style scoped>
.stroage{
    margin-top: 10px;
    margin-left: 6px;
}
</style>