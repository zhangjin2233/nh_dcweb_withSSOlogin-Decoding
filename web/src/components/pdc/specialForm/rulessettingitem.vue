<template>
  <el-input :value="form.data[item.name]" :readonly="true" type="text" title="" :placeholder="item.placeholder" :style="item.style || form.inputStyle" class="pointer">
    <el-button slot="append" @click="openDialog()" :icon="item.extBtnIcon || form.extBtnIcon" title=""></el-button>
  </el-input>
</template>

<script>
import params from '../params.js'

export default {
  name: 'rulessettingitem',
  props: ['propData'],
  data () {
    return {
      form: this.propData.form,
      item: this.propData.item,
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
            DCHttp.req({url:dcConfig.publicPath,info:{success: "删除成功"}, params:{
              Class: params.removeForm.Class,
              FUNC: params.removeForm.FUNC,
              [dcConfig.paramsKey]: data
            }}).then(res=>{
              this.loading = false;
              if(res){
                this.getTableData();
                let cdcs = this.form.data[this.item.name].split(',');
                let index = cdcs.findIndex(item=>item == row.guid);
                cdcs.splice(index,1);
                this.form.data[this.item.name] = cdcs.join(',');
                if(this.form.data[this.item.name].charAt(0) == ','){
                  this.form.data[this.item.name] = this.form.data[this.item.name].substr(1);
                }
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
    openPDCForm(row,ruleId){
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        top: '40px',
        title: '规则配置',
        width: '700px',
        component: 'subPDCForm',
        data: {id:row ? undefined : this.cdcId, guid:row ? row.guid : undefined, dataGuid:this.form.data.guid, dataCdc:this.item.value ,form:this.form,item:this.item,ruleId:ruleId},
      }))
    },
    getTableData(keywordData){
      this.form.loading = true;
      let data = {
        // sRuleIds: this.form.data[this.item.name],
        dataGuid: this.form.data.guid,
        keyword: keywordData ? keywordData : this.table.keyword,
        orderBy: null,
        pageNo: this.table.currentPage,
        pageSize: this.table.currentSize,
      }
      DCHttp.req({url:'/api/PDC/pagingRuleCfgPDCByCondition',params:data}).then(res=>{
        if(res){
          this.form.loading = false;
          this.cdcId = res.CONTENT.cdcId;
          this.keyword = res.CONTENT.keyword;
          this.table.setTableData(res.CONTENT.tableData,res.CONTENT.tableHead).set('total',res.CONTENT.total);
        }
      }).catch(err=>{
        console.warn(err);
        this.form.loading = false;
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
        dataCdcName: this.item.value,
        cdcName: cdcName,
        keyword: keywordData ? keywordData : this.table0.keyword,
        orderBy: null,
        pageNo: this.table0.currentPage,
        pageSize: this.table0.currentSize,
      }
      DCHttp.req({url:'PDC/pagingMetaRulePDCByCondition',params:data}).then(res=>{
        if(res){
          this.form.loading = false;
          this.table0.setTableData(res.CONTENT.tableData,res.CONTENT.tableHead).set('total',res.CONTENT.total);
        }
      }).catch(err=>{
        this.form.loading = false;
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
          this.form.loading = false;
        }
      }).catch(err=>{this.form.loading = false;});
    },
    getTableData0(keywordData){
      this.form.loading = true;
      //当前背景界面的表单的值
      let dataCdcName = this.item.value;
      if(dataCdcName){
        this.getCdcName0(dataCdcName,keywordData);
      }else{
        //通过guid获取cdcName
        DCHttp.req({url:'/api/CDC/get',params:{guid:this.form.data.dataGuid}}).then(res1=>{
          dataCdcName = res1.CONTENT.name;
          this.item.value0 = dataCdcName; //此处需要修改
          this.getCdcName0(dataCdcName,keywordData);
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
