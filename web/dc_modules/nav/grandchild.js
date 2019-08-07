
import childMenu from './child.vue'
export default {
    name: 'grandchild',
    data () {
        return {
            menu: []
        }
    },
    props: ['data', 'nav'],
    components: {'child-menu': childMenu},
    created() {
        this.menu = this.data.children
    },
    methods: {
        
    }
}