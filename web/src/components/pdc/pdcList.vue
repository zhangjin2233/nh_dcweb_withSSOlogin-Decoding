<template>
  <dc-table v-loading="loading" :object="table"></dc-table>
</template>

<script>
import params from './params.js'
import method from '@/components/setting/method'

export default {
  name: 'pdcList',
  props: ['data'],
  data () {
    return {
      loading: false,
      advFilterData: [],
      orderBy: {},
      keyword: null,
      table: new dc.Table({
        width: '100%',
        align: 'center',
        height: document.documentElement.clientHeight - 180 + 'px',
        btnGroup: [{
          icon: "fa fa-refresh",
          color: "green",
          title: '刷新',
          click: (tableData)=>{
            this.getTableData();
          }
        },{
          icon: "fa fa-plus", 
          color: "green",
          title: '新增',
          click: (tableData)=>{
            this.openPDCForm();
          }
        },{
          icon: "fa fa-pencil", 
          color: "blue",
          title: '编辑',
          needRow: true,
          click: (tableData, row)=>{
            this.openPDCForm(row);
          }
        },{
          icon: "fa fa-remove", 
          color: "red",
          title: '删除',
          needRow: true,
          click: (tableData, row)=>{
            let data = {};
            data[params.removeForm.data.formId] = row.guid;
            this.loading = true;
            DCHttp.req({url:dcConfig.publicPath, info:{success: "删除成功",error:"删除失败"}, params:{
              Class: params.removeForm.Class,
              FUNC: params.removeForm.FUNC,
              [dcConfig.paramsKey]: data
            }}).then(res=>{
              res && this.getTableData();
              this.loading = false;
            }).catch(err=>{
              console.error(err)
              this.loading=false;
            });
          }
        },{
          icon: "fa fa-filter", 
          color: "green",
          title: '高级过滤器',
          click:(tableData,row,tableHead)=>{
            let advFilter = new dc.AdvFilter({
              attr:{
                option: tableHead.map(item=>{
                  return {
                    label: item.label,
                    value: item.name
                  }
                }),
                placeholder: '请选择',
              },
            });
            this.$openDialog(new dc.Dialog({
              component: 'dc-advFilter',
              data: { object: advFilter, data:this.advFilterData },
              hasBtn: true,
              width: "700px",
              btnAlign: 'right',
              btnGroup: [{
                text: '确定',
                type: 'primary',
                size: 'small',
                click:(dialog, component)=>{ 
                  this.getTableData(this.advFilterData[0]);
                  dialog.show = false
                }
              }, {
                text: '取消',
                type: 'default',
                size: 'small',
                click(dialog, component) {
                  dialog.show = false
                }
              }]
            }))
          }
        },{
          icon: "fa fa-download", 
          color: "blue",
          title: '导出',
          click:(tableData)=>{
            let data = {
              cdcIds: [this.$route.query.link],
              nvQuery: this.keyword,
            };
            DCHttp.export({
              url: dcConfig.publicPath,
              params: Object.assign( params.export, { [dcConfig.paramsKey]: data })
            })
            // this.$exportFile(params.export.url, data);
          }
        }, method.domain()],
        hasSearch: true,
        hasPage: true,
        editable: false,
        // sortable: true,
        sortChange: (column, prop, order)=>{
          this.orderBy = { name: prop, isAsc: order == 'ascending' };
          this.getTableData();
        },
        sizeChange: ()=>{ this.getTableData() },
        pageChange: ()=>{ this.getTableData() },
        search: ()=>{ this.getTableData() },
        rowDbClick: (data, row)=>{ this.openPDCForm(row); },
      })
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  watch:{
    $route(to,from){
      if(this.$route.path == '/cdc'){
        this.initData();
        this.advFilterData = [];
      }
    },
  },
  methods: {
    initData(){
      this.getTableData();
    },
    getTableData(keywordData){
      let data = {
        cdcId: this.$route.query.link,
        pageNo: this.table.currentPage,
        pageSize: this.table.currentSize,
        orderBy: this.orderBy,
        keyword: keywordData ? keywordData : this.table.keyword
      };
      this.loading = true;
      DCHttp.req({url:params.getTable.url, params:data, method:'POST',info:{error:'列表加载失败，请尝试刷新'}}).then(res=>{
        if(res){
          this.table.setTableData(res.CONTENT.tableData, res.CONTENT.tableHead).set('total', res.CONTENT.total);
          this.keyword = res.CONTENT.keyword;
        }
        this.loading = false;
      }).catch(e=>{
        console.error(e);
        this.loading = false;
      });
    },
    openPDCForm(row){
      this.$route.query.from = JSON.stringify({path: this.$route.path, query: this.$route.query})
      this.$route.query[params.guid] = row ? row.guid : "";
      this.$router.push({ path: '/pdcForm', query:this.$route.query });
    },
  }
}
</script>

<style scoped>

</style>
