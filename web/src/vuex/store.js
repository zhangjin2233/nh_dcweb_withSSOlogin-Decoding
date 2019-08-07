import Vuex from 'vuex'
import Vue from 'vue'
// const Vuex = require('vuex')
// const Vue = require('vue')

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        isFullScreen: '',  //是否全屏
        history: [], //储存路由历史记录
        isLogin: false, //登录状态
        reqMethodToLogin: '', //当前请求的方式
        errorInfoList: [], //错误信息列表
        SUDFTabs: [], //SUDF的标签页
        currentTable: null, //sql部件的当前选中表格
        lines: [], //sql部件的连线信息
        showTipsRow: null, //sql部件的行信息
        viewNames: [], //sql部件的视图列表
        outputNames: [], //sql部件的输出列表
        PDCData: {}, //PDC全部信息
        PDCForm: null, //PDC表单信息
        sqlViewType: 'business', //sql部件的视图类型
        currentSqlTable: null, //sql部件的当前选中表格
        versionDiffer: [], //版本对比
        relationFlowData: null, 
    },
    mutations: {
        setRelationFlowData(state,data){ //存储直系依赖图的数据
          state.relationFlowData = JSON.stringify(data);
        },
        getRelationFlowData(state,data){ //获取直系依赖图的数据
          data.flowData = JSON.parse(state.relationFlowData);
          state.relationFlowData = null;
        },
        setPDCForm(state, data) {
            state.PDCForm = data
        },
        setPDCData(state, data) {
            state.PDCData = data
        },
        addHistory(state, item) {
            if(state.history.length > 9) {
                state.history.pop()
            }
            state.history.unshift(item)
        },
        deleteHistory(state, id) {
            let index = state.history.findIndex(item => item.id === id)
            if(index != -1) {
                state.history.splice(index, 1)
            }
        },
        loginToggle(state, val, method='get') {
            if(val === false) {
                Array.apply(null, { length: VUE.$dialogset.list.length }).forEach(item => {
                    VUE.$closeDialog()
                })
            }
            state.isLogin = val
            state.isFullScreen = '';
            state.reqMethodToLogin = method
        },
        updateErrorInfoList(state, info) {
            info.time = VUE.$formatTime(info.time,'yyyy-mm-dd hh:mm:ss');
            state.errorInfoList.unshift(info)
        },
        handleSUDFTabs(state, obj) {
            let type = obj.type
            let val = obj.val
            if(type === 'add') {
                let index = state.SUDFTabs.findIndex(s => s.name === val.name)
                if(index === -1) {
                    state.SUDFTabs.push(val)
                }else {
                    VUE.$emitEvent('fouceTab', val.name)
                }
            }else if(type === 'delete') {
                let index = state.SUDFTabs.findIndex(s => s.name === val)
                if(index > -1) {
                    state.SUDFTabs.splice(index, 1)
                }
            }else if(type === 'clear') {
                state.SUDFTabs = []
            }
        },
        setCurrentTable(state, table) {
            state.currentTable = table
        },
        addLine(state, line) {
            state.lines.push(line)
        },
        setLines(state, lines) {
            if (lines instanceof Array) {
                state.lines = lines
            }
        },
        setShowTipsRow(state, row) {
            state.showTipsRow = row
        },
        hideRowTips(state) {
            if (state.showTipsRow && state.showTipsRow.showTips) {
                state.showTipsRow.showTips = false
                state.showTipsRow = null
            }
        },
        updateTableName(state, name, type = 'IV', handle = 'add') {
            if (handle === 'add') {
                if (type === 'IV') {
                    state.viewNames.push(name)
                } else {
                    state.outputNames.push(name)
                }
            } else {
                if (type === 'IV') {
                    state.viewNames.splice(state.viewNames.indexOf(name), 1)
                } else {
                    state.outputNames.splice(state.viewNames.indexOf(name), 1)
                }
            }
        },
        exchangeSqlViewType(state) {
            if (state.sqlViewType === 'business') {
                state.sqlViewType = 'project'
            } else {
                state.sqlViewType = 'business'
            }

        },
        setCurrentSqlTable(state, table) {
            state.currentSqlTable = table
        },
        clearVersionDiffer(state) {
            state.versionDiffer = []
        },
        addVersionDiffer(state, value) {
            state.versionDiffer.push(value)
        }
    }
})
export default store