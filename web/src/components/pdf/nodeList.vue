<template>
  <el-row v-loading="loading">
    <el-col :span="15">
      <div class="treeContainer"><dc-tree :object="tree"></dc-tree></div>
      <dc-table :object="table0"></dc-table>
    </el-col>
    <el-col :span="3">
      <div class="transferBtn">
        <button @click="transferData()"><i class="fa fa-long-arrow-right fa-2x"></i><i class="fa fa-filter fa-2x"></i></button>
      </div>
    </el-col>
    <el-col :span="6">
      <dc-table :object="table1"></dc-table>
    </el-col>
  </el-row>
</template>

<script>
import params from './params.js'

export default {
  name: 'nodeList',
  props: ['propData'],
  data () {
    return {
      loading: false,
      tree: new dc.Tree({
        height: 'auto',
        hasCheckbox: false,
        lazy: false,
        hasContextmenu: false,
        nodeClick: (data, node)=>{
          if(node.type == 'CDC'){
            this.initTable(node);
            this.getTableData();
          }
        }
      }),
      table0: new dc.Table({
        searchWidth: "400px",
        height: "200px",
        align: 'center',
        pageTool: 'total, sizes, jumper',
        hasSearch: true,
        hasPage: true,
        hasColSelect: true,
        tableHead: [{
          "label": "GUID",
          "name": "guid",
          "type": "String",
        }, {
          "label": "CDC",
          "name": "cdcName",
          "type": "String",
        }],
        tableData: [],
        sizeChange: (size)=>{
          this.getTableData();
        },
        pageChange: (page)=>{
          this.getTableData();
        },
        search: (val)=>{
          this.getTableData();
        }
      }),
      table1: new dc.Table({
        height: "410px",
        align: 'center',
        hasBottomBtn: false,
        hasBtn: true,
        hasPage: false,
        btnGroup: [{
          icon: 'fa fa-remove',
          color: 'red', 
          title: '删除',
          needRow: true,
          click:(data,row)=>{
            let i = data.findIndex(item=>item == row);
            (i != -1) && data.splice(i,1);
          }
        }],
        tableHead: [{
          "label": "PDC",
          "name": "guid",
          "type": "String",
        }],
        tableData: [],
      }),
      leafId: "",
      leafName: "",
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
      let data = { 
        type: 'CDC',
        storyId: this.propData.flag == 'pdc' ? this.propData.storyId : undefined
      };
      this.req = this.propData.req || params.req;
      DCHttp.req({url:this.req.getPDCTree.url, params:data}).then(res=>{
        res && this.tree.setData(res.CONTENT.treeList)
        res && res.CONTENT.treeList.length && this.tree.set('defaultExpandedKeys', [res.CONTENT.treeList[0].id]);
      });
    },
    initTable(node){
      this.leafId = node.link;
      this.leafName = node.label;
      this.table0.keyword = "";
      this.table0.currentPage = 1;
    },
    getTableData(){
      let data = {
        cdcId: this.leafId,
        pageNo: this.table0.currentPage,
        pageSize: this.table0.currentSize,
        orderBy: {},
        keyword: this.table0.keyword
      };
      this.loading = true;
      DCHttp.req({url: this.req.getPDC.url, params:data, info:{error:'列表加载失败，请尝试刷新'}}).then(res=>{
        this.loading = false;
        res && this.table0.setTableData(res.CONTENT.tableData.map(item=>{return{guid:item.guid, cdcName:this.leafName, id:item.ID}})).set('total', res.CONTENT.total);
      }).catch(e=>{this.loading = false;});
    },
    transferData(){
      this.table0.selection.map((item,key,array)=>{
        this.table1.tableData.includes(item) || this.table1.tableData.push(item);
      })
    }
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
    margin-left: 10px;
  }
  i{
    color: blue;
  }
}
</style>
