
export default {
    name: 'frameset',
    data () {
        return {
            frameset: {}
        }
    },
    created() {
        this.frameset = this.$frameset
    },
    props: [],
    methods: {
        remove(item) {
            let index = this.frameset.list.indexOf(item)
            this.frameset.list.splice(index, 1)
        }
    },
    computed: {
        position() {
            let string = ''
            let obj = this.frameset.positionInfo[this.frameset.position]
            for(let key in obj) {
                string += key + ':' + obj[key] + ';'
            }
            return string
        }
    },
    watch: {
       
    }
}