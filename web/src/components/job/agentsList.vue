<template>
  <dc-table :object="table" v-loading="loading"></dc-table>
</template>

<script>

export default {
	name: 'agentsList',
	props: ['propData'],
  data() {
    return {
			table: new dc.Table({
        hasSearch: true,
        hasBtn: true,
        search: ()=>{ this.initData() },
        hasPage: false,
        height: '300px',
        colsWidth: [{
          prop: 'memory',
          width: '170px'
        }, {
          prop: 'load',
          width: '50px'
        }, {
          prop: 'isConnected',
          width: '58px'
        }],
        cellAppend: [{
          prop: 'memory',
          condition: 'true',
          component: 'memory'
        }],
        hasLoading: false,
        cellImages: [{
          prop: 'name',
          icon: [{
            class: 'fa fa-desktop',
            condition: 'row.isConnected===true',
            color: 'green'
          }, {
            class: 'fa fa-ban',
            condition: 'row.isConnected===false',
            color: 'red'
          }]
        }],
        cellStyle(value, prop, row) {
          if(prop === 'isConnected' && value === true) {
            return { color:  '#b3ff99'}
          }else if(prop === 'isConnected' && value === false) {
            return { color: '#ff8080' }
          }
        },
        filterSetting: [{
          prop: 'isConnected',
          value: false,
          show: '断开'
        }, {
          prop: 'isConnected',
          value: true,
          show: '已连接'
        }],
        bottomBtn: [],
        btnGroup: [{
          icon: 'fa fa-refresh',
          color: 'green',
          title: '刷新',
          click: ()=>{ this.initData() }
        }],
        rowDbClick: (data, row)=>{
          this.choseRow(row);
          this.$closeDialog();
        }
      }),
			loading: false,
    };
  },
  created(){
		this.$nextTick(()=>{
			this.initData();
		});
	},
  methods:{
		initData(){
      this.loading = true;
      DCHttp.req({
        url: '/api/agent/jobAgentsList',
        params: {
          keyword: this.table.keyword
        }
      }).then(res => {
        this.table.tableData = res.tableData
        this.table.tableHead = res.tableHead
        this.loading = false
      }).catch(err => {
        
      })
    },
    choseRow(row){
      let params = {}
      if(this.propData.type === 'Job') {
          params = {
            FUNC: 'changeJobAgent',
            Class: 'JobMgr',
            [dcConfig.paramsKey]: {
              jobId: this.propData.jobId,
              agentNames: [row.name]
            }
          }
      }else if(this.propData.type === 'PDF') {
          params = {
            pdfName: this.propData.pdfName,
            jobId: this.propData.jobId,
            agentNames: [row.name],

          }
          this.loading = true
          DCHttp.req({
            url: '/api/Job/changePDFAgent',
            params
          }).then(res => {
            this.loading = false
            res && this.$successMessage('设置成功')
          }).catch(err => {
            this.loading = false
          })
          return
      }else if(this.propData.type === 'PDC') {
          params = {
            [dcConfig.paramsKey]: {
              pdcJobName: this.propData.pdcName,
              jobId: this.propData.jobId,
              agentNames: [row.name]
            },
            FUNC: 'changePDCAgentByPDCJobName',
            Class: 'JobMgr',
          }
      }
      this.loading = true;
      DCHttp.req({
        url: dcConfig.publicPath,
        params
      }).then(res => {
        this.loading = false
        res && this.$successMessage('设置成功')
      }).catch(err => {
        this.loading = false
      })
    }
	},
}
</script>