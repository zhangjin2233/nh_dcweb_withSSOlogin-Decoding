<template>
  <div v-if="jobName">
    <span class="grayBg">{{jobName}}</span>
    <el-button-group>
      <el-button v-for="(item,i) in row" :key="i" v-if="show(item)" @click="toolBtnClick(item,0,i,$event)" :title="item.title" :disabled="item.disabled && item.disabled(flow)" size="mini">
        <i v-show="item.load" class="el-icon-loading"></i>
        <i :class="item.icon || flow.btnGroupMember.icon" :style="`color:${item.color}`"></i>
      </el-button>
    </el-button-group>
  </div>
</template>

<script>

export default {
  name: 'jobControl',
  props: ['data'],
  data(){
    return {
      flow: this.data,
      row: [{
        icon: 'fa fa-play',
        color: 'green',
        title: '启动',
        event:{
          click: function(){
            this.flow.choseStartJob(this,()=>{ this.flow.startGetStatus() });
          }
        },
      },{
        icon: 'fa fa-pause',
        color: 'red',
        title: '中断',
        event:{
          click: function(){
            this.flow.stopJob(this);
          }
        },
      },{
        icon: 'fa fa-paint-brush',
        color: 'orange',
        title: '重置错误节点',
        event:{
          click: function(){
            this.flow.resetErrorJob(this);
          }
        },
      },{
        icon: 'fa fa-warning',
        color: 'orange',
        title: '重置',
        event:{
          click: function(){
            this.flow.resetJob(this);
          }
        },
      },{
        icon: 'fa fa-exchange',
        color: '#ff8936',
        title: '树上选中',
        event:{
          click: function(){
            Tree.setCurrentKey(this.flow[this.flow.flowName].jobInfo.id);
          }
        },
      },{
        icon: 'fa fa-sliders',
        color: '#808080',
        title: '设置默认队列并发数',
        event:{
          click: function(){
            this.flow.setPoolSize(this);
          }
        },
      },{
        icon: 'fa fa-exchange',
        color: '#ff8936',
        title: '上下文参数',
        event:{
          click: function(){
            this.flow.setContext(this);
          }
        },
      }]
    }
  },
  computed:{
    jobName(){
      let name;
      try{ name = this.flow[this.flow.flowName].jobInfo.name }catch(e){}
      return name
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
.grayBg{
  padding: 5px;
  border-radius: 3px;
  background: #ccc;
}
</style>
