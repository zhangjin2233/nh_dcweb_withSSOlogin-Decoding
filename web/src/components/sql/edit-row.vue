<template>
    <div class="edit-row">
        <el-row>
            <el-col :span="6">名称</el-col>
            <el-col :span="18">值</el-col>
        </el-row>
        <el-row class="row2">
            <el-col :span="6">字段名</el-col>
            <el-col :span="18">
                <el-input size="mini" v-model="value"></el-input>
            </el-col>
        </el-row>
        <el-row class="express">
            <el-col :span="6">表达式</el-col>
            <el-col :span="18">
                <el-input 
                type="textarea" 
                v-model="expression" 
                @input="textInput"
                ref="textInput" 
                :autosize="{ minRows: 8, maxRows: 8 }"
                @focus="showRows=false"></el-input>
            </el-col>
        </el-row>
        <div v-if="type=='target'">
            <el-row>
                <el-col :span="6">是否为主键</el-col>
                <el-col :span="18">
                    <el-select v-model="data.isPrimaryKey">
                        <el-option :value="true" label="true"></el-option>
                        <el-option :value="false" label="false"></el-option>
                    </el-select>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">可否为空</el-col>
                <el-col :span="18">
                    <el-select v-model="data.canBeNull">
                        <el-option :value="true" label="true"></el-option>
                        <el-option :value="false" label="false"></el-option>
                    </el-select>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">用户类型</el-col>
                <el-col :span="18">
                    <el-input v-model="data.userType"></el-input>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">默认值</el-col>
                <el-col :span="18">
                    <el-input v-model="data.defaultV"></el-input>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">扩展内容</el-col>
                <el-col :span="18">
                    <el-input v-model="data.extend"></el-input>
                </el-col>
            </el-row>
        </div>
        <div class="btns">
            <el-button type="primary" size="mini" @click="submitForm">确定</el-button>
            <el-button size="mini" @click="closeDialog">取消</el-button>
        </div>
        <div class="rows-list" v-if="showRows">
            <div 
            v-for="row in rowList" 
            :key="row.id" 
            class="row-item" 
            @click="selectRow(row)">
                <span>{{row.data[0].value}}</span>
                <span v-if="row.data[2]">({{row.data[2].value}})</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: [ 'propData'],
    data() {
        return {
            value: this.propData.row.data[0].value,
            expression: this.propData.row.expression,
            rowList: [],
            showRows: false,
            dotIndex: 0,
            currentRow: null,
            data: {
                isPrimaryKey: '',
                canBeNull: '',
                userType: '',
                defaultV: '',
                extend: ''
            }
        }
    },
    mounted() {
        for(let key in this.data) {
            this.data[key] = this.propData.row.raw[key]
        }
    },
    computed: {
        lines() {
            return this.$store.state.lines
        },
        type() {
            return this.$store.state.currentSqlTable.type
        }
    },
    methods: {
        closeDialog() {
            this.$closeDialog()
        },
        submitForm() {
            this.propData.row.data[0].value = this.value
            this.propData.row.expression = this.expression
            let outputArr = this.getOutput(this.expression)
            this.$store.commit('setLines', this.lines.filter(item => {
                if(item.output.row !== this.propData.row) {
                    return true
                }
                return false
            }))
            outputArr.forEach((outputInfo) => {
                let tableIndex = this.propData.tables.findIndex(t => t.name === outputInfo.tableName || t.title === outputInfo.tableName)
                if(tableIndex > -1) {
                    let table = this.propData.tables[tableIndex]
                    let rows = table.rows
                    let rowIndex = rows.findIndex(r => r.data[0].value === outputInfo.rowName)
                    if(rowIndex > -1) {
                        let row = rows[rowIndex]
                        let hasLines = false
                        this.$store.commit('addLine', {
                            output: {
                                row: row,
                                table: row.table
                            },
                            input: {
                                row: this.propData.row,
                                table: this.propData.row.table
                            }
                        })
                        this.$nextTick(() => {
                            this.$emitEvent('redraw')
                        })
                    }
                }
            })
            for(let key in this.data) {
                this.propData.row.raw[key] = this.data[key]
            }
            this.$closeDialog()
        },
        textInput(val) {
            this.showRows = false
            let textDom = this.$refs.textInput.$el.getElementsByTagName('textarea')[0]
            this.dotIndex = textDom.selectionStart - 1
            if(val[this.dotIndex] === '.') {
                let startIndex = 0
                val.slice(0, this.dotIndex).lastIndexOf(' ') > -1 && (startIndex = val.slice(0, this.dotIndex).lastIndexOf(' ') + 1)
                let tableName = val.slice(startIndex, this.dotIndex)
                let tables = this.propData.tables
                let tableIndex = tables.findIndex(t => {
                    if(t.type === 'source') {
                        return t.name === tableName
                    }else {
                        return t.title === tableName
                    }
                })
                if(tableIndex > -1) {
                    this.rowList = tables[tableIndex].rows
                    this.showRows = true
                }
            }
        },
        selectRow(row) {
            this.expression = this.expression.slice(0, this.dotIndex + 1) + `${row.data[0].value}` + this.expression.slice(this.dotIndex + 1, this.expression.length)
            this.showRows = false
        },
        getOutput(str) {
            let outputArr = []
            let getOutput = (str) => {
                let dotIndex = str.indexOf('.')
                let rowNameIndex = -1
                let tableNameIndex = 0
                let rowName = ''
                let tableName = ''
                if(dotIndex > -1) {
                    rowNameIndex = str.indexOf(' ', dotIndex + 1)
                    rowNameIndex = rowNameIndex > -1 ? rowNameIndex : str.length
                    str.lastIndexOf(' ', dotIndex) > -1 && (tableNameIndex = str.lastIndexOf(' ', dotIndex) + 1)
                }
                tableName = str.slice(tableNameIndex, dotIndex)
                rowName = str.slice(dotIndex + 1, rowNameIndex)
                return {
                    tableName: tableName,
                    rowName: rowName,
                }
            }
            while(str.indexOf('.') !== -1) {
                outputArr.push(getOutput(str))
                str = str.slice(str.indexOf('.') + 1)
            }
            return outputArr
        }
    },

}
</script>
<style scoped>
.edit-row{
    position: relative;
}
.el-col{
    text-align: center;
    border: 1px solid #ccc;
    height: 100%;
    line-height: 32px;
}
.btns{
    width: 100%;
    text-align: right;
    margin-top: 6px;
}
.express .el-col{
    line-height: 164px
}
.rows-list{
    position: absolute;
    width: 300px;
    right: 20px;
    top: 100px;
    border: 1px solid #ccc;
    height: 180px;
    overflow: hidden;
    background: #fff;
    padding: 6px;
    border-radius: 4px;
}
.row-item{
    cursor: pointer;
}
.row-item:hover{
    background: #eee;
}
</style>