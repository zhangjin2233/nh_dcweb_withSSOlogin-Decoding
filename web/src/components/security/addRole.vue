<template>
    <div>
        <div style="margin-bottom: 20px">
            <span>名称：</span>
            <el-input style="width: 80%" size="mini" v-model="form.name"></el-input>
        </div>
        <div>
            <span style="vertical-align: top">描述：</span>
            <el-input style="width: 80%" size="mini" type="textarea" v-model="form.desc"></el-input>
        </div>
        <div>
            <div class="tree0">
                <dc-tree :object="tree0"></dc-tree>
            </div>
            <div class="tree1">
                <dc-tree :object="tree1"></dc-tree>
            </div>
        </div>
        <div class="btns">
            <el-button size="mini" @click="submit" type="primary">确定</el-button>
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
            form: {
                name: '',
                desc: ''
            },
            tree0: new dc.Tree({
                height: '300px',
                expandAll: true,
                lazy: false,
                singleSelect: false,
                selectionKey: 'name',
                key: 'name',
                initData(tree) {
                    DCHttp.req({
                        url: dcConfig.publicPath,
                        params: {
                            Class: 'PrivilegeMgr',
                            FUNC: 'getPrivilegeTree',
                        }
                    }).then(res => {
                        let data = res.CONTENT
                        data = VUE.$handleData(data, {key: 'privilegeList'}, (obj, key, value) => {
                            return {
                                children: obj[key]
                            }
                        })
                        data = VUE.$handleData(data, {key: 'nameText'}, (obj, key, value) => {
                            return {
                                label: obj[key]
                            }
                        })
                        tree.data = data
                        _this.propData.selection && (tree.selection = _this.propData.selection.privileges.map(item => item.name))
                    })
                }
            }),
            tree1: new dc.Tree({
                height: '300px',
                expandAll: true,
                lazy: false,
                singleSelect: false,
                initData(tree) {
                    DCHttp.req({
                        url: '/api/domain/all',
                    }).then(res => {
                        tree.data = res
                        _this.propData.selection && (tree.selection = _this.propData.selection.domain.map(item => item.ID))
                    })
                }
            })
        }
    },
    created() {
        if(this.propData.selection) {
            this.form = this.propData.form
            this.tree0.selection = this.propData.selection.privileges.map(item => item.name)
        }
    },
    watch: {},
    computed: {},
    methods: {
        submit() {
            let privilegeNodes = this.tree0.get('nodeSelection')
            let domainNodes = this.tree1.get('nodeSelection')
            let nodes = []
            if(privilegeNodes) {
                privilegeNodes.forEach(item => {
                    if(item.privilegeGroupID !== undefined) {
                        let newItem = Object.assign({}, item)
                        newItem.privilegeList = newItem.children
                        newItem.nameText = newItem.label
                        nodes.push(newItem)
                    }
                })
            }else {
                nodes = this.propData.selection.privileges
            }
            DCHttp.req({
                url: '/api/role/createAndUpdate',
                method: 'POST',
                params: {
                    privilege: nodes,
                    domain: domainNodes && domainNodes.map(item => parseInt(item.id)),
                    name: this.form.name,
                    desc: this.form.desc,
                    id: this.propData.row ? this.propData.row.ID : undefined
                }
            }).then(res => {
                VUE.$closeDialog()
                this.propData.table.initData(this.propData.table)
            })
        }
    },
}
</script>
<style scoped>
.tree0{
    width: 49%;
    float: left;
    border: 1px solid #ccc;
    margin: 8px 0;
}
.tree1{
    width: 49%;
    float: right;
    border: 1px solid #ccc;
    margin: 8px 0;
}
.btns{
    text-align: right;
}
</style>