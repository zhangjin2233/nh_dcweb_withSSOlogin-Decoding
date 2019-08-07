<template>
  <div class="nav" 
  v-if="object.menu.length"
  :style="`color: ${object.color}; 
  font-size: ${object.fontSize}; 
  background-color: ${object.backgroundColor}; 
  height: ${object.height}; 
  line-height: ${parseInt(object.height)-2}px; 
  padding-left: ${object.align==='left'?object.indent:0}px;
  padding-right: ${object.align==='right'?object.indent:0}px;
  text-align: ${object.align}`">
    <slot name="left" class="left-part"></slot>  
    <ul class="item-wrapper">
      <li 
      v-for="(item, index) in object.menu" 
      :key="index" 
      class="item" 
      @click="clickItem(item)"  
      @mouseenter="enterItem(item)" 
      @mouseleave="leaveItem(item)" 
      :style="`margin-right: ${object.marginRight}px; color: ${setItemColor(item)}; border-bottom: 2px solid ${object.hightlineActive&&object.activeItemKey===item[object.key]?object.activeColor:'rgba(0,0,0,0)'}`">
        <span>{{item.title}}</span>
        <i class="el-icon-arrow-down" :class="{'el-icon-arrow-up': item === hoverItem}" v-if="item.children && item.children.length>0"></i>
          <child-menu :data="item" @hide="hideMenu" :nav="object" v-if="item.children&&item.children.length>0&&item===hoverItem"></child-menu>
      </li>
    </ul>
    <slot name="right"  class="right-part"></slot>   
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
.nav{
  position: relative;
  z-index: 2
}
.item-wrapper{
  list-style: none;
  margin: 0;
  padding: 0;
  display: inline-block;
  .item{
    display: inline-block;
    padding: 0;
    box-sizing: border-box;
    cursor: pointer;
    &:hover{
      color: #000
    }
  }
}
.left-part, .right-part{
  display: inline-block
}
</style>
