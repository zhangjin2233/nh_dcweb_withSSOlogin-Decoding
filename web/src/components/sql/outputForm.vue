<template>
    <div>
        <el-tabs v-model="activeName">
            <el-tab-pane label="常规设置" name="first" id="tab-normal">
                <dc-form :object="form"></dc-form>
                <div>
                    来源表（FROM)：
                    <el-input type="textarea" placeholder="Please input FROM clause" v-model="form.data.from"></el-input>
                </div>
                <div>
                    查询条件（WHERE）：
                    <el-input type="textarea" v-model="form.data.where"></el-input>
                </div>
                <div>
                    <div class="col">
                        分组字段（GROUP BY）：
                        <el-input placeholder="输入分组字段（逗号分隔)" v-model="form.data.groupBy" ></el-input>
                        <el-input placeholder="输入HAVING条件" v-model="form.data.having"></el-input> 
                    </div>
                    <div class="col">
                        行数限制：
                        <el-input type="textarea" placeholder="输入行数限制，如：10或3" v-model="form.data.limit"></el-input>
                    </div>
                </div>
                <hr>
                <div>
                    排序（ORDER BY）：
                    <div>
                        <el-popover
                            placement="right-start"
                            width="120"
                            trigger="hover"
                            v-model="visible">
                            <div>
                                <div class="rowItem" v-for="(item, index) in rows" :key="index" @click="addOrderItem(item)">{{item.data[0].value}}</div>
                            </div>
                            <el-button slot="reference" size="mini" @click="visible = !visible" class="fa fa-plus"></el-button>
                        </el-popover>
                        <span v-for="(item, index) in orderBy" :key="index" class="orderItem">
                            <i class="fa fa-sort-asc" v-if="item.isAsc" @click="item.isAsc = !item.isAsc"></i>
                            <i class="fa fa-sort-desc" v-else  @click="item.isAsc = !item.isAsc"></i>
                            <span>{{item.viewName + '.' + item.fieldLabel}}</span>
                            <i class="fa fa-times" @click="deleteOrderItem(item)"></i>
                        </span>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="高级设置" name="second" id="tab-adv" v-if="propData.table.type === 'target'">
                <div>
                    <p>按条件清理脏数据（非“自动重建”时生效）</p>
                    <el-input type="textarea" v-model="form.data.clearSql" :autosize="{ minRows: 20, maxRows: 20}"></el-input>
                </div>
                <div>
                    <p>建表高级设置</p>
                    <el-input type="textarea" v-model="form.data.extendClause" :autosize="{ minRows: 20, maxRows: 20}"></el-input>
                </div>
            </el-tab-pane>
        </el-tabs>
        <hr>
        <div style="text-align: right">
            <el-button size="mini" @click="saveForm">确定</el-button>
            <el-button size="mini" @click="$closeDialog">取消</el-button>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['propData'],
    data() {
        return {
            activeName: 'first',
            form: new dc.Form({
                size: 'mini',
                structure: [],
                data: {
                    clearSql: '',
                    extendClause: '',
                    isDistinct: false,
                    isAutoRebuild: false,
                    table: '',
                    ds: '',
                    env: 'env_dc',
                    desc: '',
                    name: '',
                    schema: '',
                    groupBy: '',
                    from: '',
                    where: '',
                    orderBy: '',
                    limit: '',
                    having: ''
                }
            }),
            visible: false,
            orderBy: []
      }
    },
    created() {
        DCHttp.req({
            url: '/api/DBDataSource/list'
        }).then(res => {
            this.form.structure[3].option = res.tableData.map(item => {
                return {
                    label: item.name,
                    value: item.name
                }
            })
        })
        
        let data = this.propData.table.raw
        let type = this.propData.table.type
        let structure = {
            view: [{
                label: '名称',
                name: 'name',
                type: 'string'
            }, {
                label: '描述',
                name: 'desc',
                type: 'string'
            }, {
                label: '是否去重(DISTINCT)',
                name: 'isDistinct',
                type: 'boolean'
            }],
            target: [{
                label: '名称',
                name: 'name',
                type: 'string'
            }, {
                label: '描述',
                name: 'desc',
                type: 'string'
            }, {
                label: '运行环境',
                name: 'env',
                type: 'singleEnum',
                option: [{
                    value: 'env_dc',
                    label: 'env_dc'
                }],
                readOnly: true
            }, {
                label: '数据库',
                name: 'ds',
                type: 'singleEnum',
                option: []
            }, {
                label: 'schema',
                name: 'schema',
                type: 'string'
            }, {
                label: '表名（表达式）',
                name: 'table',
                type: 'string'
            }, {
                label: '自动重建',
                name: 'isAutoRebuild',
                type: 'singleEnum',
                option: [{
                    label: 'true',
                    value: true
                }, {
                    label: 'false',
                    value: false
                }]
            }, {
                label: '是否去重(DISTINCT)',
                name: 'isDistinct',
                type: 'boolean'
            }]
        }
        this.form.structure = structure[type]
        for(let key in data) {
            if(key in this.form.data) {
                this.form.data[key] = data[key]
            }
            if(key === 'orderBy') {
                this.orderBy = data.orderBy
            }
        }
        this.$nextTick(() => {
            document.getElementById('tab-adv') && (document.getElementById('tab-adv').style.height = document.getElementById('tab-normal').offsetHeight + 'px')
        })
    },
    watch: {},
    computed: {
        rows() {
            return this.propData.table.rows
        }
    },
    methods: {
        addOrder() {

        },
        deleteOrderItem(item) {
            this.orderBy.splice(this.orderBy.indexOf(item), 1)
        },
        addOrderItem(item) {
            this.orderBy.push({
                fieldName: item.data[2].value,
                viewName: this.propData.table.title,
                fieldLabel: item.data[0].value,
                isAsc: true,
                uuid: item.id
            })
        },
        saveForm() {
            let data = this.propData.table.raw
            for(let key in this.form.data) {
                if(key === 'orderBy') {
                    data.orderBy = this.orderBy
                }else {
                    data[key] = this.form.data[key]
                }
            }
            this.$closeDialog()
        }
    },
}
</script>
<style scoped>
.col{
    display: inline-block;
    width: 48%;
}
.fa-plus{
    color: green
}
.rowItem{
    cursor: pointer;
}
.rowItem:hover{
    color: blue;
}
.fa-times{
    color: red;
    cursor: pointer;
}
.fa-sort-asc, .fa-sort-desc{
    color: blue;
    cursor: pointer;
}
.orderItem{
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 12px;
}
</style>