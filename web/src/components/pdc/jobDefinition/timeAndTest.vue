<template>
  <dc-form v-if="form.vue" :object="form"></dc-form>
</template>

<script>
export default {
  name: 'timeAndTest',
  props: ['data'],
  data () {
    return {
      form: {},
      uuid: "",
      timer: null,
      dialog: {},
      traceHistory: [],
      errorHistory: [],
      logData: [],
    }
  },
  created(){
    this.$nextTick(()=>{
      this.form = new dc.Form({
        inline: true,
        size: 'mini',
        labelWidth: '',
        style: "margin-left:58px;",
        structure: [{
          // label: '数据时间',
          type: 'datetime',
          name: 'opTimeMills',
          style: "width:160px",
        },{
          // label: '代理',
          name: 'selectAgent',
          type: 'SingleEnum',
          style: "width:130px",
          option: this.$store.state.PDCData.agents,
        },{
          label: '',
          name: 'test',
          type: 'button',
          color: 'blue',
          icon: 'fa fa-cogs',
          toolTip: '远程测试',
          click:()=>{
            this.remoteTest();
          }
        },{
          icon: 'fa fa-eye',
          color: 'gray',
          name: 'show',
          type: 'button',
          toolTip: '查看调试日志',
          click:()=>{
            this.$openDialog(this.dialog);
          }
        }],
        data: {
          opTimeMills: new Date(),
          selectAgent: '',
          destroyRpc: false,
        }
      });
      this.form.data.selectAgent = this.form.structure[1].option[0].value;
      this.logData = this.getLogRes();
      this.dialog = new dc.Dialog({
        verticalCenter: true,
        title: '远程调试',
        top: '40px',
        width: '700px',
        component: 'tabsForm',
        data: {res: this.logData},
        hasBtn: true,
        btnGroup: [{
          text: '终止调试',
          type: 'primary',
          click:()=>{
            this.uuid && this.shut();
            this.$closeDialog();
          }
        },{
          text: '退出但不关闭',
          click:(dialog)=>{
            dialog.show = false;
          }
        }],
      })
    })
  },
  methods:{
    getLogRes(data={}){
      //累加显示
      let tabs = [{title:'Trace',data:'traceHistory',attr:'Trace'},{title:'错误信息',data:'errorHistory',attr:'Error'}];
      return tabs.map(item=>{
        data[item.attr] && this[item.data].unshift((this.$formatTime(new Date(),'number')) + '\n' + data[item.attr] + '\n');
        return {
          CONTENT: {
            title: item.title,
            value:  this[item.data].join('\n')
          }
        }
      })
    },
    startTest(res){
      //清除上一次记录
      this.traceHistory.splice(0,this.traceHistory.length);
      this.errorHistory.splice(0,this.errorHistory.length);
      this.$set(this,'logData',this.getLogRes());
      this.dialog.set('data',{res:this.logData});
      //切换状态
      this.form.setItemStructure('test',{
        color: 'red',
        icon: 'fa fa-power-off',
        toolTip: '终止测试',
      }).setItemStructure('show','color','orange');
      //记录计时器开始轮询
      this.uuid = res.CONTENT;
      this.log();
      this.$openDialog(this.dialog);
    },
    remoteTest(){
      let data = objClone(this.form.data);
      data.opTimeMills = (new Date(data.opTimeMills+':00')).getTime();
      data.attrName = this.$route.query.attrName == "MainJob" ? undefined : this.$route.query.attrName;
      data.pdc = this.$store.state.PDCForm.getPDCSaveData();
      if(this.uuid){ //计时器存在，说明在测试中
        this.shut();
      }else{
        DCHttp.req({url:dcConfig.publicPath, method:'POST', params:{
          Class: 'PDCMgr',
          FUNC: this.$route.query.attrName == "MainJob" ? 'remoteDebugJobFlow' : 'remoteDebugSUDF',
          [dcConfig.paramsKey]: data
        }}).then(res=>{
          if(res){
            this.startTest(res);
          }
        })
      }
    },
    log(){
      this.timer = setInterval(()=>{
        let data = { pollerUuid: this.uuid };
        DCHttp.req({url:dcConfig.publicPath, params:{
          Class: 'PDCMgr',
          FUNC: 'getCurrentRmtLaunchInfo',
          [dcConfig.paramsKey]: data
        }}).then(res=>{
          if(res){
            this.$set(this,'logData',this.getLogRes(res.CONTENT));
            this.dialog.set('data',{res:this.logData, active: !!res.CONTENT.Error ? 1 : undefined});
            if(!res.CONTENT.IsAlive){
              clearInterval(this.timer);
              this.timer = null;
              this.$set(this,'logData',this.getLogRes({Trace:'调试已完成',Error:'调试已完成'}));
              this.dialog.set('data',{res:this.logData, active: !!res.CONTENT.Error ? 1 : null});
            }
          }else{
            clearInterval(this.timer);
            this.timer = null;
          }
        })
      },1000);
    },
    shut(){
      clearInterval(this.timer);
      this.timer = null;
      let data = { pollerUuid: this.uuid };
      this.form.setItemStructure('test',{
        color: 'blue',
        icon: 'fa fa-cogs',
        toolTip: '远程测试',
      }).setItemStructure('show','color','gray');
      DCHttp.req({url:dcConfig.publicPath, params:{
        Class: 'PDCMgr',
        FUNC: 'terminateRemoteDebug',
        [dcConfig.paramsKey]: data
      }}).then(res=>{
        if(res){
          this.clear();
        }
      });
    },
    clear(){
      // this.traceHistory.splice(0,this.traceHistory.length);
      // this.errorHistory.splice(0,this.errorHistory.length);
      // this.$set(this,'logData',this.getLogRes());
      // this.dialog.set('data',{res:this.logData});
      this.uuid = "";
      this.$closeDialog();
    }
  }
  
}
</script>

<style lang="scss" scoped>

</style>


