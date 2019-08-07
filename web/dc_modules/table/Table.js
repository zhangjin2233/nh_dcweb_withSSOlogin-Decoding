
import tableConfig from '@/config/table.js'
class Table {
    constructor(obj) {
        this.btnGroup = []
        this.bottomBtn = []
        this.pageTool = tableConfig.pageTool
        this.btnMargin = tableConfig.btnMargin
        this.btnGroupMargin = tableConfig.btnGroupMargin
        this.paginationMargin = 20
        this.btnSize = tableConfig.btnSize
        this.pageSizes = tableConfig.pageSizes
        this.total = 1
        this.currentSize = tableConfig.currentSize
        this.currentPage = 1
        this.tableData = [] //表格的数据
        this.tableHead = [] //表格的格式
        this.hasBtn = true
        this.hasSearch = tableConfig.hasSearch
        this.hasPage =tableConfig.hasPage //是否有分页器
        this.hasBottomBtn = tableConfig.hasBottomBtn // 是否有提交按钮
        this.hasColSelect = tableConfig.hasColSelect//是否有选择列
        this.colSelectWidth = tableConfig.colSelectWidth//选择列宽度
        this.border = tableConfig.border //是否有边框
        this.editable = false //是否可编辑状态   
        this.bottomBtnAlign = tableConfig.bottomBtnAlign // 提交按钮的对齐方式
        this.paginationAlign = tableConfig.paginationAlign // 分页器的对齐方式
        this.sortable = tableConfig.sortable //是否可排序
        this.height = tableConfig.height
        this.size = tableConfig.size
        this.width = tableConfig.width
        this.searchWidth = tableConfig.searchWidth
        this.appendBottom = null
        this.appendTop = null
        this.selectValue = ''
        this.selectOptions = []
        this.selection=[]
        this.hasSelect = tableConfig.hasSelect
        this.hiddenCols = tableConfig.hiddenCols //隐藏的列
        this.isHiddenCol = true
        this.colsColor = [] //列的颜色定义
        this.cellImages = []
        this.colsWidth = []
        this.interval = null
        this.cellAppend = []
        this.loading = false
        this.align = tableConfig.align
        this.filterSetting = []
        this.currentRow = null
        this.keyword = ''
        this.maxHeight = tableConfig.maxHeight
        this.searchPlaceholder = '请输入内容'
        this.appendComponent = ''
        this.customCells = []
        this.selectionInit = {key: 'guid', value: []}
        this.dateInput = {
            value: '',
            placeholder: '请选择日期',
            format: 'yyyy-MM-dd'
        }
        this.cellStyle = null
        this.hasDate = false
        this.fixedLeft = 0
        this.fixedRight = 0
        this.isDefaultSort = true
        this.sortArr = [] 
        this.colIndex = {
            show: false,
            width: '70px'
        }
        this.rowClickSelections = []
        this.data = []
        if(obj && typeof obj === 'object') {
            for(let key in obj) {
                this[key] !== undefined && (this[key] = obj[key])
            }
        }
    }
    initData() {

    }
    selectChange(value) {
    }
    selectionChange(selection) {//当选择项发生变化时会触发该事件
    }
    rowStyle(row) {
        if(this.rowClickSelections.findIndex(r => JSON.stringify(r) === JSON.stringify(row)) > -1) {
            return { background: '#f5f7fa' }
        }
    } //设置行的颜色
    rowClick(data, row, head, table){}
    sizeChange(size) {
       
    }
    pageChange(page) {
        
    }
    rowDbClick(data, row, head, table) {
        
    }
    sortChange(column, prop, order) {
       
    }
    rowContextmenu() {
        
    }
    initData(res) {

    }
    search() {
        
    }
    dateChange() {
        
    }
    refresh() {

    }
    clearInterval() {
        this.interval && clearInterval(this.interval)
        this.interval = null
        return this
    }
    startInterval(time) {
        if(!this.initData) {
            return 
        }
        if(this.interval) {
            clearInterval(this.interval)
            this.interval = setInterval(() => {
                this.initData(this)
            }, time)
        }else{
            this.interval = setInterval(() => {
                this.initData(this)
            }, time)
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
    add(attra, item, index) {
        let target = this[attra]
        if(target instanceof Array) {
            if(index === undefined) {
                target.push(item)
            }else {
                target.splice(index, 0, item)
            }
        }
        return this
    }
    selectable(row, index) {
        return true
    }
    delete(attra, fn) {
        let target = this[attra]
        if(typeof fn === 'function') {
            this[attra] = target.filter((item, index) => {
                return !fn(item, index)
            })
        }else {
            this[attra] = []
        }
        return this
    }
    update(attra, fn) {
        let target = this[attra]
        if(typeof fn === 'function') {
            this[attra] = target.map((item, index) => {
                if(fn(item, index)) {
                    return fn(item, index)
                }
                return item
            })
        }
        return this
    }
    reset(obj) {
        let newObj = Object.assign(new dc.Table(), obj)
        for(let key in newObj) {
           this[key] !== undefined && (this[key] = newObj[key])
        }
        return this
    }
    overWrite(obj) {
        for(let key in obj) {
            this[key] = obj[key]
        }
        return this
    }
    setTableData(tableData, tableHead) {
        this.tableData = tableData
        tableHead && (this.tableHead = tableHead)
        return this
    }
    toggleRowSelection(row, selected) {
        try {
            this.vue.$refs.table.toggleRowSelection(row, selected)
        }catch(err) {}
    } 
}
export default Table