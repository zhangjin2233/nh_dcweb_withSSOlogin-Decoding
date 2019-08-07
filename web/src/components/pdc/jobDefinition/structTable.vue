<template>
  <dc-table :object="table"></dc-table>
</template>

<script>
export default {
  name: 'structTable',
  props: ['propData'],
  data () {
    return {
      table: this.propData.table
    }
  },
  methods:{
    btnClick(btn){
      btn.click && btn.click(this.table.tableData, this.table.currentRow, this.table.tableHead);
    },
    rowClick(row){
      this.table.currentRow = row;
    },
  }
}
</script>

<style lang="scss" scoped>
.lineMargin{
  margin-bottom: 10px;
}
</style>

