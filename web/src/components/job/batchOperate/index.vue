<template>
  <section>
    <el-button-group class="lineMargin">
      <el-button v-for="(btn,i) in btns" :key="i" :title="btn.title" @click="btnEvent(btn.event)"><i :class="btn.icon" :style="`color:${btn.color}`"></i>{{btn.text}}</el-button>
    </el-button-group>
    <el-tabs type="card" v-model="activeName">
      <el-tab-pane v-for="(tab,i) in tabs" :key="i" :name="tab.name" :style="`height:${tabHeight}px`">
        <span slot="label"><i :class="loading[activeName] ? 'el-icon-loading': ''"></i><i :class="tab.icon" :style="`color:${tab.color}`"></i>{{tab.title}}</span>
        <flowPart v-if="i === 0" ref="flowPart"></flowPart>
        <relationTable v-else ref="relationTable"></relationTable>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<script>
import relationTable from './relationTable'
import flowPart from './flowPart'

export default {
  name: 'batchOperate',
  data () {
    return {
      activeName: 'flowPart',
      loading: {
        flowPart: false,
        relationTable: false,
      },
      btns: [{
        text: ' 批量创建调度点及关系',
        icon: 'fa fa-save',
        color: 'blue',
        event: function(){
          this.createSchedule(this.activeName);
        }
      },{
        text: ' 批量删除调度点及关系',
        icon: 'fa fa-remove',
        color: 'red',
        event: function(){
          this.deleteSchedule(this.activeName);
        }
      }],
      tabs:[{
        icon: 'fa fa-share-alt',
        color: 'green',
        title: ' 数据流片段',
        name: 'flowPart'
      },{
        icon: 'fa fa-table',
        color: 'blue',
        title: ' 原宿关系表',
        name: 'relationTable'
      }],
    }
  },
  computed:{
    tabHeight(){
      return document.documentElement.clientHeight - (this.$store.state.isFullScreen ? 80 : 120)
    }
  },
  methods:{
    btnEvent(event){
      event.call(this);
    },
    createSchedule(tabName){
      this.loading[tabName] = true;
      let flowData = this.$refs[tabName][0].getFlowData();
      if(flowData.nodes.length === 0) {
        return
      }
      let params = {
        jobId: this.$route.query.link,
        links: flowData.links,
        nodes: flowData.nodes
      };
      // Object.assign(paramsData,flowData);
      DCHttp.req(
        {url: '/api/Job/addPDCs',params}).then(res=>{
        this.loading[tabName] = false;
        res && this.$successMessage('创建成功');
      }).catch(err=>{this.loading[tabName] = false;});
    },
    deleteSchedule(tabName){
      this.loading[tabName] = true;
      let nodes = this.$refs[tabName][0].getFlowData().nodes;
      nodes = nodes.map(item => {
        item.includes('<MainJob>') || (item = item + '<MainJob>')
        return item
      })
      DCHttp.req({
        url: dcConfig.publicPath,
        params: {
          Class: 'JobMgr',
          FUNC: 'removePDC',
          [dcConfig.paramsKey]: {
            pdcJobNames: nodes,
            jobId: this.$route.query.link,
          }
        }
      }).then(res => {
        this.loading[tabName] = false;
        res && this.$successMessage('成功删除');
      }).catch(err => {
        this.loading[tabName] = false;
      })
    },
  },
  components: {
    relationTable,
    flowPart,
  }
}
</script>
<!-- scoped -->
<style scoped>
.lineMargin{
  margin: 10px;
}
</style>
