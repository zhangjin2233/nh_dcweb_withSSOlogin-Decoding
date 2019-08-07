<template>
  <div class="contextmenu" v-if="object.show"  @mouseleave="mouseleave" @mousemove.stop="menuMousemove" :style="style">
    <ul>
      <li v-for="(item, index) in object.menu.filter(m => {
        if(typeof m.show === 'function') {
          return m.show()
        }else if(typeof m.show === 'boolean') {
          return m.show
        }
        return true
      })" 
      :style="itemStyle" :key="index" 
      @click="itemClick(item)" 
      @dblclick="itemDbclick(item)" 
      @mouseleave.stop="itemMouseout($event)" 
      @mouseenter.stop="itemMouseEnter($event, item, index)">
        <i :class="item.icon" :style="`color: ${item.iconColor}; width: 14px;`"></i>
        <span v-text="item.text"></span>
        <i class="el-icon-caret-right child-arrow" v-if="item.children&&item.children.length>0"></i>
        <child-menu v-if="item.children&&item.children.length>0&&object.currentItem.data===item"  :data="item.children" :father="object"/>
      </li>
    </ul>
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
.contextmenu{
  z-index: 2000;
  position: fixed;
  border: 1px solid #ccc;
  background: #fff;
  padding: 10px;
  border-radius: 6px;
  margin-left: 2px;
  margin-top: 2px;
  &:hover{
    cursor: pointer;
  }
  ul{
    list-style: none;
    padding: 0;
    margin: 0;
    li{
      border-bottom: 1px solid #999;
      position: relative;
      &:hover{
        background: #ccccff;
        color: #6699ff
      }
      i{
        margin-right: 10px;
      }
      span{
        margin-right: 4px;
      }
    }
    .child-arrow{
      position: absolute;
      right: -20px;
      top: 4px
    }
  }
}
</style>
