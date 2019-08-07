<template>
    <div class="btn">
        <span>
            <span>数据时间：</span>
            <el-date-picker
            v-model="time"
            type="datetime"
            format="yyyy-MM-dd HH:mm:ss"
            size="mini"
            style="width: 186px"
            placeholder="选择日期时间"
            align="right">
            </el-date-picker>
        </span>
        <el-button @click="exchangeView" size="mini">{{viewType}}</el-button>
    </div>
</template>

<script>
export default {
    components: {},
    props: [],
    data() {
        return {
            time: new Date()
        }
    },
    created() {},
    watch: {},
    computed: {
        viewType() {
            if(this.$store.state.sqlViewType === 'business') {
                return '工程视图'
            }
            return '业务视图'
        }
    },
    methods: {
        exchangeView() {
            this.$store.commit('exchangeSqlViewType')
        },
    },
}
</script>
<style scoped>
.btn{
    font-size: 12px;
    padding: 6px;
    position: relative;
    right: 80px;
}
</style>