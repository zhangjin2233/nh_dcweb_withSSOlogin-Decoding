<template>
    <div class="version">
        <div class="left" :style="{height: contentHeight  + 'px'}">
            <div class="btn-wrapper">
                <el-button 
                :class="{ btn: type !== 'export'}" 
                v-for="(btn, index) in config.btns" 
                size="mini" 
                :key="index" 
                @click="btnClick(btn)">{{btn.text}}</el-button>
            </div>
            <div :style="{width: leftWidth + 'px', height: 'calc(100% - 12px'}">
                <dc-tree :object="tree" key="0" id="versionLeftTree" v-if="type === 'export'"></dc-tree>
                <dc-tree :object="tree1" key="1" id="versionLeftTree" v-if="type === 'import'"></dc-tree>
            </div>
            <input type="file" @change="submitFile" v-show="false" ref="submitFile">
        </div>
        <div class="center" :class="{'notRight': type !== 'export'}" :style="{height: contentHeight + 'px'}">
            <dc-table :object="table" v-show="currentTable && table.tableHead.length" style="margin-top: 10px"></dc-table>
        </div>
        <div v-if="type=='export'" class="right" :style="{height: contentHeight  + 'px'}">
            <div class="btn-wrapper">
                <el-button size="mini" type="warning" @click="deleteItem">删除</el-button>
                <el-button size="mini" type="primary" @click="exportVersion">导出</el-button>
            </div>
            <div v-for="(item, key) in select" :key="key">
                <h3>{{item.title}}</h3>
                <ul>
                    <li 
                    v-for="(row, index) in  item.list" 
                    :key="index" 
                    @click="selectItem(key, row)"
                    :class="{activeItem: selection[key].includes(row)}">{{`${row.name}${ key === 'param' ? '(' + row.label + ')' : ''}`}}</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import config from './config.js'
