<template>
  <dc-table :object="table"></dc-table>
</template>

<script>
import params from '../params.js'

export default {
  name: 'rulessettingTable',
  props: ['propData'],
  data () {
    return {
      cdcId: '',
      keyword: null,
      advFilterData: [],
      advFilterData0: [], //元规则编码的高级过滤器的值
      table0: new dc.Table({ //元规则编码的表格
        align: 'center',
        height: '350px',
        hasSelect: true,
        btnGroup: [{
          icon: "fa fa-refresh",
          color: "green",
          title: '刷新',
          click: ()=>{
            this.getTableData0();
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
              },
            });
            this.$openDialog(new dc.Dialog({
              component: 'dc-advFilter',
              data: { object: advFilter, data:this.advFilterData0 },
              hasBtn: true,
              width: "700px",
              btnAlign: 'right',
              btnGroup: [{
                text: '确定',
                type: 'primary',
                click:(dialog, component)=>{ 
                  this.getTableData0(this.advFilterData0[0]);
                  dialog.show = false
                }
              }, {
                text: '取消',
                click(dialog, component) {
                  dialog.show = false
                }
              }]
            }))
          }
        }],
        hasSearch: true,
        hasPage: true,
        editable: false,
        sizeChange: (size)=>{ this.getTableData0() },
        pageChange: (page)=>{ this.getTableData0() },
        search: ()=>{ this.getTableData0() },
        rowDbClick: (data, row)=>{ this.chose0(row); },
        selectChange:(val)=>{ this.table0.currentPage=1;this.table0.keyword=""; this.getTable0(); },
      }),
      table: new dc.Table({
        align: 'center',
        height: '350px',
        btnGroup: [{
          icon: "fa fa-refresh",
          color: "green",
          title: '刷新',
          click: ()=>{
            this.getTableData();
          }
        },{
          icon: "fa fa-plus", 
          color: "green",
          title: '新增',
          click: (tableData)=>{
            this.selectRuleId();
            // this.openPDCForm();
          }
        },{
          icon: "fa fa-pencil", 
          color: "blue",
          title: '编辑',
          needRow: true,
          click: (tableData, row)=>{
            // this.openPDCForm(null,row.guid);
            this.openPDCForm(row,row.ruleId);
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
            DCHttp.req({url:dcConfig.publicPath, info:{success: "删除成功"},params:{
              Class: params.removeForm.Class,
              FUNC: params.removeForm.FUNC,
              [dcConfig.paramsKey]: data
            }}).then(res=>{
              this.loading = false;
              if(res){
                this.getTableData();
              }
            }).catch(err=>this.loading=false);
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
                click:(dialog, component)=>{ 
                  this.getTableData(this.advFilterData[0]);
                  dialog.show = false
                }
              }, {
                text: '取消',
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
              cdcIds: [this.cdcId],
              nvQuery: this.keyword,
            };
            DCHttp.export({
              url: dcConfig.publicPath,
              params: Object.assign({ [dcConfig.paramsKey]: data}, params.export)
            })
            // this.$exportFile({url:params.export.url, data:data});
          }
        }],
        hasSearch: true,
        hasPage: true,
        editable: false,
        sizeChange: (size)=>{ this.getTableData() },
        pageChange: (page)=>{ this.getTableData() },
        search: ()=>{ this.getTableData() },
        // rowDbClick: (data, row)=>{ this.openPDCForm(null,row.guid); },
        rowDbClick: (data, row)=>{ this.openPDCForm(row,row.ruleId); },
      })
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  methods:{
    initData(){
      this.getTableData();
    },
    openPDCForm(row,ruleId){
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        top: '40px',
        title: '规则配置',
        width: '700px',
        component: 'subPDCForm',
        data: {id:row ? undefined : this.cdcId, guid:row ? row.guid : undefined, dataGuid:this.propData.dataGuid, dataCdc:this.propData.dataCdc,ruleId:ruleId},
      }))
    },
    getTableData(keywordData){
      this.propData.vue.flowLoading = true;
      let data = {
        // sRuleIds: this.propData.sRuleIds,
        dataGuid: this.propData.guid,
        keyword: keywordData ? keywordData : this.table.keyword,
        orderBy: null,
        pageNo: this.table.currentPage,
        pageSize: this.table.currentSize,
      }
      DCHttp.req({url:'/api/PDC/pagingRuleCfgPDCByCondition',params:data}).then(res=>{
        if(res){
          this.propData.vue.flowLoading = false;
          this.cdcId = res.CONTENT.cdcId;
          this.keyword = res.CONTENT.keyword;
          this.table.setTableData(res.CONTENT.tableData,res.CONTENT.tableHead).set('total',res.CONTENT.total);
        }
      }).catch(err=>{
        console.warn(err);
        this.propData.vue.flowLoading = false;
      });
    },
    openDialog(){
      this.getTableData();
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        title: '规则列表',
        data: {object: this.table },
        component: 'dc-table',
        width: '1200px',
        top: '40px',
      }));
    },
    //融进元规则编码选择
    selectRuleId(){
      this.getTableData0();
      this.table0.currentPage = 1;
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        title: '选择元规则',
        data: {object: this.table0 },
        component: 'dc-table',
        width: '1200px',
        top: '40px',
      }));
    },
    getTable0(keywordData){
      if(!this.table0.selectValue && this.table0.selectOptions.length){
        this.table0.selectValue = this.table0.selectOptions[0].value
      }
      let cdcName = this.table0.selectValue;
      let data = {
        dataCdcName: this.propData.dataCdc,
        cdcName: cdcName,
        keyword: keywordData ? keywordData : this.table0.keyword,
        orderBy: null,
        pageNo: this.table0.currentPage,
        pageSize: this.table0.currentSize,
      }
      DCHttp.req({url:'/api/PDC/pagingMetaRulePDCByCondition',params:data}).then(res=>{
        if(res){
          this.propData.vue.flowLoading = false;
          this.table0.setTableData(res.CONTENT.tableData,res.CONTENT.tableHead).set('total',res.CONTENT.total);
        }
      }).catch(err=>{
        this.propData.vue.flowLoading = false;
      });
    },
    getCdcName0(dataCdcName,keywordData){
      DCHttp.req({url:dcConfig.publicPath, params:{
        Class: 'com.leavay.dataquality.DataQualityAction',
        FUNC: 'getMetaRuleCdcNamesByDataCdc',
        [dcConfig.paramsKey]: {dataCdcName:dataCdcName}
      }}).then(res=>{
        if(res){
          this.table0.selectOptions = res.CONTENT.map(item=>{
            return {
              value: item.name,
              label: item.label
            }
          })
          this.getTable0(keywordData);
        }else{
          this.propData.vue.flowLoading = false
        }
      }).catch(err=>{this.propData.vue.flowLoading = false});
    },
    getTableData0(keywordData){
      this.propData.vue.loading = true;
      //当前背景界面的表单的值
      let dataCdcName = this.propData.dataCdc;
      if(dataCdcName){
        this.getCdcName0(dataCdcName,keywordData);
      }else{
        //通过guid获取cdcId，通过cdcId获取cdcName
        DCHttp.req({url:'/api/CDC/get',params:{guid:this.form.data.dataGuid}}).then(res=>{ //此处可能需要修改
          if(res){
            dataCdcName = res.CONTENT.name;
            this.item.value0 = dataCdcName; //此处需要修改
            this.getCdcName0(dataCdcName,keywordData);
          }
        })
      }
    },
    chose0(row){
      this.$closeDialog();
      this.openPDCForm(null,row.guid); //选择元规则编码
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.pointer input{
  cursor: pointer !important;
}
</style>
