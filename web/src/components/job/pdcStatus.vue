<template>
  <div v-loading="loading" @click.ctrl="dev($event)">
    <el-button @click="initData()" :size="toobarSize" title="刷新"><i class="fa fa-refresh" style="color:green"></i></el-button>
    <el-select v-model="data.iCmbStatus" :size="toobarSize" style="width:130px">
      <el-option v-for="(option,optionIndex) in iCmbStatusList" :key="optionIndex" :label="option.label" :value="option.value"></el-option>
    </el-select>
    <dc-quick-multiSelect v-model="data.queueNames" :propData="{ item:{option:queueNamesList, size:toobarSize, width:172 ,allselectText:allselectText[0]} }"></dc-quick-multiSelect>
    <dc-quick-multiSelect v-model="data.cdcNames" :propData="{ item:{option:cdcNamesList, size:toobarSize, width:172 ,allselectText:allselectText[1]} }"></dc-quick-multiSelect>
    <dc-quick-multiSelect v-model="data.agents" :propData="{ item:{option:agentsList, size:toobarSize, width:172 ,allselectText:allselectText[2]} }"></dc-quick-multiSelect>
    <el-input v-model="data.keyword" @keyup.native.enter="initData()" :size="toobarSize" style="width:150px" suffix-icon="el-icon-search"></el-input>
    <dc-table :object="table"></dc-table>
    <dc-contextmenu :object="contextmenu"></dc-contextmenu>
  </div>
</template>

<script>
const intervalTime = 3000;
const PRIORITY = [{
  label: '最高优先级(100)',
  value: 100,
},{
  label: '高优先级(75)',
  value: 75,
},{
  label: '标准(50)',
  value: 50,
},{
  label: '底优先级(25)',
  value: 25,
},{
  label: '最低优先级(1)',
  value: 1,
}];

import {statusColor} from './statusColor'

const Class = 'JobMgr'

