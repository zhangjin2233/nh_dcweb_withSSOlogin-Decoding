<template>
  <div class="flowContainer">
    <dc-flow v-if="flow.vue" :object="flow"></dc-flow>
  </div>
</template>

<script>

export default {
  name: 'staticFlow',
  props: ['propData'],
  data(){
    return {
      flow: {},
    }
  },
  watch:{
    propData(){
      this.initData();
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    })
  },
  methods:{
    initData(){
      this.flow = new dc.NodeFlow({
        flowName: this.propData.flowName+new Date().getTime(),
        getFlowReq:()=>{ return { content: { CONTENT: this.propData.flowData } } },
        canRemoveLine: false,
        isContactAttach: false,
        canNodeIntoView: false,
        // canMoveNode: false,
        // canSelect: false,
      })
      this.flow.btnGroup.show = false;
      this.flow.btnGroupMember.show = false;
      this.flow.layout.fixed = { x: 0, y: 30, marginRight: 100, marginBottom: 50 }
      setTimeout(()=>{
        const focusNodesId = [];
        Object.keys(this.flow.vue.nodes).forEach(k=>{
          this.flow.vue.nodes[k].lineType || focusNodesId.push(k);
        })
        this.flow.vue.focusNodes.splice(0,this.flow.vue.focusNodes.length,...focusNodesId);
      },1000);
    }
  }
}
</script>

<style lang="scss" scope>
.flowContainer{
  height: 50vh;
}
</style>
