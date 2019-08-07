<template>
    <div class="memory-stroke">
        <div class="memory-stroke-highlight" :style="`width: ${150*data.row[data.name][0]/data.row[data.name][1]}px `"></div>
        <span class="memory-stroke-text">{{ data.row[data.name] | memoryExchange}}</span>
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
    filters: {
        memoryExchange(val) {
            let value1 = parseInt(val[0])
            let value2 = parseInt(val[1])
            let fn1 = (value) => {
                if(value < 1024) {
                    return value + 'MB'
                }else {
                    return (value / 1024).toFixed(2) + 'GB'
                }
            }
            if(value2 === 0) {
                return '未知'
            }else{
                return fn1(value1) + '/' + fn1(value2)
            }
           
        },
    } 
  }
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .memory-stroke{
        position: relative;
        border: 1px solid rgb(130, 150, 255);
        width: 150px;
        height: 20px;
    }
    .memory-stroke-highlight{
        position: absolute;
        top: 0;
        left: 0;
        max-width: 100%;
        height: 100%;
        background: rgb(130, 150, 255);
    }
    .memory-stroke-text{
        position: relative;
        line-height: 20px;
        z-index: 1;
        color: #000;
    }
</style>
