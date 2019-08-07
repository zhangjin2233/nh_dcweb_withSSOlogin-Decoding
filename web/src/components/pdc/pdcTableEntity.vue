<template>
  <div>
    <div class="lineMargin"><el-switch v-model="data.exist"></el-switch>{{text}}</div>
    <template v-if="data.exist">
      <dc-form :object="headForm"></dc-form>
      <el-tabs type="card">
        <el-tab-pane v-for="(tab,i) in tabs" :key="i">
          <span slot="label">
            <i :class="tab.icon" :style="`color:${tab.color}`"></i>
            {{tab.title}}
          </span>
          <dc-table v-if="tab.type == 'Table'" :object="table"></dc-table>
          <dc-form v-else-if="tab.type == 'Form'" :object="form"></dc-form>
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
  
</template>

<script>
import params from './params'

export default {
  name: 'pdcTableEntity',
  props: ['data','structure'],
  data () {
    return {
      tabs:[{
        type: 'Table',
        title: '表结构',
      },{
        type: 'Form',
        title: '高级设置'
      }],
      text: " 启用实体定义",
      table: {},
      form: {},
      headForm: {},
    }
  },
  watch: {
    data(){
      this.initData();
    },
  },
  created(){
    this.initData();
  },
  methods:{
    btnEvent(event){
      event.call(this);
    },
    initData(){
      this.initHeadForm();
      this.initForm();
      this.initTable();
    },
    initTable(){
      this.table = new dc.Table({
        align: 'center',
        hiddenCols: ['Column SMUserID','Column SMDomainID'],
        height: document.documentElement.clientHeight - 310 + 'px',
        tableHead: this.structure.tableHead,
        tableData: this.data.tableData,
        hasPage: false,
        editable: true,
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
          click:(tableData, row)=>{
            this.$importFile.reset({
              title: '上传附件',
              name: 'excelFile',
              params: {
                Class: params.importTableEntity.Class,
                FUNC: params.importTableEntity.FUNC,
                FILTER: JSON.stringify({
                  tableEntityDefName: this.$route.query[params.attrName]
                })
              }
            })
            this.$importFile.handleSuccess = (res)=>{
              this.table.tableData.splice(0, this.table.tableData.length, ...res[0].res.CONTENT);
            };
            this.$importFile.open();
          }
        },{
          icon: "fa fa-download", 
          color: "blue",
          title: "导出",
          click:(tableData, row)=>{
            let data = {
              tableEntityDefName: this.$route.query[params.attrName],
              columns: tableData
            };
            DCHttp.export({
              url: dcConfig.publicPath,
              params: Object.assign(params.exportTableEntity, { [dcConfig.paramsKey]: data })
            })
            // this.$exportFile({url:params.exportTableEntity.url, data:data});
          }
        },{
          icon: 'fa fa-eye',
          color: 'blue',
          title: "显示SQL",
          click: ()=>{
            let data = {
              pdc: this.$store.state.PDCForm.getPDCSaveData(),
              attrName: this.$route.query[params.attrName],
            }
            this.$store.state.PDCForm.loading = true;
            DCHttp.req({url:dcConfig.publicPath,method:'POST', params:{
              Class: params.showSQL.Class,
              FUNC: params.showSQL.FUNC,
              [dcConfig.paramsKey]: data
            }}).then(res=>{
              this.$store.state.PDCForm.loading = false;
              if(res){
                let form = new dc.Form({
                  structure: [{
                    type: 'Text',
                    readOnly: true,
                    name: 'sql',
                    autosize: { minRows: 10, maxRows: 10}
                  }],
                  data: { sql: res.CONTENT },
                  labelPosition: 'top',
                })
                this.$openDialog({
                  title: "显示SQL",
                  component: 'dc-form',
                  data: { object: form }
                })
              }
            }).catch(err=>{
              this.$store.state.PDCForm.loading = false;
            });
          }
        },{
          icon: 'fa fa-table',
          color: 'orange',
          title: "测试建表",
          click: ()=>{
            let data = {
              pdc: this.$store.state.PDCForm.getPDCSaveData(),
              attrName: this.$route.query[params.attrName],
            }
            this.$store.state.PDCForm.loading = true;
            DCHttp.req({url:dcConfig.publicPath, method:'POST',params:{
              Class: params.testSQL.Class,
              FUNC: params.testSQL.FUNC,
              [dcConfig.paramsKey]: data
            }}).then(res=>{
              this.$store.state.PDCForm.loading = false;
              if(res){
                let form = new dc.Form({
                  structure: [{
                    type: 'Text',
                    readOnly: true,
                    name: 'sql',
                    autosize: { minRows: 10, maxRows: 10}
                  }],
                  data: { sql: res.CONTENT },
                  labelPosition: 'top',
                })
                this.$openDialog({
                  title: '测试建表',
                  component: 'dc-form',
                  data: { object: form }
                })
              }
            }).catch(err=>{
              this.$store.state.PDCForm.loading = false;
            });
          }
        }],
      }); 
    },
    initHeadForm(){
      this.headForm = new dc.Form({
        structure: this.structure.head,
        data: this.data.head,
        inline: true,
        labelWidth: "70px",
        inputStyle: 'width:120px',
        btns: [],
        // btns: [{
        //   title: '查询',
        //   icon: 'fa fa-search',
        //   type: 'primary',
        //   event: ()=>{

        //   }
        // },{
        //   title: '从库中读取',
        //   icon: 'fa fa-database',
        //   type: 'warning',
        //   event: ()=>{

        //   }
        // }],
      }); 
      this.headForm.structure.forEach((item,itemIndex)=>{
        if(item.name == 'tableName'){
          this.headForm.setItemStructure(item.name, 'style', 'width:250px');
        }
        if(item.name == 'dataSource'){
          this.headForm.setItemStructure(item.name, 'style', 'width:200px');
        }
      });
    },
    initForm(){
      this.form = new dc.Form({
        structure: this.structure.advSetting,
        data: this.data.advSetting,
      });
    }
  },
}
</script>
<!-- scoped -->
<style scoped>
.lineMargin{
  margin: 10px;
}
</style>
