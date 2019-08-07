<template>
  <div class="pointer" :style="`${flow.nodeContainerStyle};border-color:${flow.vue.focusNodesStyle(node.id,'node')};`">
    <p ref="title" class="text-overflow" :style="flow.textListTitleStyle"><img v-show="node.textList.length" :title="flow.listShowTip" @mousedown.stop="flow.changeNodeTextListShow(node)" :src="flow.img.pathAttr+(node.listShow ? flow.img.name.listDown : flow.img.name.listUp)+flow.img.ext" :width="flow.titleImgSize.width" :heigth="flow.titleImgSize.height" />&nbsp;<img :src="flow.img.pathAttr+flow.img.name.dc+flow.img.ext" :width="flow.titleImgSize.width" :heigth="flow.titleImgSize.height"/>&nbsp;<span :title="tip('title',node.title)" :style="flow.textListTitleSpanStyle">{{node.title || node.id}}</span></p>
    <p ref="list" class="text-overflow" v-show="node.listShow" :style="flow.textListStyle" v-for="(list,i) in node.textList" :key="i" ><img :src="flow.img.pathAttr+list.dataType+flow.img.ext" @error="list.dataType = flow.img.name.dataType" :width="flow.textListImgSize.width" :heigth="flow.textListImgSize.height"/>&nbsp;<span :title="tip('list',list.label,i)">{{list.label}}</span></p>
  </div>
</template>

<script>

export default {
  name: 'textList',
  props: ['propData'],
  data () {
    return {
      flow: this.propData.flow,
      node: this.propData.node
    }
  },
  watch:{
    propData(){
      this.flow = this.propData.flow;
      this.node = this.propData.node;
    }
  },
  methods:{
    tip(name,tip,i=''){
      this.$refs[name] && i!=='' && (this.$refs[name+i] = this.$refs[name][i]);
      return this.$refs[name+i] && this.$refs[name+i].offsetWidth < this.$refs[name+i].scrollWidth ? tip : '';
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.pointer{
  cursor: pointer;
}
.text-overflow{
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
</style>
