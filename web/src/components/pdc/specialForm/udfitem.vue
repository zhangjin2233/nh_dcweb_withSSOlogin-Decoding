<template>
  <el-input :value="content" :readonly="true" type="text" title="" :placeholder="item.placeholder" :style="item.style || form.inputStyle" class="pointer">
    <el-button slot="append" @click="openDialog()" :icon="item.extBtnIcon || form.extBtnIcon" title=""></el-button>
  </el-input>
</template>

<script>

export default {
  name: 'udfitem',
  props: ['propData'],
  data () {
    return {
      form: this.propData.form,
      item: this.propData.item,
      table: new dc.Table({
        align: "center",
        height: '300px',
        editable: true,
        hasPage: false,
        hasBtn: false,
      }),
    }
  },
  watch:{
    propData(){
      this.initData();
    }
  },
  computed:{
    content(){
      let val = "";
      try{
        val = JSON.stringify(this.form.data[this.item.name])
      }catch(e){}
      return val
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  methods:{
    initData(){
      this.form = this.propData.form;
      this.item = this.propData.item;
      this.form.data[this.item.name] || (this.form.data[this.item.name]=[]);
    },
    setTableData(tableData,tableHead){
      this.table.set('customCells',[{disabled: `col.name==='${tableHead[2].name}' && row.READONLY`}])
      tableData.forEach(item=>{
        item[tableHead[0].name] = item[tableHead[0].name] || item.name || item.paramter || item.paramName;
        let item0 =  this.form.data[this.item.name].find(item0=>item0[tableHead[0].name]==item[tableHead[0].name]);
        if(item[tableHead[2].name]){
          item.READONLY = true;
        }else{
          item[tableHead[2].name] = item0 ? item0[tableHead[2].name] : "";
        }
      });
      this.table.setTableData(tableData,tableHead);
    },
    getTableHead(){
      let tableHead = [];
      let dataSettableHead = this.form.structure.find(item0=>item0.name==this.item.name).tableHead;
      let h1 = dataSettableHead.find(head=>['paramName','name','paramter'].includes(head.name));
      if(h1){
        h1.readOnly = true;
        h1.label || (h1.label='参数值');
        h1.type = 'String';
      }else{
        h1 = {
          label: '参数值',
          name: 'paramName',
          type: 'String',
          readOnly: true
        }
      }
      tableHead.push(h1);
      let h2 = dataSettableHead.find(head=>['desc'].includes(head.name));
      if(h2){
        h2.readOnly = true;
        h2.label || (h2.label='描述');
        h2.type = 'String';
      }else{
        h2 = {
          label: '描述',
          name: 'desc',
          type: 'String',
          readOnly: true
        }
      }
      tableHead.push(h2);
      let h3 = dataSettableHead.find(head=>['value'].includes(head.name));
      if(h3){
        h3.label || (h2.label='传入值');
        h3.type = 'String';
      }else{
        h3 = {
          label: '传入值',
          name: 'value',
          type: 'String',
        }
      }
      tableHead.push(h3);
      return tableHead;
    },
    openTable(tableData){
      let tableHead = this.getTableHead();
      this.setTableData(tableData,tableHead);
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        data: this.$cloneObject({object: this.table }),
        component: 'dc-table',
        width: '700px',
        top: '40px',
        hasBtn: true,
        btnGroup: [{
          text: '确定', 
          type: 'primary',
          click:(dialog, component)=>{
            this.form.data[this.item.name] = [];
            dialog.data.object.tableData.forEach(item=>{
              if(!item.READONLY && item[tableHead[2].name]!==''){
                let row = {};
                row[tableHead[0].name] = item[tableHead[0].name];
                row[tableHead[2].name] = item[tableHead[2].name];
                this.form.data[this.item.name].push(row); 
              }
            })
            dialog.show = false;
          }
        }]
      }));
    },
    openDialog(){
      let getUDFUrl;
      if(this.form.data.ruleId || this.form.data.sudf){
        if(this.form.data.sudf){
          DCHttp.req({url:dcConfig.publicPath, params:{
            Class: 'SUDFMgr',
            FUNC: 'getUDFByName',
            [dcConfig.paramsKey]: {udfName:this.form.data.sudf}
          }}).then(res=>{
            if(res){
              this.openTable(res.CONTENT.arguments);
            }
          })
        }else if(this.form.data.ruleId){
          DCHttp.req({url:dcConfig.publicPath, params:{
            Class: 'com.leavay.dataquality.DataQualityAction',
            FUNC: 'getParamsAndValueByRuleId',
            [dcConfig.paramsKey]: {ruleId:this.form.data.ruleId}
          }}).then(res=>{
            if(res){
              this.openTable(res.CONTENT);
            }
          })
        }
      }else{
        if(this.form.data.hasOwnProperty('sudf')){
          this.$alert("请先选择规则检查方法");
        }else if(this.form.data.hasOwnProperty('ruleId')){
          this.$alert("请先选择元规则编码");
        }
      }
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
