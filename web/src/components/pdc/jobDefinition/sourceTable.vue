<template>
  <el-row>
    <el-col :span="18">
      <dc-table v-loading="loading" :object="table0"></dc-table>
    </el-col>
    <el-col :span="2">
      <div class="transferBtn">
        <button @click="transferData()"><i class="fa fa-long-arrow-right fa-2x"></i><i class="fa fa-filter fa-2x"></i></button>
      </div>
    </el-col>
    <el-col :span="4" v-loading="reqLoading">
      <dc-table :object="table1"></dc-table>
    </el-col>
  </el-row>
</template>

<script>
const mockTableHead = [{
  "label": "全局标识",
  "name": "guid",
  "readOnly": true,
  "type": "String",
}, {
  "label": "选择来源",
  "name": "source_",
  "type": "String",
}, {
  "label": "表结构",
  "name": "tableEntity_",
  "type": "String",
}];

import params from './mainJobParams.js'
import pdcParams from '../params.js'
const filterArr = ['guid','source_','tableEntity_'];
const filterFlag = false;

export default {
  name: 'sourceTable',
  props: ['propData'],
  data () {
    return {
      loading: false,
      pdfId: '',
      reqLoading: false,
      tree: new dc.Tree({
        height: '300px',
        hasCheckbox: false,
        lazy: false,
        hasContextmenu: false,
        nodeClick: (data, node)=>{
          if(node.type.toLowerCase() == 'pdf'){
            this.pdfId = node.link;
            this.table0.btnGroup[0].text = node.label
            this.$closeDialog();
          }
        }
      }),
      advFilterData: [],
      table0: new dc.Table({
        height: "350px",
        align: 'center',
        pageTool: 'total, sizes, jumper',
        hasSearch: true,
        hasPage: true,
        hasColSelect: true,
        hasSelect: true,
        selectOptions: [],
        tableHead: mockTableHead,
        btnGroup: [{
          text: ' 选择PDF',
          icon: 'fa fa-folder',
          color: '#ff8936',
          title: 'PDF',
          click: ()=>{
            if(this.pdfId){
              this.$alert('PDF已选择，不可更改');
            }else{ //此处需要修改为懒加载
              this.$openDialog(new dc.Dialog({
                verticalCenter: true,
                top: '40px',
                component: 'dc-tree',
                data: {object:this.tree},
              }));
            }
          }
        },{
          icon: "fa fa-refresh",
          color: "green",
          title: '刷新',
          click: (tableData)=>{
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
                placeholder: '请选择',
              },
            });
            this.$openDialog(new dc.Dialog({
              verticalCenter: true,
              component: 'dc-advFilter',
              data: { object: advFilter, data:this.advFilterData },
              hasBtn: true,
              width: "700px",
              btnAlign: 'right',
              btnGroup: [{
                text: '确定',
                type: 'primary',
                size: 'small',
                click:(dialog, component)=>{ 
                  this.getTableData(this.advFilterData[0]);
                  dialog.show = false
                }
              }, {
                text: '取消',
                type: 'default',
                size: 'small',
                click(dialog, component) {
                  dialog.show = false
                }
              }]
            }))
          }
        }],
        sizeChange: (size)=>{ this.getTableData(); },
        pageChange: (page)=>{ this.getTableData(); },
        search: (val)=>{ this.getTableData(); },
        selectChange:(val)=>{this.getTableData();}
      }),
      table1: new dc.Table({
        height: "350px",
        align: 'center',
        hasBtn: true,
        hasPage: false,
        hasBottomBtn: true,
        bottomBtn: [{
          text: '确定',
          type: 'primary',
          click:()=>{
            this.saveData();
          }
        },{
          text: '取消',
          click:()=>{
            this.$closeDialog();
          }
        }],
        btnGroup: [{
          icon: 'fa fa-remove',
          color: 'red', 
          title: '删除',
          needRow: true,
          click:(data,row)=>{
            let index = data.findIndex(item=>item==row);
            data.splice(index,1);
          }
        }],
        tableHead: [{
          label: 'PDC',
          name: 'guid',
          type: 'String'
        }],
        tableData: [],
      }),
      req: {},
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  methods:{
    initData(){
      let data = {};
      this.pdfId = this.$store.state.PDCData.data.parentDFP;
      this.req = this.propData.req ? this.propData.req : params.req;
      this.getAllReqData(this.req);
    },
    getAllReqData(req){
      this.loading = true;
      this.reqLoading = true;
      DCHttp.req({url:req.getSourceTable.url,params:{pdcId:this.$store.state.PDCData.data.ID,pdfId:this.$store.state.PDCData.data.parentDFP,cdcName:this.$store.state.PDCData.adcName.split('.').slice(-1)[0]}}).then(res=>{
        if(res){
          
          this.loading = false;
          this.reqLoading = false;
          res.CONTENT.pdfName && (this.table0.btnGroup[0].text = res.CONTENT.pdfName);
          this.tree.setData(res.CONTENT.treeList || []);
          this.table1.setTableData(res.CONTENT.selected);
          this.table0.set('selectOptions',res.CONTENT.option)
                     .set('selectValue',res.CONTENT.option.length ? res.CONTENT.option[0].value : "")
                     .setTableData(res.CONTENT.table.tableData,res.CONTENT.table.tableHead.filter(item=>{return filterFlag ? filterArr.includes(item.name) : true}))
                     .set('total',res.CONTENT.table.total)
                     .set('selectionInit',{ key: 'guid', value: this.table1.tableData.map(item=>item.guid) });
        }
      })
    },
    getTableData(){
      if(this.table0.selectValue){
        let data0 = {
          orderBy: {name:'guid',asnc:'true'},
          keyword: this.table0.keyword,
          pageNo: this.table0.currentPage,
          pageSize: this.table0.currentSize,
          cdcId: this.table0.selectValue,
        };
        this.loading = true;
        DCHttp.req({url:this.req.getPDCList.url, params:data0, method:'POST'}).then(res0=>{
          this.loading = false;
          if(res0){
            this.table0.setTableData(res0.CONTENT.tableData, res0.CONTENT.tableHead.filter(item=>{return filterFlag ? filterArr.includes(item.name) : true})).set('total', res0.CONTENT.total);
            this.table0.set('selectionInit',{ key: 'guid', value: this.table1.tableData.map(item=>item.guid) });
          }
        }).catch(err=>{this.loading = false;});
      }else{
        this.table0.setTableData([]).set('total', 0);
      }
    },
    transferData(){
      this.table0.selection.forEach((item,key,array)=>{
        if(!this.table1.tableData.some(item0=>item0.guid==item.guid) && item.ID != this.$store.state.PDCData.data.ID){
          this.table1.tableData.push(item)
        }
      })
    },
    saveData(){ //保存PDC表单后再保存该数据，之后再进行刷新页面
      let data0 = {
        pdfId: this.pdfId,
        pdcIds: this.table1.tableData.map(item=>{return item.ID}),
        pdc: this.$store.state.PDCForm.getPDCSaveData()
      }
      this.loading = true;
      DCHttp.req({url:this.req.saveSourceTable.url, params:data0, method:'POST',info:{success:'保存成功',error:'保存失败'}}).then(res0=>{
        this.loading = false;
        if(res0){
          this.$closeDialog()
          this.$store.state.PDCForm.initData(); //刷新整个PDC
        }
      }).catch(err=>this.loading = false);
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.treeContainer{
  height: 150px;
  border: 1px solid #ccc;
  overflow: auto;
  margin-bottom: 10px;
}
.transferBtn{
  height: 350px;
  display: flex;
  align-items: center;
  button{
    cursor: pointer;
    margin-left: 10px;
  }
  i{
    color: blue;
  }
}
</style>
