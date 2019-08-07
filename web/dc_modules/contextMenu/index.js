const childMenu = () => import('./child.vue')
export default {
    name: 'contextmenu',
    data () {
        return {
        }
    },
    created() {
        this.$nextTick(() => {
            let bodyHeight = window.innerHeight
            let bodyWidth = window.innerWidth
            let menuHeight = this.$el.offsetHeight
            let menuWidth = this.$el.offsetWidth
            let left = parseInt(this.object.style.left)
            let top = parseInt(this.object.style.top)
            let newLeft
            let newTop
            let scrollFunc = () => {
                this.object.show = false
            }
            if(document.addEventListener){
                document.addEventListener('DOMMouseScroll', scrollFunc, false);
            }
            window.onmousewheel = document.onmousewheel = scrollFunc
            if(top + menuHeight > bodyHeight) {
                newTop = bodyHeight - menuHeight
                this.object.style.top = newTop + 'px'
            }
            if(left + menuWidth > bodyWidth) {
                newLeft = bodyWidth - menuWidth
                this.object.style.left = newLeft + 'px'
            }
        })
    },
    props: ['object', 'data', 'isChild'],
    methods: {
        mouseleave() {
            if(!this.isChild) {
                this.object.show = false
            } 
        },
        itemClick(item) {
            item.click && item.click(...this.object.params)
        },
        itemDbclick(item) {
            
        },
        itemMouseout(event) {
            event.target.style = this.itemStyle
            this.object.currentItem = {}
        },
        itemMouseEnter(event, item, index) {
            let target = event.target
            target.style = Object.assign({}, this.itemHoverStyle)
            let sum = 0
            this.object.menu.forEach((item, sumIndex) => {
                if (item.show && !item.show(this.data) && index > sumIndex) {
                    sum++
                }
            })
            this.$nextTick(() => {
                this.object.currentItem = {
                    data: item,
                    position: {
                        left: parseInt(this.object.style.left) + 16,
                        top: parseInt(this.object.style.top) + 4
                    },
                    size: {
                        width: target.offsetWidth,
                        height: target.offsetHeight
                    },
                    index: index - sum
                }
            })
            
        },
        menuMousemove() {}
    },
    computed: {
        style() {
            let style = ''
            for(let key in this.object.style) {
                style += key + ':' + this.object.style[key] + ';'
            }
            return style
        },
        itemStyle() {
            let style = ''
            for(let key in this.object.itemStyle) {
                style += key + ':' + this.object.itemStyle[key] + ';'
            }
            return style
        },
        itemHoverStyle() {
            let style = ''
            for(let key in this.object.itemHoverStyle) {
                style += key + ':' + this.object.itemHoverStyle[key] + ';'
            }
            return style
        },
        show() {
            return this.object.show
        }
    },
    components: {
        'child-menu': childMenu
    },
    watch: {
        show(val) {
            if(val) {
                this.$nextTick(() => {
                    let bodyHeight = window.innerHeight
                    let bodyWidth = window.innerWidth
                    let menuHeight = this.$el.offsetHeight
                    let menuWidth = this.$el.offsetWidth
                    let left = parseInt(this.object.style.left)
                    let top = parseInt(this.object.style.top)
                    let newLeft
                    let newTop
                    if (top + menuHeight > bodyHeight) {
                        newTop = bodyHeight - menuHeight
                        this.object.style.top = newTop + 'px'
                    }
                    if (left + menuWidth > bodyWidth) {
                        newLeft = bodyWidth - menuWidth
                        this.object.style.left = newLeft + 'px'
                    }
                })
            }
        }
    }
}