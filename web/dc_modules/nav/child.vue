<template>
  <div class="child" :style="`width: ${data.width || nav.menuWidth}px; `">
        <ul class="item-wrapper">
            <li v-for="(item, index) in menu" :class="{active: item.active}" :key="index" class="item" @click.stop="itemClick(item)" @mouseenter="itemMouseenter($event, item)" @mouseleave="itemMouseleave">
                <span>{{item.title}}</span>
                <grand-child :data="item" :nav="nav" v-if="item.children&&item.children.length>0&&hoverItem===item"></grand-child>
                <i class="el-icon-arrow-right item-arrow" v-if="item.children&&item.children.length>0&&hoverItem!==item"></i>
                <i class="el-icon-arrow-left item-arrow" v-if="item.children&&item.children.length>0&&hoverItem===item"></i>
            </li> 
        </ul>
  </div>
</template>

<script>
import component from './child.js'
export default {
    mixins: [component]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.child{
    position: absolute;
    background-color: #fff;
    border: 1px solid #ccc;
    padding: 6px;
    border-radius: 2px;
    color: #999;
    margin-top: 2px;
    box-shadow: 2px 2px #e0e0eb;
}
.item-wrapper{
    list-style: none;
    padding: 0;
    margin: 0;
    .item:hover{
        color: #000;
    }
    .item{
        height: 24px;
        position: relative;
        line-height: 24px;
    }
}
.item-arrow{
    position: absolute;
    right: 0px;
    top: 4px;
    font-size: 14px
}
.active{
    border: 1px solid #e67300;
    box-sizing: border-box;
}
</style>
