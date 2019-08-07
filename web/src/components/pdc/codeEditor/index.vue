<template>
  <codemirror v-model="code" :options="options"></codemirror>
</template>

<script>
import { codemirror } from 'vue-codemirror-lite'
require('codemirror/mode/clike/clike.js')
require('codemirror/addon/hint/show-hint.js')
require('codemirror/addon/hint/show-hint.css')
require('codemirror/theme/eclipse.css')
export default {
  components: {
    codemirror
  },
  props: ['data','attr'],
  data() {
    return {
      code: "",
      options: {
        mode: 'text/x-java',
        selectOnLineNumbers: true,
        lineNumbers: true,
        theme: 'eclipse setHeight'
      },
    }
  },
  watch:{
    attr(){
      this.initData();
    },
    code(val){
      this.data[this.attr] = val;
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    })
  },
  methods:{
    initData(){
      this.code = this.data[this.attr];
    },
  },
}
</script>
<style scoped>
.vue-codemirror-wrap{
  height: calc(100% - 32px);
}
</style>