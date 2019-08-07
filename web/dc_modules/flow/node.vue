<template>
  <g>
    <!-- 节点的图片 -->
    <foreignObject :x="node.x" :y="node.y" :width="node.width" :height="node.height" :style="flow.foreignObjectStyle">
      <img :class="`pointer ${node.animate}`" :src="(node.img ? (flow.img.path+node.img+flow.img.ext) : $icons.content[node.imgSrc || 'node'])" @error="node.img = flow.img.name.node" :width="node.width" :height="node.height" :title="(flow.vue.nodesTip.CONTENT && flow.vue.nodesTip.CONTENT[node.id]) ? flow.vue.htmlToStr(flow.vue.nodesTip.CONTENT[node.id].msg): node.id" :style="`${flow.nodeContainerStyle};border-color:${flow.vue.focusNodesStyle(node.id,'node')}`" @mousedown.stop.prevent="flow.vue.choseNode($event,node)" @mouseup.stop.prevent="flow.vue.moveOver()" @click.right.stop.prevent="flow.vue.nodeRightClick($event,node)"/>
    </foreignObject>
    <!-- 节点的标签 -->
    <text :x="node.x+node.width/2" :y="node.y+node.height+flow.nodeLabelSize+2" :style="`font-size:${flow.nodeLabelSize}px;text-anchor: middle`">{{flow.showNodeId ? node.id : (node.label || node.id)}}</text>
    <!-- 显示状态 -->
    <foreignObject v-if="flow.vue.showStatus(node.id)" :x="node.x+node.width+2" :y="node.y+node.height-flow.statusImgSize" :width="flow.statusImgSize" :height="flow.statusImgSize" :style="flow.foreignObjectStyle">
      <img :src="flow.getSatusImg(node)" :width="flow.statusImgSize" :height="flow.statusImgSize" />
    </foreignObject>
    <!-- 显示详情标签 -->
    <foreignObject v-if="flow.vue.showNodeTips(node.id)" :x="node.x+node.width+5" :y="node.y" :width="flow.tipSize" :height="flow.tipSize" class="tip" :style="flow.foreignObjectStyle">
      <i class="fa fa-tint fa-rotate-180 pointer" title="查看标签" @click="flow.showNodeTips(node,$event)"></i>
    </foreignObject>
    <!-- 显示前驱展开按钮 -->
    <foreignObject v-if="node.pre" :x="node.x-flow.tipSize-5" :y="node.y+node.height/2-flow.tipSize" :width="flow.tipSize" :height="flow.tipSize" class="skinship" :style="flow.foreignObjectStyle">
      <i class="fa fa-backward pointer" @click="flow.zoomPre(node,flow.vue)"></i>
    </foreignObject>
    <!-- 显示后继展开按钮 -->
    <foreignObject v-if="node.next" :x="node.x+node.width+(flow.vue.showNodeTips(node.id) ? 15 : 5)" :y="node.y+node.height/2-flow.tipSize" :width="flow.tipSize" :height="flow.tipSize" class="skinship" :style="flow.foreignObjectStyle">
      <i class="fa fa-forward pointer" @click="flow.zoomNext(node,flow.vue)"></i>
    </foreignObject>
  </g>
</template>

<script>

export default {
  name: 'node',
  props: ['propData'],
  data () {
    return {
      flow: this.propData.flow,
      node: this.propData.node,
    }
  },
  watch:{
    propData(){
      this.initData();
    }
  },
  created(){
    this.initData();
  },
  methods: {
    initData(){
      this.flow = this.propData.flow;
      this.node = this.propData.node;
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.pointer{
  cursor: pointer;
}
.tip{
  color: #177cb0;
  animation:fade 3s infinite;
}
.skinship{
  color: green;
  animation:fade 3s infinite;
}
</style>
