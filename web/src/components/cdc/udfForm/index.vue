<template>
	<div class="containerPadding">
    <el-button-group>
      <el-button :disabled="propData.flag=='PDC'" v-for="(btn,btnIndex) in btns" :key="btnIndex" v-if="!btn.hide" @click.prevent.stop="btnEvent(btn,btnIndex)" :title="btn.title"><i :class="btn.icon" :style="`color:${btn.color}`"></i>{{btn.label}}</el-button>
    </el-button-group>
    <div class="float" v-if="propData.flag=='PDC'"><timeAndTest></timeAndTest></div>
    <el-input v-model="udfData.label" :style="`margin-top:${propData.flag=='PDC' ? 0 : 10}px;margin-bottom:10px;`" type="textarea" :rows="5" resize="none" spellcheck="false" :readonly="true"></el-input>
    <dc-table :object="table"></dc-table>    
  </div>
</template>

<script>
import params from './params'

export default {
  name: 'udfForm',
  props: ['propData'],
  data () {
    return {
      btns: [{
        label: ' 选择UDF',
        color: 'orange',
        icon: 'fa fa-folder',
        event: ()=>{
          this.showUDFTree();
        }
      },{
        label: ' 新增UDF',
        color: 'green',
        icon: 'fa fa-plus',
        hide: this.propData.flag == 'PDC',
        event: ()=>{
          //新增UDF
          this.showNewUDFForm();
        }
      }],
      table: new dc.Table({
        align: "center",
        height: (this.propData.flag=='PDC' ? document.documentElement.clientHeight-315 : 180)+'px',
        hasBtn: false,
        editable: this.propData.flag == 'PDC' ? false : true,
        hasPage: false,
        cellAppend: [{
          prop: "value", 
          condition: this.propData.flag == 'PDC' ? "false" : "true", 
          component: "specialSelect"
        }]
      }),
      index: -1,
      udfData: {},
      data: {},
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  watch:{
    propData(){
      this.initData();
    }
  },
  methods: {
    initData(){
      this.udfData = this.propData.udfData;
      this.data = this.propData.data;
      //初始化表格
      if(this.propData.flag=='PDC'){
        this.table.setTableData(this.udfData.tableData,this.propData.tableHead);
      }else{
        this.index = this.data.tableHead.findIndex(item=>item.name==this.data.name);
        this.table.setTableData(this.udfData.tableData,this.data.tableHead[this.index].udf.tableHead);
        this.getTableOption();
      }
    },
    getTableOption(){
      const tableEntityStr = 'TableEntity';
      const selectIndex = this.table.tableHead.findIndex(item=>item.name=='value');
      let option = this.data.tableData.map(row=>{
        let type = row.elementType == 'staticValue' ? row.dataType : row.elementType;
        if(type == row.elementType && type.substr(0,tableEntityStr.length) == tableEntityStr){
          type = tableEntityStr;
        }
        return {
          value: row.name,
          label: this.table.tableHead[selectIndex].optionMap[type]
        }
      })
      this.table.tableHead[selectIndex].option.splice(this.table.tableHead[selectIndex].option.length, 0, ...option);
    },
    btnEvent(btn,btnIndex){
      btn.event.call(this);
    },
    showUDFTree(){
      DCHttp.req({url:params.getUdfTree.url,params:{type:'UDF'}}).then(res=>{
        if(res){
          // 弹窗显示树组件
          let tree = new dc.Tree({
            height: '300px',
            hasCheckbox: false,
            lazy: false,
            nodeClick: (data, node)=>{
              if(node.type == 'SUDF'){
                DCHttp.req({url:params.getUdf.url,params:{id:node.link}}).then(res0=>{
                  if(res0){
                    for(let i in res0.CONTENT){
                      Array.isArray(res0.CONTENT[i]) ? this.udfData[i].splice(0, this.udfData[i].length, ...res0.CONTENT[i]) : (this.udfData[i]=res0.CONTENT[i])
                    }
                    dialog.show = false;
                  }
                })
              }
            }
          });
          tree.set('data', res.CONTENT.treeList)
          res.CONTENT.treeList.length && tree.set('defaultExpandedKeys', [res.CONTENT.treeList[0].id]);
          let dialog = new dc.Dialog({
            title: '选择UDF',
            verticalCenter: true,
            component: 'dc-tree',
            data: {object:tree},
          });
          this.$openDialog(dialog);
        }
      });  
    },
    showNewUDFForm(){
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        top: '30px',
        title: '新建UDF',
        width: '700px',
        component: 'newUDFForm',
        data: {storyId: this.$route.query.storyId},
        hasBtn: true,
        btnGroup: [{
          text: '确定', 
          type: 'primary', 
          size: 'small', 
          click:(dialog, component)=>{ 
            component.saveData(dialog);
          }
        }]
      }))
    },
  },
}
</script>

<style scoped>
.float{
  float: right;
}
.containerPadding{
  padding: 10px;
}
</style>
