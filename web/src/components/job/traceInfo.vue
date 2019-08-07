<template>
  <div v-loading="loading">
    <p class="header">
      <i :class="`fa fa-${resData.isError ? 'times' : 'info'}-circle flag`" :style="`color:${resData.isError ? 'red' : '#177cb0'};`"></i>
      <span>{{resData.title}}</span>
    </p>
    <tabsForm v-if="btns.length" :propData="{res:resData.tabsData}"></tabsForm>
    <footer v-if="propData.hasBtn">
      <el-button v-for="(btn,btnIndex) in btns" :key="btnIndex" @click="btn.click" size="mini">
        <i :class="btn.icon" :style="`color:${btn.color}`"></i>
        {{btn.text}}
      </el-button>
    </footer>
  </div>
</template>

<script>

export default {
	name: 'traceInfo',
  props: ['propData'],
  data(){
    return {
      loading: false,
      resData: {},
      btns: [],
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    })
  },
  methods:{
    initData(){
      this.loading = true;
      if(this.propData.res){
        this.getResOperate(this.propData.res);
			}else{
        DCHttp.req(this.propData).then(res=>{
          if(res){
            this.getResOperate(res.CONTENT);
          }
        })
      }
    },
    getResOperate(res){
      this.$set(this,'resData',res);
      this.resData.tabsData.forEach(item=>{
        if(item.CONTENT.value){
          this.btns.push({
            icon: 'fa fa-download',
            color: 'green',
            text: '下载'+item.CONTENT.title,
            click:()=>{
              DCHttp.export({
                fileName: item.CONTENT.title+'.log',
                url: dcConfig.publicPath,
                data: item.CONTENT.value
              })
              // this.$exportFile({
              //   fileName: item.CONTENT.title+'.log',
              //   data: item.CONTENT.value
              // })
            }
          });
        }
      })
      this.loading = false;
    }
  }
}
</script>
<style scoped>
.header{
  margin-top: 0px;
  display: flex;
  align-items:center;
}
.header>span{
  align-items:center;
}
.flag{
  font-size: 36px;
  margin-right:10px;
}
footer{
  margin: 10px 0 0 0;
  text-align: right;
}
</style>