export default {
    components: {},
    props: [],
    data() {
        let _this = this
        return {
            table: new dc.Table(),
            tree: new dc.Tree({
                loadType: ['story', 'ADC', 'ADCFolder', 'CDCFolder'],
                hasCheckbox: false,
                fontSize: '12px',
                initData() {
                    DCHttp.req({
                        url: '/api/catalog/nodeTree',
                        params: {
                            type: 'CDC'
                        }
                    }).then(res => {
                        this.data = res
                    })
                },
                loadNode(node, resolve) {
                    let type = node.data.type
                    let children = []
                    if(type === 'Story') {
                        DCHttp.req({
                            url: '/api/catalog/nodeTree',
                            params: {
                                type: 'CDC',
                                storyId: node.data.link
                            }
                        }).then(res => {
                            children = res[0].children
                            resolve(children)
                        }).catch(err => {
                            resolve([])
                        })  
                    }else {
                        DCHttp.req({
                            url: '/api/catalog/children', 
                            params: {
                                id: node.data.id,
                                type
                            }}
                        ).then(res => {
                            children = res.data
                            resolve(children)
                        }).catch(err => {
                            resolve([])
                        })
                    }
                    VUE.$nextTick(() => {
                        setTimeout(() => {
                            let treeDom = document.getElementById('versionLeftTree')
                            children.forEach(item => {
                                let dom = treeDom.querySelector(`[dataid="${item.id}"]`)
                                let width = dom.offsetLeft + dom.offsetWidth
                                _this.leftWidth < width && (_this.leftWidth = width)
                            })
                        }, 600)
                    })
                },
                nodeClick(tree, data) {
                    let type = data.type
                    if(type === 'CDC') {
                        _this.currentTable = 'pdc'
                        _this.table.keyword = ''
                        _this.currentLink = data.link
                        _this.changeLink = true
                        _this.getPDCData()
                    }
                }
            }),
            tree1: new dc.Tree({
                key: 'path',
                fontSize: '12px',
                singleSelect: false,
                selectLeafOnly: false,
                nodeClick(tree, data) {
                    let loading = _this.$loading()
                    let path = data.path
                    let nodes = DCHttp.req({
                        url: dcConfig.publicPath,
                        params: {
                            Class: 'WebVersionMgr',
                            FUNC: 'showDatas',
                            [dcConfig.paramsKey]: {
                                path
                            }
                        }
                    })
                    let hiddenAttr = DCHttp.req({
                        url: dcConfig.publicPath,
                        params: {
                            Class: 'CDCMgr',
                            FUNC: 'getHiddenAttr'
                        }
                    })
                    Promise.all([nodes, hiddenAttr]).then(res => {
                        try{
                            loading.close()
                            let data = res[0].CONTENT.datas
                            _this.table.tableData = data
                            let attrs = {}
                            res[0].CONTENT.meta && (_this.currentTable = res[0].CONTENT.meta.dataType)  
                            if(_this.currentTable === 'PDC') {
                                attrs = res[0].CONTENT.meta.info.attribute
                                _this.table.tableHead = attrs.reduce((a, b) => {
                                    if(!res[1].CONTENT.includes(b.name)) {
                                        a.push({
                                            name: b.name,
                                            label: b.label,
                                            type: b.dataType
                                        })
                                    }
                                    return a
                                }, [])
                            }else {
                                _this.table.tableHead = _this.getTableHead('Param')
                            }
                           
                            _this.currentLink = path
                            _this.changeLink = true
                            _this.setSelect()
                        }catch(err) { 
                            loading.close()
                        }
                    }).catch(err => {
                        loading.close()
                    })
                }
            }),
            config: {},
            select: {
                param: {
                    title: '已选择参数定义',
                    list: []
                }, 
                pdc: {
                    title: '已选择PDC',
                    list: []
                }
            },
            selection: {
                param: [],
                pdc: []
            },
            leftWidth: 200,
            contentHeight: window.innerHeight - 40,
            currentTable: '',
            currentLink: '',
            changeLink: true,
            changePage: false,
            importSelection: []
        }
    },
    created() {
        this.config = config[this.type](this)
        this.table.reset(this.config.table)
        window.onresize = () => {
            this.contentHeight = window.innerHeight - 40
            this.table.height = this.contentHeight - 90 + 'px'
        }
        if(this.type === 'import') {
            this.leftWidth = 450
        }
        this.table.height = this.contentHeight - 90 + 'px'
    },
    watch: {
        type(val) {
            if(this.$route.path !== '/version') return
            this.config = config[val](this)
            this.table.reset(this.config.table)
            if(val === 'import') {
                this.leftWidth = 450
            }else {
                this.leftWidth = 200
            }
        },
        currentTable(val) {
            if(val === 'param') {
                this.table.hasPage = false
            }else if(val === 'pdc') {
                this.table.hasPage = true
            }
        },
        currentLink(val) {
            this.table.currentSize = 25
            this.table.currentPage = 1
        }
    },
    computed: {
        type() {
            return this.$route.query.type
        }
    },
    methods: {
        btnClick(btn) {
            btn.click(this)
        },
        selectItem(key, item) {
            let index = this.selection[key].indexOf(item)
            if(index > -1) {
                this.selection[key].splice(index, 1)
            }else {
                this.selection[key].push(item)
            }
           
        },
        deleteItem() {
            for(let key in this.selection) {
                this.selection[key].forEach(item => {
                    let index = this.table.tableData.findIndex(row => {
                        if(key === 'param') {
                            return row.name === item.name
                        }else if(key === 'pdc') {
                            return row.guid === item.name
                        }
                    })
                    index > -1 && this.table.toggleRowSelection(this.table.tableData[index])
                    index = this.select[key].list.indexOf(item)
                    index > -1 && this.select[key].list.splice(index, 1)
                })
                this.selection[key] = []
            }
        },
        setSelect() {
            if(this.type === 'export') {
                this.select[this.currentTable].list.forEach(item => {
                    let row = this.table.tableData.find(r => { 
                        if(this.currentTable === 'pdc') return r.guid === item.name
                        if(this.currentTable === 'param') return r.name === item.name
                    })
                    this.$nextTick(() => {
                        row && this.table.toggleRowSelection(row, true)
                    })
                
                })
            }else {
                this.importSelection.forEach(item => {
                    let row = this.table.tableData.find(r => r.name === item.name)
                    this.$nextTick(() => {
                        row && this.table.toggleRowSelection(row, true)
                    })
                })
            }
           
        },
        exportVersion() {
            DCHttp.export({
                url: dcConfig.publicPath,
                method: 'post',
                params: {
                    Class: 'WebVersionMgr',
                    FUNC: 'exportVersion',
                    [dcConfig.paramsKey]: {
                        params: this.select.param.list.map(item => item.name),
                        PDCs: this.select.pdc.list.map(item => item.name)
                    },
                    action: 'DCView.callJavaFunc2',
                }
            })
        },
        submitFile() {
            let input = this.$refs.submitFile
            let form = new FormData()
            form.append('Class', dcConfig.Class.WebVersionMgr)
            form.append('FUNC', 'importVersionDatas')
            form.append('action', 'DCView.callJavaUploadFunc2')
            form.append('FILE', input.files[0])
            DCHttp.import(form).then(res => {
                let data = res.data.CONTENT
                this.tree1.data = data.treeList
                this.tree1.defaultExpandedKeys = [data.treeList[0].path]
                input.value = ''
            })
           
        },
        getTableHead(type) {
            let data = {
                Param: [{
                    "name": "name",
                    "type": "string",
                    "label": "名称"
                }, {
                    "name": "desc",
                    "type": "string",
                    "label": "描述"
                }, {
                    "name": "format",
                    "type": "string",
                    "label": "格式"
                }, {
                    "name": "method",
                    "type": "string",
                    "label": "方法"
                }, {
                    "name": "params",
                    "type": "string",
                    "label": "参数"
                }]
            }
            return data[type]
        },
        getPDCData() {
            let loading = this.$loading()
            DCHttp.req({
                url: '/api/PDC/list',
                params: {
                    cdcId: this.currentLink,
                    pageSize: this.table.currentSize,
                    pageNo: this.table.currentPage,
                    keyword: '',
                    orderBy: {}
                }
            }).then(res => {
                this.table.tableData = res.CONTENT.tableData
                this.table.tableHead = res.CONTENT.tableHead
                this.table.total = res.CONTENT.total
                this.setSelect()
                loading.close()
            }).catch(err => {
                loading.close()
            })
        }
    },
    destroyed() {
        window.onresize = null
    },
}
</script>
<style scoped>
.version{
    width: 100%;
    font-size: 0;
}
.version>div{
    display: inline-block;
    vertical-align: top;
    box-sizing: border-box;
    height: 100%;
}
.btn{
    padding: 4px 6px;
    margin-left: 4px
}
.left{
    width: 200px;
    padding-top: 12px;
    border-right: 1px solid #ccc;
    overflow: auto;
    box-sizing: border-box;
}
.center{
    width: calc(100% - 200px - 200px)
}
.right{
    width: 200px;
    border-left: 1px solid #ccc;
    padding-top: 10px;
    font-size: 12px;
}
.notRight{
    width: calc(100% - 200px);
    padding-top: 10px;
}
.btn-wrapper{
    text-align: center;
}
h3{
    text-align: center;
    border: 1px solid #ccc;
}
li{
    cursor: pointer;
    padding-right: 4px;
}
li:hover{
    color: fuchsia
}
.activeItem{
    color: red;
}
</style>