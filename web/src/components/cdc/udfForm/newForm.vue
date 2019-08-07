<template>
	<div v-loading="loading">
    <!-- 窗口顶部 -->
    <el-form :inline="true">
      <el-form-item v-for="(head,i) in structure.head" :key="i" :label="head.label">
        <el-input v-model="data.head[head.name]" :readonly="head.readOnly" size="mini"></el-input>
      </el-form-item>
    </el-form>
    <el-input v-model="data.desc" class="bottomMargin" :placeholder="structure.desc.placeholder" type="textarea" :rows="5" resize="none" spellcheck="false"></el-input>
    <dc-table :object="table"></dc-table>    
  </div>
</template>

<script>

export default {
  name: 'newUDFForm',
  props: ['propData'],
  data () {
    return {
      loading: false,
      structure: {
        head: [{
          label: '标签',
          name: 'label',
        },{
          label: '名称',
          name: 'name',
        }],
        desc: {
          placeholder: 'UDF描述'
        },
        tableHead: [{
          name: 'name',
          label: '参数',
          type: 'String'
        },{
          name: 'type',
          label: '类型',
          type: 'SingleEnum',
          option: [{
            label: '字符串',
            value: 'String'
          },{
            label: '整型',
            value: 'int'
          },{
            label: '长整型',
            value: 'long'
          },{
            label: '浮点型',
            value: 'double'
          },{
            label: '布尔类型',
            value: 'boolean',
          },{
            label: 'PDC',
            value: 'PDC'
          }]
        },{
          name: 'desc',
          label: '描述',
          type: 'String'
        }],
      },
      data: {
        head: {
          label: '',
          name: '',
        },
        desc: "",
        tableData: [],
      },
      table: new dc.Table({
        align: "center",
        height: '180px',
        hasBtn: true,
        editable: true,
        hasPage: false,
        btnGroup: [{
          icon: "fa fa-plus", 
          color: "green",
          title: '新增',
          click: (data, row, tableHead)=>{
            data.push(tableHead.newTableRow(data));
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
        cellAppend: [{
          prop: "type", 
          condition: "true", 
          component: "specialSelect"
        }]
      }),
    }
  },
  created(){
    this.$nextTick(()=>{
      this.table.setTableData(this.data.tableData,this.structure.tableHead);
    });
  },
  methods: {
    saveData(dialog){
      let params = {
        storyId: this.propData.storyId,
        label: this.data.head.label,
        name: this.data.head.name,
        desc: this.data.desc,
        tableData: this.data.tableData,
      }
      this.loading = true;
      DCHttp.req({url:'/api/CDC/addUDF', params:params, method:'POST',info:{success:'新增成功',error:'新增失败'}}).then(res=>{
        this.loading = false;
        res && (dialog.show=false);
      }).catch(err=>{ this.loading = false })
    }
  }
}
</script>

<style scoped>
.bottomMargin{
  margin-bottom: 10px; 
}
</style>
