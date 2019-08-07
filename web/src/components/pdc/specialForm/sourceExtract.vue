<template>
  <section v-loading="loading">
    <dc-form :object="form"></dc-form>
    <el-tabs type="border-card" class="sourceExtract">
      <el-tab-pane v-for="(tab,tabIndex) in tabs" :key="tabIndex" :label="tab.title">
        <div class="tableContainer" v-if="tab.type=='table'">
          <dc-table :object="tab.object"></dc-table>
        </div>
        <el-tabs v-else-if="tab.type=='tabs'" type="border-card">
          <el-tab-pane v-for="(subTab,subTabIndex) in tab.children" :key="subTabIndex" :label="subTab.title">
            <div class="tableContainer">
              <dc-table v-if="subTab.type=='table'" :object="subTab.object"></dc-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>
<script>

const formStructure = [{
  label: '数据数量',
  name: 'limit',
  type: 'int',
},{
  label: '起始位置',
  name: 'offset',
  type: 'int'
},{
  label: '描述',
  name: 'desc',
  type: 'text',
  style: 'width:560px'
}];

const otherSettingWhereTableHead = [{
  label: '与关系',
  name: 'isAndWithLast',
  type: 'Boolean',
},{
  label: '字段中文名',
  name: 'label',
  type: 'String',
},{
  label: '字段名',
  name: 'first',
  type: 'String',
  option: [],
},{
  label: '判断方式',
  name: 'judgeType',
  type: 'SingleEnum',
  option: [],
},{
  label: '第二值类型',
  name: 'isManulSec',
  type: 'SingleEnum',
  option: [{
    label: '手工值',
    value: true,
  },{
    label: '系统变量',
    value: false
  }]
},{
  label: '第二值',
  name: 'second',
  // type: 'text',
  type: 'String',
  option: [],
}];

const tabHeight = 200;
const tabTitleHeight = 20;

