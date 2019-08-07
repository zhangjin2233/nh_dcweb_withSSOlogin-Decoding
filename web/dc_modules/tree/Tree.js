import treeConfig from '@/config/tree.js'
class Tree {
    constructor(obj) {
        this.emptyText = treeConfig.emptyText
        this.key = treeConfig.key 
        this.lazy = treeConfig.lazy
        this.indent = treeConfig.indent
        this.expandAll = treeConfig.expandAll
        this.highlightCurrent = treeConfig.highlightCurrent
        this.defaultExpandedKeys = []
        this.hasCheckbox = treeConfig.hasCheckbox
        this.checkStrictly = treeConfig.checkStrictly
        this.selectType = []
        this.fontSize = treeConfig.fontSize
        this.props = Object.assign({}, treeConfig.props)
        this.hasContextmenu = true
        this.accordion = treeConfig.accordion
        this.singleSelect = true
        this.nodeSelection = null
        this.loadType = treeConfig.loadType
        this.selectLeafOnly = treeConfig.selectLeafOnly
        this.data = []
        this.selection = []
        this.height = ''
        this.vue = null
        this.currentNode = null
        this.contextmenu = new dc.Contextmenu({
            params: [this]
        })
        this.clickNodeExpand = false
        if(obj && typeof obj === 'object') {
            for(let key in obj) {
                this[key] = obj[key]
            }
        } 
    }
    nodeClick(data, node) {}
    loadNode(node, resolve) {}
    nodeContextmenu(event, data, node) {}
    initData(data) {}
    getNode(id) {
        return this.vue.$refs.tree.getNode(id)
    }
    getParentNode(id, filter) {
        let node = this.getNode(id)
        if(!node) {
            return {}
        }
        if(typeof filter === 'string') {
            while (node.data.type !== filter) {
                node = node.parent
            }
        }else if(filter && (typeof filter === 'object')) {
            function isMatch(node) {
                let keys = Object.keys(filter)
                let matchKeys = keys.filter(item => {
                    return node.data[item] === filter[item]
                })
                return !(matchKeys.length === keys.length)
            }
            while(isMatch(node)) {
                node = node.parent
            }
        }else {
            node = node.parent
        }
        return node
    }
    async setCurrentKey(id) {
        let addExpand = (id) => {
            if (this.getNode(id)) {
                let pData = this.getNode(id).parent.data
                if (this.defaultExpandedKeys.indexOf(pData[this.key]) === -1) {
                    this.defaultExpandedKeys.push(pData[this.key])
                    if (pData.type.toLowerCase() !== 'story') {
                        addExpand(pData[this.key])
                    }
                }
            }
        }
        try{ addExpand(id) }catch(err){}
        this.vue.$refs.tree.setCurrentKey(id)
    }
    refresh() {}
    hideMenu() {
        this.contextmenu.hideMenu()
        return this
    }
    reset(obj) {
        let newObj = Object.assign(new dc.Tree(), obj)
        for(let key in newObj) {
            this[key] = newObj[key]
        }
        return this
    }
    set(attra, val) {
        this[attra] = val
        return this
    }
    get(attra) {
        return this[attra]
    }
    setData(data) {
        this.data = data
        return this
    }
    setSelection(arr) {
        this.vue.$refs.tree.setCheckedKeys(arr)
    } 
}

export default Tree