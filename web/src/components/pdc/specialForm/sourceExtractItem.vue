<template>
  <el-input :value="content()" :readonly="true" type="text" title="" :placeholder="item.placeholder" :style="item.style || form.inputStyle" class="pointer">
    <el-button slot="append" @click="openDialog()" :icon="item.extBtnIcon || form.extBtnIcon" title=""></el-button>
  </el-input>
</template>

<script>
import params from '../params.js'

export default {
  name: 'sourceExtractItem',
  props: ['propData'],
  data () {
    return {
      form: {},
      item: {},
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
    },
    content(){
      return this.item.name ? JSON.stringify(this.form.data[this.item.name]) : '';
    },
    openDialog(){
      if(this.form.data.source_){
        let reqs = [{url:params.getSourceTableStructure.url,params:{source:this.form.data.source_}},{url:params.getJudgeTypeOption.url,params:{}},{url:params.getParamsOption.url,params:{}}];
        let flag = !this.item.dcpath.includes('FILE');
        let dialog = new dc.Dialog({
          verticalCenter: true,
          top: '40px',
          data: objClone({reqs: reqs, data:this.form.data[this.item.name], flag:flag }),
          component: 'sourceExtract',
          width: '700px',
          hasBtn: true,
          btnGroup: [{
            text: '确定',
            type: 'primary',
            size: 'small',
            click:(dialog, component)=>{ 
              //计算结果
              let result = objClone(component.form,{},['desc','limit','offset'],true);
              result.select = component.tabs[0].object.tableData.map(item=>{ return item.ColName });
              if(flag){
                result.where = component.tabs[1].children[0].object.tableData.map(item=>{ return objClone(item,{},['label']) });
                result.orderBy = component.tabs[1].children[1].object.tableData.map(item=>{ return { left:item.name, right:item.right } });
              }
              this.form.data[this.item.name].splice(0,1,{json:objClone(result, this.form.data[this.item.name][0].json)});
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
        });
        this.$openDialog(dialog);
      }else{
        this.$alert("请先选择来源");
      }
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
