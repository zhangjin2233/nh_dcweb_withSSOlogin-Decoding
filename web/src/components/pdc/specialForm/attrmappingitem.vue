<template>
  <el-input :value="content()" :readonly="true" type="text" title="" :placeholder="item.placeholder" :style="item.style || form.inputStyle" class="pointer">
    <el-button slot="append" @click="openDialog()" :icon="item.extBtnIcon || form.extBtnIcon" title=""></el-button>
  </el-input>
</template>

<script>

export default {
  name: 'attrmappingitem',
  props: ['propData'],
  data () {
    return {
      form: this.propData.form,
      item: this.propData.item,
      table: new dc.Table({
        editable: false,
        align: 'center',
        height: '400px',
        hasPage: false,
        hasBtn: false,
        cellAppend: [{
          prop: "tag", 
          condition: "true", 
          component: "specialSelectCell"
        }],
      })
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
  methods:{
    content(){
      let val = '';
      try{
        val = JSON.stringify(this.form.data[this.item.name])
      }catch(e){}
      return val;
    },
    initData(){
      this.form = this.propData.form;
      this.item = this.propData.item;
      this.form.data[this.item.name] || (this.form.data[this.item.name]=[]);
      let tableData = Object.keys(this.item.attrDataTypeMap).map(key=>{
        return {
          attr: key,
          label: this.item.attrDataTypeMap[key].label,
          tag: "",
        }
      })
      let tableHead = [{
        name: 'attr',
        label: '属性名称',
        type: 'String',
        readOnly: true,
      },{
        name: 'label',
        label: '中文标签',
        type: 'String',
        readOnly: true,
      },{
        name: 'tag',
        label: '要素标签',
        type: 'String',
        optionMap: this.item.attrDataTypeMap,
      }];
      this.table.setTableData(tableData,tableHead);
    },
    openDialog(){
      try{
        this.form.data[this.item.name].forEach(item=>{
          this.table.tableData.find(row=>row.attr==item.attr).tag = item.tag;
        })
      }catch(e){
        this.form.data[this.item.name] = [];
      }
      DCHttp.req({url:dcConfig.publicPath, params:{
        Class: 'com.leavay.dataquality.DataQualityAction',
        FUNC: 'listAllTags',
        [dcConfig.paramsKey]: {}
      }}).then(res=>{
        if(res){
          let allMap = res.CONTENT;
          Object.keys(allMap).forEach(key=>{
            Object.keys(this.item.attrDataTypeMap).forEach(itemKey=>{
              if(this.item.attrDataTypeMap[itemKey].type == key){
                this.item.attrDataTypeMap[itemKey].option.splice(1,this.item.attrDataTypeMap[itemKey].option.length,...allMap[key].map(label=>{return{label: label, value: label}}));
              }
            })
          })
          this.$openDialog(new dc.Dialog({
            verticalCenter: true,
            data: this.$cloneObject({object: this.table}),
            component: 'dc-table',
            width: '700px',
            top: '40px',
            title: this.item.label,
            hasBtn: true,
            btnGroup: [{
              text: '确定', 
              type: 'primary',
              click:(dialog, component)=>{ 
                this.form.data[this.item.name] = dialog.data.object.tableData.filter(item=>item.tag !== '').map(item=>{return { attr:item.attr, tag: item.tag }});
                dialog.show = false;
              }
            }]
          }));
        }
      })
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
