<template>
  <dc-form v-loading="loading" :object="form"></dc-form>
</template>

<script>
import params from '../params.js'

export default {
  name: 'subPDCForm',
  props: ['propData'],
  data () {
    return {
      loading: false,
      exitFlag: false,
      form: new dc.Form({
        size: 'mini',
        dialogEdit: true,
        style: 'maxHeight:400px;',
        hiddenRows: ['env','configId'],
        // hiddenRows: ['env','dataGuid'],
        bottomBtnStyle: 'text-align:right;',
        btns: [{
          label: '保存',
          type: 'primary',
          click:(form,btn,index)=>{
            this.saveData();
          },
        },{
          label: '取消',
          click:(form,btn,index)=>{
            this.$closeDialog();
          },
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
      this.getData();
    },
    getPDCByCDCId(){
      DCHttp.req({url:params.getForm.url, params:{cdcId:this.propData.id}}).then(res=>{
        this.setData(res);
        this.loading = false;
      });
    },
    getPDCByCDCNameOrCDCId(){ //若cdc名称获取失败，则使用cdcId获取
      DCHttp.req({url:params.getForm.url, params:{cdcName:this.propData.name}}).then(res=>{
        if(res){
          this.setData(res);
          this.loading = false;
        }else{
          this.getPDCByCDCId()
        }
      }).catch(err=>{
        this.getPDCByCDCId()
      });
    },
    getPDCByGuidOrCDC(){ //尝试使用guid获取PDC，若失败则通过cdc获取
      DCHttp.req({url:params.getForm.url, params:{guid:this.propData.guid}}).then(res=>{
        if(res){
          this.setData(res);
          this.exitFlag = true;
          this.loading = false;
        }else{
          this.getPDCByCDCNameOrCDCId();
        }
      }).catch(err=>{
        this.getPDCByCDCNameOrCDCId();
      });
    },
    // getData(){
    //   this.loading = true;
    //   let data = {
    //     guid: this.propData.guid,
    //     cdcId: this.propData.id,
    //     cdcName: this.propData.name,
    //   };
    //   this.loading = true;
    //   DCHttp.req({url:'/api/PDC/tryToGet', params:data, info:{error:'加载失败'}}).then(res=>{
    //     if(res){
    //       this.loading = false;
    //       this.exitFlag = res.CONTENT.data.ID.substr(res.CONTENT.data.ID.length-2) == '-1' ? false : true;
    //       this.setData(res);
    //     }
    //   });
    // },
    async getData(){
      this.loading = true;
      let data;
      if(!this.propData.guid && !this.propData.name){
        data = {cdcId: this.propData.id};
      }else if(!this.propData.guid && !this.propData.id){
        data = {cdcName: this.propData.name};
      }else if(!this.propData.name && !this.propData.id){
        data = {guid: this.propData.guid};
        this.exitFlag = true;
      }
      if(data){
        DCHttp.req({url:params.getForm.url, params:data}).then(res=>{
          if(res){
            this.setData(res);
            this.loading = false;
          }
        });
      }else{
        if(this.propData.guid){
          this.getPDCByGuidOrCDC();
        }else if(this.propData.name){
          this.getPDCByCDCNameOrCDCId();
        }
      }
    },
    setData(res){
      this.data = res.CONTENT;
      this.form.setForm(this.data.data.featureType,this.data.treeList[0].structure);
      this.form.resetLabelWidth();
      const initJson = {where:[],select:[],orderBy:[],limit:-1,offset:-1,desc:""};
      this.form.structure.forEach(item=>{
        switch(item.name){
          case 'dataGuid':
            item.readOnly = true;
            this.form.data.dataGuid || (this.form.data.dataGuid = this.propData.dataGuid);
            break;
          case 'guid':
            item.readOnly = this.propData.cdcName ? true : false; 
            this.form.data[item.name] || (this.form.data[item.name] = (this.propData.cdcName ? this.data.adcName.split('.').slice(-1)[0]+'_'+this.propData.cdcName : this.data.adcName.split('.').slice(-1)[0]+new Date().getTime() ));
            break;
          case 'cdcName':
            if(this.propData.cdcName){
              this.form.data[item.name] = this.propData.cdcName;
              item.readOnly = true;
            }
            break;
          case 'mirrorSource': //镜像节点
            this.form.setItemStructure(item.name,{
              type: 'extinput',
              extBtnIcon: 'fa fa-reply',
              readOnly: true,
              extClick: ()=>{ this.$router.push({ path:'/pdcForm', query:{'guid':this.form.data.mirrorSource}}); }
            })
            break;
          case 'source_': //选择来源
            this.form.setItemStructure(item.name,{
              type: 'sourceselect',
              elementType: 'sourceselect',
              dcpath: this.headForm.data.adcName
            })
            break;
          case 'extractJson_': //贴源抽取
            this.form.data[item.name] || (this.form.data[item.name] = [{json:{where:[],select:[],orderBy:[],limit:-1,offset:-1,desc:""}}]);
            this.form.setItemStructure(item.name,{
              type: 'sourceextractitem',
              elementType: 'sourceextractitem',
              dcpath: this.headForm.data.adcName,
            })
            break;
          case 'extractModeds_': //重跑策略
            this.form.data[item.name] || (this.form.data[item.name] = [{json:{where:[],select:[],orderBy:[],limit:-1,offset:-1,desc:""}}]);
            this.form.setItemStructure(item.name,{
              type: 'extractmodeitem',
              elementType: 'extractmodeitem',
            })
            break;
          case 'attributeMapping': //属性映射配置
            item.nameList = this.propData.tableDataAttrList;
            item.attrDataTypeMap = this.propData.attrDataTypeMap;
            this.form.setItemComponent(item.name,'attrmappingitem');
            break;
          case 'ruleCdcs': //可选的元规则CDC列表
            this.form.setItemComponent(item.name,'checktreeitem');
            break;
          case 'sudf': //规则检查方法
            this.form.setItemComponent(item.name,'selecttreeitem');
            break;
          case 'params': //相关参数映射或质量检查方法的参数配置
            this.form.setItemComponent(item.name,'udfitem');
            break;
          case 'DQ_Rules': //规则配置列表
            item.value = this.data.adcName.split('.').slice(-1)[0];
            this.form.setItemComponent(item.name,'rulessettingitem');
            break;
          case 'ruleId': //元规则编码
            //调整之后的元规则编码不可编辑
            item.readOnly = true;
            if(this.propData.ruleId){
              this.form.data[item.name] = this.propData.ruleId;
            }
            break;
          default:
            break;
        }
      })
    },
    saveData(){
      let data = {
        SAVE: this.exitFlag, //判断是否更新
        data: this.data.data,
      };
      this.loading = true;
      DCHttp.req({url:params.saveForm.url, params:data, method:'POST',info:{success:'保存成功',error:'保存失败'}}).then(res=>{
        if(res && res.STATE === 1){
          this.elseOperate()
        }
        this.loading = false;
      }).catch(err=>{
        console.error(err);
        this.loading = false;
      });
    },
    elseOperate(){
      if(this.propData.form){
        if(!this.propData.form.data[this.propData.item.name].includes(this.form.data.guid)){
          let arr = this.propData.form.data[this.propData.item.name].split(',');
          arr.push(this.form.data.guid);
          this.propData.form.data[this.propData.item.name] = arr.join(',');
          if(this.propData.form.data[this.propData.item.name].charAt(0) == ','){
            this.propData.form.data[this.propData.item.name] = this.propData.form.data[this.propData.item.name].substr(1);
          }
        }
      }
    },
  },
}
</script>
<!-- scoped -->
<style scoped lang="scss">
</style>
