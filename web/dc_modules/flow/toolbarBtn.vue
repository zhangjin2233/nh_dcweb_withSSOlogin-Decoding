<template>
  <transition name="slide-fade">
    <div v-if="flow.btnGroupMember.show" class="btnGroupMember" :style="flow.btnGroupMember.style">
      <div v-for="(row,r) in flow.toolbar" :key="r">
        <el-button-group>
          <el-button v-for="(item,i) in row" :key="i" v-if="show(item)" @click="toolBtnClick(item,r,i,$event)" :title="item.title" :disabled="item.disabled && item.disabled(flow)" size="mini">
            <i :class="item.load ? 'el-icon-loading' : (item.icon || flow.btnGroupMember.icon)" :style="`color:${item.color}`"></i>
          </el-button>
        </el-button-group>
        <component v-show="flow.toolbarComponentShow && !r" :is="flow.toolbarComponent" :data="flow"></component>
      </div>
    </div>    
  </transition>
</template>

<script>

export default {
  name: 'toolbarBtn',
  props: ['flow'],
  data(){
    return {

    }
  },
  methods:{
    toolBtnClick(item,r,i,e){
      item.event.click.call(this.flow.vue,this.flow,item,r,i,e);
    },
    show(item){
      return item.hasOwnProperty('hide') ? !item.hide.call(this.flow.vue,this.flow,item) : true;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.btnGroupMember{
  position: fixed;
  z-index: 10;
  height: 30px; 
}
.el-button{
  width:43px;
}
.slide-fade-enter-active {
  transition: all .2s ease;
}
.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to{
  transform: translateY(-200px);
  opacity: 0;
}
</style>
