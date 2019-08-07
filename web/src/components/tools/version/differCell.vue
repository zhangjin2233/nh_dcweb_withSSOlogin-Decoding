<template>
    <div>
        <span class="cell" :title="title">{{data.row[data.name]}}</span>
        <span class="el-icon-question question" :title="content"></span>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['data'],
    data() {
      return {
          
      }
    },
    created() {
        
    },
    watch: {},
    computed: {
        content() {
            let data = this.$store.state.versionDiffer.find(item => item[0] === this.data.row[this.data.name])
            return `当前值: ${typeof data[2] === 'object' ? JSON.stringify(data[2]) : data[2]}`
        }, 
        title() {
            let row = this.data.row
            let name = this.data.name
            if(typeof row[name] === 'object') {
                return JSON.stringify(row[name])
            } 
            return row[name]
        }
    },
    methods: {},
}
</script>
<style scoped>
.cell{
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    color: #80bfff;
}
.question{
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0
}
</style>