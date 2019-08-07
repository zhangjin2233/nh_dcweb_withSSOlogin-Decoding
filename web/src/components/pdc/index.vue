<template>
  <el-tabs type="card">
    <el-tab-pane v-for="(tab,i) in tabs" :key="i">
      <span slot="label"><i :class="tab.icon" :style="`color:${tab.color}`"></i>{{tab.title}}</span>
      <!-- 根据类型选用组件展示 -->
      <component :is="tab.type" ref="pdcTab" :key="i"></component>
    </el-tab-pane>
  </el-tabs>
</template>

<script>

import pdcList from './pdcList.vue'
import cdc0 from '../cdc/cdc.vue'

export default {
  name: 'PDC',
  data () {
    return {
    	tabs: [{
        title: ' PDC列表',
        type: 'pdcList',
        icon: 'fa fa-list-alt',
        color: 'blue',
      },{
        title: ' 模型定义',
        type: 'cdc0',
        icon: 'fa fa-paper-plane',
        color: 'blue',
      }],
    }
  },
  methods:{
    initData(){
      this.$refs.pdcTab.forEach(tab=>{
        tab.initData();
      });
    }
  },
  components:{
    pdcList,
    cdc0,
  }
}
</script>
<!-- scoped -->
<style>

</style>