export default {
  name: 'sourceExtract',
  props: ['propData'],
  data () {
    return {
      loading: false,
      table: new dc.Table({
        align: 'center',
        height: '350px',
        hasPage: false,
        hasColSelect: true,
      }),
      tabs: [{
        title: '选择列',
        type: 'table',
        object: new dc.Table({
          height: tabHeight+'px',
          hasPage: false,
          align: 'center',
          btnGroup: [{
            icon: 'fa fa-plus',
            color: 'green',
            title: '新增',
            click:(tableData,row,tableHead)=>{
              this.addSelectColumnRow(tableData,row,tableHead);
            }
          },{
            icon: 'fa fa-remove',
            color: 'red',
            title: '删除',
            needRow: true,
            click:(tableData,row)=>{
              let index = tableData.findIndex(item=>item==row);
              tableData.splice(index,1);
            }
          },{
            icon: "fa fa-level-up", 
            color: "green",
            title: '上移',
            needRow: true,
            click(tableData,row){
              tableData.splice(0,tableData.length, ...tableData.swap(row,-1));
            }
          },{
            icon: "fa fa-level-down", 
            color: "green",
            title: '下移',
            needRow: true,
            click(tableData,row){
              tableData.splice(0,tableData.length, ...tableData.swap(row,1));
            }
          }],
        })
      },{
        title: '其他设置',
        type: 'tabs',
        children: [{
          title: 'where',
          type: 'table',
          object: new dc.Table({
            align: 'center',
            height: tabHeight-tabTitleHeight+'px',
            hasPage: false,
            rowDbClick:(tableData, row, tableHead)=>{ this.editRow(true,tableData,row,tableHead) },
            btnGroup: [{
              icon: 'fa fa-plus',
              color: 'green',
              title: '新增',
              click:(tableData,row,tableHead)=>{
                this.editRow(false,tableData,row,tableHead)
              }
            },{
              icon: 'fa fa-remove',
              color: 'red',
              title: '删除',
              needRow: true,
              click:(tableData,row)=>{
                let index = tableData.findIndex(item=>item==row);
                tableData.splice(index,1);
              }
            },{
              icon: 'fa fa-edit',
              color: 'blue',
              title: '编辑',
              needRow: true,
              click:(tableData,row)=>{
                this.editRow(true,tableData,row,tableHead)
              }
            },{
              icon: "fa fa-level-up", 
              color: "green",
              title: '上移',
              needRow: true,
              click(tableData,row){
                tableData.splice(0,tableData.length, ...tableData.swap(row,-1));
              }
            },{
              icon: "fa fa-level-down", 
              color: "green",
              title: '下移',
              needRow: true,
              click(tableData,row){
                tableData.splice(0,tableData.length, ...tableData.swap(row,1));
              }
            }],
          })
        },{
          title: 'orderBy',
          type: 'table',
          object: new dc.Table({
            height: tabHeight-tabTitleHeight+'px',
            hasPage: false,
            editable: true,
            align: 'center',
            btnGroup: [{
              icon: 'fa fa-plus',
              color: 'green',
              title: '新增',
              click:(tableData,row,tableHead)=>{
                this.addOrderByRow(tableData,tableHead);
              }
            },{
              icon: 'fa fa-remove',
              color: 'red',
              title: '删除',
              needRow: true,
              click:(tableData,row)=>{
                let index = tableData.findIndex(item=>item==row);
                tableData.splice(index,1);
              }
            },{
              icon: "fa fa-level-up", 
              color: "green",
              title: '上移',
              needRow: true,
              click(tableData,row){
                tableData.splice(0,tableData.length, ...tableData.swap(row,-1));
              }
            },{
              icon: "fa fa-level-down", 
              color: "green",
              title: '下移',
              needRow: true,
              click(tableData,row){
                tableData.splice(0,tableData.length, ...tableData.swap(row,1));
              }
            }],
          })
        }]
      }],
      form: new dc.Form({
        inline: true,
        labelWidth: '70px',
      })
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  methods:{
    initData(){
      this.loading = true;
      let reqs = this.propData.reqs.map(item=>{ return DCHttp.req({url:item.url,params:item.params})});
      Promise.all(reqs).then(res=>{ 
        if(res && !res.some(item=>{ return item.ERR_MSG })){
          this.loading = false;
          this.getResOperate(res);
        }else{
          this.$closeDialog();
        }
      }).catch(err=>{ this.$closeDialog() });
    },
    getResOperate(res){
      let formData = objClone(this.propData.data[0].json,{},formStructure.map(item=>{return item.name}),true);
      this.form.setForm(formData,formStructure);
      // 构造tabs的数据
      this.table.setTableData(res[0].CONTENT.tableData,res[0].CONTENT.tableHead);
      let tableData = this.table.tableData.filter(item=>this.propData.data[0].json.select.includes(item.ColName));
      this.tabs[0].object.setTableData(objClone(tableData),this.table.tableHead);
      if(this.propData.flag){
        let whereTableData = this.propData.data[0].json.where.map(item=>{
          return Object.assign({ label: this.table.tableData.find(item0=>item0.name==item.first).ColComment },item);
        })
        otherSettingWhereTableHead[2].option.splice(0,otherSettingWhereTableHead[2].option.length,...this.table.tableData.map(item=>{return {value:item.ColName, label:item.ColComment} }));
        otherSettingWhereTableHead[3].option.splice(0,otherSettingWhereTableHead[3].option.length,...res[1].CONTENT.option);
        otherSettingWhereTableHead[5].option.splice(0,otherSettingWhereTableHead[5].option.length,...res[2].CONTENT.option);
        this.tabs[1].children[0].object.setTableData(whereTableData,otherSettingWhereTableHead);
        let orderByTableHead = objClone(this.table.tableHead);
        orderByTableHead.push({ label: '是否降序', name: 'right', type: 'Boolean', readOnly: false});
        let orderByTableData = this.propData.data[0].json.orderBy.map(item=>{
          let item0 = this.table.tableData.find(item0=>item0.ColName == item.left);
          return {
            label: item0.ColComment,
            name: item.left,
            type: item0.DataType,
            right: item.right
          }
        });
        this.tabs[1].children[1].object.setTableData(orderByTableData,orderByTableHead);
      }else{
        this.tabs.splice(1,1);
      }
    },
    addSelectColumnRow(tableData,row,tableHead){
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        component: 'dc-table',
        data: {object: this.table},
        width: '700px',
        top: '40px',
        hasBtn: true,
        btnGroup: [{
          text: '确定',
          type: 'primary',
          click:(dialog, component)=>{
            this.table.selection.forEach(item=>{
              tableData.push(item);
            })
            dialog.show = false;
          }
        }, {
          text: '取消',
          click(dialog, component) {
            dialog.show = false
          }
        }]
      }))
    },
    addOrderByRow(tableData,tableHead){
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        component: 'dc-table',
        data: {object: this.table},
        width: '700px',
        top: '40px',
        hasBtn: true,
        btnGroup: [{
          text: '确定',
          type: 'primary',
          click:(dialog, component)=>{
            this.table.selection.forEach(item=>{
              let newRow = objClone(item,{right:false});
              tableData.push(newRow);
            })
            dialog.show = false;
          }
        }, {
          text: '取消',
          click(dialog, component) {
            dialog.show = false
          }
        }]
      }))
    },
    getNewFormItem(newItemStructure){
      return {
        isAndWithLast: false,
        first: this.table.tableData[0].ColName,
        isManulSec: false,
        second: newItemStructure.find(item=>item.name=='second').option[0].value,
        judgeType: newItemStructure.find(item=>item.name=='judgeType').option[0].value,
        label: newItemStructure.find(item=>item.name=='first').option[0].label,
      }
    },
    getNewItemStructure(flag,tableData,row,tableHead){
      let newItemStructure = objClone(otherSettingWhereTableHead,[]);
      newItemStructure[2] = objClone({
        label: '判断字段',
        type: 'SingleEnum',
        change: (form,item)=>{
          form.data.label = item.option.find(item0=>item0.value==form.data[item.name]).label;
        }
      },newItemStructure[2]);
      newItemStructure[4] = objClone({
        label: '手工值',
        type: 'Boolean',
        change: (form,item)=>{
          if(form.data[item.name]){
            form.structure[5].label = '手工值';
            form.structure[5].type = 'text';
            form.data.second = '';
          }else{
            form.structure[5].label = '系统变量';
            form.structure[5].type = 'SingleEnum';
            form.data.second = form.structure[5].option[0].value;
          }
        }
      },newItemStructure[4]);
      newItemStructure[5] = objClone({
        label: '系统变量',
        type: 'SingleEnum',
      },newItemStructure[5]);
      return newItemStructure;
    },
    editRow(flag,tableData,row,tableHead){
      let newItemStructure = this.getNewItemStructure(flag,tableData,row,tableHead);
      let form = new dc.Form({
        structure: newItemStructure,
        data: flag ? row : this.getNewFormItem(newItemStructure),
        hiddenRows: ['label'],
      })
      this.$openDialog(new dc.Dialog({
        verticalCenter: true,
        component: 'dc-form',
        data: { object: form },
        width: '500px',
        top: '40px',
        hasBtn: true,
        btnGroup: [{
          text: '确定',
          type: 'primary',
          click:(dialog, component)=>{
            if(flag){
              let index = tableData.findIndex(item=>item==row);
              tableData.splice(index,1,form.data);
            }else{
              tableData.push(form.data);
            }
            dialog.show = false;
          }
        }, {
          text: '取消',
          click(dialog, component) {
            dialog.show = false
          }
        }]
      }))
    }
  }
}
</script>
<!-- scoped -->
<style lang="scss" scoped>
.tableContainer{
  padding: 10px;
}
</style>

<style lang="scss">
.sourceExtract .el-tabs__content{ 
  margin: 0px;
  padding: 0px;
}
</style>
