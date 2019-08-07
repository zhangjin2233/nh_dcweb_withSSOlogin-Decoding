
const grandChild  = () => import('./grandchild.vue')
export default {
    name: 'menu',
    data () {
        return {
            hoverItem: null,
            menu: []
        }
    },
    props: [ 'data', 'nav'],
    created() {
        this.menu = this.data.children.filter(item => {
            if(item.show === undefined) {
                return true
            }else if(typeof item.show === 'function') {
                return item.show()
            }else if(typeof item.show === 'boolean') {
                return item.show
            }
        })
    },
    components: {'grand-child': grandChild},
    methods: {
        itemMouseenter(event, item) {
            this.hoverItem = item
        },
        itemMouseleave() {
            
        },
        itemClick(item) {
            this.$emit('hide')
            item.click && item.click(item)
        }
    }
}