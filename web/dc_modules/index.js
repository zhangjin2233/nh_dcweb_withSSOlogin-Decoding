import ContextMenu from './contextMenu/index.vue'
const Dialog = () => import('./dialog/index.vue')
const Dialogset = () => import('./dialog/set.vue')
const Tab = () => import('./tab/index.vue')
const Table = () => import('./table/index.vue')
const Tree = () => import('./tree/index.vue')
const ImportFile = () => import('./importFile/index.vue')
const Nav = () => import('./nav/index.vue')
const Frame = () => import('./frame/index.vue')
const FrameSet = () => import('./frame/set.vue')
const Form = () => import('./form/index.vue')
const Flow = () => import('./flow/index.vue')
const StaticFlow = () => import('./flow/staticFlow.vue')
const Popover = () => import('./popover/index.vue')
const AdvFilter = () => import('./advFilter/index.vue')
const QuickMultiSelect = () => import ('./quickMultiSelect/index.vue')
const Buttons = () => import('./buttons/index.vue')
const Grid = () => import('./grid/index.vue')

import TableClass from './table/Table'
import Dialogsetclass from './dialog/DialogSet'
import DialogClass from './dialog/Dialog'
import TabsClass from './tab/Tabs'
import ContextmenuClass from './contextMenu/Contextmenu'
import ImportFileClass from './importFile/ImportFile'
import TreeClass from './tree/Tree'
import NavClass from './nav/Nav'
import FrameClass from './frame/Frame'
import FrameSetClass from './frame/FrameSet'
import PopoverClass from './popover/Popover'
import FormClass from './form/Form'
import FlowClass from './flow/Flow'
import NodeFlowClass from './flow/NodeFlow'
import ReportFlowClass from './flow/ReportFlow'
import objClone from './js/base/objClone'
import './js/base/newTableRow.js'
import AdvFilterClass from './advFilter/AdvFilter'
import DataSet from './dataSet/index.vue'
import Attach from './attach/index.vue'
import nodeTree from './flow/nodeTree'
import ButtonsClass from './buttons/Buttons.js'

import components from '@/config/components.js'
import Element from 'element-ui'
import localforage from 'localforage'

window.localforage = localforage;

