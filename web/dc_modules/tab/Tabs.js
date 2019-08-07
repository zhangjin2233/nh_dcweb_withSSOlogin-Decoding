import Vue from 'vue'
class Tabs {
    constructor(obj) {
        this.name = 'tabs'
        this.type = 'card'
        this.tabPosition = 'top'
        this.stretch = false
        this.height = 'auto'
        this.currentTab = ''
        this.tabs = []
        this.fullscreen = true
        this.isFullscreen = false
        this.width = '100%'

        if(Vue.prototype.$dcTabs) {
            Vue.prototype.$dcTabs.push(this)
        }else {
            Vue.prototype.$dcTabs = [this]
        }
        if(obj && typeof obj === 'object') {
            for(let key in obj) {
                this[key] = obj[key]
            }
        }else if(typeof obj === 'string') {
            this.name = obj
        }
        if(this.tabs.length > 0) {
            this.currentTab = this.tabs[0].id
        }
    }
    tabClick(tab, component) {
        
    }
    tabChange(activeTab, oldActiveTab) {
    }
    tabRemove(tab) {

    }	
    setType(val) {
        this.type = val
        return this
    }
    setTabPosition(val) {
        this.tabPosition = val
        return this
    }
    setStretch(val) {
        this.stretch = val
        return this
    }
    setCurrentTab(val) {
        this.currentTab = val
        return this
    }
    addTab(obj) {
        if(obj instanceof Array) {
            for(let i = 0; i < obj.length; i++) {
                obj[i].id = new Date().getTime() + '' + i
                obj[i].closable = true
                this.tabs.push(obj[i])
                if(i === obj.length - 1) {
                    this.currentTab = obj[i].id
                }
            }
        }else if(obj && typeof obj === 'object') {
            obj.id = new Date().getTime() + '' + this.tabs.length
            obj.closable = true
            this.tabs.push(obj)
            this.currentTab = obj.id
        }
        return this
    }
    closeTab(title) {
        let list = this.tabs
        let index = list.findIndex(t => t.title === title)
        if(index === list.length - 1 && list.length - 1 !== 0) {
            this.currentTab = list[index - 1].id
        }else{
            this.currentTab = list[list.length - 1].id ? list[list.length - 1].id : ''
        }
        list.splice(index, 1)
        return this
    }
    focusTab(title) {
        let list = this.tabs
        let index = list.findIndex(t => t.title === title)
        this.currentTab = list[index].id
        return this
    }
    setHeight(val) {
        this.height = val
        return this
    }
    setWidth(val) {
        this.width = val
        return this
    }
    updateTitle(oldTitle, newTitle) {
        let tabs = this.tabs
        let index = tabs.findIndex(t => t.title === oldTitle)
        index !== -1 && (tabs[index].title = newTitle)
        return this
    }
    updateTabData(title, data) {
        let tabs = this.tabs
        let index = tabs.findIndex(t => t.title === title)
        index !== -1 && (tabs[index].data = data)
        return this
    }
    
}

export default Tabs