<template>
  <div class="cell-btn">
    <template v-if="specialType.includes(item.value)" >
      <el-select v-model="item.value" @change="selectChange(item.value)" :disabled="selectReadOnly || item.readOnly" size="mini" class="selectExt">
        <el-option v-for="(option,optionIndex) in item.option" :key="optionIndex" :label="option.label" :value="option.value"></el-option>
      </el-select>
      <button @click="extShow(item.value)">…</button>
    </template>
    <template v-else>
      <el-select class="fullWidth" v-model="item.value" @change="selectChange(item.value)" size="mini" :disabled="selectReadOnly || item.readOnly">
        <el-option v-for="(option,optionIndex) in item.option" :key="optionIndex" :label="option.label" :value="option.value"></el-option>
      </el-select>
    </template>
  </div> 
</template>

<script>
const params = {
  initData:{
    choseRow: "",
    label: "",
    tableData: [],
  }
}

export default {
  name: 'tableExtBtn',
  props: ['data'],
  data () {
    return {
      index: -1,
      item: {},
      specialType: ['UDF','SingleEnum','DataSet','gtable']
    }
  },
  watch:{
    data(){
      this.initData();
    }
  },
  computed:{
    selectReadOnly(){
      return this.data.name == 'dataType' && this.data.row.elementType != 'staticValue'
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
      this.data.row.enumDef || (this.data.row.enumDef = objClone(params.initData));
      this.data.row.gtable || (this.data.row.gtable = objClone(params.initData));
      (this.data.name == 'dataType' && this.data.row.dataType == 'SingleEnum') && this.choseTableRow(null,'enumDef');
      (this.data.name == 'elementType' && this.data.row.dataType == 'gtable') && this.choseTableRow(null,'gtable');
      // (this.data.name == 'dataType') && this.choseTableRow(); //枚举初始值为第一行
      this.data.row.udf || (this.data.row.udf = objClone(params.initData));
      this.data.row.dataSet || (this.data.row.dataSet = objClone(params.initData));
      this.item = {
        value: this.data.row[this.data.name],
        readOnly: this.data.tableHead[this.index].readOnly || this.data.row.READONLY,
        option: this.data.tableHead[this.index].option
      };
    },
    dataTypeChange(value){
      switch(value){
        case 'String':
          let item = this.data.tableHead.find(item => item.name == 'size');
          this.data.row.size = item ? item.value : "";
          break;
        case 'AttachObject':
          this.data.row.size = "";
          break;
        case 'SingleEnum':
          this.data.row.size = "";
          break;
        default:
          this.data.row.size = "";
          break;
      }
    },
    elementTypeChange(value){
      switch(value){
        case 'staticValue':
          let size = this.data.tableHead.find(item=>item.name == 'size');
          this.data.row.size = size ? size.value : "";
          break;
        default:
          let dataType = this.data.tableHead.find(item => item.name == 'dataType');
          this.data.row.dataType = dataType ? dataType.value : "";
          this.data.row.size = "";
          break;
      }
    },
    selectChange(value){
      this.data.row[this.data.name] = value;
      switch(this.data.name){
        case 'dataType':
          this.dataTypeChange(value);
          break;
        case 'elementType':
          this.elementTypeChange(value);
          break;
        default:
          break;
      }
    },
    extShow(value){
      switch(value){
        case 'UDF':
          this.showUDF();
          break;
        case 'DataSet':
          this.showDataSet();
          break;
        case 'SingleEnum':
          this.showEnumTable();
          break;
        case 'gtable': 
          this.showGtable();
          break;
        default:
          break;
      }
    },
    choseTableRow(table,attr){
      let tableId = this.data.tableHead[this.index][attr].tableHead[0].name;
      let choseRow = this.data.row[attr].choseRow;
      let tableRow = this.data.tableHead[this.index][attr].tableData[0];
      if(choseRow){
        tableRow = this.data.tableHead[this.index][attr].tableData.find(item=>item[tableId]==choseRow);
      }else{
        this.data.row[attr].choseRow = tableRow[tableId];
      }
      table && (table.currentRow = tableRow);
    },
    showGtable(){
      let tableId = this.data.tableHead[this.index].gtable.tableHead[0].name;;
      let enumTable = new dc.Table({
        hiddenCols: [tableId],
        align: "center",
        height: '350px',
        hasPage: false,
        bottomBtn: [],
        btnGroup: [],
        tableData: this.data.tableHead[this.index].gtable.tableData,
        tableHead: this.data.tableHead[this.index].gtable.tableHead,
        rowClick: (data, row)=>{
          this.data.row.gtable.choseRow = row[tableId];
        },
        rowDbClick: (data, row)=>{
          this.data.row.gtable.choseRow = row[tableId];
          dialog.show = false;
        }
      });
      this.choseTableRow(enumTable,'gtable'); //高亮选择行
      let dialog = new dc.Dialog({
        verticalCenter: true,
        top: '40px',
        title: '全局数据集',
        component: 'dc-table',
        width: '700px',
        data: {object: enumTable, enumTable: this.data.row.gtable},
      });
      this.$openDialog(dialog);
    },
    showEnumTable(){
      let tableId = this.data.tableHead[this.index].enumDef.tableHead[0].name;
      let enumTable = new dc.Table({
        align: "center",
        height: '350px',
        hasPage: false,
        bottomBtn: [],
        btnGroup: [],
        tableData: this.data.tableHead[this.index].enumDef.tableData,
        tableHead: this.data.tableHead[this.index].enumDef.tableHead,
        rowClick: (data, row)=>{
          this.data.row.enumDef.choseRow = row[tableId];
        },
        rowDbClick: (data, row)=>{
          this.data.row.enumDef.choseRow = row[tableId];
          dialog.show = false;
        }
      });
      this.choseTableRow(enumTable,'enumDef'); //高亮选择行
      let dialog = new dc.Dialog({
        verticalCenter: true,
        top: '40px',
        title: '枚举',
        component: 'dc-table',
        width: '700px',
        data: {object: enumTable, enumTable: this.data.row.enumDef},
      });
      this.$openDialog(dialog);
    },
    showUDF(){
      let dialog = new dc.Dialog({
        verticalCenter: true,
        top: '40px',
        component: 'udfForm',
        width: '700px',
        data: {udfData:objClone(this.data.row.udf), data:objClone(this.data,{},['table'])},
        hasBtn: true,
        btnGroup: [{
          text: '确定', 
          type: 'primary', 
          size: 'small', 
          click:(dialog, component)=>{ 
            this.data.row.udf = dialog.data.udfData;
            dialog.show = false;
          }
        }]
      });
      this.$openDialog(dialog);
    },
    showDataSet(){
      let dataSet = new dc.Table({
        align: "center",
        height: '350px',
        bottomBtn: [],
        hasPage: false,
        btnGroup: [{
          icon: "fa fa-plus", 
          color: "green",
          click: (tableData, row, tableHead)=>{
            tableData.push(tableHead.newTableRow(tableData,2));
          }
        },{
          icon: "fa fa-remove", 
          color: "red",
          needRow: true,
          click(data, row) {
            let index = data.findIndex(item=>item==row);
            data.splice(index,1);
          }
        },{
          icon: "fa fa-level-up", 
          color: "green",
          needRow: true,
          click(data, row) {
            data.splice(0,data.length, ...data.swap(row,-1));
          }
        },{
          icon: "fa fa-level-down", 
          color: "green",
          needRow: true,
          click(data, row) {
            data.splice(0,data.length, ...data.swap(row,1));
          }
        }],
        hiddenCols: ['id'],
        editable: true,
        tableData: objClone(this.data.row.dataSet.tableData,[]),
        tableHead: this.data.tableHead[this.index].dataSet.tableHead,
      });
      let dialog = new dc.Dialog({
        verticalCenter: true,
        top: '40px',
        title: '数据集',
        component: 'dc-table',
        width: '900px',
        data: {object: dataSet},
        hasBtn: true,
        btnGroup: [{
          text: '确定', 
          type: 'primary', 
          size: 'small', 
          click:(dialog, component)=>{ 
            this.data.row.dataSet.tableData.splice(0,this.data.row.dataSet.tableData.length,...dialog.data.object.tableData);
            dialog.show = false;
          }
        }]
      });
      this.$openDialog(dialog);
    }
  },
  
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.selectExt{
  width: 85%;
  width: calc(100% - 25px);
}
.fullWidth{
  width: 100%;
}
button {
  background: transparent;
  font-weight: bold;
  border: none;
  cursor: pointer;
}
</style>
<style>
.cell-btn input{
  height: 28px !important;
  line-height: 28px !important;
}
</style>