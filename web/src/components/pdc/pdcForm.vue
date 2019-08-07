<template>
  <el-container class="pdcForm" v-loading="loading">
    <el-header>
      <el-button v-for="(btn,btnIndex) in btns.filter(btn => !(btn.hide && btn.hide()))" :key="btnIndex" @click="btn.event()" :size="toobarSize" :title="btn.title">
        <i :class="btn.icon" :style="`color:${btn.color}`"></i>{{btn.text}}
      </el-button>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <dc-tree :object="tree"></dc-tree>
      </el-aside>
      <el-main>
        <header>{{tree.currentNode.label || '标题'}}</header>
        <codeEditor v-if="codeType.includes(tree.currentNode.type)" :data="tree.currentNode.type == 'action' ? data.data[tree.currentNode.link] : data.data" :attr="tree.currentNode.type == 'action' ? 'script' : tree.currentNode.link"></codeEditor>
        <udfForm v-if="tree.currentNode.type == 'SUDF'" :propData="{udfData: data.data[tree.currentNode.link], tableHead:tree.currentNode.tableHead, flag:'PDC'}"></udfForm>
        <pdcFileEntity v-if="tree.currentNode.type == 'FileEntity'" :structure="tree.currentNode.structure" :data="data.data[tree.currentNode.link]"></pdcFileEntity>
        <pdcTableEntity v-if="tree.currentNode.type == 'TableEntity'" :structure="tree.currentNode.tableEntityStructrue" :data="data.data[tree.currentNode.link]"></pdcTableEntity>
        <div v-show="tree.currentNode.type == 'MainJob'" class="flowContainer"><dc-flow v-if="flow.vue" :object="flow"></dc-flow></div>
        <section v-show="tree.currentNode.type == 'featureType'" class="section0"><dc-form v-if="form.vue" :object="form"></dc-form></section>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import params from './params.js'
import pdcTableEntity from './pdcTableEntity'
import pdcFileEntity from './pdcFileEntity'
import merge from 'webpack-merge'
import flowParams from './jobDefinition/mainJobParams.js'
import udfForm from '@/components/cdc/udfForm/index.vue'
import formatPDCToSave from './formatPDCToSave.js'

