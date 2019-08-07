<template>
    <div v-loading="loading"   element-loading-text="手动备份操作中">
        <dc-form :object="form"></dc-form>
        <el-button size="mini" @click="setBackup">手工备份</el-button>
        <div style="text-align: right">
            <el-button @click="submitForm" size="mini" type="primary">确定</el-button>
            <el-button @click="$closeDialog()" size="mini">取消</el-button>
        </div>
    </div>
</template>

<script>
export default {
  name: 'back-up',
  data () {
    return {
        form: new dc.Form({
            size: 'mini',
            labelWidth: '140px'
        }),
        loading: false
    }
  },
    created() {
        this.getData()
    },
    methods: {
        getData() {
            DCHttp.req({
                url: '/api/backup/detail'
            }).then(res => {
                this.form.data = res.formData
                this.form.structure = res.structure
            })
        },
        setBackup() {
            this.$confirm(`警告：执行手动备份，同时会清除掉${this.form.data.keepMonth == -1? '在此之前' : this.form.data.keepMonth + '个月前'}的备份。 是否继续?`, '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                center: true
                }).then(() => {
                    this.loading = true
                    DCHttp.req({
                        url: dcConfig.publicPath,
                        params: {
                            Class: 'SystemMgr',
                            FUNC: 'manualBackup'
                        }
                    }).then(res => {
                        this.loading = false
                        VUE.$successMessage('操作成功')
                    }).catch(err => {
                        this.loading = false
                    })
                    
                })
        },
        submitForm() {
            DCHttp.req({
                url: '/api/backup/update',
                params: {formData: this.form.data }
            }).then(res => {
                VUE.$successMessage('备份成功')
                VUE.$closeDialog()
            })
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    p{
        text-align: right;
        margin-top: 20px;
    }
</style>
