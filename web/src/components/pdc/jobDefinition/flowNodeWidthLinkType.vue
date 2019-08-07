<template>
  <g>
    <!-- 节点的图片 -->
    <foreignObject :x="node.x" :y="node.y" :width="node.width" :height="node.height" :style="flow.foreignObjectStyle">
      <img :class="`pointer ${node.animate}`" :src="flow.img.path+node.img+flow.img.ext" @error="node.img = flow.img.name.node" :width="node.width" :height="node.height" :title="(flow.vue.nodesTip.CONTENT && flow.vue.nodesTip.CONTENT[node.id]) ? flow.vue.htmlToStr(flow.vue.nodesTip.CONTENT[node.id].msg): node.id" :style="`${flow.nodeContainerStyle};border-color:${flow.vue.focusNodesStyle(node.id,'node')}`" @mousedown.stop.prevent="flow.vue.choseNode($event,node)" @mouseup.stop.prevent="flow.vue.moveOver()" @click.right.stop.prevent="flow.vue.nodeRightClick($event,node)"/>
    </foreignObject>
    <!-- 节点的标签 -->
    <text :x="node.x+node.width/2" :y="node.y+node.height+flow.nodeLabelSize+2" :style="`font-size:${flow.nodeLabelSize}px;text-anchor: middle`">{{node.label || node.id}}</text>
    <!-- 显示状态 -->
    <foreignObject :x="node.x-flow.statusImgSize" :y="node.y+node.height-flow.statusImgSize-8" :width="flow.statusImgSize" :height="flow.statusImgSize" :style="flow.foreignObjectStyle">
      <i @dblclick="node.status=node.status=='any' ? 'all' : 'any'" class="fa fa-xing" :style="`color:${node.status=='any' ? 'red' : 'blue'};cursor:pointer`"></i>
    </foreignObject>
    <!-- 显示前驱展开按钮 -->
    <foreignObject v-if="node.pre" :x="node.x-flow.tipSize-5" :y="node.y+node.height/2-flow.tipSize" :width="flow.tipSize" :height="flow.tipSize" :style="flow.foreignObjectStyle">
      <i class="fa fa-backward pointer skinship" @click="flow.zoomPre(node,flow.vue)"></i>
    </foreignObject>
    <!-- 显示后继展开按钮 -->
    <foreignObject v-if="node.next" :x="node.x+node.width+5" :y="node.y+node.height/2-flow.tipSize" :width="flow.tipSize" :height="flow.tipSize" :style="flow.foreignObjectStyle">
      <i class="fa fa-forward pointer skinship" @click="flow.zoomNext(node,flow.vue)"></i>
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
      node: this.propData.node
    }
  },
  created() {
  },
  watch:{
    propData(){
      this.flow = this.propData.flow;
      this.node = this.propData.node;
    }
  },
  methods: {
    
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.pointer{
  cursor: pointer;
}
.pointer{
  cursor: pointer;
}
@keyframes fade {
  from { opacity: 1.0; }
  50% { opacity: 0.5; }
  to { opacity: 1.0; }
}
 
@-webkit-keyframes fade {
  from { opacity: 1.0; }
  50% { opacity: 0.5; }
  to { opacity: 1.0; }
}
.skinship{
  color: green;
  animation:fade 3000ms infinite;
  -webkit-animation:fade 3000ms infinite;
}
</style>
