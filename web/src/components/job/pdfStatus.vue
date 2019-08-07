<template>
  <div @click.ctrl.alt="dev($event)">
    <dc-table :object="table" v-loading="loading"></dc-table>
    <dc-contextmenu :object="contextmenu"></dc-contextmenu>
  </div>
</template>

<script>
const intervalTime = 3000;
import {statusColor} from './statusColor'

export default {
  name: 'PDFStatus',
  props: ['propData'],
  data () {
    let _this = this
    return {
      loading: false,
      errTimes: 0,
      contextmenu: new dc.Contextmenu(),
      btns: [{
        icon: 'fa fa-refresh',
        color: 'green',
        title: '刷新',
        click:(data, row, head, table)=>{ this.initData() }
      },{
        icon: 'fa fa-plus',
        color: 'green',
        title: '新增',
        click:(data, row, head, table)=>{
          VUE.$openDialog(new dc.Dialog({
            verticalCenter: true,
            title: '添加PDF',
            component: 'addPDF',
            width: '400px',
            data: {
              storyId: _this.propData.storyId,
              jobId: _this.propData.link,
              refresh: _this.initData
            }
          }))
        }
      },{
        icon: 'fa fa-times',
        color: 'red',
        title: '删除',
        needRow: true,
        click:(tableData, row, head, table)=>{ 
          const params = { jobId: this.propData.link, pdfName: row.name }
          this.loading = true;
          DCHttp.req({ url: '/api/Job/removePDF', params }).then(res => {
            this.initData()
            this.loading = false
          }).catch(err =>{
            this.loading = false
          })
        }
      },{
        icon: 'fa fa-random',
        color: 'blue',
        title: '同步PDF到Job',
        needRow: true,
        click:(tableData, row, head, table)=>{
          let data = { jobId: this.propData.link, pdfName: row.name }
          this.loading = true;
          DCHttp.req({ url: '/api/Job/syncPDF', params: data, info: {success:"同步成功!"} }).then(res => {
            this.initData()
            this.loading = false
          }).catch(err => {
            this.loading = false
          })
        }
      }],
      table: new dc.Table({
        height: "350px",
        hasPage: false,
        hasSearch: true,
        hasBtn: true,
        search: ()=>{ this.initData() },
        rowDbClick: (data, row)=>{
          this.$closeDialog();
          this.$router.push({ 
            path: '/job', 
            query: { pdfId:row.pdfId, pdcName: row.name, link: this.propData.link, storyId:this.propData.storyId, flowType:'flowModule' }
          });
        },
        rowContextmenu: (e, data, row, head, table)=>{
          let contextmenu = [{
            text: '仅重置错误节点状态',
            icon: 'fa fa-paint-brush',
            iconColor: 'orange',
            click: ()=>{
              this.loading = true;
              this.contextmenu.hideMenu();
              let params = {
                jobId: this.propData.link,
                pdfName: row.name
              }
              this.loading = true;
              DCHttp.req({ url: '/api/Job/resetPDFAllErrors', params }).then(res => {
                this.initData()
                this.loading = false
              }).catch(err =>{
                this.loading = false
              })
              
            }
          },{
            text: '重置所有节点的状态',
            icon: 'fa fa-warning',
            iconColor: '#f20c00',
            click: ()=>{
              this.loading = true;
              this.contextmenu.hideMenu();
              let params = { jobId: this.propData.link, pdfName: row.name }
              this.loading = true;
              DCHttp.req({ url: '/api/Job/resetPDFAllStopRunnings', params}).then(res => {
                this.initData()
                this.loading = false
              }).catch(err =>{
                this.loading = false
              })
            }
          },{
            text: '指派代理机',
            icon: 'fa fa-laptop',
            iconColor: '#666',
            click: ()=>{
              this.loading = true;
              this.contextmenu.hideMenu();
              this.$openDialog(new dc.Dialog({
                verticalCenter: true,
                width: '600px',
                component: 'agentsList',
                data: { 'jobId':this.propData.link, pdfName:row.name, 'type':'PDF' },
              }));
            }
          },{
            text: '同步PDF到job',
            icon: 'fa fa-random',
            iconColor: 'blue',
            click: ()=>{
              let data = { jobId: this.propData.link, pdfName: row.name }
              this.loading = true;
              DCHttp.req({ url: '/api/Job/syncPDF', params: data, info: {success:"同步成功!"} }).then(res => {
                this.initData()
                this.loading = false
              }).catch(err => {
                this.loading = false
              })
            }
          },{
            text: '强行终止PDF中运行的节点',
            icon: 'fa fa-stop',
            iconColor: 'red',
            click: ()=>{
              this.contextmenu.hideMenu()
              let data = { jobId: this.propData.link, pdfName: row.name }
              this.loading = true
              DCHttp.req({ url: '/api/Job/stopPDF', params: data }).then(res => {
                this.initData()
                this.loading = false
              }).catch(err => {
                this.loading = false
              })
            }
          }];
          this.contextmenu.showMenu(e,contextmenu)
        },
      }),
    }
  },
  created(){
    this.$nextTick(()=>{
      (this.propData.type.toLowerCase() == 'job') || this.btns.splice(1,2);
      this.table.btnGroup = this.btns;
      // this.initData();
      this.startRefresh();
    });
  },
  destroyed(){
    this.stopRefresh();
  },
  methods: {
    dev(e){
      (e.detail === 3) && this.stopRefresh();
      (e.detail === 2) && this.startRefresh();
    },
    initData(){
      this.loading = true;
      this.getTableData();
    },
    getTableData(){
      const url = '/api/Job/PDFStatisticsList';
      const params = { jobId: this.propData.link, keyword: this.table.keyword };
      DCHttp.req({ url, params }).then(res => {
        this.resHandleFn(res,res.ERR_MSG)
      }).catch(err => {
        this.failFn(err);
      })
    },
    changeTableCellColor(tableHead, table){
      table.cellStyle = statusColor
    },
    failFn(res){ //请求错误的操作
      this.loading = false
      this.errTimes++;
      if(this.errTimes >= 3){
        console.warn(res);
        this.stopRefresh();
      }
    },
    resHandleFn(res,err){ //请求后的操作
      if(res && this.errTimes<3){
        this.loading = false
        this.errTimes = 0;
        this.table.tableHead.length || this.changeTableCellColor(res.tableHead, this.table);
        this.table.setTableData(res.tableData, res.tableHead);
      }else{
        this.failFn(err);
      }
    },
    startRefresh(){
      this.stopRefresh();
      // this.interval = setInterval(this.getTableData, intervalTime);
      //将interval定时器替换为websocket
      const url = "PDFStatisticsList";
      const params = { jobId: this.propData.link, keyword: this.table.keyword };
      this.interval = getWebSocket(url, params);
      this.interval.send(res => { this.resHandleFn(res.content,res.errMsg) });
    },
    stopRefresh(){
      if(this.interval){
        (typeof this.interval == 'object') && this.interval.close();
        (typeof this.interval == 'number') && clearInterval(this.interval);
      }
      this.interval = null;
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
