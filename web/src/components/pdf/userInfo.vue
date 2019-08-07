<template>
    <!-- <div class="userInfo">
        <el-popover
        :placement="config.placement"
        :title="config.title"
        :width="config.width"
        trigger="click">
        <dc-tree :object="tree" ></dc-tree>
        <span class="confirm" @click="changeUsers">确  定</span>
        <el-button slot="reference" :size="config.button.size" :type="config.button.type">{{config.button.text}}</el-button>
        </el-popover>
    </div> -->
    <div>
        <section class="lineMargin">
            <span>请选择用户</span>
            <div class="right">
                <el-button @click="refresh()" size="mini" type="success">刷新</el-button>
                <el-button @click="submit()" size="mini" type="primary">确定</el-button>
            </div>
        </section>
        <dc-tree :object="tree" ></dc-tree>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['selection', 'option','propData'],
    data() {
        let option = {
            title: '用户信息',
            placement: 'right-start',
            width: '200',
            trigger: 'click',
            button: {
                type: '',
                size: 'mini',
                text: '选择显示的用户标签'
            }
        }
        this.option && (option = Object.assign(option, this.option))
        return {
            userGroup: [],
            tree: new dc.Tree({
                hasCheckbox: true,
                key: 'id',
                load: true,
                loadType: ['group'],
                selectType: ['user'],
                selection: this.propData.selection || [],
                singleSelect: false,
                initData: () => {
                    this.getData().then(res => {
                        this.tree.data = this.formatData(res.CONTENT, 'group')
                    })
                },
                loadNode: (node, resolve) => {
                    this.getUsersData(node.data.id).then(res => {
                        resolve(this.formatData(res.CONTENT, 'user'))
                    }).catch(err => { resolve([]) })
                }
            }),
            config: option,
        }
    },
    created() {    
    },
    watch: {
        propData(){
            this.refreshTree();
        }
    },
    computed: {},
    methods: {
        refreshTree(){
            this.tree.selection.splice(0,this.tree.selection.length,...this.propData.selection);
        },
        submit(){
            // if(this.tree.selection.length){
                this.propData.selection.splice(0,this.propData.selection.length,...this.tree.selection);
                this.propData.flow.refreshNodeTips();
                this.propData.flow.vue.popoverShut();
            // }else{
            //     VUE.$alert('请先选择用户');
            // }
        },
        getData() {
            return new Promise((resolve, reject) => {
                DCHttp.req({
                    url: dcConfig.publicPath,
                    params: {
                        Class: 'com.leavay.tag.TagAction',
                        FUNC: 'listUserGroups'
                    }
                }).then(res => resolve(res)).catch(err => reject(err))
            })
        },
        getUsers() {
            return this.tree.selection
        },
        getUsersData(id) {
            return new Promise((resolve, reject) => {
                DCHttp.req({
                    url: dcConfig.publicPath,
                    params: {
                        Class: 'com.leavay.tag.TagAction',
                        FUNC: 'listUserInGroup',
                        [dcConfig.paramsKey]: {
                            groupName: id
                        }
                    }
                }).then(res => resolve(res)).catch(err => reject(err))
            })
        },
        formatData(data, type) {
            return data.map(item => {
                return {
                    label: item,
                    id: item,
                    children: [],
                    type,
                    isLeaf: type === 'user'
                }
            })
        },
        changeUsers() {
            this.$emit('submit', this.tree.selection)
        },
        refresh() {
            this.tree.refresh()
        }
        
    },
}
</script>
<style scoped>
.confirm{
    position: absolute;
    top: 10px;
    right: 8px;
    cursor: pointer;
    color: #999;
}
.confirm:hover{
    color: #409EFF;
    text-decoration: underline;
}
.right{
    float: right;
}
.lineMargin{
    margin-bottom: 10px;
}
</style>