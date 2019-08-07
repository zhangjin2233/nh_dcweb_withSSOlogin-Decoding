<template>
  <div v-loading="loading">
    <dc-table :object="table"></dc-table>
  </div>
</template>

<script>
const jobParamsTableHead = [{
  "canBeEmpty": false,
  "name": "name",
  "readOnly": false,
  "label": "变量名称",
  "type": "String",
  "value": null,
}, {
  "canBeEmpty": false,
  "name": "desc",
  "readOnly": false,
  "label": "变量描述",
  "type": "String",
  "value": null,
}, {
  "canBeEmpty": false,
  "name": "type",
  "readOnly": false,
  "label": "变量类型",
  "type": "SingleEnum",
  "value": "1",
  "option": [{
    "label": "数据集(2)",
    "value": "2"
  }, {
    "label": "单行数据(1)",
    "value": "1"
  }]
}, {
  "canBeEmpty": false,
  "name": "struct",
  "readOnly": false,
  "label": "变量结构",
  "type": "String",
  "value": null,
  "option": []
}]
const mockConfig = {"CONTENT":{"tableData":[{"struct":{"meta":[{"colName":"11","colType":1,"colValue":"22"},{"colName":"33","colType":1,"colValue":"44"}]},"name":"1","type":"2","desc":"2"},{"struct":{"meta":[{"colName":"5","colType":1,"colValue":"6"},{"colName":"7","colType":1,"colValue":"8"}]},"name":"3","type":"2","desc":"4"}],"tableHead":[{"canBeEmpty":false,"udf":null,"name":"name","enumDef":null,"readOnly":false,"label":"变量名称","type":"STRING","dataSet":null,"value":null,"option":[]},{"canBeEmpty":false,"udf":null,"name":"desc","enumDef":null,"readOnly":false,"label":"变量描述","type":"STRING","dataSet":null,"value":null,"option":[]},{"canBeEmpty":false,"udf":null,"name":"type","enumDef":null,"readOnly":false,"label":"变量类型","type":"SingleEnum","dataSet":null,"value":null,"option":[{"label":"数据集(2)","value":"2"},{"label":"单行数据(1)","value":"1"}]},{"canBeEmpty":false,"udf":null,"name":"struct","enumDef":null,"readOnly":false,"label":"变量结构","type":"PARAMS_STRUCT","dataSet":null,"value":null,"option":[]}]}};

import params from './mainJobParams.js'

export default {
  name: 'variableConfig',
  props: [],
  data () {
    return {
      loading: false,
      table: new dc.Table({
        editable: true,
        align: 'center',
        height: '280px',
        hasPage: false,
        hasBottomBtn: true,
        cellAppend: [{
          prop: "struct", //变量结构
          condition: "true", 
          component: "cellBtn_structure"
        }],
        bottomBtn: [{
          text: "确定", 
          type: "primary",
          click: (tableData, row, tableHead)=>{
            this.saveTableData(tableData);
          }
        },{
          text: "取消", 
          click: (tableData, row, tableHead)=>{
            this.$closeDialog();
          }
        }],
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
        },{
          icon: "fa fa-level-up", 
          color: "green",
          title: '上移',
          needRow: true,
          click(data, row) {
            data.splice(0,data.length, ...data.swap(row,-1));
          }
        },{
          icon: "fa fa-level-down", 
          color: "green",
          title: '下移',
          needRow: true,
          click(data, row) {
            data.splice(0,data.length, ...data.swap(row,1));
          }
        },{
          icon: "fa fa-upload", 
          color: "blue",
          title: "导入",
          click:(tableData, row, tableHead)=>{
            let dataSetDef = JSON.stringify(tableHead);
            this.$importFile.reset({
              title: '上传附件',
              name: 'excelFile',
              params: {
                Class: params.req.importDataSet.Class,
                FUNC: params.req.importDataSet.FUNC,
                FILTER: JSON.stringify({
                  dataSetDef: dataSetDef,
                })
              }
            })
            this.$importFile.handleSuccess = (res)=>{
              tableData.splice(0,  tableData.length, ...res[0].res.CONTENT);
            };
            this.$importFile.open(); 
          }
        },{
          icon: "fa fa-download", 
          color: "blue",
          title: "导出",
          click:(tableData, row, tableHead)=>{
            let dataSetDef = JSON.stringify(tableHead);
            let data = {
              dataSetDef: dataSetDef,
              rows: tableData
            };
            DCHttp.export({
              url: dcConfig.publicPath,
              params: Object.assign({ [dcConfig.paramsKey]: data }, params.req.exportDataSet)
            })
            // this.$exportFile({url:DOWNLOAD_URL, data:data});
          }
        }]
      }),
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    })
  },
  methods: {
    initData(){
      this.getTableData();
    },
    getTableData(){
      this.table.setTableData(objClone(this.$store.state.PDCData.data.jobParamsDef_),jobParamsTableHead);
    },
    saveTableData(tableData){
      this.$store.state.PDCData.data.jobParamsDef_ = tableData;
      this.$closeDialog();
    },
  },

}
</script>

<style lang="scss" scoped>

</style>


