<template>
  <div class="full">
  	<el-tabs type="border-card">
		  <el-tab-pane v-for="(tab,i) in tabs" :key="i">
		    <span slot="label"><i :class="tab.icon"></i>{{tab.title}}</span>
		    <!-- 根据类型选用组件展示 -->
        <div v-if="tab.type == 'flow' && tab.object.vue" class="flowContainer" :style="`height:${flowHeight}`"><dc-flow :object="tab.object"></dc-flow></div>
        <div v-else-if="tab.type == 'table'" v-loading="tab.loading" class="containerMargin"><dc-table :object="tab.object"></dc-table></div>
        
		  </el-tab-pane>
		</el-tabs>
  </div>
</template>

<script>

import params from './params'

export default {
  name: 'SDF',
  props: ['data'],
  data () {
    return {
      flowName: '',
      pId: '',
    	tabs: [{
        title: 'SDF流程图',
        type: 'flow',
        object: {},
        loading: false,
      },{
        title: '附件列表',
        type: 'table',
        object: new dc.Table({
          align: 'center',
          height: document.documentElement.clientHeight - 130 + 'px',
          btnGroup: [{
            icon: "fa fa-upload", 
            title: '上传',
            color: "blue",
            click: (data, row)=>{
              this.uploadFile();
            }
          },{
            icon: "fa fa-download", 
            title: '下载',
            color: "blue",
            needRow: true,
            click:(tableData, row)=>{
              let data = {};
              data[params.downloadFile.data.fileName] = row.ID;
              let downloadFile = {
                Class: params.downloadFile.Class,
                FUNC: params.downloadFile.FUNC
              }
              DCHttp.export({
                url: dcConfig.publicPath,
                params: Object.assign({[dcConfig.paramsKey]: data}, downloadFile)
              })
            }
          },{
            icon: "fa fa-refresh", 
            color: "green",
            title: '刷新',
            click:(data, row, rowIndex)=>{
              this.getFileData();
            }
          },{
            icon: "fa fa-remove", 
            title: '删除',
            color: "red",
            needRow: true,
            click:(tableData, row)=>{
              this.removeFile(tableData,row);
            }
          }],
          hasPage: false,
        }),
        loading: false,
      }],
    }
  },
  computed:{
    flowHeight(){
      return document.documentElement.clientHeight - (this.$store.state.isFullScreen ? 20 : 60) + 'px';
    }
  },
  watch:{
    $route(to,from){
      if(this.$route.path == '/sdf' && this.$route.query.link != params.flowName){
        this.initData();
      }else if(this.$route.path == '/sdf' && from.query && from.query.from && window.sessionStorage.getItem('dc')){
        let fromQuery = JSON.parse(from.query.from);
        this.$route.query.id == fromQuery.id && this.tabs[0].object.updateNode();
      }
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    })
  }, 
  methods:{
    initData(){
      let nodeData = this.$route.query;
      params.flowName = nodeData.link;
      params.storyId = nodeData.storyId;
      params.folderId = nodeData.folderId;
      params.pId = nodeData.pId;
      this.flowName = nodeData.link;
      this.pId = nodeData.pId;
      this.tabs[0].object = new dc.ReportFlow(params);
      this.getFileData();
    },
    uploadFile(){
      this.$importFile.reset({
        title: '上传附件',
        name: 'uploadFile',
        params: {
          Class: params.uploadFile.Class,
          FUNC: params.uploadFile.FUNC,
          FILTER: JSON.stringify({sdfName: this.tabs[0].object.flowResData.name})
        }
      })
      this.$importFile.handleSuccess = ()=>{
       this.getFileData();
      };
      this.$importFile.open();
    },
    removeFile(tableData,row){
      this.tabs[1].loading = true;
      let data = {};
      data[params.removeFile.data.fileName] = row.ID;
      DCHttp.req({url:dcConfig.publicPath, params:{
        Class: params.removeFile.Class,
        FUNC: params.removeFile.FUNC,
        [dcConfig.paramsKey]: data
      }}).then(res=>{
        this.tabs[1].loading = false;
        if(res){ this.getFileData() }
      }).catch(err=>{
        this.tabs[1].loading = false;
      });
    },
    getFileData(){
      this.tabs[1].loading = true;
      let data = {};
      data[params.getFileList.data.flowName] = this.flowName;
      DCHttp.req({url:params.getFileList.url, params:data}).then(res=>{
        this.tabs[1].loading = false;
        res && this.tabs[1].object.setTableData(res.CONTENT.tableData, res.CONTENT.tableHead);
      }).catch(err=>{
        this.tabs[1].loading = false;
      });
    }
  },
}
</script>
<!-- scoped -->
<style scoped>
.containerMargin{
  margin: 10px;
  margin-bottom: 0px;
}
.flowContainer{
  overflow: auto;
}
.full{
	margin: 0;
	padding: 0;
}
</style>
<style>
.full .el-tabs--border-card{
  margin: 0;
  padding: 0;
  border: none;
}
.full .el-tabs--border-card>.el-tabs__content { 
  margin: 0px !important;
  padding: 0px !important;
}
</style>
