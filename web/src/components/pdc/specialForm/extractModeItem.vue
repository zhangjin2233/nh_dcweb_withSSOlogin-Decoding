<template>
  <el-input :value="content()" :readonly="true" type="text" title="" :placeholder="item.placeholder" :style="item.style || form.inputStyle" class="pointer">
    <el-button slot="append" @click="openDialog()" :icon="item.extBtnIcon || form.extBtnIcon" title=""></el-button>
  </el-input>
</template>

<script>

import params from '../params.js'

export default {
  name: 'extractModeItem',
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
    content(){
      return this.item.name ? JSON.stringify(this.form.data[this.item.name]) : '';
    },
    initData(){
      this.form = this.propData.form;
      this.item = this.propData.item;
    },
    openDialog(){
      const extractModeVal = 3;
      if(this.form.data.extractMode_ == extractModeVal){
        let dialog = new dc.Dialog({
          verticalCenter: true,
          top: '40px',
          data: {reqs: [{url:params.getSourceTableStructure.url,params:{source:this.form.data.source_}},{url:params.getJudgeTypeOption.url,params:{}},{url:params.getParamsOption.url,params:{}}],form:this.form,item:this.item },
          component: 'extractModel',
          width: '700px',
          hasBtn: true,
          btnGroup: [{
            text: '确定',
            type: 'primary',
            click:(dialog, component)=>{ 
              let result = {};
              result.where = component.table.tableData.map(item=>{ return objClone(item,{},['label']) });
              this.form.data[this.item.name].splice(0,1,{json:objClone(result, this.form.data[this.item.name][0].json)});
              dialog.show = false
            }
          }, {
            text: '取消',
            click(dialog, component) {
              dialog.show = false
            }
          }]
        });
        this.$openDialog(dialog);
      }else{
        let toolTip = "请选择抽取策略";
        try{
          toolTip = `抽取策略为${this.form.structure.find(item=>item.name=='extractMode_').option.find(item0=>item0.value==extractModeVal).label}才可操作`;
        }catch(err){}
        this.$alert(toolTip);
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
