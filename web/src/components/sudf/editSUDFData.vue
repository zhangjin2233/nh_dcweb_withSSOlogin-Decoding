<template>
    <div>
        <el-row>
            <el-col :span="3">标签：</el-col>
            <el-col :span="20">
                <el-input v-model="data.label" size="mini"></el-input>
            </el-col>
        </el-row>
        <el-input type="textarea" v-model="data.desc" class="desc-input"></el-input>
        <dc-table :object="table"></dc-table>
        <div class="btns">
            <el-button type="primary" size="mini" @click="$closeDialog">确定</el-button>
            <el-button size="mini" @click="closeDialog">取消</el-button>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['propData'],
    data() {
        return {
            table: new dc.Table({
                hasPage: false,
                editable: true,
                tableHead: [{
                    type: 'span',
                    name: 'name',
                    label: '参数'
                }, {
                    type: 'string',
                    name: 'desc',
                    label: '描述'
                }],
                // cellAppend: [{
                //     prop: 'desc',
                //     condition: true, 
                //     component: 'SUDFSelectInput'
                // }]
            }),
            data: {},
            memoryData: {}
        }

    },
    created() {
        // console.log(this.propData)
        dcConfig.customModule && this.table.set('cellAppend',[{
            prop: 'desc',
            condition: true, 
            component: 'SUDFSelectInput'
        }]);
        this.data = this.propData.data
        this.table.tableData = this.propData.data.arguments
        this.memoryData.label = this.data.label
        this.memoryData.desc = this.data.desc
        this.memoryData.arguments = this.data.arguments.map(item => Object.assign({}, item))
    },
    watch: {},
    computed: {},
    methods: {
        closeDialog() {
            this.data = Object.assign(this.data, this.memoryData)
            this.$closeDialog()
        }

    },
}
</script>
<style scoped>
.desc-input{
    margin-top: 4px;
}
.btns{
    width: 100%;
    text-align: right;
}
</style>