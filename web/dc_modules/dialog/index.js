export default {
    name: 'dialog',
    data () {
        return {
            
        }
    },
    props: ['object'],
    created() {
    },
    methods: {
        close() {
            this.$closeDialog && this.$closeDialog()
            this.object.close && this.object.close()   
        },
        btnClick(btn) {
            btn.click && btn.click(this.object, this.$refs.component)
        }
    }
}