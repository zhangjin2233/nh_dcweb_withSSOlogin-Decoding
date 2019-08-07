
export default {
    name: 'tree',
    data () {
        return {
            contextmenu: null,
            checkedNodes: [],
            tree: null
        }
    },
    props: [ 'object', 'propData' ],
    created() {
        if(this.propData) {
            this.tree = this.propData.object
        }else{
            this.tree = this.object
        }
        this.tree.vue = this
        this.tree.refresh = this.initData
        this.initData()
        this.$nextTick(() => {
            if(this.tree.hasCheckbox && this.tree.selection && this.tree.selection.length > 0) {
                let val = this.tree.selection
                this.$refs.tree.setCheckedKeys(val)
            }
        })
    },
    methods: {
        initData() {
            this.tree.initData && this.tree.initData(this.tree)
        },
        nodeClick(data, node) {
            this.tree.nodeClick && this.tree.nodeClick(this.tree, data, node)
        },
        nodeContextmenu(event, data, node) {
            this.tree.currentNode = node
            this.tree.nodeContextmenu && this.tree.nodeContextmenu(event, data, node)
        },
        checkChange(data, check) {
            this.tree.checkChange && this.tree.checkChange(this, data, check)
        },
        loadNode(node, resolve) {
            let loadType = this.tree.loadType
            let arr = loadType.map(item => {
                return item.toLowerCase()
            })
            let type = node.data.type && node.data.type.toLowerCase()
            if(!arr.includes(type)) {
                if(node.data && node.data.children) {
                    resolve(node.data.children)
                }
            }else{
                this.tree.loadNode && this.tree.loadNode(node, resolve, this)
            }
        },
        checkChange(data, checked) {
            let selectType = this.tree.selectType
            if(this.tree.singleSelect) {
                if(checked) {
                    if(selectType.length === 0  || selectType.indexOf(data.type) !== -1) {
                        this.tree.selection = [data[this.tree.key]]
                    }else {
                        this.tree.selection = []
                    }
                    
                }else{
                    let arr = this.$refs.tree.getCheckedKeys()
                    arr.length === 0 &&  (this.tree.selection = [])
                }
            }else {
                this.checkedNodes = this.$refs.tree.getCheckedNodes(this.tree.selectLeafOnly)
            }
        },
        nodeExpand(data) {
            let tree = this.tree
            !tree.defaultExpandedKeys.includes(data[tree.key]) && tree.defaultExpandedKeys.push(data[tree.key])
            tree.contextmenu && tree.contextmenu.hideMenu() 
          
        },
        nodeCollapse(data, node) {
            let tree = this.tree
            let collapseNodes = (node) => {
                let index = tree.defaultExpandedKeys.indexOf(node.data[tree.key])
                index !== -1 && tree.defaultExpandedKeys.splice(index, 1)
                node.childNodes.length > 0 && node.childNodes.forEach(item => {
                    collapseNodes(item)
                }) 
            }
            collapseNodes(node)
            if(tree.getNode) {
                tree.defaultExpandedKeys = tree.defaultExpandedKeys.filter(item => {
                    return tree.getNode(item) 
                })
            }
            this.tree.contextmenu && this.tree.contextmenu.hideMenu()
        }
    },
    computed: {
        selection() {
            if(this.object) {
                return this.object.selection
            }else {
                return this.propData.object.selection
            }
        }
    },
    watch: {
        checkedNodes: {
            deep: true,
            handler(val, oldVal) {
                // if(val.length > oldVal.length) {
                    if(!this.tree.singleSelect) {
                        let arr = val.filter(item => {
                            if(this.tree.selectType.length === 0 || this.tree.selectType.indexOf(item.type) !== -1) {
                                return true
                            }
                                return false
                        })
                        this.tree.selection = []
                        arr.forEach(item => {
                            this.tree.selection.push(item[this.tree.key])
                        })   
                    }
                   
                // }else if(val.length < oldVal.length){
                //     this.tree.selection = val
                // }
            }
        },
        selection(val) {
            this.$refs.tree.setCheckedKeys(val)
            this.$nextTick(() => {
                let nodes = this.$refs.tree.getCheckedNodes()
                this.tree.nodeSelection = nodes.filter(item => {
                    if (this.tree.selectType.length === 0 || this.tree.selectType.indexOf(item.type) !== -1) {
                        return true
                    }
                    return false
                })
            })
            
        }
    }
}