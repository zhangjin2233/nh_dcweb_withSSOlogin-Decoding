<template>
  <div class="flowContainer">
    <dc-flow v-if="object.flowName" :object="object"></dc-flow>
  </div>
</template>

<script>
import params from './params.js'

export default {
  name: 'flowPart',
  props: [],
  data () {
    return {
      object: {},
    }
  },
  watch:{
    $route(to,from){
      if(this.$route.path == '/batchOperate' && !(this.$route.query.id == params.flowName)){
        this.initData();
      }
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    })
  },
  methods:{
    initData(){
      let nodeData = this.$route.query;
      params.flowName = nodeData.link;
      params.pId = nodeData.pId;
      params.storyId = nodeData.storyId;
      this.object = new dc.NodeFlow(params);
    },
    getFlowData(){
      return {
        nodes: this.getFlowNodesId(),
        links: this.object.vue.lines
      }
    },
    getFlowNodesId(){
      let nodesId = [];
      for(let k in this.object.vue.nodes){
        nodesId.push(k);
      }
      return nodesId;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.flowContainer{
  overflow: auto;
  height: 100%;
}
</style>
