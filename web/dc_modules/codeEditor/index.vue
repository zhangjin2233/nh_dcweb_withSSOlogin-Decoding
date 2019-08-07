<template>
  <codemirror class="code-editor" v-model="code" :options="options"></codemirror>
</template>

<script>
import { codemirror } from 'vue-codemirror-lite'
import params from '@/config/codeEditor.js'
var modes = [];

export default {
  name: 'codeEditor',
  components: { codemirror },
  props: ['value','propData'],
  computed:{
    code:{
      get() { 
        return this.value; 
      }, 
      set(val) { 
        this.$emit('input', val); 
      } 
    },
    options(){
      let mode = this.propData.form.codeMode || params.codeMode; //默认渲染方式
      let elseOptions = this.propData.form.codeOptions || params.codeOptions; //其他设置
      return Object.assign({mode: this.loadMode(mode)}, elseOptions);
    }
  },
  methods:{
    loadMode(lang){
      let arr = lang.split('/');
      let type = arr[0]; //语言的类型
      let hasLoad = modes.includes(type); //是否加载过该类型的语言包
      let mode; //渲染的语言模式，vue/sql/clike
      switch(type){
        case 'html':
          lang = 'vue';
        case 'vue':
        case 'javascript':
          mode = 'vue';
          hasLoad = modes.includes(mode);
          hasLoad || require('codemirror/mode/vue/vue');
          break;
        case 'sql':
          lang = 'text/'+arr[1];
          mode = type;
          hasLoad || require("codemirror/mode/sql/sql");
          break;
        case 'clike':
          lang = 'text/'+arr[1];
          mode = type;
          hasLoad || require('codemirror/mode/clike/clike.js');
          break;
        default:
          mode = 'text';
          hasLoad = modes.includes(mode);
          break;
      }
      hasLoad || modes.push(mode);
      return lang;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.code-editor{
  border: solid 1px #ccc;
  line-height: 20px;
  font-family: Consolas, 'Courier New', monospace;
}
</style>