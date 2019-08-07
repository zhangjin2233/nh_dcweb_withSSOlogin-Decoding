<template>
  <dc-form :object="form"></dc-form>
</template>
<script>

export default {
  name: 'pdcFileEntity',
  props: ['structure','data'],
  data () {
    return {
      form: new dc.Form({
        structure: this.structure,
        data: this.data,
      })
    }
  },
  created(){
    this.$nextTick(()=>{

    });
    
  },
  watch:{
    data(){
      this.form.setForm(this.data,this.structure);
    },
  },
}
</script>
<!-- scoped -->
<style>

</style>
