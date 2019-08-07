<template>
<div class="flowContainer">
  <dc-flow v-if="object.flowName" :object="object"></dc-flow>
</div>
</template>

<script>
import params from './params.js'

export default {
  name: 'PDF',
  props: [],
  data () {
    return {
      object: {},
    }
  },
  watch:{
    $route(to,from){
      if(from.path == '/pdf'){
        this.object.stopGetStatus();
      }
      if(this.$route.path == '/pdf' && this.$route.query.link != params.flowName){
        this.initData();
      }else if(this.$route.path == '/pdf'){
        this.object.startGetStatus();
      }
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  methods:{
    initData(){
      let nodeData = this.$route.query;
      params.flowName = nodeData.link;
      params.pId = nodeData.storyId;
      params.storyId = nodeData.storyId;
      this.object = new dc.NodeFlow(params);
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
