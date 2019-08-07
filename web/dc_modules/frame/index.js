
export default {
    name: 'frame',
    data () {
        return {
            canMove: false,
            canResizeRight: false,
            canResizeBottom: false,
            canResizeLeftBottom: false,
            memory: {
                top: '200px',
                left: '200px',
                width: '50%',
                height: '50%'
            },
            isFullsrceen: false,
            transform: 'transform: translate(-50%, -50%);'
        }
    },
    created() {
        if(this.object.center) {
            this.object.top = '50%'
            this.object.left = '50%'
        }
    },
    props: ['object'],
    methods: {
        mousemove(event, type) {
            switch(type) {
                case 'move': 
                if(this.canMove) {
                    this.object.top = event.target.parentNode.offsetTop + event.movementY + 'px'
                    this.object.left = event.target.parentNode.offsetLeft + event.movementX + 'px'
                }
                break
                case 'right': 
                if(this.canResizeRight) {
                    this.object.width = event.target.parentNode.offsetWidth + event.movementX + 'px'
                }
                break
                case 'bottom':
                if(this.canResizeBottom) {
                    this.object.height = event.target.parentNode.offsetHeight + event.movementY + 'px'
                }
                break
                case 'leftBottom':
                if(this.canResizeLeftBottom) {
                    this.object.height = event.target.parentNode.offsetHeight + event.movementY + 'px'
                    this.object.width = event.target.parentNode.offsetWidth + event.movementX + 'px'
                }
                break
            } 
        },
        close() {
            this.$closeFrame(this.object.id)
            this.object.close && this.object.close()
        }
    },
    watch: {
        isFullsrceen(val) {
            if(val) {
                for(let key in this.memory) {
                    this.memory[key] = this.object[key]
                }
                this.object.width = '100%'
                this.object.height = '100%'
                this.object.left = 0
                this.object.top = 0
            }else {
                for(let key in this.memory) {
                    this.object[key] = this.memory[key]
                }
            }
        }
    }
}