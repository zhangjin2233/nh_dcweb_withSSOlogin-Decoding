<template>
  <div>
    <div ref="grid" class="grid-container" :style="`grid-template-columns:repeat(${propData.colNum || colNum},auto);${propData.style}`">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'grid',
  props: ['propData'],
  data(){
    return {
      timer: null,
      colNum: this.propData.defaultCol,
    }
  },
  created(){
    this.$nextTick(()=>{
      this.timer = this.propData.colWidth && requestAnimationFrame(this.getColNum);
    })
  },
  destroyed(){
    cancelAnimationFrame(this.timer);
  },
  methods:{
    getColNum(){
      let colWidth = this.propData.colWidth;
      let style = window.getComputedStyle(this.$el);
      let gap = 0;
      if(style.boxSizing == 'border-box'){
        gap = parseInt(style.borderLeftWidth) + parseInt(style.borderRightWidth) + parseInt(style.paddingLeft) + parseInt(style.paddingRight);
      }
      let contentWidth = this.$el.offsetWidth - gap;
      this.colNum = parseInt(contentWidth / colWidth);
      this.timer = requestAnimationFrame(this.getColNum);
    }
  }
}
</script>

<style scoped>
.grid-container{
  display: grid;
  justify-content: center;
}
</style>