<template>
	<div class="borderMargin" v-loading="loading">
    <!-- 工具栏 -->
    <el-button-group>
      <el-button v-for="(btn,btnIndex) in btns" v-if="!btn.hide" :key="btnIndex" @click.prevent.stop="btnEvent(btn,btnIndex)" :title="btn.title"><i :class="btn.icon" :style="`color:${btn.color}`"></i></el-button>
    </el-button-group>
    
    <!-- 窗口顶部 -->
    <dc-form :object="headForm"></dc-form>

	  <!-- 标签页 -->
    <el-tabs type="card">
		  <el-tab-pane v-for="(tab,i) in attrData.tabs" :key="i" :label="demo.tabs[i].title">
        <dc-table v-if="demo.tabs[i].type == 'Table'" :object="table"></dc-table>
	  		<dc-form v-else-if="demo.tabs[i].type == 'Form'" :object="form"></dc-form>
			</el-tab-pane>
		</el-tabs>

  </div>
</template>

<script>
import params from './params'
import saveNode from '@/assets/js/flow/saveNode'
import merge from 'webpack-merge'

export default {
  name: 'cdc',
  props: ['activeId'],
  data () {
    return {
      flag: false,
      attrData: {},
      demo: {},
      content: {},
      table: new dc.Table({
        align: "center",
        size: 'mini',
        height: document.documentElement.clientHeight - 260 + 'px',
        btnGroup: [{
          icon: "fa fa-plus", 
          color: "green",
          title: '新增',
          click: (data, row, tableHead)=>{
            data.push(tableHead.newTableRow(data,2));
          }
        },{
          icon: "fa fa-remove", 
          color: "red",
          title: '删除',
          needRow: true,
          click(data, row) {
            let index = data.findIndex(item=>item==row);
            data.splice(index,1);
          }
        },{
          icon: "fa fa-level-up", 
          color: "green",
          title: '上移',
          needRow: true,
          click(data, row) {
            data.splice(0,data.length, ...data.swap(row,-1));
          }
        },{
          icon: "fa fa-level-down", 
          color: "green",
          title: '下移',
          needRow: true,
          click(data, row) {
            data.splice(0,data.length, ...data.swap(row,1));
          }
        }, ...(dcConfig.customModule.dataquality ? [{
          icon: "fa fa-mail-reply fa-rotate-270",
          color: "blue",
          title: '一键导入质量检查框架的属性',
          click:(tableData, row, tableHead)=>{
            this.loading = true;
            DCHttp.req({url:dcConfig.publicPath, params:{
              Class: 'com.leavay.dataquality.DataQualityAction',
              FUNC: 'getQualityFrameAttrs',
              [dcConfig.paramsKey]: {}
            }}).then(res=>{
              if(res){
                let dataType = tableHead.find(item=>item.name=='dataType').option.map(item=>item.value);
                let addRows = res.CONTENT.map(item=>{
                  if(dataType.includes(item.dataType)){
                    item.elementType = 'staticValue';
                  }else{
                    item.elementType = item.dataType;
                    item.dataType = 'String';
                  }
                  return item
                });
                this.addTableRows(tableData, addRows);
              }
            }).catch(err=>{
              this.loading = false;
            })
          }
        },{
          icon: 'fa fa-cog',
          color: 'orange',
          title: '元规则分类',
          click:(tableData, row, tableHead)=>{
            let tableDataAttrList = [];
            let attrDataTypeMap = {};
            let dataType = tableHead.find(item=>item.name=='dataType').option.map(item=>item.value);
            tableData.forEach(item=>{
              if(item.elementType !== 'UDF'){
                tableDataAttrList.push(item.name);
                let type = item.elementType!='staticValue' ? item.elementType : item.dataType;
                if(type.includes('TableEntity=')){ type='TableEntity'}
                attrDataTypeMap[item.name] = {name:item.name,label:item.label,type:type,option:[{label:'',value:''}]};
              }
            })
            VUE.$openDialog(new dc.Dialog({
              top: '40px',
              title: '元规则分类',
              width: '700px',
              component: 'subPDCForm',
              data: { name:'CDC_DATA_QUALITY_CFG',guid:'CDC_DATA_QUALITY_CFG_'+this.headForm.data.name, cdcName:this.headForm.data.name,tableDataAttrList:tableDataAttrList,attrDataTypeMap:attrDataTypeMap },
            }))
          }
        }] : [])],
        hasPage: false,
        editable: true,
        cellAppend: [{
          prop: "dataType", 
          condition: "true", 
          component: "cellBtn"
        },{
          prop: "elementType", 
          condition: "true", 
          component: "cellBtn"
        }],
        customCells: [{ //数据类型
          disabled: "col.name==='dataType' && (row.elementType!='staticValue')",
        },{//长度
          disabled: "col.name==='size' && (row.elementType!=='staticValue' || row.dataType!=='String')"
        },{//默认值
          disabled: "col.name==='defaultValue' && (row.elementType!=='staticValue' || row.dataType=='AttachObject')"
        },{
          disabled: '(col.name==="name")&&row.INHERIT'
        }],
      }),
      form: {},
      loading: false,
      headForm: new dc.Form({
        inline: true,
        size: 'mini',
        labelWidth: '',
        style: "margin: 15px 0px 0px 0px;",
        inputStyle: 'width:230px',
      }),
      btns: [{
        icon: 'fa fa-save',
        title: '保存',
        color: 'blue',
        click(){ //保存表单
          this.saveForm();
        }
      },{
        icon: 'fa fa-refresh',
        title: '刷新',
        color: 'green',
        click(){ //刷新表单
          this.getForm();
        }
      },{
        icon: 'fa fa-reply',
        color: 'orange',
        title: '返回',
        hide: true,
        click: ()=>{
          JSON.stringify(this.fromQuery) != '{}' ? this.$router.push({path: '/cdf', query: this.fromQuery}) : this.$router.go(-1);
        }
      }],
    }
  },
  computed: {
    newNode() {
      return this.$store.state.newNode
    },
    fromId(){
      return this.$route.query ? this.$route.query.flowName : "";
    },
    fromQuery(){
      return this.$route.query.from ? JSON.parse(this.$route.query.from) : {};
    }
  },
  watch:{
    $route(to,from){
      this.btns[2].hide = true;
      if(to.path == '/cdcForm'){
      // if(to.path == '/cdcForm' || to.path == '/cdc'){
        this.initData(from);
      }
    },
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  methods: {
    addTableRows(tableData, addRows){
      let udfNames = [];
      addRows.forEach(item=>{
        if(item.elementType == 'UDF'){
          item.customerExtension || (item.customerExtension={});
          let udfName = Object.keys(item.customerExtension)[0];
          udfName && udfNames.push(udfName);
        }
      })
      if(udfNames.length){
        let reqs = udfNames.map(item=>{return DCHttp.req({url:dcConfig.publicPath, params:{
          Class: 'SUDFMgr',
          FUNC: 'getUDFByName',
          [dcConfig.paramsKey]: {udfName:item}
        }})});
        Promise.all(reqs).then(res=>{ 
          if(res && !res.some(item=>{ return item.ERR_MSG })){
            addRows.forEach(row=>{
              if(row.elementType == 'UDF'){
                let udfName = Object.keys(row.customerExtension)[0];
                let udf = res.find(udfRes=>udfRes.CONTENT.name == udfName).CONTENT;
                row.udf = {
                  choseRow: udf.name,
                  label: udf.desc,
                  tableData: udf.arguments.map(udfDataItem=>{
                    return {
                      name: udfDataItem.name,
                      type: udfDataItem.fullClass.substr(udfDataItem.fullClass.lastIndexOf('.')+1),
                      value: row.customerExtension[udf.name][udfDataItem.name]
                    }
                  })
                }
              }
            })
            tableData.some(item=>addRows.find(item0=>item0.name==item.name)) ? this.$alert('字段已存在') : tableData.splice(tableData.length,0,...addRows);
            this.loading = false;
          }
        });
      }else{
        tableData.some(item=>addRows.find(item0=>item0.name==item.name)) ? this.$alert('字段已存在') : tableData.splice(tableData.length,0,...addRows);
        this.loading = false;
      }
    },
    btnEvent(btn,btnIndex){
      btn.click.call(this);
    },
    initData(from){
      let nodeData = this.$route.query;
      this.formId = nodeData.type.toLowerCase() == params.dcType ? nodeData.link : "";
      this.pId = nodeData.pId;
      this.folderId = nodeData.id;
      this.adcId = nodeData.adcId;
      if(this.fromId || nodeData.from || (from && from.query && from.query.from)){
        this.btns[2].hide = false;
      }
      this.getForm();
    },
    getForm(){
      this.loading = true;
      DCHttp.req({url:params.getForm.url, params:{id:this.formId,adcId:this.adcId}}).then(res=>{
        if(res){
          this.initContent(res.CONTENT);
          this.loading = false;
        }
      });
    },
    initContent(content){
      this.content = content;
      this.attrData = content.attr;
      this.demo = content.demo;
      this.headForm.setForm(this.attrData.head,this.demo.head);
      this.table.setTableData(this.attrData.tabs[0].tableData, this.demo.tabs[0].tableHead);
      this.form = new dc.Form({
        labelWidth: "145px",
        structure: this.demo.tabs[1].structure,
        data: this.attrData.tabs[1].formData,
        readOnly: this.demo.tabs[1].readOnly
      });
    },
    formatSaveData(){
      let data = objClone(this.content, {
        saveData: {
          id: this.formId,
          folderId: this.formId ? this.pId : this.folderId,
        }
      }, ['attr','demo']);
      data = objClone(this.content.attr, data);
      console.log(data)
      return data;
    },
    refresh(Vue,data){
      this.flag = true;
      Vue.formId && saveNode(data,Vue.$route.query.type);
      if(Vue.formId && Vue.attrData.head.label != Vue.$route.query.label){
        let node = Tree.getNode(this.$route.query.link);
        node.data.label = Vue.attrData.head.label || Vue.attrData.head.name;
        Vue.$router.replace({ query:merge(Vue.$route.query,{'label':Vue.attrData.head.label}) })
      }else if(!Vue.formId){
        Tree.refreshTree(this.$route.query.link).then(res=>{
          let nodeData = res.find(item=>(item.label == (Vue.attrData.head.label || Vue.attrData.head.name)) && (item.type=='CDC'))
          if(nodeData){
            this.$router.replace({ query:objClone(nodeData,{},['id','pId','link','label','type','storyId'],true) })
          }
        })
      }
    },
    saveForm(){
      let data = this.formatSaveData();
      this.loading = true;
      DCHttp.req({url:params.saveForm.url,params:data, method:'POST',info:{success:'保存成功',error:'保存失败'}}).then(res=>{
        res && this.refresh(this,data);
        this.loading = false;
      }).catch(err=>{
        console.error(err);
        this.loading = false;
      });
    },
  },
}
</script>

<style scoped>
.borderMargin{
  margin: 10px 20px 0px 20px;  
}
.lineMargin{
  margin-top: 10px;
}
</style>
