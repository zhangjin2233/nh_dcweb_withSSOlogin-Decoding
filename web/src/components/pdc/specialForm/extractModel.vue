<template>
  <dc-table v-loading="loading" :object="table"></dc-table>
</template>

<script>

const otherSettingWhereTableHead = [{
  label: '与关系',
  name: 'isAndWithLast',
  type: 'Boolean',
},{
  label: '字段中文名',
  name: 'label',
  type: 'String',
},{
  label: '字段名',
  name: 'first',
  type: 'String',
  option: [],
},{
  label: '判断方式',
  name: 'judgeType',
  type: 'SingleEnum',
  option: [],
},{
  label: '第二值类型',
  name: 'isManulSec',
  type: 'SingleEnum',
  option: [{
    label: '手工值',
    value: true,
  },{
    label: '系统变量',
    value: false
  }]
},{
  label: '第二值',
  name: 'second',
  type: 'text',
  option: [],
}];

import params from '../params.js'

export default {
  name: 'extractMode',
  props: ['propData'],
  data () {
    return {
      form: {},
      item: {},
      loading: false,
      tableData: [],
      table: new dc.Table({
        hasPage: false,
        height: '300px',
        align: 'center',
        rowDbClick: (tableData,row,tableHead)=>{ this.openRow(true,tableData,row,tableHead); },
        btnGroup: [{
          icon: "fa fa-plus",
          color: "green",
          title: '新增',
          click: (tableData,row,tableHead)=>{
            this.openRow(false,tableData,row,tableHead);
          }
        },{
          icon: "fa fa-remove", 
          color: "red",
          title: '删除',
          needRow: true,
          click:(tableData,row,tableHead)=>{
            let index = tableData.findIndex(item=>item==row);
            tableData.splice(index,1);
          }
        },{
          icon: "fa fa-level-up", 
          color: "green",
          title: '上移',
          needRow: true,
          click(tableData, row) {
            tableData.splice(0,tableData.length, ...tableData.swap(row,-1));
          }
        },{
          icon: "fa fa-level-down", 
          color: "green",
          title: '下移',
          needRow: true,
          click(tableData, row) {
            tableData.splice(0,tableData.length, ...tableData.swap(row,1));
          }
        }]
      }),
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
      this.loading = true; //整个PDC表单的加载
      let reqs = this.propData.reqs.map(item=>{ return DCHttp.req({url:item.url,params:item.params})});
      Promise.all(reqs).then(res=>{ 
        this.loading = false;
        if(res && !res.some(item=>{ return item.ERR_MSG })){
          this.getTableData(res);
        }else{
          this.$closeDialog();
        }
      }).catch(err=>{ this.$closeDialog() });
    },
    getTableData(res){
      this.tableData = res[0].CONTENT.tableData.filter(item=>this.form.data.extractJson_[0].json.select.includes(item.ColName));
      otherSettingWhereTableHead[2].option.splice(0,otherSettingWhereTableHead[2].option.length,...this.tableData.map(item=>{return {value:item.ColName, label:item.ColComment}}));
      otherSettingWhereTableHead[3].option.splice(0,otherSettingWhereTableHead[3].option.length,...res[1].CONTENT.option);
      otherSettingWhereTableHead[5].option.splice(0,otherSettingWhereTableHead[5].option.length,...res[2].CONTENT.option);
      let whereTableData = this.form.data[this.item.name][0].json.where.map(item=>{
        return Object.assign({ label: this.tableData.find(item0=>item0.ColName==item.first).ColComment },item);
      })
      this.table.setTableData(whereTableData,otherSettingWhereTableHead);
    },
    getNewItemStructure(flag,tableData,row,tableHead){
      let newItemStructure = objClone(otherSettingWhereTableHead,[]);
      newItemStructure[2] = objClone({
        label: '判断字段',
        type: 'SingleEnum',
        change: (form,item)=>{
          form.data.label = item.option.find(item0=>item0.value==form.data[item.name]).label;
        }
      },newItemStructure[2]);
      newItemStructure[4] = objClone({
        label: '手工值',
        type: 'Boolean',
        change: (form,item)=>{
          if(form.data[item.name]){
            form.structure[5].label = '手工值';
            form.structure[5].type = 'text';
            form.data.second = '';
          }else{
            form.structure[5].label = '系统变量';
            form.structure[5].type = 'SingleEnum';
            form.data.second = form.structure[5].option[0].value;
          }
        }
      },newItemStructure[4]);
      newItemStructure[5] = objClone({
        label: '系统变量',
        type: 'SingleEnum',
      },newItemStructure[5]);
      return newItemStructure;
    },
    getNewFormItem(newItemStructure){
      return {
        isAndWithLast: false,
        first: this.tableData[0].ColName,
        isManulSec: false,
        second: newItemStructure.find(item=>item.name=='second').option[0].value,
        judgeType: newItemStructure.find(item=>item.name=='judgeType').option[0].value,
        label: newItemStructure.find(item=>item.name=='first').option[0].label,
      }
    },
    openRow(flag,tableData,row,tableHead){
      if(!flag && !this.form.data.extractJson_[0].json.select.length){
        this.$alert('请先在贴源抽取中选择过滤');
        return ;
      }
      let newItemStructure = this.getNewItemStructure(flag,tableData,row,tableHead);
      let form = new dc.Form({
        structure: newItemStructure,
        data: flag ? row : this.getNewFormItem(newItemStructure),
        hiddenRows: ['label'],
      })
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        component: 'dc-form',
        data: { object: form },
        width: '500px',
        top: '40px',
        hasBtn: true,
        btnGroup: [{
          text: '确定',
          type: 'primary',
          click:(dialog, component)=>{
            if(flag){
              let index = tableData.findIndex(item=>item==row);
              tableData.splice(index,1,form.data);
            }else{
              tableData.push(form.data);
            }
            dialog.show = false;
          }
        }, {
          text: '取消',
          click(dialog, component) {
            dialog.show = false
          }
        }]
      }))
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.pointer input{
  cursor: pointer !important;
}
</style>
