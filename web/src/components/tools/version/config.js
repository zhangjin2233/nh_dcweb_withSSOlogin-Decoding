function importVersion(vue, isAll) {
    let params = { 
        Class: 'WebVersionMgr',
        [dcConfig.paramsKey]: {} 
    }
    let paths = []
    if(vue.tree1.selection.length > 0) {
        vue.tree1.selection.forEach(item => {
            paths.push(item)
        })
    }
    if(!isAll) {
        params.FUNC = 'importNewVersion'
        vue.importSelection.forEach(item => {
            paths.push(`${item.path}/${item.id}.json`)
        })
        params[dcConfig.paramsKey] = {
            paths
        }
    }else {
        params.FUNC = 'importAll'
    }

    vue.$prompt('请输入版本备注说明', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    }).then(({ value }) => {
        params[dcConfig.paramsKey].desc = value
        DCHttp.req({ 
            url: dcConfig.publicPath,
            params,
            method: 'post'
        }).then(res => {
            vue.$successMessage('上传成功！')
        })
    }).catch(() => {   
    })
}
export default {
    export(vue) {
        return  {
            btns: [{
                text: '参数定义',
                click() {
                    vue.currentTable = 'param'
                    let loading = vue.$loading()
                    DCHttp.req({
                        url: '/api/param/list'
                    }).then(res => {
                        vue.table.tableData = res.tableData
                        vue.table.tableHead = res.tableHead
                        vue.table.keyword = ''
                        vue.currentLink = 'param'
                        vue.changeLink = true
                        vue.setSelect()
                        loading.close()
                    }).catch(() => {
                        loading.close()
                    }) 
                }
            }],
            table: {
                hasPage: false,
                hasColSelect: true,
                hasSearch: true,
                hasPage: true,
                hasLoading: true,
                selectionChange(selection) {
                    try{
                        if(vue.changeLink && selection.length === 0) {
                            vue.changeLink = false
                            return
                        }else {
                            let list = vue.select[vue.currentTable].list
                            let flag = false
                        
                            selection.forEach(item => {
                                let obj = {
                                    name: item.guid || item.name,
                                    label: item.desc || item.name,
                                    link: vue.currentLink
                                }
                                let index = list.findIndex(r => r.name === obj.name)
                                if(index === -1) {
                                    list.push(obj)
                                    flag = true
                                }
                            })
                            if(!flag && !vue.changePage) {
                                vue.select[vue.currentTable].list = list.filter(item => {
                                    return !(item.link === vue.currentLink && (selection.findIndex(r => {
                                        if(vue.currentTable === 'param') {
                                            return r.name === item.name
                                        }else {
                                            return r.guid === item.name
                                        }
                                    }) === -1))
                                })
                                if(vue.changePage) {
                                    vue.changePage = false
                                }
                            }
                            vue.changeLink = false
                        }
                    }catch(err) {}
                },
                search(val, table) {
                    let url = ''
                    let params = {}
                    if(vue.currentTable === 'param') {
                        url = '/api/param/list'
                        params = {
                            keyword: val
                        }
                    }else if(vue.currentTable === 'pdc') {
                        vue.table.currentPage = 1
                        url = '/api/PDC/list',
                        params = {
                            keyword: val,
                            cdcId: vue.currentLink,
                            orderBy: {},
                            pageNo: 1,
                            pageSize: vue.table.currentSize
                        }
                    }
                    DCHttp.req({
                        url,
                        params
                    }).then(res => {
                        let data = res.CONTENT || res
                        table.tableData = data.tableData
                        table.tableHead = data.tableHead
                        vue.setSelect()
                    })
                },
                sizeChange(size) {
                    vue.getPDCData()
                    vue.changePage = true
                },
                pageChange(page) {
                    vue.getPDCData()
                    vue.changePage = true
                }
            },
        }
    }, 
   
    import(vue) {
        return {
            btns: [{
                text: '版本上传',
                type: 'file',
                click() {
                    vue.$refs.submitFile.click()
                }
            }, {
                text: '导入',
                click() {
                    importVersion(vue)
                    // console.log(vue.importSelection)
                }
            }, {
                text: '全量导入',
                click() {
                   importVersion(vue, true)
                }
            }],
            table: {
                hasPage: false,
                hasColSelect: true,
                hasSearch: false,
                selectionChange(selection) {
                    if(vue.changeLink && selection.length === 0) {
                        vue.changeLink = false
                        return
                    }else {
                        let flag = false
                        selection.forEach(item => {
                            let index = vue.importSelection.findIndex(r => r.name === item.name)
                            if(index === -1) {
                                let name = vue.currentTable === 'Param' ? item.name : item.guid
                                vue.importSelection.push({
                                    name: name,
                                    path: vue.currentLink,
                                    id: item.ID
                                })
                                flag = true
                            }
                        })
                        if(!flag) {
                            vue.importSelection = vue.importSelection.filter(item => {
                                return !(item.path === vue.currentLink && (selection.findIndex(r => {
                                    return r.name === item.name
                                }) === -1))
                            })
                        }
                        vue.changeLink = false
                    }
                },
                btnGroup: [{
                    text: '版本对比',
                    type: 'primary',
                    color: '#fff',
                    click(data, row, head, table) {
                        function setDifferCell() {
                            vue.table.cellAppend = []
                            vue.$store.state.versionDiffer.forEach(item => {
                                vue.table.cellAppend.push({
                                    prop: item[1],
                                    condition(prop, row, col) {
                                        if(row[prop] === item[0]) {
                                            return true
                                        }
                                    },
                                    component: 'differCell'
                                })
                            })
                        }
                        if(vue.currentTable === 'Param') {
                            DCHttp.req({
                                url: '/api/param/list'
                            }).then(res => {
                                vue.$store.commit('clearVersionDiffer')
                                data.forEach((item) => {
                                    let param = res.tableData.find(r => r.name === item.name)
                                    for(let key in item) {
                                        if(typeof item[key] === 'object') {
                                            JSON.stringify(item[key]) !== JSON.stringify(param[key]) && vue.$store.commit('addVersionDiffer', [item[key], key, param[key]])
                                        }else if(param[key] !== undefined && item[key] !== param[key]) {
                                            vue.$store.commit('addVersionDiffer', [item[key], key, param[key]])
                                        }
                                    }  
                                })
                                setDifferCell()
                            })
                        }else {
                            let ids = data.map(item => item.ID)
                            DCHttp.req({
                                url: dcConfig.publicPath,
                                params: {
                                    Class: 'PDCMgr',
                                    FUNC: 'listPDCs',
                                    [dcConfig.paramsKey]: {
                                        pdcIds: ids
                                    }
                                }
                            }).then(res => {
                                let pdcs = res.CONTENT
                                vue.$store.commit('clearVersionDiffer')
                                data.forEach((item, index) => {
                                    let pdc = pdcs[index]
                                    for(let key in item) {
                                        if(typeof item[key] === 'object') {
                                            JSON.stringify(item[key]) !== JSON.stringify(pdc[key]) && vue.$store.commit('addVersionDiffer', [item[key], key, pdc[key]])
                                        }else if(item[key] !== pdc[key]) {
                                            vue.$store.commit('addVersionDiffer', [item[key], key, pdc[key]])
                                        }
                                    }  
                                })
                                setDifferCell()
                            })
                        }
                    } 
                }],
            }
        }
    } 
}