<template>
    <div class="icon">
      <img :src="`data:image/x-icon;base64,${data.row[data.name]}`" alt="">
    </div>
</template>

<script>
export default {
    data() {
        return {
        }
    },
    created() {
    },
    props: ['data'],
    methods: {
        
    },
    computed: {
      
    }
  }
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
   .icon{
       img{
           height: 30px;
       }
   }
</style>
