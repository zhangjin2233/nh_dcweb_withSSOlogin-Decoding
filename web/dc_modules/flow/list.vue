<template>
  <aside class="flow-side"> 
    <el-collapse v-show="asideShow" v-model="activeName" class="nodelist">
      <el-collapse-item v-for="(item,itemIndex) in flow.listData" :key="itemIndex" :name="itemIndex">
        <template slot="title">
          <i :class="item.icon" style="width: 20px;height: 20px;"></i>
          <i v-if="item.img!==''" class="img" :style="`background-image: url(${flow.img.path+item.img+flow.img.ext})`" @error="item.img = flow.img.name.node"></i>
          {{item.title}}
        </template>
        <li v-for="(node,nodeIndex) in item.nodes" :key="nodeIndex" class="block">
          <img :src="flow.img.path+node.img+flow.img.ext" @error="node.img = flow.img.name.node" :width="50" :height="50" :draggable="true" :title="node.tip" @dragstart.stop="drag($event,node,item)"/>
          <label :title="node.label">{{node.label}}</label>
        </li>
      </el-collapse-item>
    </el-collapse>
    <span class="control-btn" @click="zoom()" :style="`right:${(asideShow ? -88 : 0)}px`"><i :class="`fa ${'fa-angle-double-'+(asideShow ? 'left' : 'right')}`"></i></span> 
  </aside>
</template>

<script>
export default {
  name: 'node',
  props: ['flow'],
  data () {
    return {
      asideShow: true,
      activeName: this.flow.listData.length-1,
    }
  },
  methods: {
    zoom(){
      this.asideShow = !this.asideShow;
    },
    drag(e,node,item){
      e.dataTransfer.setData("node",JSON.stringify(node));
      this.$parent.nodeObj.dragStart();
    }
  },
}
</script>

<style lang="scss" scoped>
.text-overflow{
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.block{
  display: block;
  margin:0;
  padding: 5px;
  &:nth-child(2n){
    background: #f3f9f1;
  }
  label{
    position: static;
    top: -10px;
    display: block;
    @extend .text-overflow
  }
}
li p{
  margin: 0;
  padding: 0;
}
.el-collapse-item__header{
  .img{
    display: inline-block;
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100%; 
    position: relative;
    top: 5px;
  }
}
.control-btn{
  display: inline-block;
  position: relative;
  width: 12px;
  z-index: 1;
  display: block;
  top: 1px;
  height: 100%;
  background: #e9f1f6;
  cursor: pointer;
  i{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
.nodelist{
  position: absolute;
  background: #fff;
  display: inline-block;
  top:0;
  width: 100px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #789262;
  border-left: none;
  $boxShadow: inset 0 0 5px rgba(0,0,0,0.2);
  &::-webkit-scrollbar {/*滚动条整体样式*/
    width: 4px;     /*高宽分别对应横竖滚动条的尺寸*/
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
    border-radius: 5px;
    box-shadow: $boxShadow;
    background: rgba(0,0,0,0.2);
  }
  &::-webkit-scrollbar-track {/*滚动条里面轨道*/
    box-shadow: $boxShadow;
    border-radius: 0;
    background: rgba(0,0,0,0.1);
  }
}
aside{
  position: absolute;
  top:28px;
  height: 80%;
  height: calc(100% - 46px);
}
</style>
<style lang="scss">
.flow-side{
  .el-collapse-item__content{
    margin: 0;
    padding: 0;
    text-align: center;
  }
  .el-collapse-item__header{
    text-indent: 5px;
  }
}
</style>