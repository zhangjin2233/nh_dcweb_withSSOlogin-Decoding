
import childMume from './child.vue'
export default {
    name: 'nav',
    data () {
        return {
            activeIndex: '',
            hoverItem: ''
        }
    },
    props: [ 'object' ],
    created() {
    },
    methods: {
        enterItem(item) {
            if(this.object.trigger === 'hover') {
                this.hoverItem = item
            }
        },
        leaveItem() {
            if(this.object.trigger === 'hover') {
                this.hoverItem = null 
            }
        },
        clickItem(item) {
            this.object.activeItemKey = item[this.object.key]
            if(this.object.trigger === 'click') {
                if(this.hoverItem === item) {
                    this.hoverItem = null
                }else {
                    this.hoverItem = item
                }
            }
            item.click && item.click(item)
        },
        setItemColor(item) {
            if(item === this.hoverItem) {
                return this.object.hoverColor
            }
            if(this.object.hightlineActive && item[this.object.key] === this.object.activeItemKey) {
                return this.object.activeColor
            }
            return this.object.color
        },
        hideMenu() {
            this.hoverItem = null
        }
    },
    components: {
        'child-menu': childMume
    }
}