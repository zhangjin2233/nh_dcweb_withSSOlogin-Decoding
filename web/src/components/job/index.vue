<template>
  <div class="flowContainer">
    <dc-flow v-if="object.vue" :object="object"></dc-flow>
  </div>
</template>

<script>
import params from './params.js'

export default {
  name: 'JOB',
  props: [],
  data () {
    return {
      object: {},
    }
  },
  watch:{
    $route(to,from){
      if(from.path == '/job'){
        this.object.stopGetStatus();
      }
      if(this.$route.path == '/job' && (to.query.pdcName != from.query.pdcName || this.$route.query.link != params.flowName || this.$route.query.flowType != params.flowType || this.$route.query.relationType!=params.relationType)){
        this.initData();
      }else if(this.$route.path == '/job'){
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
      params.relationType = nodeData.relationType;
      params.flowType = nodeData.flowType;
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
