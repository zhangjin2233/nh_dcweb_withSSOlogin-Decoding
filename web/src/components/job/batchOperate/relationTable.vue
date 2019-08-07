<template>
  <el-row v-if="tables.length" type="flex">
    <el-col v-for="(table,colIndex) in tables" :key="colIndex" :span="12">
      <section>
        <label>{{table.title}}</label>
        <dc-table :object="table.object"></dc-table>
      </section>
    </el-col>
  </el-row>
</template>

<script>
import relationTableParams from './relationTableParams'

export default {
  name: 'batchOperate',
  data () {
    return {
      tables: [],
      jobId: '',
    }
  },
  watch:{
    $route(to,from){
      if(this.$route.path == '/batchOperate' && !(this.$route.query.id == this.jobId)){
        this.initData();
      }
    }
  },
  created(){
    this.initData();
  },
  methods:{
    initData(){
      this.jobId = this.$route.query.id;
      ['源','目标'].forEach((item,itemIndex)=>{
        if(this.tables.length < 2) {
           this.tables.push({
            title: item+'调度点',
            object: new dc.Table(objClone(relationTableParams.tableParams)),
          })
        }else{
          this.tables[itemIndex].object.reset(objClone(relationTableParams.tableParams))
        }
      });
    },
    getFlowData(){
      let lines = [];
      this.tables[0].object.tableData.forEach(item0=>{
        this.tables[1].object.tableData.forEach(item1=>{
          lines.push([item0.id.id,item1.id.id])
        })
      })
      return {
        nodes: this.getFlowNodesId(),
        links: lines
      }
    },
    getFlowNodesId(){
      let nodesId = [];
      this.tables.forEach(table=>{
        table.object.tableData.forEach(item=>{
          nodesId.push(item.id.id);
        })
      });
      return nodesId;
    }
  },
}
</script>
<!-- scoped -->
<style scoped lang="scss">
section{
  margin: 10px 5px 0px 5px;
  border: 1px solid #999;
  label{
    position: relative;
    background: #fff;
    top:-10px;
    left: 15px;
  }
}
</style>