export default {
  name: 'PDCForm',
  data () {
    return {
      codeType: ['java','action'],
      showSql: true,
      loading: false,
      btns: [{
        icon: 'fa fa-exchange',
        color: '#ffc773',
        title: '选中所属CDC',
        hide(){ return !VUE.$route.query.guid },
        event(){
          this.icon = 'el-icon-loading';
          DCHttp.req({url:params.getCDCOfPDC.url,params:{guid: VUE.$route.query.guid}}).then(res=>{
            this.icon = 'fa fa-exchange';
            res && Tree.setCurrentKey(res.CONTENT.ID);
          }).catch(err=>this.icon = 'fa fa-exchange');
        }
      },{
        icon: 'fa fa-exchange',
        color: '#ff8936',
        title: '选中所属PDF',
        hide(){ 
          if(VUE.$route.query.from){
            let from = JSON.parse(VUE.$route.query.from);
            if(from.query && from.query.type && from.query.type.toLowerCase() == 'pdf') return false;
          }
          return true;
        },
        event:()=>{
          Tree.setCurrentKey(JSON.parase(this.$route.query.form).query.link);
        }
      },{
        icon: 'fa fa-reply',
        color: 'orange',
        title: '返回',
        event: ()=>{
          JSON.stringify(this.from) != '{}' ? this.$router.push(this.from) : this.$router.go(-1);
        }
      },{
        icon: 'fa fa-save',
        color: 'blue',
        title: '保存',
        event: ()=>{
          this.saveData();
        }
      },{
        icon: 'fa fa-refresh',
        color: 'green',
        title: '重载',
        event: ()=>{
          this.getData();
        }
      // },{
      //   icon: 'fa fa-paint-brush',
      //   color: 'orange',
      //   title: '重置实例',
      //   event: ()=>{
      //     // this.saveData({});
      //   }
      }],
      toobarSize: 'mini',
      data: {},
      tree: new dc.Tree({
        hasCheckbox: false,
        clickNodeExpand: true,
        expandAll: true,
        currentNode: {},
        nodeClick: (data, node)=>{ 
          //当点击某些目录时
          if(['entityDefinition','jobDefinition','SUDFFolder','actionFolder','codeFolder'].includes(node.type)) return;
          if(node.type == 'sqlMapping'){
           //点击了SQL映射配置 
            VUE.$openDialog(new dc.Dialog({
              fullscreen: true,
              component: 'sqlComponent',
              showClose: false,
              data: {
                data: VUE.$store.state.PDCData.data.sqlMapping,
                type: 'reflect'
              }
            }))
          }else{
            data.currentNode = node;
            this.$route.query[params.attrName] = node.id;
          }
        }
      }),
      headForm: {},
      form: {},
      flow: new dc.NodeFlow(flowParams)
    }
  },
  computed:{
    from(){
      return this.$route.query.from ? JSON.parse(this.$route.query.from) : {};
    },
  },
  watch:{
    $route(to,from){
      if(to.path == '/pdcForm'){
        this.initData();
      }
    },
  },
  mounted(){
this.initData();
  },
  // created(){
  //   this.$nextTick(()=>{
  //     this.initData();
  //   });
  // },
  methods:{
    initData(){
      this.getData();
    },
    getData(){
      let data = {
        guid: this.$route.query.guid,
        cdcId: this.$route.query.link
      };
      this.loading = true;
      DCHttp.req({url:params.getForm.url, params:data, info:{error:'加载失败，请刷新重试'}}).then(res=>{
        if(res){
          this.setData(res);
          this.loading = false;
        }
      });
    },
    setData(res){
      this.$store.commit('setPDCForm',this);
      this.data = res.CONTENT;
      this.$store.commit('setPDCData',this.data); //将数据保存到Vuex中
      this.tree.setData(this.data.treeList);
      this.tree.currentNode = this.tree.data[0];
      if(this.data.data.MainJob){ //重写MainJob数据，并进行重置
        //获取树上的SUDF和action数据
        let arr = [{folder:'SUDFFolder',index:0,type:'udf'},{folder:'actionFolder',index:1,type:'action'}];
        arr.forEach(arrItem=>{
          let leaf = this.tree.data.find(item=>item.type == arrItem.folder);
          if(leaf){
            this.flow.listData[arrItem.index].nodes = leaf.children.map(item=>{
              const node = {
                id: item.id,
                label: item.label,
                img: arrItem.type,
                type: arrItem.type,
                animate: '',
              }
              if(this.data.data.MainJob.CONTENT.nodes[node.id]){
                this.data.data.MainJob.CONTENT.nodes[node.id].label = node.label;
              }
              return node
            })
          }
        })
        this.flow.getFlow = (Vue)=>{
          this.$nextTick(()=>{
            this.flow.getFlowFinished(this.flow.vue,this.data.data.MainJob);
          })
        }
        this.flow.refreshFlow(this.flow.vue);
      }
      this.headForm = new dc.Form({
        data: {adcName: this.data.adcName},
        structure: [this.data.adcNameStructure]
      });
      this.form = new dc.Form({
        size: 'mini',
        dialogEdit: true,
        data: this.data.data.featureType,
        structure: this.data.treeList[0].structure
      });
      const initJson = {where:[],select:[],orderBy:[],limit:-1,offset:-1,desc:""};
      this.form.structure.forEach(item=>{ 
        switch(item.name){
          case 'guid':
            this.form.data[item.name] || (this.form.data[item.name] = this.data.adcName.split('.').slice(-1)[0]+new Date().getTime());
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
            let tableDataAttrList = [];
            let attrDataTypeMap = {};
            //要素类型:0,实体定义:1,作业定义:3,动作:4,java代码:5,SQL映射6
            [0,1,4,5].forEach(i=>{
              if(i){
                this.data.treeList[i].children.forEach(r=>{
                  tableDataAttrList.push(r.id);
                  attrDataTypeMap[r.id] = {name:r.id, label:r.label.replace(/\(.*\)/,''),type:r.type, option:[{label:'',value:''}]}
                })
              }else{
                this.data.treeList[0].structure.forEach(r=>{
                  tableDataAttrList.push(r.name);
                  attrDataTypeMap[r.name] = {name:r.name, label:r.label,type:r.type, option:[{label:'',value:''}]}
                })
              }
            })
            item.nameList = tableDataAttrList;
            item.attrDataTypeMap = attrDataTypeMap;
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
            if(this.data.adcName.split('.').slice(-1)[0] == 'DATA_QUALITY_RULE_CONFIG'){
              this.form.setItemComponent(item.name,'selectmetaruleitem');
            }
            break;
          default:
            break;
        }
      })
    },
    getPDCSaveData(){
      return formatPDCToSave(objClone({
        data: this.data.data,
        flowData: {
          lines: this.flow.vue.lines,
          nodes: this.flow.vue.nodes,
          jumpLinks: this.flow.vue.jumpLinks,
          branchData: this.flow.vue.branchData
        }
      }))
    },
    saveData(data0){
      let data = {
        SAVE: !!this.$route.query.guid,
        data: this.data.data,
        flowData: {
          lines: this.flow.vue.lines,
          nodes: this.flow.vue.nodes,
          jumpLinks: this.flow.vue.jumpLinks,
          branchData: this.flow.vue.branchData
        }
      };
      console.log(data)
      this.loading = true;
      DCHttp.req({url:params.saveForm.url, params:data, method:'POST',info:{success:'保存成功',error:'保存失败'}}).then(res=>{
        if(res && res.STATE === 1){ //保存成功后刷新
          this.$route.query.guid == this.form.data.guid ? this.initData() : this.$router.replace({ query:merge(this.$route.query,{'guid':this.form.data.guid})});
        }
        this.loading = false;
      }).catch(err=>{
        this.loading = false;
      });
    },
  },
  components:{
    pdcTableEntity,
    pdcFileEntity,
    udfForm,
  }
}
</script>
<!-- scoped -->
<style  lang="scss">
.pdcForm .flowContainer{
  position: relative;
  overflow: auto;
  height: calc(100% - 30px);
}
.pdcForm{
  height: 100%;
  >.el-header{
    padding: 8px 20px;
    height: 43px !important;
  }
  >.el-container{
    border-top: 1px solid #ccc;
    height: 100%;
    >.el-aside{
      height: 100%;
      border-right: 1px solid #ccc;
    }
    >.el-main{
      height: 100%;
      padding: 0px;
      >header{
        padding: 5px 0px;
        text-align: center;
        background:#e9f1f6;
      }
      >.sectionLabel{
        margin-left: 30px; 
      }
      >.section{
        border: 1px solid #999;
        height: calc(100% - 145px);
        overflow: auto;
        margin: 12px;
      }
      >.section0{
        height: calc(100% - 33px);
        overflow: auto;
      }
    }
  }
}
</style>
