<template>
    <div>
        <div v-for="(item, index) in content" :key="index">
            {{item.title}}
            <hr>
            <dc-buttons :object="item.buttons"></dc-buttons>
            <dc-table :object="item.table"></dc-table>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['data', 'updateRelat', 'tables'],
    data() {
      let tableHead = [{
          label: '目标表字段',
          type: 'singleEnum',
          option: [],
          name: 'left'
      }, {
          label: '来源字段（本输出集）',
          type: 'singleEnum',
          option: [],
          name: 'right'
      }]
      return {
          content: [{
                title: '更新数据列',
                buttons: new dc.Buttons({
                    data: [{
                        title: '新增行',
                        icon: 'fa fa-plus',
                        color: 'green',
                        click(table) {
                            table.tableData.push({
                                right: '',
                                left: ''
                            })
                        }
                    }, {
                        title: '删除行',
                        icon: 'fa fa-times',
                        color: 'red',
                        click(table) {
                            table.tableData.splice(table.tableData.indexOf(table.currentRow), 1)
                        }
                    }, ]
                }), 
                key: 'data',
                table: new dc.Table({
                    hasPage: false,
                    editable: true,
                    tableHead: Object.assign({}, tableHead)
                })
          }, {
                title: '更新关联数据列',
                buttons: new dc.Buttons({
                    data: [{
                        title: '新增行',
                        icon: 'fa fa-plus',
                        color: 'green',
                        click(table) {
                            table.tableData.push({
                                right: '',
                                left: ''
                            })
                        }
                    }, {
                        title: '删除行',
                        icon: 'fa fa-times',
                        color: 'red',
                        click(table) {
                            table.tableData.splice(table.tableData.indexOf(table.currentRow), 1)
                        }
                    }, ]
                }), 
                key: 'updateRelat',
                table: new dc.Table({
                    hasPage: false,
                    editable: true,
                    tableHead: Object.assign({}, tableHead)
                })
          }],

      }
    },
    created() {
        let tableHeight = (window.innerHeight - 240) / 2
        this.content.forEach(item => {
            item.table.height = tableHeight
            item.buttons.params = [item.table]
            item.table.tableData = this[item.key]
            item.table.tableHead[1].option = this.getOptions(this.tables).map(item => {
                return {
                    label: item.data[0].value,
                    value: this.viewType === 'business' ? item.data[0].value : item.data[2].value
                }
            })
            item.table.tableHead[0].option = this.getOptions(this.mappingtables, 'left').map(item => {
                return {
                    label: item.label,
                    value: item.label
                }
            })
        })
    },
    watch: {
        
    },
    methods: {
        getOptions(tables, type='right') {
            let index = 0
            if(type==='right') {
                let tableType = 'output'
                index = tables.findIndex(t => t.role === tableType)
                if(index > -1) {
                    return tables[index].rows
                }
            }else {
                index = tables.findIndex(t => t.streamType === 'output')
                if(index > -1) {
                    return tables[index].fields
                }
            }
            
            return []
        }
    },
    computed: {
        mappingtables() {
            return this.$store.state.PDCData.data.sqlMapping.viewMetas
        },
        viewType() {
            return this.$store.state.sqlViewType
        }
    }
}
</script>
<style scoped>
.submit{
    padding: 6px 12px;
    margin-left: 14px;
}
</style>