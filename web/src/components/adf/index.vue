<template>
  <div class="flowContainer">
    <dc-flow v-if="object.vue" :object="object"></dc-flow>
  </div>
</template>

<script>
import params from './params'

export default {
  name: 'ADF',
  props: ['data'],
  data () {
    return {
      object: {},
    }
  },
  watch:{
    $route(to,from){
      if(this.$route.path == '/adf' && this.$route.query.link != params.flowName){
        this.initData();
      }else if(this.$route.path == '/adf' && from.query && from.query.from && window.sessionStorage.getItem('dc')){
        let fromQuery = JSON.parse(from.query.from);
        this.$route.query.id == fromQuery.id && this.object.updateNode();
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
      params.storyId = nodeData.storyId;
      params.folderId = nodeData.folderId;
      params.pId = nodeData.pId;
      this.object = new dc.ReportFlow(params);
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
