<template>
  <dc-table v-loading="loading" :object="table"></dc-table>
</template>

<script>

export default {
  name: 'pdfList',
  props: ['propData'],
  data () {
    return {
      loading: false,
      tree: new dc.Tree({
        height: '308px',
        hasCheckbox: true,
        singleSelect: true,
        key: 'link',
        selectType: ['PDF'],
      }),
      table: new dc.Table({
        height: "300px",
        align: 'center',          
        hasBtn: true,
        hasPage: false,
        tableHead: [{ label: 'PDF名称',  name: 'guid', type:'string' }],
        btnGroup: [{
          icon: 'fa fa-refresh',
          color: 'green', 
          title: '刷新',
          click:()=>{
            this.initData();
          }
        },{
          icon: 'fa fa-plus',
          color: 'blue', 
          title: '新增',
          click:()=>{ 
            this.openPDFTree();
          }
        },{
          icon: 'fa fa-remove',
          color: 'red', 
          title: '删除',
          needRow: true,
          click:(tableData,row)=>{
            this.removePDF(row);
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
      this.loading = true;
      DCHttp.req({
        url: dcConfig.publicPath,
        params: {
          FUNC: 'listAllPreposedPDFBrief',
          Class: 'PDFMgr',
          [dcConfig.paramsKey]: { pdfId: this.propData.pdfId }
        }
      }).then(res => {
        if(res){
          this.table.setTableData(res.CONTENT)
          this.loading = false;
        }
      }).catch(err => {
        this.loading = false
      })
    },
    removePDF(row){
      this.loading = true;
      DCHttp.req({
        url: dcConfig.publicPath,
        params: {
          FUNC: 'removePreposedPDF',
          Class: 'PDFMgr',
          [dcConfig.paramsKey]: { pdfId: this.propData.pdfId, preposedPdfId:row.ID }
        }
      }).then(res => {
        res && this.initData();
      }).catch(err => {
        this.loading = false
      })
    },
    openPDFTree(){
      DCHttp.req({url:'/api/tree/getAllTree', params:{type:'PDF',storyId:this.propData.storyId}}).then(res=>{
        if(res){
          let treeList = res.CONTENT.treeList;
          this.tree.setData(treeList);
          if(treeList.length){
            const expandedKeys = [treeList[0].link, treeList[0].children[0].link, treeList[0].children[0].children[0].link];
            this.tree.set('defaultExpandedKeys', expandedKeys);
          }
        }
      });

      VUE.$openDialog(new dc.Dialog({
        title: '选择添加的PDF',
        width: '400px',
        component: 'dc-tree',
        data: { object: this.tree },
        hasBtn: true,
        btnGroup: [{
          text: '确定',
          type: 'primary',
          click: (dialog,component)=>{
            if(this.tree.selection.length){
              this.addPDF(this.tree.selection[0]);
              dialog.show = false;
            }else{
              this.$alert('未选中PDF');
            }
          }
        }]
      }));
    },
    addPDF(pdfId){
      this.loading = true;
      DCHttp.req({
        url: dcConfig.publicPath,
        params: {
          FUNC: 'addPreposedPDF',
          Class: 'PDFMgr',
          [dcConfig.paramsKey]: { pdfId: this.propData.pdfId, preposedPdfId:pdfId }
        },
        info: {success: '添加成功', error:'添加失败'}
      }).then(res => {
        res && this.initData();
      }).catch(err => {
        this.loading = false
      })
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