export default {
  name: 'PDCStatus',
  props: ['propData'],
  data () {
    return {
      loading: false,
      isFirst: true,
      errTimes: 0,
      contextmenu: new dc.Contextmenu(),
      toobarSize: 'small',
      allselectText: ['所有队列','所有CDC','所有代理'],
      queueNamesList: [],
      cdcNamesList: [],
      agentsList: [],
      iCmbStatusList: [],
      selectRows: [],
      table: new dc.Table({
        size: 'mini',
        height: "300px",
        isDefaultSort: false,
        sortArr: ['JobName','Queue','Priority', 'AppOptime', 'Time', 'Agent', 'End Time'],
        sizeChange: (val)=>{ this.initData() },
        pageChange: (val)=>{ this.initData() },
        sortChange: (column, prop, order)=>{
          let orderMap = {
            ascending: 0,
            descending: 1,
          }
          let sortMap = {
            JobName: 'name',
            Queue: 'QueueName',
            Priority: 'Priority',
            'Time': 'CEXE_TIME',
            Agent: 'Agent',
            AppOptime: 'CORG_TIME',
            'End Time': 'CTIME',
          }
          this.data.sort = orderMap[order];
          this.data.order = sortMap[prop];
          this.initData();
        },
        rowDbClick: (tableData, row)=>{
          this.$closeDialog();
          this.$router.push({ 
            path: '/job', 
            query: { pdcName:row.JobName, id:this.propData.jobId, link:this.propData.jobId, storyId:this.propData.storyId, flowType:'relation' } 
          });
        },
        rowContextmenu: (e, data, row, head, table)=>{
          table.rowClickSelections.length === 0 && (table.rowClickSelections.push(row))
          let contextmenu = [{
            text: '编辑PDC',
            icon: 'fa fa-edit',
            iconColor: 'blue',
            show: () => { return this.table.rowClickSelections.length < 2 }, 
            click: ()=>{
              this.contextmenu.hideMenu();
              this.$closeDialog();
              this.$route.query.from = JSON.stringify({path: this.$route.path, query: this.$route.query});
              this.$route.query.guid = row.jobName;
              this.$router.push({path:'/pdcForm',query: this.$route.query});
            }
          },{
            text: '打开数据流模型',
            icon: 'fa fa-sitemap fa-rotate-270',
            iconColor: 'blue',
            show: () => { return !row.JobName.endsWith('<MainJob>') },
            click: ()=>{
              this.contextmenu.hideMenu();
              this.$closeDialog();
              this.$router.push({ 
                path: '/job', 
                query: { pdcName:row.JobName, id:this.propData.jobId, link:this.propData.jobId, storyId:this.propData.storyId,flowType:'flowModule' } 
              });
            }
          },{
            text: '删除调度点',
            icon: 'fa fa-remove',
            iconColor: 'red',
            show: () => { return this.table.rowClickSelections.length < 2 }, 
            click: ()=>{
              this.contextmenu.hideMenu();
              this.loading = true;
              DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                  FUNC: 'removePDC',
                  Class,
                  [dcConfig.paramsKey]: {
                    jobId: this.propData.jobId,
                    pdcJobName: row.JobName
                  }
                }
              }).then(res => {
                this.initData()
                this.loading = false
              }).catch(err => {
                this.loading = false
              })
            }
          },{
            text: '查询历史记录',
            icon: 'fa fa-history',
            iconColor: '#666',
            show: () => { return this.table.rowClickSelections.length < 2 }, 
            click: ()=>{
              this.contextmenu.hideMenu();
              this.$openDialog(new dc.Dialog({
                verticalCenter: true,
                top: '40px',
                width: '1000px',
                component: 'historyTable',
                data: {  jobId:this.propData.jobId, pdcName: row.JobName },
              }));
            }
          },{
            text: '查看具体信息',
            icon: 'fa fa-info-circle',
            iconColor: '#177cb0',
            show: () => { return this.table.rowClickSelections.length < 2 }, 
            click: ()=>{
              this.contextmenu.hideMenu();
              this.getLog(row);//弹窗显示具体信息
            }
          },{
            text: '挂起节点',
            icon: 'fa fa-power-off',
            iconColor: 'orange',
            show: () => { return this.table.rowClickSelections.length < 2 }, 
            click: ()=>{
              this.contextmenu.hideMenu();
              this.$affirm('此操作将会改变调度的状态，是否继续', '提示', '取消').then(() => {
                this.loading = true;
                DCHttp.req({
                  url: dcConfig.publicPath,
                  params: {
                    Class: 'JobMgr',
                    FUNC: 'suspendPDCByPDCJobName',
                    [dcConfig.paramsKey]: {
                      jobId: this.propData.jobId,
                      pdcJobName: row.JobName
                    }
                  }
                }).then(res => {
                  this.initData()
                  this.loading = false
                }).catch(err => {
                  this.loading = false
                })
              })
            }
          }, {
            text: '忽略节点',
            icon: 'fa fa-check-square',
            iconColor: '#bddd22',
            show: () => { return this.table.rowClickSelections.length < 2 }, 
            click: ()=>{
              this.contextmenu.hideMenu();
              this.$prompt('请输入忽略的信息', '忽略节点', '取消').then(({ value }) => {
                this.loading = true;
                DCHttp.req({
                  url: dcConfig.publicPath,
                  params: {
                    Class: 'JobMgr',
                    FUNC: 'ignorePDCFailedByPDCJobName',
                    [dcConfig.paramsKey]: {
                      jobId: this.propData.jobId,
                      pdcJobName: row.JobName,
                      sIgnoreMsg: value
                    }
                  }
                }).then(res => {
                  this.initData()
                  this.loading = false
                }).catch(err => {
                  this.loading = false
                })
              })
            }
          }, {
            text: '重置运行状态',
            icon: 'fa fa-paint-brush',
            iconColor: 'orange',          
            click: ()=>{
              this.contextmenu.hideMenu();
              this.loading = true;
              DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                  Class: 'JobMgr',
                  FUNC: 'resetPDCStatusOfJob',
                  [dcConfig.paramsKey]: {
                    jobId: this.propData.jobId,
                    pdcJobNames: this.table.rowClickSelections.map(item => item.JobName)
                  }
                }
              }).then(res => {
                this.initData()
                this.loading = false
              }).catch(err => {
                this.loading = false
              })
            }
          }, {
            text: '切换调度队列',
            icon: 'fa fa-exchange',
            iconColor: 'blue',
            click: ()=>{
              this.contextmenu.hideMenu();
              this.loading = true;
              DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                  Class: 'JobMgr',
                  FUNC: 'listAllChildQueue',
                  [dcConfig.paramsKey]: {
                    jobId: this.propData.jobId,
                  }
                }
              }).then(res => {
                let data = res.CONTENT || []
                let tableData = data.map(item => {
                  return {
                    queueName: item.right.name,
                    groupPath: item.left,
                    pdcNames: this.table.rowClickSelections.map(item => item.JobName.slice(0, row.JobName.lastIndexOf('<'))),
                    jobId: this.propData.jobId
                  }
                })
                let tableHead = [{
                  label: '列队名',
                  name: 'queueName',
                  type: 'string'
                }, {
                  label: '全路径',
                  name: 'groupPath',
                  type: 'string'
                }]
                let dialog = new dc.Dialog({
                  verticalCenter: true,
                  title: '切换队列',
                  width: '400px',
                  component: 'dc-table',
                  data: {
                    object: new dc.Table({
                      tableHead,
                      tableData,
                      hasPage: false,
                      height: '300px',
                      rowDbClick(tableData, row) {
                        DCHttp.req({
                          url: dcConfig.publicPath,
                          params: {
                            FUNC: 'changeQueueOfPDC',
                            Class: 'JobMgr',
                            [dcConfig.paramsKey]: row
                          }
                        }).then(res => {
                          VUE.$closeDialog()
                          VUE.$successMessage('切换成功')
                        })
                      }
                    })
                  }
                })
                VUE.$openDialog(dialog)
                this.loading = false
              }).catch(err => {
                this.loading = false
              })
            }
          }, {
            text: '设置优先级' + (row.Priority ? '(当前='+row.Priority+')' : ''),
            icon: 'fa fa-exchange',
            iconColor: '#666',
            children: [
              ...PRIORITY.map(item=>{
                return {
                  text: item.label,
                  click: ()=>{
                    this.changePriority(item.value, this.table.rowClickSelections.map(item => item.JobName));
                    this.contextmenu.hideMenu();
                  }
                }
              }),
            {
              text: '自定义',
              click: ()=>{ 
                this.contextmenu.hideMenu();
                VUE.$prompt(null, '设置优先级', {
                  inputValue: 50,
                  inputValidator: (value)=>{const val=parseInt(value); return value == val && val>=1 && val<=100},
                  inputErrorMessage: '优先级必须是不小于1且不大于100的整数'
                }).then(({ value }) => {
                  this.changePriority(parseInt(value), this.table.rowClickSelections.map(item => item.JobName))
                }).catch(()=>{});
              }
            }]
          },{
            text: '捆绑资源',
            icon: 'fa fa-bar-chart',
            iconColor: 'red', 
            click: ()=>{
              this.contextmenu.hideMenu();
              this.$openDialog(new dc.Dialog({
                verticalCenter: true,
                top: '40px',
                width: '600px',
                component: 'bindResource',
                data: { 'jobId':this.propData.jobId, 'pdcNames': this.table.rowClickSelections.map(item => item.JobName) },
              }));
            }
          },{
            text: '指派代理机',
            icon: 'fa fa-laptop',
            iconColor: '#666',
            show: () => { return this.table.rowClickSelections.length < 2 },
            click: ()=>{
              this.contextmenu.hideMenu();
              this.$openDialog(new dc.Dialog({
                verticalCenter: true,
                width: '600px',
                component: 'agentsList',
                data: { 'jobId':this.propData.jobId, 'pdcName':row.JobName, 'type':'PDC' },
              }));
            }
          },{ // 接口不存在，故屏蔽
            text: '查询代理执行记录',
            icon: 'fa fa-history',
            iconColor: '#666',
            show: () => { return this.table.rowClickSelections.length < 2 },
            click: ()=>{
              this.contextmenu.hideMenu();
              this.$openDialog(new dc.Dialog({
                verticalCenter: true,
                top: '40px',
                width: '1000px',
                component: 'historyTable',
                data: { jobId:this.propData.jobId, pdcName:row.JobName, type: 'agent' },
              }));
            }
          }];
          this.contextmenu.showMenu(e,contextmenu)
        },
        colsWidth: [{
          prop: 'Status',
          width: '80px'
        },{
          prop: 'Priority',
          width: '85px'
        },{
          prop: 'queue',
          width: '90px'
        }]
      }),
      data: {
        jobId: this.propData.jobId,
        iCmbStatus: this.propData.iCmbStatus || 1,
        queueNames: [],
        cdcNames: [],
        agents: [],
        keyword: "",
        order: "",
        sort: 0,
      }
    }
  },
  created(){
    this.$nextTick(()=>{
      try{
        this.initData()
        this.startRefresh()
      }catch(err) {}
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
      this.isFirst = true;
      this.getTableData();
    },
    getTableData(){
      let params = objClone(this.data);
      ['cdcNames','agents','queueNames'].forEach(item=>{ //当下拉列表不存在或全选时传null
        (!this[item+'List'].length || (this[item+'List'].length == params[item].length)) && (params[item] = null);
      })
      params.pageNo = this.table.currentPage
      params.pageSize = this.table.currentSize
      DCHttp.req({ url: '/api/Job/PDCRunInfo', params }).then(res => {
        this.resHandleFn(res,res.ERR_MSG);
      }).catch(err => {
        this.failFn(err)
      })
    },
    updateData(data){
      this.table.setTableData(data.tableData, data.tableHead).set('total', data.total);
      this.table.cellStyle = statusColor;
      if(this.isFirst){
        this.isFirst = false;
        this.iCmbStatusList = data.status;
        ['cdcNames','agents','queueNames'].forEach(item=>{
          !this[item+'List'].length && data[item].length && this.getList(this.data[item], data[item]);
          this[item+'List'].splice(0, this[item+'List'].length, ...data[item]);
          this[item+'List'] = data[item]
        })
      } 
    },
    getList(selected, options){
      selected.splice(0, selected.length, ...options.map(item=>item.value));
    },
    failFn(res){
      this.loading = false
      this.errTimes++;
      if(this.errTimes >= 3){
        console.warn(res);
        this.stopRefresh();
      }
    },
    resHandleFn(res,err){
      if(this.errTimes < 3 && res){
        this.errTimes = 0
        this.loading = false
        this.updateData(res);
      }else{
        this.failFn(err);
      }
    },
    startRefresh(){
      this.stopRefresh();
      this.interval = setInterval(this.getTableData, intervalTime);
      //将interval定时器替换为websocket
      // let params = objClone(this.data);
      // ['cdcNames','agents','queueNames'].forEach(item=>{ //当下拉列表不存在或全选时传null
      //   (!this[item+'List'].length || (this[item+'List'].length == params[item].length)) && (params[item] = null);
      // })
      // params.pageNo = this.table.currentPage
      // params.pageSize = this.table.currentSize
      // const url = "PDCRunInfo";
      // this.interval = getWebSocket(url, params);
      // this.interval.send(res => { this.resHandleFn(res.content,res.errMsg) });
    },
    stopRefresh(){
      if(this.interval){
        (typeof this.interval == 'object') && this.interval.close();
        (typeof this.interval == 'number') && clearInterval(this.interval);
      }
      this.interval = null;
    },
    changePriority(priority,rowNames){
      this.loading = true;
      DCHttp.req({
        url: dcConfig.publicPath,
        params: {
          FUNC: 'changePDCPriorityByPDCJobName',
          Class,
          [dcConfig.paramsKey]: {
            jobId: this.propData.jobId,
            pdcJobNames: rowNames,
            priority: priority
          }
        }
      }).then(res => {
        this.initData()
        this.loading = false
      }).catch(err => {
        this.loading=false
      })
    },
    getLog(row){
      const tabsData = [{title:"Trace日志",value:"Trace"},{title:"错误堆栈",value:"Error Detail"}].map(item=>{
        return {
          CONTENT: {
            "title": item.title,
            "type": "String",
            "value": row[item.value],
          }
        }
      }).filter(item=>!!item.CONTENT.value);
      if(tabsData.length || (row.Msg && row.Msg.length > 50)){
        VUE.$openDialog(new dc.Dialog({
          verticalCenter: true,
          top: '40px',
          width: '900px',
          component: 'traceInfo',
          data: { 
            hasBtn:true,
            res: {
              title: row.Msg,
              isError: !!row["Error Detail"],
              tabsData: tabsData
            }
          }
        }));
      }else{
        VUE.$alert(row.Msg,'信息',{type:'info'});
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
