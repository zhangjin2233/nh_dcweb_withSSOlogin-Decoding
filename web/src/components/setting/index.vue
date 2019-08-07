<template>
    <div v-if="title">
        <div class="header">{{title}}:</div>
        <dc-table :object="table" class="table"></dc-table>
    </div>
</template>

<script>
import tableConfig from './tableConfig.js'
export default {
    data() {
        return {
            table:  new dc.Table(),
        }   
    },
    created() {
        let type = this.$route.query.content
        this.table.reset(tableConfig[type])
        if(type === 'agent') {
            // this.table.startInterval(4000)
        }
    },
    destroyed() {
        
    },
    methods: {
    },
    computed: {
        title() {
            if(tableConfig[this.$route.query.content]) {
                return tableConfig[this.$route.query.content].title
            }
           
        }
    },
    watch: {
        $route(to, from) {
            closeWebSocket('AgentList')
            if(to.path === '/setting') {
                let type = to.query.content
                this.table.reset(tableConfig[type])
                // if(type === 'agent') {
                //     console.log(getWebSocket('agentList'))
                //     getWebSocket('agentList').send().then(res => { 
                //         this.table.tableData = res.tableData
                //         this.table.tableHead = res.tableHead
                //     })
                // }else {
                    this.table.initData(this.table)
                // }
            }
            
        }
    }
  }
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
   .table{
       margin: 10px;
   }
   .header{
       text-align: left;
       text-indent: 10px;
       font-size: 20px;
       font-weight: bold;
       line-height: 40px;
       border-bottom: 1px solid #ccc;
   }
</style>
