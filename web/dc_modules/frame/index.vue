<template>
  <div class="frame" 
  :style="`width: ${object.width}; 
  height: ${object.height}; 
  top: ${object.top}; 
  left: ${object.left}; 
  z-index: ${object.zIndex};`">
    <div class="header" :style="`background: ${object.headerBackgroundColor};`"
    @mousedown.stop.prevent="canMove=true"
    @mouseup.stop.prevent="canMove=false"
    @mouseout.stop.prevent="canMove=false"
    @mousemove.stop.prevent="mousemove($event, 'move')">
    <span>{{object.title}}</span>
    </div>
    <div class="body" :style="`background: ${object.backgroundColor};color: ${object.color};font-size: ${object.fontSize}`">
      <div v-html="object.html" v-if="object.html"></div>
      <component :is="object.component" :propData="object.data"></component>
    </div>
    <div class="btns">
      <i class="fa fa-minus" v-if="object.minimization" @click="object.show=false"></i>
      <i class="fa fa-window-maximize" v-if="object.maximization" :class="{'fa-window-restore': isFullsrceen}" @click="isFullsrceen=!isFullsrceen"></i>
      <i class="fa fa-close" @click="close"></i>
    </div>
    <div class="resize-left"
    @mousedown.stop.prevent="canResizeRight=true"
    @mouseup.stop.prevent="canResizeRight=false"
    @mouseout.stop.prevent="canResizeRight=false"
    @mousemove.stop.prevent="mousemove($event, 'right')"></div>
    <div class="resize-bottom"
    @mousedown.stop.prevent="canResizeBottom=true"
    @mouseup.stop.prevent="canResizeBottom=false"
    @mouseout.stop.prevent="canResizeBottom=false"
    @mousemove.stop.prevent="mousemove($event, 'bottom')"></div>
    <div class="resize-left-bottom"
    @mousedown.stop.prevent="canResizeLeftBottom=true"
    @mouseup.stop.prevent="canResizeLeftBottom=false"
    @mouseout.stop.prevent="canResizeLeftBottom=false"
    @mousemove.stop.prevent="mousemove($event, 'leftBottom')"></div>
  </div>
</template>

<script>
import component from './index.js'
export default {
    mixins: [component]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.frame{
  position: fixed;
  box-sizing: border-box;
  border: 1px solid #999;
  box-shadow: 2px 2px #999;
}
.header{
  height: 28px;
  line-height: 28px;
  text-indent: 10px;
  width: 100%;
  cursor: move;
}
.body{
  width: 100%;
  height: calc(100% - 28px);
  box-sizing: border-box;
  overflow: auto;
}
.resize-left{
  position: absolute;
  top: 0;
  right: -10px;
  width: 20px;
  height: 100%;
  cursor: e-resize;
}
.resize-bottom{
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 20px;
  cursor: n-resize;
}
.resize-left-bottom{
  position: absolute;
  width: 24px;
  height: 24px;
  right: -6px;
  bottom: -6px;
  cursor: nw-resize;
}
.btns{
  position: absolute;
  top: 4px;
  font-size: 18px;
  right: 10px;
  i{
    cursor: pointer;
  }
}
</style>
