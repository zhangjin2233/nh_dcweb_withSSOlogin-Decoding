<template>
    <div 
    class="text-input" 
    :style="`left: ${left}px;top: ${top}px;width: ${width}px`" 
    @mouseover="mouseOver"
    @mouseout="mouseOut">
        <el-input 
        type="textarea" 
        v-if="data"
        v-model="data[name]" 
        ref="inputText" 
        :autosize="{ minRows: 7, maxRows: 7}"
        :disabled="inputDisabled"></el-input>
        <div 
        :class="`bar ${item.name}-bar`" 
        draggable="true"
        @dragstart.stop="resizeInput($event, item, 'start')"
        @dragend="resizeInput($event, item, 'end')"
        v-for="item in bars" 
        :key="item.name"></div>
        <div class="close-icon" title="关闭弹框" @click="closeInput">
            <i class="fa fa-times-circle"></i>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['data', 'name', 'input', 'inputDisabled', 'showInputText'],
    data() {
        let _this = this
      return {
          left: 0,
          top: 0,
          width: 340,
          height: 160,
          x: 0,
          bars: [{
              name: 'left',
              fn(event) {
                  _this.width -= (event.offsetX - _this.x)
                  _this.left += (event.offsetX - _this.x)
              }
          }, {
              name: 'right',
              fn(event) {
                  _this.width += event.offsetX - _this.x
              }
          }]
      }
    },
    created() { 
        // this.setPosition()
        this.$nextTick(() => {
            // this.$refs.inputText.focus()
        })
            
    },
    watch: {
        input: {
            deep: true,
            handler(val) {
                if(val) {
                    this.setPosition()
                }
            }
        },
        showInputText(val) {
            if(val) {
                this.setPosition()
                this.$nextTick(() => {
                    this.$refs.inputText.focus()
                })
            }
        }
    },
    computed: {},
    methods: {
        setPosition() {
            let getElementPosition = (element, type='Top') => {
            　　　　var actualTop = element['offset' + type]
            　　　　var current = element.offsetParent

            　　　　while (current !== null){
            　　　　　　actualTop += current['offset' + type] - current['scroll' + type]
            　　　　　　current = current.offsetParent
            　　　　}

            　　　　return actualTop
            　　}
            let left = getElementPosition(this.input, 'Left') - 10
            let top = getElementPosition(this.input) + 28
            let bodyHeight = window.innerHeight
            let bodyWidth = window.innerWidth
            if(top + 160 > bodyHeight) {
                top -= 174
            }
            if(left + 340 > bodyWidth) {
                left = bodyWidth - 342
            }
            this.left = left
            this.top = top
        },
        mouseOver() {
            this.$emit('hoverInput', true)
        },
        mouseOut() {
            // this.$emit('hoverInput', false)
        },
        resizeInput(event, item, type) {
            if(type === 'start') {
                this.x = event.offsetX
            }else {
                item.fn(event)
            }
        },
        closeInput() {
            this.$emit('hoverInput', false)
        }
    },
}
</script>
<style scoped>
.text-input{
  position: fixed;
  z-index: 3000;
  height: 146px;
  
  /* background: #fff; */
  /* border: 1px solid #ccc; */
  /* border-radius: 8px; */
  padding: 0 12px;
}
.bar{
    position: absolute;
}
.left-bar{
    left: 0;
    cursor: w-resize;
}
.right-bar{
    right: 0;
    cursor: e-resize;
}
.left-bar,.right-bar{
    width: 12px;
    height: 100%;
    top: 0
}
.close-icon{
    position: absolute;
    top: 0px;
    right: 14px;
    cursor: pointer;
    color: #ccc;
}
</style>