
import inputTipes from './inputTips.vue'
export default {
    name: 'table',
    components: {inputTipes},
    data () {
        return {
            data: [],
            head: [],
            type: '',
            config: {},
            tableConfig: null,
            currentInput: null,
            currentData: null,
            currentName: '',
            showInputText: false,
            buttons: {},
            inputDisabled: false,
            hover: false,
            numberType: ['number', 'double', 'int', 'long', 'integer'],
            widthCount: 0,
            currentHoverCell: []
        }
    },
    props: ['object', 'propData'],
    created() {
        if(this.propData) {
            this.tableConfig = this.propData.object
        }else{
            this.tableConfig = this.object
        }
        this.tableConfig.initData && this.tableConfig.initData(this.tableConfig)
        this.$nextTick(() => {
            let header = this.$refs.table.$el.getElementsByTagName('thead')[0]
            header.onmousedown = (event) => {
                this.widthCount = event.screenX
            }
            header.onmouseup = (event) => {
                this.widthCount -= event.screenX
            }
            this.tableConfig.vue = this
        })
    },
    methods: {
        dateChange(val) {
            this.tableConfig.dateChange && this.tableConfig.dateChange(val, this.tableConfig)
        },
        openDataset(tableHead, tableData) {
            let vue = this
            let dialog = new dc.Dialog({
                title: '数据集',
                component: 'dc-table',
                width: '60%',
                data: {
                    object: new dc.Table({
                        tableData: tableData,
                        tableHead: tableHead,
                        editable: true,
                        hasPage: false,
                        hasBtn: true,
                        hasColSelect: false,
                        btnGroup: [{
                            needRow: false,
                            text: '新增',
                            click(data, row, head, table) {
                               data.push({})
                            } 
                        }, {
                            needRow: true,
                            text: '删除',
                            click(data, row, head, table) {
                                let index = data.indexOf(row)
                                data.splice(index, 1)
                            } 
                        }, {
                            needRow: true,
                            text: '上移',
                            click(data, row, head, table) {
                                table.setTableData(data.swap(row, -1))
                            } 
                        }, {
                            needRow: true,
                            text: '下称',
                            click(data, row, head, table) {
                                table.setTableData(data.swap(row, 1))
                            } 
                        }]
                    }).setBottomBtn([{
                        text: '确定',
                        size: 'primary',
                        click() {
                            vue.$closeDialog()
                        }
                    }])
                }
            })
            this.$openDialog(dialog)
        },
        rowStyle({row}) {
            let rowStyle = this.tableConfig.rowStyle(row)
            if(rowStyle) return rowStyle
            if(JSON.stringify(row) === JSON.stringify(this.tableConfig.currentRow)) {
                return {
                    background: '#f5f7fa'
                }
            }
        },
        rowContextmenu(row, event) {
            this.tableConfig.rowContextmenu && this.tableConfig.rowContextmenu(event,  this.tableConfig.tableData, row, this.tableConfig.tableHead, this.tableConfig)
        },
        rowClick(row, event) {
            if(row.READONLY) return
            let index
            let rowClickSelections = this.tableConfig.rowClickSelections
            if(event.shiftKey && rowClickSelections.length === 1) {
                index = this.tableConfig.tableData.findIndex(r => JSON.stringify(r) === JSON.stringify(rowClickSelections[0]))
                let currentIndex = this.tableConfig.tableData.indexOf(row)
                this.tableConfig.rowClickSelections = this.tableConfig.tableData.filter((item, i) => {
                    return (i - index) * (i - currentIndex) <= 0
                })
            }else if(event.metaKey || event.ctrlKey) {
                rowClickSelections.push(row)
            }else {
                this.tableConfig.rowClickSelections = []
                this.tableConfig.rowClickSelections.push(row)
            }
            this.tableConfig.currentRow = row
            this.tableConfig.rowClick(this.tableConfig.tableData, row, this.tableConfig.tableHead, this.tableConfig, event)
        },
        rowDbClick(row, event) {
            this.tableConfig.currentRow = row
            this.tableConfig.rowDbClick(this.tableConfig.tableData, row, this.tableConfig.tableHead, this.tableConfig, event)
        },
        sortChange({ column, prop, order }) {
            this.tableConfig.sortChange(column, prop, order)
        },
        selectionChange(selection) {
            this.tableConfig.selection = selection
            this.tableConfig.selectionChange && this.tableConfig.selectionChange(selection)
        },
        btnClick(item) {
            item.click && item.click(this.tableConfig.tableData, this.tableConfig.currentRow, this.tableConfig.tableHead,  this.tableConfig)
        },
        // 分页器部分
        handleSizeChange(size) {
            this.tableConfig.currentSize = size
            this.tableConfig.sizeChange && this.tableConfig.sizeChange(size, this.tableConfig)
          
        },
        handleCurrentChange(page) {
            this.tableConfig.currentPage = page
            this.tableConfig.pageChange && this.tableConfig.pageChange(page, this.tableConfig)
           
        },
        search() {  //搜索功能
            this.tableConfig.search && this.tableConfig.search(this.tableConfig.keyword, this.tableConfig)
        },
        cellStyle({row, column, rowIndex, columnIndex}) {
            if (!column.property) {
                return
            }
            if(this.tableConfig.cellStyle) {
                return this.tableConfig.cellStyle(row[column.property], column.property, row)
            }
        },
        bottomBtnClick(item) {
            item.click && item.click(this.tableConfig.tableData, this.tableConfig.currentRow, this.tableConfig.tableHead, this.tableConfig)
        },
        isSortable(name) {
            if(this.tableConfig.sortable && !this.tableConfig.sortArr.length) {
                if (this.tableConfig.isDefaultSort) {
                    return true
                }
                return 'custom'
            }
            if(this.tableConfig.sortArr && this.tableConfig.sortArr.indexOf(name) !== -1) {
                if (this.tableConfig.isDefaultSort) {
                    return true
                }
                return 'custom'
            }
                return false
        },
        selectChange() {
            this.tableConfig.selectChange && this.tableConfig.selectChange(this.tableConfig.selectValue, this)
        },
        showImg(col) {
            let cellImages = this.tableConfig.cellImages
            if(cellImages.length > 0) {
                let index = cellImages.findIndex(c => c.prop === col)
                if(index !== -1) {
                    return true
                }
            }
        },
        getCellImg(col, value, row) {
            let cellImages = this.tableConfig.cellImages
            if(cellImages.length > 0) {
                let index = cellImages.findIndex(c => c.prop === col)
                if(index !== -1) {
                    if(typeof cellImages[index].img === 'string') {
                        return `background-image: url(${cellImages[index].img});top:2px`
                    }else if(cellImages[index].img instanceof Array) {
                        for(let i = 0; i < cellImages[index].img.length; i++) {
                            if(cellImages[index].img[i].value === value || eval(cellImages[index].img[i].condition)) {
                                return `background-image: url(${cellImages[index].img[i].url});top:2px`
                            }
                        }
                    }else if(cellImages[index].icon instanceof Array) {
                        for(let i = 0; i < cellImages[index].icon.length; i++) {
                            if(cellImages[index].icon[i].value === value || eval(cellImages[index].icon[i].condition)) {
                                return `color: ${cellImages[index].icon[i].color ? cellImages[index].icon[i].color : '#000'}`
                            }
                        }
                    }
                }
            }
        },
        getCellIcon(col, value, row) {
            let cellImages = this.tableConfig.cellImages
            if(cellImages.length > 0) {
                let index = cellImages.findIndex(c => c.prop === col)
                if(index !== -1) {
                    let obj = {}
                    if(typeof cellImages[index].icon === 'string') {
                        obj[cellImages[index].icon] = true
                        return obj
                    }else if(cellImages[index].icon instanceof Array) {
                        for(let i = 0; i < cellImages[index].icon.length; i++) {
                            if(cellImages[index].icon[i].value === value || eval(cellImages[index].icon[i].condition)) {
                                obj[cellImages[index].icon[i].class] = true
                                return obj
                            }
                        }
                    }
                }
            }
        },
        setColWidth(col) {
            let index = this.tableConfig.colsWidth.findIndex(c => c.prop === col)
            if(index !== -1) {
                return this.tableConfig.colsWidth[index].width
            }
        },
        cellComponent(prop, row, col) {
            let arr = this.tableConfig.cellAppend
            let index = arr.findIndex(a => a.prop === prop)
            if(index !== -1) {
                if(typeof arr[index].condition === 'string' && !!eval(arr[index].condition)) {
                    return arr[index].component
                }else if(typeof arr[index].condition === 'function' && arr[index].condition(prop, row, col)) {
                    return arr[index].component
                }
            }
        },
        setCell(row, col) {
            let customCells = this.tableConfig.customCells
            if(customCells.length > 0) {
                let arr = []
                for (let i = 0; i < customCells.length; i++) {
                    let item = customCells[i]
                    if (typeof item.value === 'function' && item.value(row, col, this.tableConfig) !== undefined) {
                        row[col.name] = item.value(row, col, this.tableConfig)
                    }
                    if (typeof item.disabled === 'function') {
                        arr.push(item.disabled(row, col, this.tableConfig))
                    }
                    if (typeof item.disabled === 'string') {
                        arr.push(eval(item.disabled))
                    }
                }
                return arr.some(item => item)
            }
            return false
        },
        fixCol(head, index) {
            if (this.tableConfig.fixedLeft > 0) {
                if(index < this.tableConfig.fixedLeft) {
                    return 'left'
                }
            } 
            if (this.tableConfig.fixedRight > 0) {
                if (head.length - this.tableConfig.fixedRight <= index) {
                    return 'right'
                }
            }
            return false
        },
        inputFocus(event, data, name) {
            this.currentInput = event.target
            this.currentData = data
            this.currentName = name
            this.watchInput(data[name])
            this.inputDisabled = false
            this.hover = false
        },
        inputBlur() {
            this.currentInput = null
        },
        calcStringPixels(str, strFontSize) {
            if (!str) {
                return 0
            }
            let stringCharsCount = (str + '').length
            let stringPixelsCount = 0
            let element = this.$refs.hiddenSpan

            for (let i = 0; i < stringCharsCount; i++) {
                if (str[i] == " ") {
                    element.innerHTML = "&nbsp;"
                } else {
                    element.innerHTML = str[i]
                }
                stringPixelsCount += element.offsetWidth
            }
            return stringPixelsCount

        },
        watchInput(val) {
            let size = this.calcStringPixels(val, '12px') ? this.calcStringPixels(val, '12px') : 0
            let width = this.currentInput.offsetWidth
            if (size >= width - 40) {
                this.showInputText = true
            }
        },
        inputOver(event, row, col) {
            setTimeout(() => {
                if (this.showInputText) {
                    return
                }
                if (col.readOnly || row.READONLY || this.setCell(row, col)) {
                    this.hover = true
                    this.currentInput = event.target
                    this.inputDisabled = true
                    if (this.currentName === col.name && this.currentData === row) {
                        this.watchInput(row[col.name])
                        return
                    }
                    this.currentData = row
                    this.currentName = col.name

                }
            }, 100)
        },
        hoverInput(val) {
            if(val) {
                this.inputDisabled = this.hover
                this.showInputText = true
            }else{
                this.inputDisabled = false
                this.showInputText = false
                this.currentInput = null
            }
        },
        inputOut(event, row, col) {
            if (this.currentInput === event.target) {
                this.inputDisabled = false
                this.showInputText = false
                this.currentInput = null
            }
        },
        headerDragend(newWidth, oldWidth, column, event) {
            column.width -= this.widthCount
        },
        textHover(e){
           let cell = e.target.parentNode
           if(cell.offsetWidth < e.target.offsetWidth) {
                e.target.title = e.target.firstElementChild.innerText
           }
        }
    },
    computed: {
        selectionInit() {
            if (!this.tableConfig) return {}
            if(!this.tableConfig.hasColSelect) {
                return {value: []}
            }else {
                return this.tableConfig.selectionInit
            }
        },
        currentValue() {
            if (this.currentData && this.currentName) {
                return this.currentData[this.currentName]
            } else {
                return ''
            }
        }
    },
    watch: {
        currentValue(val) {
            if (this.currentInput && val) {
                this.watchInput(val)
            }
        },
        selectionInit: {
            deep: true,
            handler(val) {
                this.$nextTick(() => {
                    this.tableConfig.tableData && this.tableConfig.tableData.forEach(item => {
                        if (val.value.includes(item[val.key])) {
                            this.$refs.table.toggleRowSelection(item)
                        }
                    })    
                })
            }
        },
    },
    filters: {
        cellFilter(val, tableConfig, row, name, col) {
            let filterSetting = tableConfig.filterSetting
            let index = filterSetting.findIndex(t => t.prop === name && (val === t.value || typeof t.show === 'function'))
            if(index !== -1) {
                if(typeof filterSetting[index].show === 'function') {
                    return filterSetting[index].show(val, row, name, tableConfig)
                }
                return filterSetting[index].show
            }
            let type = col.type.toLowerCase()
            if(type === 'singleenum' || type === 'multiselect') {
                let index = col.option.findIndex(o => o.value === val)
                if(index > -1) {
                    return col.option[index].label
                }
            }
            return val
        }
    }
}