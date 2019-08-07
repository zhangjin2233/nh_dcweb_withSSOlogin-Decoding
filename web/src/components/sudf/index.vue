<template>
    <div>
        <el-tabs v-model="tabValue" type="card" @tab-remove="tabRemove">
            <el-tab-pane
            :key="item.name"
            closable
            v-for="item in tabs"
            :label="item.name"
            :name="item.name">
                <span slot="label">
                    <i class="title-icon" style="background-image: url('static/images/tree/fbom.png')"></i>{{item.name}}</span>
                <el-button-group class="btns">
                    <el-button  
                    :icon="btn.icon" 
                    size="mini" 
                    v-for="(btn, index) in btns" 
                    :key="btn.flag" 
                    :title="btn.title"
                    @click="btnClick(index, item)"
                    :style="`color: ${btn.color}`"></el-button>
                </el-button-group>
                <div :style="`height: ${codeHeight}px`">
                    <codemirror 
                    :ref="item.raw.ID"
                    v-model="item.raw.code" 
                    :options="options"></codemirror>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { codemirror } from 'vue-codemirror-lite'
require('codemirror/mode/clike/clike.js')
require('codemirror/addon/hint/show-hint.js')
require('codemirror/addon/hint/show-hint.css')
require('codemirror/theme/eclipse.css')
export default {
    components: {
        codemirror
    },
    props: [],
    data() {
        let _this = this
        return {
            tabValue: '',
            autosize: {},
            code: '// Type away! \n',
            codeHeight: 400,
            options: {
                mode: 'text/x-java',
                selectOnLineNumbers: true,
                lineNumbers: true,
                theme: 'eclipse setHeight',
            },
            btns: [{
                icon: 'fa fa-refresh',
                flag: 'refresh',
                color: 'green',
                title: '刷新',
                click(item) {
                   _this.refreshItem(item)
                }
            }, {
                icon: 'fa fa-edit',
                flag: 'edit',
                color: 'blue',
                title: '编辑元数据',
                click(item) {
                    VUE.$openDialog(new dc.Dialog({
                        title: '编辑元数据',
                        width: '500px',
                        component: 'SUDFEditData',
                        data: {
                            data: item
                        }
                    }))
                }
            }, {
                icon: 'fa fa-save',
                flag: 'save',
                color: 'blue',
                title: '保存',
                click(item) {
                    let code = _this.getValue()
                    let name = code.slice(code.indexOf('class ') + 6, code.indexOf('{')).trim()
                    let data = Object.assign(item.raw, {
                        arguments: item.arguments,
                        name: name,
                        label: item.label,
                        desc: item.desc,
                        code: code
                    })
                    DCHttp.req({
                        url: dcConfig.publicPath,
                        params:{
                            Class: 'SUDFMgr',
                            FUNC: 'updateUDF',
                            [dcConfig.paramsKey]: {
                                udf: data
                            }
                        },
                        method: 'POST'
                    }).then(res => {
                        if(res) {
                            Tree.refreshTree(Tree.getParentNode(data.ID).data.link)
                            item.name = name
                            _this.tabValue = name
                            _this.refreshItem(item)
                        }
                    })
                }
            }]
        }
    },
    created() {
        if(this.tabs.length > 0) {
            this.tabValue = this.tabs[0].name
        }
        this.$addListener('fouceTab', (name) => {
            this.tabValue = name
        })
        this.codeHeight = window.innerHeight - 108
    },
    destroyed() {
        this.$cancelEvent('fouceTab')
    },
    watch: {
        tabsLength(val, oldVal) {
            if(val > 0) {
                if(val - 1 === oldVal) {
                    this.tabValue = this.tabs[val - 1].name
                }else{
                    let index = this.tabs.findIndex(t => t.name === this.tabValue)
                    if(index === -1) {
                        this.tabValue = this.tabs[val - 1].name
                    }
                }
            }
        }
    },
    computed: {
        tabs() {
            return this.$store.state.SUDFTabs
        },
        tabsLength() {
            return this.$store.state.SUDFTabs.length
        }
    },
    methods: {
        tabRemove(name) {
            this.$store.commit('handleSUDFTabs', {
                type: 'delete',
                val: name
            })
        },
        btnClick(index, item) {
           this.btns[index].click(item)
        },
        getValue(type='code') {
            let index = this.tabs.findIndex(s => s.name === this.tabValue)
            let currentTab = this.tabs[index]
            let editor = this.$refs[currentTab.raw.ID][0].editor
            if(type === 'code') {
                return editor.doc.getValue()
            }else if(type === 'editor') {
                return editor
            }else if(type === 'doc') {
                return editor.doc
            }else if(type === 'currentTab') {
                return currentTab
            }
            
        },
        refreshItem(item) {
            DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                    Class: 'SUDFMgr',
                    FUNC: 'getUDF',
                    [dcConfig.paramsKey]: {
                        udfId: item.raw.ID 
                    }
                }
            }).then(res => {
                if(res) {
                    item.raw = res.CONTENT
                    item.code = res.CONTENT.code
                    item.arguments = res.CONTENT.arguments,
                    item.label = res.CONTENT.label,
                    item.desc = res.CONTENT.desc
                }
            })
        }
    },
}
</script>
<style scoped>
.vue-codemirror-wrap{
    height: 100%;
}
.btns{
    margin-bottom: 6px;
    margin-left: 6px;
}
.title-icon{
    display: inline-block;
    width: 16px;
    height: 16px;
    position: relative;
    top: 3px;
    left: -4px;
}
</style>