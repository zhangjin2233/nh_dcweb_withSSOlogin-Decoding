<template>
  <div>
    <nodeTipsList :propData="propData"></nodeTipsList>
    <dc-form v-if="form.vue" :object="form"></dc-form>
  </div> 
</template>

<script>
export default {
  name: 'addList',
  props: ['propData'],
  data () {
    return {
      form: {},
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
    })
  },
  methods: {
    initData(){
      this.form = new dc.Form({
        structure: [{
          label: '标签',
          name: 'tag',
          type: 'text'
        }],
        data: { tag: '' },
        btns: [{
          label: '确定',
          type: 'primary',
          click: (form)=>{
            if(form.data.tag){
              DCHttp.req({url:dcConfig.publicPath, params:{
                Class: 'com.leavay.tag.TagAction',
                FUNC: 'createTag',
                [dcConfig.paramsKey]: {pdcId: this.propData.pdcId, tag: form.data.tag}
              }}).then(res=>{
                this.propData.flow.addNodeTips(this.propData.node.id,res.CONTENT);
                this.propData.flow.vue.popoverShut();
              })
            }else{
              this.$alert('标签内容不能为空');
            }
          }
        }]
      })
    }
  },
}
</script>

<style>

</style>

<style scoped>
.right{
  text-align: right;
}
</style>
