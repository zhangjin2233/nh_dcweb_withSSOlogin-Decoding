<template>
  <el-select v-model="item.value" @change="selectChange()" :disabled="item.readOnly" :filterable="item.canInput" :allow-create="item.canInput">
    <el-option v-for="(option,optionIndex) in item.option" :key="optionIndex" :label="option.value" :value="option.value">
      <span style="float: left">{{option.value}}</span>
      <span style="float: left; color: #8492a6; font-size: 13px">&nbsp;&minus;&nbsp;{{option.label}}</span>
    </el-option>
  </el-select>
</template>

<script>

export default {
  name: 'udfSelect',
  props: ['data'],
  data () {
    return {
      item: {},
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    })
  },
  methods:{
    initData(){
      let index = this.data.tableHead.findIndex(item=>item.name==this.data.name);
      this.item = {
        value: this.data.row[this.data.name],
        readOnly: this.data.tableHead[index].readOnly,
        option: this.data.tableHead[index].option,
        canInput: true,
      }
    },
    selectChange(){
      this.data.row[this.data.name] = this.item.value;
    }
  },
  
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">


</style>
