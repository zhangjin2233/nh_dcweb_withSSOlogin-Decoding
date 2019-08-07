const contextmenu = () => import('./index.vue')
export default {
    name: 'childMenu',
    data () {
        return {
            contextmenu: {}
        }
    },
    props:['data', 'father'],
    created() {
        let params = this.father.params
        this.contextmenu = new dc.Contextmenu({
            params: params
        })
        this.contextmenu.itemHoverStyle = Object.assign({}, this.father.itemHoverStyle)
        this.contextmenu.itemStyle = Object.assign({}, this.father.itemStyle)
        let currentItem = this.father.currentItem
        let left = currentItem.position.left + currentItem.size.width + 10
        let top = currentItem.position.top + currentItem.size.height * currentItem.index
        this.contextmenu.showMenu([left, top], this.data)
    },
    methods: {
       
    },
    computed: {
       
    },
    components: {
        'context-menu': contextmenu
    }
}