const ModuleComponents = {}
ModuleComponents.install = (Vue) => {
    Vue.component('dc-quick-multiSelect', QuickMultiSelect)
    Vue.component('dc-attach', Attach)
    Vue.component('dc-dataSet', DataSet)
    Vue.component('dc-advFilter', AdvFilter)
    Vue.component('dc-contextmenu', ContextMenu)
    Vue.component('dc-dialog', Dialog)
    Vue.component('dc-dialogset', Dialogset)
    Vue.component('dc-nodeTree', nodeTree)
    Vue.component('dc-form', Form)
    Vue.component('dc-flow', Flow)
    Vue.component('dc-staticFlow', StaticFlow)
    Vue.component('dc-tabs', Tab)
    Vue.component('dc-table', Table)
    Vue.component('dc-tree', Tree)
    Vue.component('dc-importFile', ImportFile)
    Vue.component('dc-nav', Nav)
    Vue.component('dc-frame', Frame)
    Vue.component('dc-frameset', FrameSet)
    Vue.component('dc-popover', Popover)
    Vue.component('dc-buttons', Buttons)
    Vue.component('dc-grid', Grid)
    Vue.component('dc-module', {
        render(createElement) {
            let getImportFile = (createElement) => {
                if(this.importFile.show) {
                    return createElement('dc-importFile')
                }
            }
            return createElement('div', [
                createElement('dc-dialogset'),
                createElement('dc-frameset'),
                getImportFile(createElement)
            ])
        },
        data() {
            return {
                importFile: {}
            }
        },
        created() {
            this.importFile = this.$importFile
        }
    })

    Vue.prototype.$dialogset = new Dialogsetclass()

    Vue.prototype.$importFile = new ImportFileClass()
    Vue.prototype.$frameset = new FrameSetClass()

    Vue.prototype.$openDialog = (dialog) => { //打开对话框
        dialog.show = true
        Vue.prototype.$dialogset.addDialog(dialog)
    }
    
    Vue.prototype.$closeDialog = (dialog) => { //关闭对话框
        Vue.prototype.$dialogset.removeDialog(dialog)
    }

    Vue.prototype.$addTab = (obj, name='tabs') => {
        let index = Vue.prototype.$dcTabs.findIndex(d => d.name === name)
        Vue.prototype.$dcTabs[index].addTab(obj)
    }

    Vue.prototype.$closeTab = (title, name='tabs') => {
        let index = Vue.prototype.$dcTabs.findIndex(d => d.name === name)
        Vue.prototype.$dcTabs[index].closeTab(title)
    }

    Vue.prototype.$focusTab = (title, name='tabs') => {
        let index = Vue.prototype.$dcTabs.findIndex(d => d.name === name)
        Vue.prototype.$dcTabs[index].focusTab(title)
    }

    Vue.prototype.$updateTabTitle = (oldTitle, newTitle, name='tabs') => {
        let index = Vue.prototype.$dcTabs.findIndex(d => d.name === name)
        Vue.prototype.$dcTabs[index].updateTitle(oldTitle, newTitle)
    }

    Vue.prototype.$updateTabData = (title, data, name='tabs') => {
        let index = Vue.prototype.$dcTabs.findIndex(d => d.name === name)
        Vue.prototype.$dcTabs[index].updateTabData(title, data)
    }

    Vue.prototype.$closeFrame = (id) => {
        Vue.prototype.$frameset.closeFrame(id)
    }

    Vue.prototype.$openFrame = (frame) => {
        frame.show = true
        Vue.prototype.$frameset.openFrame(frame)
    }
    Vue.prototype.$affirm = (text, title='提示', failMessage='已取消操作') => { //确认弹框
        return new Promise((resolve, rejects) => {
          Element.MessageBox.confirm(text, title, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            resolve()
          }).catch(() => {
            Element.Message({
              type: 'info',
              message: failMessage,
              showClose: true
            })      
          })
        })
    }

    Vue.prototype.$successMessage = (text="操作成功", duration=1500) => { //成功提示信息
        Element.Message({
            type: 'success',
            message: text,
            showClose: true,
            duration: duration
        })
    }

    Array.prototype.swap = function(item, sept) { 
        let currentIndex = this.indexOf(item)
        let arr = []
        if(this.indexOf(item) !== -1) {
            let targetIndex = currentIndex + sept
            if(targetIndex < 0 || targetIndex > this.length - 1) {
                return this
            }else {
                let target = this[targetIndex]
                arr = this.map(i => {
                    if(i === target) {
                        return item
                    }else if(i === item) {
                        return target
                    }
                    return i
                })
            }
            return arr
        }else {
            throw new Error('index===-1')
        }
    }

    let cloneObject = (obj) => {
        let object
        if(obj && typeof obj === 'object') {
            if(obj instanceof Array) {
                object = []
                for(let i = 0; i < obj.length; i++) {
                    if(obj[i] && typeof obj[i] === 'object') {
                        object.push(cloneObject(obj[i]))
                    }else{
                        object.push(obj[i])
                    }
                }
            }else{
                object = {}
                if(obj.constructor !== Object) {
                    object.__proto__ = obj.__proto__
                }
                for(let key in obj) {
                    let value = obj[key]
                    if(typeof value === 'object') {
                        object[key] = cloneObject(value)
                    }else {
                        object[key] = value
                    }
                }
            }
           
        }
        return object
    }
    Vue.prototype.$cloneObject = cloneObject

    let handleData = (data, condition, callback) => {
        if(data && typeof data === 'object') {
            if(condition && typeof data === 'object') {
                let object
                if(data instanceof Array) {
                    let arr = []
                    for(let i = 0; i < data.length; i++) {
                        if(typeof data[i] === 'object') {
                            arr.push(handleData(data[i], condition, callback))
                        }else {
                            arr.push(data[i])
                        }
                    }
                    object = arr
                }else {
                    object = {}
                    let cKey = condition.key
                    let cValue = condition.value
                    for(let key in data) {
                        let dataValue = data[key]
                        if(dataValue && typeof dataValue === 'object' && !(cKey === key && cValue === undefined)) {
                            object[key] = handleData(dataValue, condition, callback)
                        }else{
                            let newValue
                            let handle = () => {
                                newValue = callback(data, key, dataValue)
                                if(newValue !== undefined) {
                                    if(newValue && typeof newValue === 'object' && !(newValue instanceof Array)) {
                                        for(let newKey in newValue) {
                                            object[newKey] = newValue[newKey]
                                        }
                                    }else {
                                        object[key] = newValue
                                    }
                                }
                            }
                            if(cKey === key && cValue === dataValue) {
                                handle()
                            }else if(cKey === undefined && cValue === dataValue) {
                                handle()
                            }else if(cValue === undefined && cKey === key) {
                                handle()
                            }else{
                                object[key] = dataValue
                            }
                        }
                    }
                }
                return object
            }else{
                throw new Error('condition is not a object')
            }
        }
    }
    Vue.prototype.$handleData = handleData
    
    for(let key in components) {
        Vue.component(key, components[key])
    }

    let bus = new Vue()

    Vue.prototype.$addListenerOnce = (name, fn) => {
        bus.$once(name, fn)
    }
    Vue.prototype.$addListener = (name, fn) => {
        bus.$on(name, fn)
    }
    Vue.prototype.$emitEvent = (name, ...param) => {
        bus.$emit(name, ...param)
    }
    Vue.prototype.$cancelEvent = (name) => {
        bus.$off(name)
    }

    Vue.prototype.$openPage = (router) => {
        let href = location.href
        let index = href.indexOf('#/')
        let url = href.slice(0, index)
        open(url + router)
    }

    Vue.prototype.$formatTime = (time,format='yyyy-mm-dd hh:mm:ss') => {
        let dateTime = ''
        if(time instanceof Date) {
            dateTime = time
        }else{
            dateTime = new Date(time);
        }
        const y = dateTime.getFullYear();
        let m = dateTime.getMonth()+1;
        m = m < 10 ? ('0' + m) : m;
        let d = dateTime.getDate();
        d = d < 10 ? ('0' + d) : d;
        let h = dateTime.getHours();
        h = h < 10 ? ('0' + h) : h;
        let min = dateTime.getMinutes();
        min = min < 10 ? ('0' + min) : min;
        let s = dateTime.getSeconds();
        s = s < 10 ? ('0' + s) : s;
        let res = time;
        switch(format){
            case 'yyyy-mm-dd hh:mm:ss':
                res = `${y}-${m}-${d} ${h}:${min}:${s}`;
                break;
            case 'yyyy-mm-dd hh:mm':
                res = `${y}-${m}-${d} ${h}:${min}`;
                break;
            case 'number':
                res = dateTime.getTime();
                break;
            case 'string':
                res = dateTime.getTime().toString();
                break;
            default:
                break;
        }
        return res;
    }
}
let namespace = 'dc'
window[namespace] = {
    Table: TableClass,
    Dialogset: Dialogset,
    Dialog: DialogClass,
    Tabs: TabsClass,
    Contextmenu: ContextmenuClass,
    ImportFile: ImportFileClass,
    Tree: TreeClass,
    Nav: NavClass,
    Frame: FrameClass,
    Popover: PopoverClass,
    Form: FormClass,
    Flow: FlowClass,
    NodeFlow: NodeFlowClass,
    ReportFlow: ReportFlowClass,
    AdvFilter: AdvFilterClass,
    Buttons: ButtonsClass,
}
window.objClone = objClone;


export default ModuleComponents