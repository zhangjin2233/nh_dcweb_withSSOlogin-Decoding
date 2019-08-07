<template>
    <div v-if="title" class="wrapper">
        <div class="header">{{title}}:</div>
        <div class="content">
            <dc-buttons :object="btn" class="btns"></dc-buttons>
            <dc-form :object="form"></dc-form>
            <div class="testBtn" v-if="type === 'dataSource'">
                <span v-if="testObj.loading">
                    <i class="el-icon-loading"></i>
                    测试中
                </span>
                <el-button size="mini" type="primary" @click="testLink" :disabled="testObj.loading">测试连接</el-button>
            </div>
            <div class="testBtn" v-else-if="type === 'params'">
                <el-button size="mini" type="primary" @click="testParams">测试</el-button>
            </div>
            <dc-table :object="table" v-if="type !== 'agent'"></dc-table>
        </div>
    </div>
</template>

<script>
import config from './formConfig.js'
export default {
    data() {
        return {
            form: new dc.Form({
                size: 'mini',
                labelWidth: '160px'
            }),
            table: new dc.Table({
                hasPage: false,
                editable: true,
                btnSize: 'mini'
            }),
            btn: new dc.Buttons(),
            testObj: {
                loading: false
            }
        }
    },
    created() {
        this.initData()
    },
    methods: {
        initData() {
            config[this.type].getData(this.table, this.form, this.name)
            this.btn.data = config[this.type][this.handle + '_btns']
            this.table.btnGroup = config[this.type].tableBtns
            this.btn.params = [this.table, this.form, this.name]
            if(this.type === 'globaldataset') {
                this.table.colIndex.show = true
            }
        },
        testLink() {
            config[this.type].BDTest(this.testObj, this.table, this.form)
        },
        testParams() {
            DCHttp.req({
                url: '/api/param/testParams',
                params: {
                    formData: this.form.data,
                    tableData: this.table.tableData,
                    name: this.name
                }
            }).then(res => {
                this.$alert(res, '信息', {
                confirmButtonText: '确定',
                callback: action => {}
                })
            })
        }
    },
    computed: {
        title() {
            let handle = this.$route.query.handle
            let type = this.$route.query.type
            if(handle && type) {
                return (handle === 'create' ? '新增' : '修改') + config[type].title
            }
           
        },
        name() {
            return this.$route.query.name
        },
        handle() {
            return this.$route.query.handle
        },
        type() {
            return this.$route.query.type
        }
        
    },
    watch: {
        $route(to, from) {
            if(to.path === '/settingForm') {
               this.initData()
            }
        }
    }
  }
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .wrapper{
        height: 100%;
        overflow: hidden;
    }
    .content{
        height: calc(100% - 30px);
        overflow: auto;
    }
    .form{
        margin: 10px
    }
    .header{
        text-align: left;
        text-indent: 10px;
        font-size: 20px;
        font-weight: bold;
        line-height: 40px;
        border-bottom: 1px solid #ccc;
    }
    .btns{
        margin-top: 4px;
        margin-left: 6px;
    }
    .testBtn{
        text-align: right;
        padding-right: 10px;
    }
</style>
