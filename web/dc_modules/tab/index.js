export default {
    name: 'tab',
    data () {
        return {
            type: 'card',
            tabPosition: 'top',
            stretch: false,
            tab: '',
        }
    },
    props: ['object'],
    created() {
        this.$nextTick(() => {
           if(this.object.fullscreen && this.object.tabs.length) {
                let header = this.$el.getElementsByClassName('el-tabs__nav-wrap is-top')[0]
                header.ondblclick = () => {
                    this.object.isFullscreen = !this.object.isFullscreen
                }
           }
        })
       
    },
    methods: {
        remove(tab) {
            let index = this.object.tabs.findIndex(t => t.id === tab)
            this.$closeTab(this.object.tabs[index].title, this.object.name)
            this.object.tabRemove && this.object.tabRemove(this.object)
        },
        tabClick(tab) {
            let tabs = this.object.tabs
            let vue = this.$refs[tabs[tab.index].id] && this.$refs[tabs[tab.index].id][0]
            this.object.tabClick && this.object.tabClick(tabs[tab.index], vue)
        },
    },
    computed: {
        currentTab() {
            return this.object.currentTab
        },
        tabsLength() {
            return this.object.tabs.length
        }
    },
    watch: {
        currentTab(val, oldVal) {
            let tabs = this.object.tabs
            let activeTabIndex = tabs.findIndex(t => t.id === val)
            let oldTabIndex =  tabs.findIndex(t => t.id === oldVal)
            this.object.tabChange && this.object.tabChange(tabs[activeTabIndex], tabs[oldTabIndex])
        },
        tabsLength(val, oldVal) {
            if(val === 1 && oldVal === 0) {
                let header = this.$el.getElementsByClassName('el-tabs__nav-wrap is-top')[0]
                header.ondblclick = () => {
                    this.object.isFullscreen = !this.object.isFullscreen
                }
            }
        }
    }
}