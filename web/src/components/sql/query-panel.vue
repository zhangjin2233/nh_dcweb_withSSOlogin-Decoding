<template>
    <div>
        <div class="header">
            <el-button size="mini" @click="runSql">
                <i class="fa fa-play" style="color: green"></i>
            </el-button>
            <el-select size="mini" v-model="limitNum">
                <el-option v-for="item in limitOption" :key="item" :value="item" :label="item"></el-option>
            </el-select>
        </div>
        <div class="content">
            <el-input v-model="sqlContent" type="textarea" :autosize="{minRows: 10, maxRows: 10}"></el-input>
        </div>
        <div class="result">
            <dc-table :object="resultTable"></dc-table>
        </div>
        <div class="footer">
            <el-button type="primary" size="mini">确定</el-button>
            <el-button size="mini" @click="$closeDialog">取消</el-button>
        </div>
        <el-dialog
        title="查询数据库... ..."
        :append-to-body="true"
        :visible.sync="dialogVisible"
        width="300px">
            <i class="el-icon-loading"></i>
            <span>查询中...</span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['propData'],
    data() {
      return {
          limitNum: 100,
          limitOption: ['Not limited', 100, 500, 1000, 10000],
          sqlContent: '',
          resultTable: new dc.Table({
              hasPage: false,
              height: '180px'
          }),
          dialogVisible: false,
      }
    },
    created() {
        this.sqlContent = this.propData.sql
        this.runSql()
    },
    watch: {},
    computed: {
        rows() {
            return this.propData.rows.map(item => item.raw)
        }
    },
    methods: {
        runSql() {
            this.dialogVisible = true
            DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                    Class: 'PDCMgr',
                    FUNC: 'testQuerySql',
                    [dcConfig.paramsKey]: {
                        pdc: this.propData.pdc,
                        sSql: this.propData.sql,
                        viewName: this.propData.viewName,
                        rows: this.limitNum
                    }
                }
            }).then(res => {
                let left = res.CONTENT.left
                this.resultTable.tableHead = left.map((item, i) => {
                    if(i === 0) {
                        let index = this.rows.findIndex(r => r.fieldName.toLowerCase() === item.name)
                        if(index > -1) {
                            item.label += `(${this.rows[index].label})`
                        }
                    }
                    
                    item.type = 'string'
                    return item
                })
                let data = res.CONTENT.right
                this.resultTable.tableData = data.map(item => {
                    let obj = {}
                    item.forEach((r, i) => {
                        obj[left[i].name] = r
                    })
                    return obj
                })
                this.dialogVisible = false
            }).catch(err => {
                this.dialogVisible = false
            })
        }
    },
}
</script>
<style scoped>
.header{
    height: 28px;
    margin-bottom: 10px;
}
.content{
    min-height: 200px;
    overflow: auto;
    width: 100%;
    border: 1px solid #ccc;
    margin-bottom: 6px;
}
.result{
    min-height: 200px;
    overflow: auto;
    width: 100%;
    background: #ccc;
    border: 1px solid #ccc;
    
}
.footer{
    text-align: right;
    margin-top: 10px;
}
</style>