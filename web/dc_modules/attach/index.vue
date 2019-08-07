<template>
  <div>
    <span title="">{{form.data[item.name] || emptyText}}</span>
    <div class="right">
      <el-button v-for="(btn,btnIndex) in btns" :key="btnIndex" @click="btnEvent(btn.event)" :disabled="btn.disabled && btn.disabled(form.data[item.name],item,form)" :title="btn.title" :type="btn.type" :size="item.size || form.size">
        <i :class="btn.icon" :style="btn.color"></i>{{btn.text}}
      </el-button>  
    </div>
  </div>
</template>

<script>

const UPLOAD_PARAMS = {
  Class: 'PDCMgr',
  FUNC: 'updatePDCAttachment',
}

const DOWNLOAD_URL = { Class: 'PDCMgr', FUNC: 'getPDCAttachment'}

export default {
  name: 'attach',
  props: ['propData'],
  data () {
    return {
      form: {},
      item: {},
      object: {},
      emptyText: "空文件",
      btns: [{
        text: '上传',
        type: 'primary',
        disabled:(val, item, form)=>{
          return item.readOnly || form.readOnly
        },
        event: (item,form)=>{
          //触发上传组件
          const pdcId = this.$store.state.PDCData.data.ID;
          if(pdcId.slice(-3) == '=-1'){
            this.$alert("请先保存PDC，再上传附件");
            return;
          }
          this.$importFile.reset({
            title: '上传附件',
            name: 'attachFile',
            params: {
              Class: UPLOAD_PARAMS.Class,
              FUNC: UPLOAD_PARAMS.FUNC,
              FILTER: JSON.stringify({
                pdcId: pdcId,
                attrName: item.name
              })
            }
          })
          this.$importFile.handleSuccess = (res)=>{
            form.data[item.name] = res[0].res.CONTENT[item.name];
          };
          this.$importFile.open();
        },
      },{
        text: '下载',
        type: 'success',
        disabled:(val, item, form)=>{
          return !item.value || item.readOnly || form.readOnly;
        },
        event: (item,form)=>{
          DCHttp.export({
            url: dcConfig.publicPath,
            params: Object.assign({ [dcConfig.paramsKey]: { pdcId: this.$store.state.PDCData.data.ID, attrName: item.name }}, DOWNLOAD_URL)
          })
          // this.$exportFile({url:DOWNLOAD_URL, data:{pdcId: this.$store.state.PDCData.data.ID, attrName: item.name}});
        },
      },{
        text: '删除',
        type: "danger",
        disabled:(val, item, form)=>{
          return (!val || val == this.emptyText) || item.readOnly || form.readOnly;
        },
        event: (item,form)=>{
          form.data[item.name] = "";
        },
      }]
    }
  },
  watch:{
    propData(){
      this.initData();
    }
  },
  created(){
    this.initData();
    this.$nextTick(()=>{
      
    })
  },
  methods:{
    initData(){
      this.form = this.propData.form;
      this.item = this.propData.item;
      this.item.value = this.form.data[this.item.name];
    },
    btnEvent(event){
      event.call(this,this.item,this.form);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.right{
  float: right;
}
</style>
