<template>
    <div>
        <el-select size="mini" v-model="data.row.desc" :filterable="true" :allow-create="true" placeholder="请选择">
            <el-option :value="item" :label="item" v-for="(item, index) in option" :key="index"></el-option>
        </el-select>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['data'],
    data() {
      return {
          option: [""]
      }
    },
    created() {
        DCHttp.req({
            url: dcConfig.publicPath,
            params: {
                [dcConfig.paramsKey]: {
                    fullClass: this.data.row.fullClass
                },
                Class: 'com.leavay.dataquality.DataQualityAction',
                FUNC: 'listTagByFullClass'
            }
        }).then(res => {
            if(res) {
                this.option.splice(1,this.option.length,...res.CONTENT)
                // this.option = res.CONTENT
            }
        })
    },
    watch: {},
    computed: {},
    methods: {},
}
</script>
<style scoped>
</style>