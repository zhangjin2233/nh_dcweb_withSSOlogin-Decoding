<template>
    <div>
        <div class="content">
            <div class="left">
                <dc-tree :object="tree"></dc-tree>
            </div>
            <div class="right">
                <dc-table :object="table"></dc-table>
            </div>
        </div>
        
        <div class="btns">
            <el-button size="mini" type="primary" @click="submit">确定</el-button>
            <el-button size="mini" @click="$closeDialog">取消</el-button>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['propData'],
    data() {
        let _this = this
        return {
            table: new dc.Table({
                hasPage: false,
                hasBtn: false,
                hasColSelect: true,
                selectable() {
                    return false
                },
                tableHead: [{
                    name: 'name',
                    type: 'string',
                    label: '用户名'
                }, {
                    name: 'fullName',
                    type: 'string',
                    label: '姓名'
                }]
            }),
            tree: new dc.Tree({
                height: '300px',
                expandAll: true,
                lazy: false,
                hasCheckbox: false,
                initData(tree) {
                    setTimeout(() => {
                        tree.data = [Tree.data[1].children[0]]
                        if(!tree.data[0].children.length) {
                            DCHttp.req({
                                url: '/api/catalog/children',
                                params: {
                                    id: 'userFolder',
                                    type: 'userfolder'
                                }
                            }).then(res => {
                                VUE.$nextTick(() => {
                                    res.data.forEach(item => {
                                        tree.vue.$refs.tree.append(item, tree.data[0])
                                    })
                                    
                                })
                            })
                        }
                    }, 10)  
                },
                nodeClick(data, node) {
                    if(node.type !== 'user') return
                    DCHttp.req({
                        url: '/api/user/listUserInGroup',
                        params: {
                            id: node.link
                        }
                    }).then(res => {
                        _this.table.tableData = res.tableData
                        _this.table.selectionInit = {
                            key: 'id',
                            value: _this.selectionInit.value.filter(item => {
                                let index = res.tableData.findIndex(t => t.id === item)
                                return index > -1
                            })
                        }
                    })
                }
            }),
            selectionInit: {}
        }
    },
    created() {
        DCHttp.req({
            url: dcConfig.publicPath,
            params: {
                Class: 'RoleMgr',
                FUNC: 'listUserInRole',
                [dcConfig.paramsKey]: {
                    roleId: this.propData.row.ID
                }
            }
        }).then(res => {
            this.table.tableData = res.CONTENT
            let init = {
                key: 'id',
                value: res.CONTENT.map(item => item.id)
            }
            this.table.selectionInit = init
            this.selectionInit = JSON.parse(JSON.stringify(init))

        })
    },
    watch: {},
    computed: {},
    methods: {
        submit() {

        }
    },
}
</script>
<style scoped>
.content{
    margin-bottom: 10px;
    overflow: hidden;
}
.left{
    float: left;
    width: 36%;
    border: 1px solid #ccc;
    border-radius: 4px;
}
.right{
    float: right;
    width: 62%;
    height: 300px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
.btns{
    text-align: right;
    margin-top: 20px;
}
</style>