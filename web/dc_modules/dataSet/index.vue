<template>
  <el-input :value="dataSetContent" :readonly="true" type="text" title="" :placeholder="item.placeholder" :style="item.style || form.inputStyle" @click.native="openDateSet()" class="pointer">
    <el-button slot="append" @click="openDateSet()" :icon="item.extBtnIcon || form.extBtnIcon" title=""></el-button>
  </el-input>
</template>

<script>
const UPLOAD_PARAMS = {
  Class: 'PDCMgr',
  FUNC: 'importDataSetContent',
}

const DOWNLOAD_URL = { Class: 'PDCMgr', FUNC: 'exportDataSetContent'}

export default {
  name: 'dataSet',
  props: ['propData'],
  data () {
    return {
      form: {},
      item: [],
      object: {},
      dataSetContent: '',
      dialog: {},
    }
  },
  watch:{
    propData(){
      this.initData();
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
      this.form.data[this.item.name] || (this.form.data[this.item.name]=[])
      this.object = this.propData.object;
      this.object.set('editable', true).set('align','center').set('height','320px').set('hasPage', false).set('hasBottomBtn', false).set('btnGroup',[{
        icon: "fa fa-plus", 
        color: "green",
        title: "新增",
        click: (data, row)=>{
          let newData = {};
          for(let i=0; i<this.item.tableHead.length; i++){
            newData[this.item.tableHead[i].name] = "";
          }
          data.push(newData);
        }
      },{
        icon: "fa fa-remove", 
        color: "red",
        title: "删除",
        needRow: true,
        click(data, row) {
          let index = data.findIndex(item=>item==row);
          data.splice(index,1);
        }
      },{
        icon: "fa fa-level-up", 
        color: "green",
        title: "上移",
        needRow: true,
        click(data, row) {
          data.splice(0,data.length, ...data.swap(row,-1));
        }
      },{
        icon: "fa fa-level-down", 
        color: "green",
        title: "下移",
        needRow: true,
        click(data, row, rowIndex) {
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
              Class: UPLOAD_PARAMS.Class,
              FUNC: UPLOAD_PARAMS.FUNC,
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
            params: Object.assign({ [dcConfig.paramsKey]: data }, DOWNLOAD_URL)
          })
          // this.$exportFile({url:DOWNLOAD_URL, data:data});
        }
      }]);
      this.initDataSetContent();
    },
    initDataSetContent(){
      this.dataSetContent = this.form.data[this.item.name].length ? JSON.stringify(this.form.data[this.item.name][0])+'...' : '';
    },
    openDateSet(){
      this.object.set('tableData',objClone(this.form.data[this.item.name])).set('tableHead',this.item.tableHead);
      let width = this.object.tableHead.length < 6 ? this.object.tableHead.length*200 : 1100;
      width = width > 500 ? width : 500;
      this.$openDialog(new dc.Dialog({
        data: this.propData,
        component: 'dc-table',
        width: width + 'px',
        top: '40px',
        title: '数据集',
        hasBtn: true,
        btnGroup: [{
          text: '确定', 
          type: 'primary',
          click:(dialog, component)=>{ 
            this.form.data[this.item.name].splice(0, this.form.data[this.item.name].length, ...dialog.data.object.tableData);
            this.initDataSetContent();
            dialog.show = false;
          }
        }]
      }));
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
