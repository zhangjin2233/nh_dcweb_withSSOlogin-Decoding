<template>
  <el-input :value="form.data[item.name]" :readonly="true" type="text" title="" :placeholder="item.placeholder" :style="item.style || form.inputStyle" class="pointer">
    <el-button slot="append" @click="openDialog()" :icon="item.extBtnIcon || form.extBtnIcon" title=""></el-button>
  </el-input>
</template>

<script>

export default {
  name: 'selecttreeitem',
  props: ['propData'],
  data () {
    return {
      form: this.propData.form,
      item: this.propData.item,
      tree: new dc.Tree({
        height: '400px',
        selectType: ['SUDF'],
        key: 'name',
        singleSelect: true,
        hasCheckbox: true,
        hasContextmenu:false,
        expandAll: true,
      })
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  watch:{
    propData(){
      this.initData();
    }
  },
  methods:{
    initData(){
      this.form = this.propData.form;
      this.item = this.propData.item;
      this.form.data[this.item.name] || (this.form.data[this.item.name]="");
    },
    getTree(treeList,id,attr){
      for(let i=0; i<treeList.length; i++){
        if(treeList[i].id == id){
          return attr ? treeList[i][attr] : [treeList[i]]
        }else if(treeList[i].children.length){
          let tree = this.getTree(treeList[i].children,id,attr);
          if(tree){
            return tree;
          }
        }
      }
    },
    openDialog(){
      this.tree.set('selection',this.form.data[this.item.name].split(','));
      this.$openDialog(new dc.Dialog({
        data: {object: this.tree },
        component: 'dc-tree',
        width: '500px',
        top: '40px',
        hasBtn: true,
        btnGroup: [{
          text: '确定', 
          type: 'primary',
          click:(dialog, component)=>{
            if(dialog.data.object.selection[0]){
              this.form.data[this.item.name] = dialog.data.object.selection[0];
            }
            dialog.show = false;
          }
        }]
      }));
      this.form.loading = true;
      let reqList = [{url:'/api/tree/getAllTree',params:{type:'UDF'}},{url:dcConfig.publicPath, params:{Class: 'com.leavay.dataquality.DataQualityAction',FUNC: 'getDQCheckSUDFCatalog',[dcConfig.paramsKey]: {}}}];
      let reqs = reqList.map(item=>{return DCHttp.req(item)});
      Promise.all(reqs).then(res=>{
        if(res && !res.some(item=>{ return item.ERR_MSG })){
          this.form.loading = false;
          let treeList = this.getTree(res[0].CONTENT.treeList, res[1].CONTENT.ID);
          this.tree.setData(treeList);
          treeList.length && this.tree.set('defaultExpandedKeys', [treeList[0].name]);
        }else{
          this.form.loading = false;
        }
      }).catch(err=>{
        this.form.loading = false;
      })
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
