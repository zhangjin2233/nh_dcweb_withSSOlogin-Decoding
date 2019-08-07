<template>
  <dc-table v-loading="loading" :object="table"></dc-table>
</template>

<script>
import params from './params.js'

export default {
  name: 'jobList',
  props: ['propData'],
  data () {
    return {
      loading: false,
      table: new dc.Table({
        height: "250px",
        align: 'center',          
        hasBtn: true,
        hasPage: false,
        hiddenCols: ['jobId'],
        btnGroup: [{
          icon: 'fa fa-refresh',
          color: 'green', 
          title: '刷新',
          click:(tableData,row)=>{
            this.initData();
          }
        },{
          icon: 'fa fa-plus',
          color: 'blue', 
          title: '新增',
          click:(tableData,row)=>{ 
            this.openJobConfig('add');
          }
        },{
          icon: 'fa fa-edit',
          color: 'blue', 
          title: '编辑',
          needRow: true,
          click:(tableData,row)=>{ 
            this.openJobConfig('edit',row);
          }
        },{
          icon: 'fa fa-remove',
          color: 'red', 
          title: '删除',
          needRow: true,
          click:(tableData,row)=>{
            this.loading = true;
            DCHttp.req({
              url: dcConfig.publicPath,
              params: {
                FUNC: 'deleteJob',
                Class: 'JobMgr',
                [dcConfig.paramsKey]: {
                  jobId: row.jobId
                }
              }
            }).then(res => {
              this.loading = false
              this.initData()
            }).catch(err => {
              this.loading = false
              try{
                Tree.refreshTree(Tree.getNode(row.jobId).parent.data.link)
              }catch(err){}
              
            })
          }
        },{
          icon: 'fa fa-random',
          color: 'blue',
          title: '同步PDF到Job',
          needRow: true,
          click:(tableData, row, head, table)=>{
            let params = {
              [dcConfig.paramsKey]: {
                jobId: row.jobId,
                pdfId: this.propData.flowName,
                checkReferenceNode: true,
              },
              Class: 'JobMgr',
              FUNC: 'syncPDF'
            }
            this.loading = true;
            DCHttp.req({
              url: dcConfig.publicPath,
              params,
              info: {success:'同步成功'}
            }).then(res => {
              this.initData();
            })
          }
        }],
        rowDbClick:(data, row, head, table)=>{
          this.openJobConfig('edit',row);
        }
      }),
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
      this.$addListener('refreshJobTabel', () => {
        this.initData()
      })
    });
  },
  destroyed() {
    this.$cancelEvent('refreshJobTabel')
  },
  methods:{
    initData(){
      this.loading = true
      DCHttp.req({
        url: '/api/Job/listJobOfPDF',
        params: {
          pdfId: this.propData.flowName
        }
      }).then(res => {
        this.loading = false
        this.table.setTableData(res.tableData, res.tableHead)
      }).catch(err=>{ this.loading = false })
    },
    openJobConfig(type,row){
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        title: 'Job',
        width: '500px',
        component: 'jobForm',
        data: {
          jobId: row ? row.jobId : "",
          type: type,
          storyId: this.$route.query.storyId,
          jobName: row ? row.jobName : "",
          pdfId: this.propData.flowName,
          flowId: this.propData.flowName,
          initData: this.initData
        }
      }))
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
