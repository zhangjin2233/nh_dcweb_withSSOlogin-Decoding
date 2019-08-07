<template>
  <el-select v-model="data.row[data.name]" :filterable="true" :allow-create="true" class="fullWidth">
    <el-option v-for="(option,optionIndex) in itemOption" :key="optionIndex" :label="option.label" :value="option.label"></el-option>
  </el-select> 
</template>

<script>

export default {
  name: 'tableExtBtn',
  props: ['data'],
  data () {
    return {
      itemOption: this.data.tableHead[this.data.tableHead.findIndex(item=>item.name==this.data.name)].optionMap[this.data.row.attr].option
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.fullWidth{
  width: 100%;
}
</style>

