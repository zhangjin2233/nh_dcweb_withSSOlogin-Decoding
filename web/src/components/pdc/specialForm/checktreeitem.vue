<template>
  <el-input :value="form.data[item.name]" :readonly="true" type="text" title="" :placeholder="item.placeholder" :style="item.style || form.inputStyle" class="pointer">
    <el-button slot="append" @click="openDialog()" :icon="item.extBtnIcon || form.extBtnIcon" title=""></el-button>
  </el-input>
</template>

<script>

export default {
  name: 'checktreeitem',
  props: ['propData'],
  data () {
    return {
      form: this.propData.form,
      item: this.propData.item,
      tree: new dc.Tree({
        height: '300px',
        selectType: ['cdc'],
        singleSelect: false,
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
      // this.form.data[this.item.name] || (this.form.data[this.item.name]="");
    },
    openDialog(){
      //获取树的值
      this.form.loading = true;
      this.tree.set('selection',this.form.data[this.item.name] ? this.form.data[this.item.name].split(',') : []);
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
            this.$set(this.form.data,this.item.name,dialog.data.object.selection.join(","))
            // this.form.data[this.item.name] = dialog.data.object.selection.join(",");
            dialog.show = false;
          }
        }]
      }));
      DCHttp.req({url:dcConfig.publicPath, params:{
        Class: 'com.leavay.dataquality.DataQualityAction',
        FUNC: 'getMetaRuleCdcName',
        [dcConfig.paramsKey]: {}
      }}).then(res=>{
        this.form.loading = false;
        if(res){
          let treeList = res.CONTENT.map(item=>{
            return{
              id: item.name,
              label: item.label,
              type: 'cdc',
              children: []
            }
          });
          this.tree.setData(treeList);
        }
      }).catch(err=>{
        this.form.loading = false;
      });
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
