<template>
  <el-input :value="form.data[item.name]" :readonly="true" type="text" title="" :placeholder="item.placeholder" :style="item.style || form.inputStyle" class="pointer">
    <el-button slot="append" @click="openDialog()" :icon="item.extBtnIcon || form.extBtnIcon" title=""></el-button>
  </el-input>
</template>

<script>
import params from '../params.js'

export default {
  name: 'selectmetaruleitem',
  props: ['propData'],
  data () {
    return {
      form: this.propData.form,
      item: this.propData.item,
      keyword: null,
      table: new dc.Table({
        align: 'center',
        height: '350px',
        hasSelect: true,
        btnGroup: [{
          icon: "fa fa-refresh",
          color: "green",
          title: '刷新',
          click: ()=>{
            this.getTableData();
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
        }],
        hasSearch: true,
        hasPage: true,
        editable: false,
        sizeChange: (size)=>{ this.getTableData() },
        pageChange: (page)=>{ this.getTableData() },
        search: ()=>{ this.getTableData() },
        rowDbClick: (data, row)=>{ this.chose(row); },
        selectChange:(val)=>{ this.table.currentPage=1;this.table.keyword=""; this.getTable(); },
      })
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  watch:{
    propData(){
      this.initData();
    }
  },
  methods:{
    initData(){
      this.form = this.propData.form;
      this.item = this.propData.item;
      this.form.data[this.item.name] || (this.form.data[this.item.name]="");
    },
    getTable(keywordData){
      if(!this.table.selectValue && this.table.selectOptions.length){
        this.table.selectValue = this.table.selectOptions[0].value
      }
      let cdcName = this.table.selectValue;
      let data = {
        dataCdcName: this.item.value || this.item.value0,
        cdcName: cdcName,
        keyword: keywordData ? keywordData : this.table.keyword,
        orderBy: null,
        pageNo: this.table.currentPage,
        pageSize: this.table.currentSize,
      }
      DCHttp.req({url:'/api/PDC/pagingMetaRulePDCByCondition',params:data}).then(res=>{
        if(res){
          this.form.loading = false;
          this.keyword = res.CONTENT.keyword;
          this.table.setTableData(res.CONTENT.tableData,res.CONTENT.tableHead).set('total',res.CONTENT.total);
        }
      }).catch(err=>{
        this.form.loading = false;
      });
    },
    getCdcName(dataCdcName,keywordData){
      DCHttp.req({url:dcConfig.publicPath, params:{
        Class: 'com.leavay.dataquality.DataQualityAction',
        FUNC: 'getMetaRuleCdcNamesByDataCdc',
        [dcConfig.paramsKey]: {dataCdcName:dataCdcName}
      }}).then(res=>{
        if(res){
          this.table.selectOptions = res.CONTENT.map(item=>{
            return {
              value: item.name,
              label: item.label
            }
          })
          this.getTable(keywordData);
        }else{
          this.form.loading = false;
        }
      }).catch(err=>{this.form.loading = false;});
    },
    getTableData(keywordData){
      this.form.loading = true;
      //当前背景界面的表单的值
      let dataCdcName = this.item.value;
      if(dataCdcName){
        this.getCdcName(dataCdcName,keywordData);
      }else{
        //通过guid获取cdcId，通过cdcId获取cdcName
        DCHttp.req({url:'/api/CDC/get',params:{guid:this.form.data.dataGuid}}).then(res1=>{
          if(res1){
            dataCdcName = res1.CONTENT.name;
            this.item.value0 = dataCdcName;
            this.getCdcName(dataCdcName,keywordData);
          }
        })
      }
    },
    openDialog(){
      this.getTableData();
      this.table.currentPage = 1;
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        data: {object: this.table },
        component: 'dc-table',
        width: '1200px',
        top: '40px',
      }));
    },
    chose(row){
      this.form.data[this.item.name] = row.guid;
      this.$closeDialog();
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
