<template>
  <div>
    <div class="header" @click.ctrl="dev($event)">{{title}}:</div>
    <dc-table :object="table" v-loading="loading" class="containerMargin"></dc-table>
    <dc-contextmenu :object="contextmenu"></dc-contextmenu>
  </div>
</template>

<script>

import {statusColor} from './statusColor'
const Class = 'JobMgr'
export default {
  name: 'dataFlow',
  data () {
    return {
      errTimes: 0,
      title: 'Job监控',
      loading: false,
      interval: false,
      contextmenu: new dc.Contextmenu(),
      table: new dc.Table({
        align: 'center',
        btnSize: 'mini',
        height: document.documentElement.clientHeight - 220 + 'px',
        colsWidth: [{
          prop: 'status',
          width: '60px',
        },{
          prop: 'name',
          width: '130px',
        },{
          prop: 'opTime',
          width: '135px',
        },{
          prop: 'appOpTime',
          width: '135px'
        }],
        btnGroup: [{
          icon: "fa fa-refresh", 
          type: 'success',
          title: "刷新",
          click: (tableData, row, tableHead)=>{
            this.initData();
          }
        },{
          icon: "fa fa-eye",
          type: "primary",
          title: "查看状态",
          needRow: true,
          click: (data, row)=>{
            let dialog = new dc.Dialog({
              top: '40px',
              title: row.jobName,
              width: '1200px',
              component: 'pdcStatus',
              data: objClone(row,{},['jobId','jobName','OpTime','AppOptime','storyId'],true)
            });
            this.$openDialog(dialog);
          }
        }],
        hasSearch: true,
        search: ()=>{ this.initData() },
        sizeChange: ()=>{ this.initData() },
        pageChange: ()=>{ this.initData() },
        rowDbClick: (data, row)=>{
          let dialog = new dc.Dialog({
            top: '40px',
            title: row.jobName,
            width: '1200px',
            component: 'pdcStatus',
            data: objClone(row,{},['jobId','jobName','OpTime','AppOptime','storyId'],true)
          });
          this.$openDialog(dialog);
        },
        rowContextmenu: (e, data, row, head, table)=>{
          let contextmenu = [{
            text: '激活',
            icon: 'fa fa-power-off',
            iconColor: 'blue',
            show(tree) {  return !row.status },
            click: ()=>{
              this.loading = true
              this.contextmenu.hideMenu()
              DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                  [dcConfig.paramsKey]: {
                    jobId: row.jobId,
                  },
                  Class,
                  FUNC: 'activeJob'
                }
              }).then(res => {
                this.initData()
                this.loading = false
              }).catch(err => {
                this.loading = false
              })
            },
          },{
            text: '挂起',
            icon: 'fa fa-power-off',
            iconColor: 'red',
            show(tree) { return row.status },
            click: ()=>{
              this.loading = true;
              this.contextmenu.hideMenu();
              DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                  [dcConfig.paramsKey]: {
                    jobId: row.jobId
                  },
                  Class,
                  FUNC: 'suspendJob'
                }
              }).then(res => {
                this.initData()
              }).catch(err => {
                this.loading = false
              })
            },
          },{
            text: '中断',
            icon: 'fa fa-stop',
            iconColor: 'red',
            click: ()=>{
              this.loading = true;    
              this.contextmenu.hideMenu(); 
              DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                  [dcConfig.paramsKey]: {
                    jobId: row.jobId
                  },
                  Class,
                  FUNC: 'stopJob'
                }
              }).then(res => {
                this.initData()
                this.loading = false
              }).catch(err => {
                this.loading = false
              })  
            }
          },{
            text: '启动',
            icon: 'fa fa-play',
            iconColor: 'rgb(80, 139, 55)',
            click: ()=>{
              let form = new dc.Form({
                structure: [{
                  type: 'DateTime',
                  canBeEmpty: false,
                  name: 'dateTime',
                  label: '启动时间',
                }],
                data: {
                  dateTime: row.opTime,
                  jobId: row.jobId
                },
                btns: [{
                  label: '确定',
                  type: 'primary',
                  click:(form,btn,index)=> {
                    this.loading = true;
                    DCHttp.req({
                      url: dcConfig.publicPath,
                      params: {
                          Class,
                          FUNC: 'startJob',
                          [dcConfig.paramsKey]: {
                            jobId: row.jobId,
                            opTime: VUE.$formatTime(form.data.dateTime + ':00','number')
                          }
                      }
                    }).then(res => {
                      this.loading = false
                      this.initData()
                      VUE.$closeDialog()
                    }).catch(err => this.loading = false)
                  }
                }, {
                  label: '取消',
                  click:(form,btn,index)=>{
                    this.$closeDialog()
                  }
                }]
              })
              this.$openDialog({
                title: '设置调度时间',
                width: '400px',
                component: 'dc-form',
                data: {
                  object: form
                }
              })
            }
          },{
            text: '仅重置错误节点状态',
            icon: 'fa fa-undo',
            iconColor: 'yellow',
            click: ()=>{
              this.loading = true;
              this.contextmenu.hideMenu();
              DCHttp.req({
                  url: dcConfig.publicPath,
                  params: {
                      Class,
                      FUNC: 'resetAllErrorPDCOfJob',
                      [dcConfig.paramsKey]: {
                        jobId: row.jobId
                      }
                  }
              }).then(res => {
                this.loading = false
                this.initData()
              }).catch(err => {
                this.loading = false
              })
            }
          },{
            text: '重置所有节点的状态',
            icon: 'fa fa-folder-o',
            iconColor: '#000',
            click: ()=>{
              this.loading = true;
              this.contextmenu.hideMenu();
              let str = '您确定要重置所有节点的运行状态？“甚至”包括已经运行成功的节点也要重置？'
              VUE.$affirm(str).then(() => {
                  DCHttp.req({
                    url: dcConfig.publicPath,
                    params: {
                      Class,
                      FUNC: 'resetAllPDCOfJob',
                      [dcConfig.paramsKey]: {
                        jobId: row.jobId
                      }
                    }
                  }).then(res => {
                    this.loading = false
                    this.initData()
                  }).catch(err => {
                    this.loading = false
                  })
              })
            }
          },{
            text: '树上选中',
            icon: 'fa fa-exchange',
            iconColor: '#ffc773',
            click: ()=>{
              this.contextmenu.hideMenu();
              Tree.setCurrentKey(row.jobId);
            }
          },{
            text: '切换调度时间',
            icon: 'fa fa-exchange',
            iconColor: 'blue',
            click: ()=>{
              let form = new dc.Form({
                structure: [{
                  type: 'DateTime',
                  canBeEmpty: false,
                  name: 'dateTime',
                  label: '启动时间',
                }],
                data: {
                  dateTime: row.opTime,
                  jobId: row.jobId
                },
                btns: [{
                  label: '确定',
                  type: 'primary',
                  click:(form,btn,index)=> {
                    this.loading = true;
                    DCHttp.req({
                      url: dcConfig.publicPath,
                      params: {
                          Class,
                          FUNC: 'changeJobOptime',
                          [dcConfig.paramsKey]: {
                            jobId: row.jobId,
                            newOptime: VUE.$formatTime(form.data.dateTime + ':00','number')
                          }
                      }
                    }).then(res => {
                      this.loading = false
                      this.initData()
                      VUE.$closeDialog()
                    }).catch(err => this.loading = false)
                  }
                }, {
                  label: '取消',
                  click:(form,btn,index)=>{
                    this.$closeDialog()
                  }
                }]
              })
              this.$openDialog({
                title: '切换调度时间',
                width: '400px',
                component: 'dc-form',
                data: {
                  object: form
                }
              })
            }
          }, {
            text: '指派代理机',
            icon: 'fa fa-laptop',
            iconColor: '#666',
            click: ()=>{
              this.contextmenu.hideMenu();
              this.$openDialog(new dc.Dialog({
                width: '600px',
                component: 'agentsList',
                data: { 'jobId':row.jobId, 'type':'Job' },
              }));
            }
          }];
          this.contextmenu.showMenu(e,contextmenu)
        },
        cellAppend: [{
          prop: "status", 
          condition: "true", 
          component: "cellIcon"
        }],
      }),
      webSocket: null
    }
  },
  watch:{
    $route(to,from){
      if(this.$route.path != '/dataFlow'){
        closeWebSocket('JobStatisticsList')
      }else{
        this.initData();
        // this.startRefresht();
      }
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
      // this.startRefresh();
    });
  },
  destroyed(){
    // this.stopRefresh();
    this.webSocket.stop()
  },
  methods: {
    dev(e){
      (e.detail === 3) && this.stopRefresh();
      (e.detail === 2) && this.startRefresh();
    },
    changeTableCellColor(tableHead,table){
      table.cellStyle = statusColor
    },
    initData(){
      this.loading = true;
      this.getTableData();
    },
    getTableData(){
      let params = {
        pageSize: this.table.currentSize,
        pageNo: this.table.currentPage,
        keyword: this.table.keyword,
      }
      this.webSocket && this.webSocket.close()
      this.webSocket = getWebSocket('JobStatisticsList', params)
      this.webSocket.send(res => {
        if(this.errTimes < 5){
          if(res.content) {
            this.loading = false
            this.errTimes = 0
            let content = res.content
            this.table.tableHead.length || this.changeTableCellColor(content.tableHead, this.table);
            this.table.setTableData(content.tableData, content.tableHead).set('total', content.total);
          }else{
            this.loading = false
            this.errTimes++
          }
        }else {
            this.webSocket.stop()
        }
      })

      // if(this.errTimes < 5){
      //   DCHttp.req({
      //     url: '/api/Job/statisticsList', 
      //     params
      //   }).then(res => {
      //     this.loading = false
      //     this.errTimes = 0;
      //     this.table.tableHead.length || this.changeTableCellColor(res.tableHead, this.table);
      //     this.table.setTableData(res.tableData, res.tableHead).set('total', res.total);
      //   }).catch(err => {
      //     this.loading = false
      //     this.errTimes++;
      //   })
      // }else{
      //   this.stopRefresh();
      // }
      
    },
    // startRefresh(){
    //   this.stopRefresh();
    //   this.interval = setInterval(this.getTableData, intervalTime);
    // },
    // stopRefresh(){
    //   clearInterval(this.interval);
    //   this.interval = null;
    // },
  },
}
</script>

<style scoped>
.containerMargin{
  margin: 10px 10px 0px 10px;
}
.header{
  text-align: left;
  text-indent: 10px;
  font-size: 20px;
  font-weight: bold;
  line-height: 40px;
  border-bottom: 1px solid #ccc;
}
</style>
