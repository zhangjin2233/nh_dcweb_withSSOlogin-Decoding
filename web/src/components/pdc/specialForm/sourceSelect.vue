<template>
  <el-input :value="content" :readonly="true" type="text" title="" :placeholder="item.placeholder" :style="item.style || form.inputStyle" class="pointer">
    <el-button slot="append" @click="openDialog()" :icon="item.extBtnIcon || form.extBtnIcon" title=""></el-button>
  </el-input>
</template>

<script>
import params from '../params.js'

export default {
  name: 'sourceSelect',
  props: ['propData'],
  data () {
    return {
      form: {},
      item: {},
      content: '',
      advFilterData: [],
      table: new dc.Table({
        hasPage: false,
        height: '300px',
        align: 'center',
        hasSearch: true,
        hasPage: true,
        sizeChange: (size)=>{ this.getTableData() },
        pageChange: (page)=>{ this.getTableData() },
        search: ()=>{ this.getTableData() },
        rowDbClick: (tableData, row, tableHead,tableObj)=>{ this.choseRow(row); },
        btnGroup: [{
          icon: "fa fa-refresh",
          color: "green",
          title: '刷新',
          click: (tableData)=>{
            this.getTableData();
          }
        },{
          icon: "fa fa-filter", 
          color: "green",
          title: '高级过滤器',
          click:(tableData,row,tableHead)=>{
            let advFilter = new dc.AdvFilter({
              attr:{
                option: tableHead.map(item=>{
                  return {
                    label: item.label,
                    value: item.name
                  }
                }),
                placeholder: '请选择',
              },
            });
            this.$openDialog(new dc.Dialog({
              component: 'dc-advFilter',
              data: { object: advFilter, data:this.advFilterData },
              hasBtn: true,
              width: "700px",
              btnAlign: 'right',
              btnGroup: [{
                text: '确定',
                type: 'primary',
                size: 'small',
                click:(dialog, component)=>{ 
                  this.getTableData(this.advFilterData[0]);
                  dialog.show = false
                }
              }, {
                text: '取消',
                type: 'default',
                size: 'small',
                click(dialog, component) {
                  dialog.show = false
                }
              }]
            }))
          }
        }]
      }),
    }
  },
  // watch:{
  //   propData(){
  //     this.initData();
  //   }
  // },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  methods:{
    initData(){
      this.form = this.propData.form;
      this.item = this.propData.item;
      this.table.tableHead.length || this.getTableData();
    },
    initcontent(){
      this.content = this.form.data[this.item.name];
      // let path = this.item.dcpath.split('.').slice(-1)[0];
      // let prefix = path.substring(0,path.indexOf('_'));
      // let item = this.table.tableData.find(item=>item.guid==this.form.data[this.item.name]);
      // this.table.tableData.find(item=>item.guid==this.form.data[this.item.name]);
      // this.content = item ? prefix+'_'+item.table_ : '';
    },
    getTableData(keywordData){
      let data = {
        // cdcId: this.$route.query.link,
        // guid: this.$route.query.guid,
        pdcCdcName: this.$store.state.PDCData.adcName.split('.').slice(-1)[0],
        pageNo: this.table.currentPage,
        pageSize: this.table.currentSize,
        keyword: keywordData ? keywordData : this.table.keyword
      };
      this.$store.state.PDCForm.loading = true; //整个PDC表单的加载
      DCHttp.req({url:params.getSourcePDCList.url, params:data}).then(res=>{
        this.$store.state.PDCForm.loading = false;
        res && this.table.setTableData(res.CONTENT.tableData, res.CONTENT.tableHead).set('total', res.CONTENT.total);
        this.content || this.initcontent();
      }).catch(e=>{this.$store.state.PDCForm.loading = false;});
    },
    choseRow(row,tableObj){
      this.$closeDialog();
      this.$set(this.form.data,this.item.name,row.guid)
      // this.form.data[this.item.name] = row.guid;  
      this.initcontent();
      let initJson = {where:[],select:[],orderBy:[],limit:-1,offset:-1,desc:""};
      this.form.data.extractJson_.splice(0,1,{json:objClone(initJson,this.form.data.extractJson_[0].json)});
      this.form.data.extractModeds_.splice(0,1,{json:objClone(initJson,this.form.data.extractModeds_[0].json)}); 
    },
    openDialog(){
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        top: '40px',
        title: this.item.label,
        data: {object: this.table },
        component: 'dc-table',
        width: '900px',
      }));
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
