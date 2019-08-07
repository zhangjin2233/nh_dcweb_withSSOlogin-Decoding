<template>
    <div 
    class="name" 
    @click="toIndex"
    v-html="getContent()">
    </div>
</template>

<script>
export default {
    components: {},
    props: [],
    data() {
        return {
        }
    },
    created() {
    },
    watch: {},
    computed: {
    },
    methods: {
        toIndex() {
            this.$router.push('/')
        },
        getContent() {
            let wrapper = {}
            try{
                let logo = dcConfig.page.logo
                wrapper = document.createElement('div')
                let newDom = document.createElement(logo.tag)
                for(let key in logo.attr) {
                    newDom.setAttribute(key, logo.attr[key])
                }
                newDom.innerHTML = logo.content
                wrapper.appendChild(newDom)
                return wrapper.innerHTML
            }catch(err) {}
        }
    },
}
</script>
<style scoped>
.name{
    display: inline-block;
    font-size: 28px;
    font-weight: bold;
    margin-right: 20px;
    font: 700 28px "Comic Sans MS";
    color: #fff;
    cursor: pointer;
}
</style>