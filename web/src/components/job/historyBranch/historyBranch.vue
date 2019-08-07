<template>
  <el-row v-loading="loading">
    <el-col :span="16">
      <toolBtn @refresh="initData" :data="data" :type="propData.type" :toobarSize="toobarSize" :iCmbStatusList="iCmbStatusList" :queueNamesList="queueNamesList" :cdcNamesList="cdcNamesList" :agentsList="agentsList" :allselectText="allselectText" :hisOpTimeList="hisOpTimeList"></toolBtn>
      <dc-table :object="table0"></dc-table>
    </el-col>
    <el-col :span="2">
      <div class="transferBtn">
        <button @click="transferData()"><i class="fa fa-long-arrow-right fa-2x"></i><i class="fa fa-filter fa-2x"></i></button>
      </div>
    </el-col>
    <el-col :span="6">
      <dc-table :object="table1"></dc-table>
      <div class="lineMargin">
        <el-input v-if="propData.type.toLowerCase() != 'historyjob'" v-model="jobName" placeholder="请输入历史分支名称"></el-input>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import {statusColor} from '../statusColor'
import toolBtn from './toolBtn'

export default {
  name: 'historyBranch',
  props: ['propData'],
  data () {
    return {
      jobName: '',
      toobarSize: 'mini',
      allselectText: ['所有队列','所有CDC','所有代理'],
      queueNamesList: [],
      cdcNamesList: [],
      agentsList: [],
      iCmbStatusList: [],
      hisOpTimeList: [],
      loading: false,
      data: {
        jobId: this.propData.parentId || this.propData.jobId,
        iCmbStatus: 1,
        queueNames: [],
        cdcNames: [],
        agents: [],
        hisOpTime: this.propData.OpTime || "",
        keyword: "",
        order: "",
        sort: 0,
      },
      table0: new dc.Table({
        size: 'mini',
        pageTool: 'total, sizes, jumper',
        sizeChange: (val)=>{ this.getTableData() },
        pageChange: (val)=>{ this.getTableData() },
        height: "300px",
        align: 'center',
        hasPage: true,
        hasColSelect: true,
        colsWidth: [{
          prop: 'Name',
          width: '250px',
        },{
          prop: 'Start Time',
          width: '130px'
        },{
          prop: 'End Time',
          width: '140px'
        },{
          prop: 'resourcePool',
          width: '150px'
        }]
      }),
      table1: new dc.Table({
        height: "300px",
        align: 'center',
        hasBottomBtn: false,
        hasBtn: true,
        hasPage: false,
        btnGroup: [{
          icon: 'fa fa-remove',
          color: 'red', 
          title: '删除',
          needRow: true,
          click:(data,row)=>{
            let i = data.findIndex(item=>item == row);
            (i != -1) && data.splice(i,1);
          }
        }],
        tableHead: [{
          "label": "名称",
          "name": "Name",
          "type": "String",
        }],
      }),
    }
  },
  created(){
      this.initData();
  },
  methods:{
    initData(){
      this.getTableData();
    },
    getTableData(){
      this.loading = true;
      let data = objClone(this.data);
      ['cdcNames','agents','queueNames'].forEach(item=>{ //当下拉列表不存在或全选时传null
        (!this[item+'List'].length || (this[item+'List'].length == data[item].length)) && (data[item] = null);
      })
      data.pageNo = this.table0.currentPage;
      data.pageSize = this.table0.currentSize;
      DCHttp.req({
        url: '/api/Job/getHistoryData',
        params: data
      }).then(res => {
        this.loading = false
        this.updateData(res)
      }).catch(err => {
        this.loading = false
      })
    },
    updateData(data){
      this.table0.setTableData(data.tableData, data.tableHead).set('total', data.total);
      this.table0.cellStyle = statusColor;
      this.iCmbStatusList = data.status;
      this.hisOpTimeList = data.status2;
      ['cdcNames','agents','queueNames'].forEach(item=>{
        !this[item+'List'].length && data[item].length && this.getList(this.data[item], data[item]);
        this[item+'List'].splice(0, this[item+'List'].length, ...data[item]);
      })
      this.data.hisOpTime = data.jobOptime
      
    },
    getList(selected, options){
      selected.splice(0, selected.length, ...options.map(item=>item.value));
    },
    transferData(){
      this.table0.selection.map((item,key,array)=>{
        this.table1.tableData.includes(item) || this.table1.tableData.push(item);
      })
    },
    finishOperate(){
      this.loading = false;
      this.$closeDialog();
      this.propData.refresh();
    },
    createHistoryBranch() {
      let nodes = this.table1.tableData.map(item=>item.Names)
      let data = {
        jobId: this.propData.jobId,
        name: this.jobName || `历史分支-${this.$formatTime(new Date())}`,
        hisOpTime: this.data.hisOpTime,
        nodes: nodes,
      }
      this.loading = true
      DCHttp.req({
        url: '/api/Job/createHistoryJob',
        params: data,
        method: 'post'
      }).then(res => {
        this.loading = false
        this.finishOperate()
      }).catch(err => {
        this.loading = false
      })
    },
    createAllNodesBranch(nodes,links){ //创建整个job的历史分支
      let data = {
        jobId: this.propData.jobId,
        nodes: nodes,
        name: this.jobName || this.data.hisOpTime,
        hisOpTime: this.data.hisOpTime,
      }
      DCHttp.req({
        url: '/api/Job/createHistoryJob',
        params: data,
        method: 'post'
      }).then(res => {
        this.loading = false
        this.finishOperate()
      }).catch(err => {
        this.loading = false
      })
    },
    addBranchNodes(nodes){ //在分支节点上添加节点
      let data = {
        jobId: this.propData.jobId,
        nodes: nodes,
      }
      DCHttp.req({
        url: '/api/Job/historyJobAddNode',
        params: data,
        method: 'post'
      }).then(res => {
        this.loading = false
        this.finishOperate()
      }).catch(err => {
        this.loading = false
      })
    },
    addAllNodes(nodes,links){ //添加所有节点
      let data = {
        jobId: this.propData.jobId,
        nodes: nodes,
      }
      DCHttp.req({
        url: '/api/Job/historyJobAddNode',
        params: data,
        method: 'post'
      }).then(res => {
        this.loading = false
        this.finishOperate()
      }).catch(err => {
        this.loading = false
      })
    },
  },
  components:{
    toolBtn,
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.lineMargin{
  margin-top: 15px;
}
.treeContainer{
  height: 150px;
  border: 1px solid #ccc;
  overflow: auto;
  margin-bottom: 10px;
}
.transferBtn{
  height: 350px;
  display: flex;
  align-items: center;
  button{
    margin-left: 10px;
  }
  i{
    color: blue;
  }
}
</style>
