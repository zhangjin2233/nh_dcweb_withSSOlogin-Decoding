<template>
    <div>
        <div>
            <span>关联类型</span>
            <el-select v-model="linkType" size="mini">
                <el-option v-for="item in linkTypeOption" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
        </div>
        <div class="row">
            <span>数据集1</span>
            <el-select v-model="dataset1" size="mini" @change="datasetChange($event, 1)">
                <el-option v-for="item in datasetOption1" :key="item.value" :value="item.label" :label="item.label"></el-option>
            </el-select>
            <span>数据列1</span>
            <el-select v-model="row1" size="mini">
                <el-option v-for="item in rowOption1" :key="item.value" :value="item.label" :label="item.label"></el-option>
            </el-select>
        </div>
        <div class="row">
            <span>数据集2</span>
            <el-select v-model="dataset2" size="mini" @change="datasetChange($event, 2)">
                <el-option v-for="item in datasetOption2" :key="item.value" :value="item.label" :label="item.label"></el-option>
            </el-select>
            <span>数据列2</span>
            <el-select v-model="row2" size="mini">
                <el-option v-for="item in rowOption2" :key="item.value" :value="item.label" :label="item.label"></el-option>
            </el-select>
        </div>
        <div class="btns">
            <el-button type="primary" size="mini" @click="submit">确定</el-button>
            <el-button size="mini" @click="closeDialog">取消</el-button>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: [ 'propData' ],
    data() {
      return {
          linkTypeOption: [{
              value: 'join',
              label: '关联'
          }, {
              value: 'left join',
              label: '左关联'
          }, {
              value: 'right join',
              label: '右关联'
          }],
          dataset1: '',
          dataset2: '',
          row1: '',
          row2: '',
          datasetOption1: [],
          datasetOption2: [],
          rowOption1: [],
          rowOption2: [],
          linkType: 'join'
      }
    },
    created() {
        this.datasetOption1 = this.datasetOption2 = this.propData.option
        let arr = [1, 2]
        if(!this.propData.row) {
            let table = this.propData.option[0].table
            this.dataset1 = this.dataset2 = (table.type === 'source' ? table.name : table.title)
        } else {
            let row = this.propData.row
            this.linkType = row.row1
            this.dataset1 = row.row2
            this.dataset2 = row.row4
            this.row1 = row.row3
            this.row2 = row.row5
        }
        arr.forEach(item => {
            this.datasetChange(this['dataset' + item], item)
            !this.propData.row && (this['row' + item] = this['rowOption' + item][0].label)
        })

    },
    watch: {},
    computed: {},
    methods: { 
        closeDialog() {
            this.$closeDialog()
        },
        datasetChange(label, type) {
            let index = this.datasetOption1.findIndex(d => d.label === label)
            this['rowOption' + type] = this.datasetOption1[index].table.rows.map(item => {
                return {label: item.data[0].value, value: item.id}
            })
        },
        submit() {   
            let tableHead = this.propData.tableHead
            let row = {}
            let sort = ['linkType', 'dataset1', 'row1', 'dataset2', 'row2']
            tableHead.forEach((item, index) => {
                row[item.name] = this[sort[index]]
            })
            
            if(this.propData.row) {
                for(let key in row) {
                    this.propData.row[key] = row[key]
                }
            }else {
                this.propData.tableData.push(row)
            }
            this.$closeDialog()
        }
    },
}
</script>
<style scoped>
.btns{
    text-align: right;
}
.row{
    margin: 10px 0;
}
</style>