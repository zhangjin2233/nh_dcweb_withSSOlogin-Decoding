<template>
  <div v-loading="loading">
    <dc-form :object="form"></dc-form>
    <dc-table :object="table"></dc-table>
  </div>
</template>

<script>

const FormStructure = [{
  label: '描述',
  name: 'Describe',
  type: 'text'
}];

export default {
  name: 'branchData',
  props: ['propData'],
  data () {
    return {
      loading: false,
      sysVar: [],
      jobVar: [],
    	form: new dc.Form({
        labelWidth: '45px',
        structure: FormStructure,
        data: this.propData.formData,
      }),
      table: new dc.Table({
        height: '200px',
        align: 'center',
        hasPage: false,
        hiddenCols: ['condition'],
        rowDbClick: (tableData, row, tableHead)=>{ this.openRowForm(true,tableData, row, tableHead); },
        btnGroup: [{
          icon: 'fa fa-plus',
          color: 'green',
          title: '新增',
          click:(tableData,row,tableHead,tableObj)=>{
            this.openRowForm(false,tableData, row, tableHead);
          }
        },{
          icon: 'fa fa-remove',
          color: 'red',
          title: '删除',
          needRow: false,
          click:(tableData,row)=>{
            let index = tableData.findIndex(item=>item==row);
            tableData.splice(index,1);
          }
        }],
        tableHead: this.propData.tableHead,
        tableData: this.propData.tableData
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
      this.getParams();
    },
    getParams(){
      this.loading = true;
      let reqs = this.propData.reqs.map(item=>{ return DCHttp.req({url:item.url,params:item.params})});
      Promise.all(reqs).then(res=>{
        if(res && !res.some(item=>{ return item.ERR_MSG })){
          this.loading = false;
          this.getResOperate(res);
        }else{
          this.$closeDialog();
        }
      })
    },
    getResOperate(res){
      //请求环境变量,请求作业变量数据
      this.sysVar = res[0].CONTENT.option.map(item=>{return {
        value: 'SYSVAR:' + item.value,
        label: item.label + ' - 系统变量'
      }});
      //拿到作业变量
      if(this.$store.state.PDCData.data.jobParamsDef_){
        this.jobVar = this.$store.state.PDCData.data.jobParamsDef_.map(item=>{return{
          value: 'PREVAR:' + item.name,
          label: item.name + ' - 作业变量',
        }});
      }
    },
    openRowForm(flag,tableData, row, tableHead){
      let option = this.sysVar.concat(this.jobVar);
      tableHead[4].object = null;
      tableHead[4].object = new dc.AdvFilter({treeData:flag ? row.condition : [], type:'mainJob', option_leftV:option, option_rightV: option});
      let form = new dc.Form({
        size: 'mini',
        labelWidth: '90px',
        structure: tableHead,
        data: flag ? objClone(row) : {name:'',desc:'',nextAction:'',isloopCase:false, condition:[]}
      })
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        top: '40px',
        width: '700px',
        component: 'dc-form',
        data: {object: form },
        hasBtn: true,
        btnGroup: [{
          text: '确定',
          type: 'primary',
          click:(dialog, component)=>{
            flag ? tableData.splice(tableData.findIndex(item=>item==row),1,form.data) : tableData.push(objClone(form.data));
            dialog.show = false;
            tableHead[4].object = null;
          }
        },{
          text: '取消',
          click:(dialog, component)=>{
            dialog.show = false;
            tableHead[4].object = null;
          }
        }]
      }));
    }
  },
}
</script>
<!-- scoped -->
<style scoped lang="scss">

</style>
