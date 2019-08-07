<template>
    <div class="security">
        <dc-table :object="table"></dc-table>
    </div>
</template>

<script>
import option from './config.js'
export default {
    components: {},
    props: [],
    data() {
        return {
            table: new dc.Table({
                hasPage: false
            })
        }
    },
    created() {
        let type = this.$route.query.type
        this.table.btnGroup = option[type](this.table).btnGroup
        this.table.initData = option[type](this.table).initData
        this.table.rowDbClick = option[type](this.table).rowDbClick
        this.table.filterSetting = option[type](this.table).filterSetting
    },
    watch: {
        query: {
            deep: true,
            handler(val) {
                let type = this.$route.query.type
                if(type !== 'user' && type !== 'roles') return
                this.table.btnGroup = option[type](this.table).btnGroup
                this.table.filterSetting = option[type](this.table).filterSetting
                this.table.rowDbClick = option[type](this.table).rowDbClick
                this.table.initData(this.table)
            }
        }
    },
    computed: {
        query() {
            return this.$route.query
        }
    },
    methods: {},
}
</script>
<style scoped>
.security{
    padding-top: 20px;
}
</style>