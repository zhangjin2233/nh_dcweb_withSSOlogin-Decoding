<template>
  <div id="app">
    <router-view/>
    <dc-module/>
  </div>
</template>

<script>
import setTabs from './assets/js/index/setTabs.js'
export default {
  name: 'App',
  created() {
    setTabs()
    document.body.ondragstart = ()=>{ return false }
    this.$nextTick(() => {
      let isRun = window.sessionStorage.getItem('isRun');
      isRun || localforage.clear();
      window.sessionStorage.setItem('isRun',true)
    })
    
  },
  methods: {
    getUser(users) {
      this.$refs.user.refresh()
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
/* 去掉数字输入框的上下按钮 */
input[type="number"]::-webkit-inner-spin-button {
   -webkit-appearance: none;
}
input[type="number"]::-webkit-outer-spin-button {
   -webkit-appearance: none;
}
input[type="number"]{-moz-appearance:textfield;}
</style>
