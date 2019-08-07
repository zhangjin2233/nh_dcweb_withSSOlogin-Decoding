<template>
  <div>
    <span @dblclick="openDialog()">{{data.row[data.name] ? JSON.stringify(data.row[data.name]) : ''}}</span> 
    <el-dialog :visible.sync="dialogShow" top='40px' width='500px' :before-close="saveData()" :modal="false">
      <structTable :propData="{table:table}"></structTable>
    </el-dialog> 
  </div>
</template>

<script>

let tableHead0 = [{
  label: '列名称',
  name: 'colName',
  type: 'String',
  value: "",
},{
  label: '列类型',
  name: 'colType',
  type: 'SingleEnum',
  option: [{
    label: '文本',
    value: 1
  },{
    label: '数值',
    value: 2
  },{
    label: '日期',
    value: 3
  }],
  value: 1,
},{
  label: '初始值',
  name: 'colValue',
  type: 'String',
  value: "",
}];

export default {
  name: 'structureCellBtn',
  props: ['data'],
  data () {
    return {
      dialogShow: false,
      table: new dc.Table({
        height: '330px',
        editable: true,
        align: 'center',
        hasPage: false,
        btnGroup: [{
          icon: "fa fa-plus", 
          color: "green",
          title: '新增',
          click: (data, row, tableHead)=>{
            data.push(tableHead.newTableRow(data));
          }
        },{
          icon: "fa fa-remove", 
          color: "red",
          title: '删除',
          needRow: true,
          click(data, row) {
            let index = data.findIndex(item=>item==row);
            data.splice(index,1);
          }
        }],
      })
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    })
  },
  methods:{
    initData(){
      this.index = this.data.tableHead.findIndex(item=>item.name==this.data.name);
      if(!this.data.row[this.data.name]){
        this.data.row[this.data.name] = { meta: [] };
      }
    },
    saveData(){
      
    },
    openDialog(){
      this.table.setTableData(this.data.row[this.data.name].meta,tableHead0);
      this.dialogShow = true;
    }
  },
  
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>