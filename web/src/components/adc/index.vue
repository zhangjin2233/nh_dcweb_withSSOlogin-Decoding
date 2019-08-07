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
	  		<!-- 表格类型 -->
        <dc-table v-if="demo.tabs[i].type == 'Table'" :object="table"></dc-table>
	  		<!-- 文本类型 -->
	  		<el-input v-else-if="demo.tabs[i].type == 'String'" v-model="tab.value" type="textarea" :rows="9" :readonly="demo.tabs[i].readOnly"></el-input>
			</el-tab-pane>
		</el-tabs>

  </div>
</template>

<script>
import params from './params'
import saveNode from '@/assets/js/flow/saveNode'
import merge from 'webpack-merge'

export default {
  name: 'adc',
  props: ['activeId'],
  data () {
    return {
      params: params,
      attrData: {},
      demo: {},
      content: {},
      hiddenCols: ['size','canBeEmpty'],
      table: new dc.Table({
        align: 'center',
        height: document.documentElement.clientHeight - 235 + 'px',
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
        }],
        hasPage: false,
        editable: true,
      }),
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
          JSON.stringify(this.fromQuery) != '{}' ? this.$router.push({path: '/adf', query: this.fromQuery}) : this.$router.go(-1);
        }
      }]
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  watch:{
    $route(to,from){
      this.btns[2].hide = true;
      if(to.path == '/adc'){
        this.initData(from);
      }
    },
    newNode(val) {
      if(this.$route.path != '/adc') return;
      let nodeData = {};
      this.$emitEvent('getTreeNode', {
        pId: this.$route.query.pId,
        label: this.attrData.head.label || this.attrData.head.name,
        type: 'ADC'
      }, nodeData);
      if(JSON.stringify(nodeData) != '{}'){
        this.$router.replace({ query:objClone(nodeData,{},['id','pId','link','label','type','storyId'],true) })
      }
    },
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
  methods: {
    btnEvent(btn,btnIndex){
      btn.click.call(this);
    },
    initData(from){
      let nodeData = this.$route.query;
      this.formId = nodeData.type.toLowerCase() == params.dcType ? nodeData.link : "";
      this.storyId = nodeData.storyId;
      this.pId = nodeData.pId;
      this.folderId = nodeData.id;
      if(this.fromId || nodeData.from || (from && from.query && from.query.from)){
        this.btns[2].hide = false;
      }
      this.getForm();
    },
    getForm(){
      this.loading = true;
      DCHttp.req({url:this.params.getForm.url, params:{id:this.formId}}).then(res=>{
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
    },
    formatSaveData(){
      let data = objClone(this.content, {
        saveData: {
          id: this.formId,
          storyId: this.storyId,
          folderId: this.$route.query.type.toLowerCase().includes('root') ? undefined : this.folderId,
        }
      }, ['attr','demo']);
      data = objClone(this.content.attr, data);
      return data;
    },
    refresh(Vue,data){
      Vue.formId && saveNode(data,this.$route.query.type);
      if(Vue.formId && Vue.attrData.head.label != Vue.$route.query.label){
        //刷新当前节点,并刷新当前页面
        let node = Tree.getNode(this.$route.query.link);
        node.data.label = Vue.attrData.head.label || Vue.attrData.head.name;
        Vue.$router.replace({ query:merge(Vue.$route.query,{'label':Vue.attrData.head.label}) })
      }else if(!Vue.formId){
        Tree.refreshTree(this.$route.query.link).then(res=>{
          let nodeData = res.find(item=>(item.label == (Vue.attrData.head.label || Vue.attrData.head.name)) && (item.type=='ADC'))
          if(nodeData){
            this.$router.replace({ query:objClone(nodeData,{},['id','pId','link','label','type','storyId'],true) })
          }
        })
      }
    },
    saveForm(){
      //保存表单数据
      let data = this.formatSaveData();
      this.loading = true;
      DCHttp.req({url:this.params.saveForm.url,params:data, method:'POST', info:{success:'保存成功',error:'保存失败'}}).then(res=>{
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
</style>
