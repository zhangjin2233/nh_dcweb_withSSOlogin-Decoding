
export default {
    name: 'popover',
    data () {
        return {
        }
    },
    created() {
        
    },
    props: ['object'],
    methods: {
        show() {
            this.object.show()
        },
        hide() {
            this.object.hide()
        }
    }
}