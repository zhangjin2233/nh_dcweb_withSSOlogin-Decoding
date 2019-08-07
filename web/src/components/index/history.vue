<template>
    <div class="history">
        <el-dropdown @command="handleCommand" v-if="history.length">
            <i class="fa fa-history">历史记录</i>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="index" v-for="(item, index) in history" :key="item.id">{{item.label}}</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</template>

<script>
export default {
    components: {},
    props: [],
    data() {
      return {
      }
    },
    created() {},
    watch: {},
    computed: {
        history() {
            return this.$store.state.history
        }
    },
    methods: {
        handleCommand(index) {
            this.$router.push(this.history[index].path)
        }
    },
}
</script>
<style scoped>
.history{
  position: absolute;
  top: 10px;
  right: 96px;
  z-index: 2;
  font-size: 12px;
  cursor: pointer;
}
</style>