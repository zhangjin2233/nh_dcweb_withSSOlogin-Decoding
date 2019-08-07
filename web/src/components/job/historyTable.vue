<template>
  <dc-table :object="table" v-loading="loading"></dc-table>
</template>

<script>
import {statusColor} from './statusColor'
let arr = [{title:'信息',attr:'msg'},{title:'错误堆栈',attr:'Error_Detail'},{title:'Trace日志',attr:'Trace'}];

export default {
  name: 'historyTable',
  props: ['propData'],
  data () {
    return {
      loading: false,
      table: new dc.Table({
        align: 'center',
        height: "320px",
        hasPage: true,
        hasSearch: false,
        hasBtn: true,
        btnGroup: [{
          icon: "fa fa-refresh", 
          color: "green",
          title: '刷新',
          click: (data, row, tableHead)=>{
            this.initData();
          }
        }],
        sizeChange: (size)=>{ this.initData() },
        pageChange: (page)=>{ this.initData() },
        rowDbClick: (tableData, row)=>{ this.getLog(row) },
      }),
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  methods: {
    initData(){
      this.loading = true;
      let data = {
        pageNo: this.table.currentPage,
        pageSize: this.table.currentSize,
      };
      Object.assign(data, this.propData.params);
      let option = {}
      if(this.propData.type === 'agent') {
        option = {
          url: '/api/Job/PDCAgentRunLog',
          params: {
            jobId: this.propData.jobId,
            pdcJobName: this.propData.pdcName
          }
        }
      }else {
        option = {
          url: '/api/Job/PDCRunHistory',
          params: {
            pageNo: this.table.currentPage,
            pageSize: this.table.currentSize,
            jobId: this.propData.jobId,
            pdcJobName: this.propData.pdcName
          }
        }
      }
      DCHttp.req(option).then(res => {
        this.loading = false
        this.table.setTableData(res.tableData,res.tableHead).set('total', res.total);
        this.table.cellStyle = statusColor
      }).catch(err => {
        this.$closeDialog()
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
        this.$openDialog(new dc.Dialog({
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
          },
        }));
      }else{
        VUE.$alert(row.Msg,'信息',{type:'info'})
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
