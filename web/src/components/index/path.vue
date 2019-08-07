<template>
    <div class="path">
        <span v-for="(item, index) in data" :key="index">
            <span @click="toLink(item.type, item.id)" :class="{link: linkType.includes(item.type)}">
                <img :src="icons[item.type]" alt="" v-if="item.type">
                <span>{{item.label}}</span>
            </span>
            <span v-if="index !== data.length - 1">></span>
        </span>
    </div>
</template>

<script>
import treeConfig from '@/config/tree.js'
export default {
    components: {},
    props: ['data', 'tree'],
    data() {
      return {
          linkType: ['SDC', 'SDF', 'CDC', 'CDF', 'ADC', 'ADF', 'PDC', 'PDF', 'Job', 'PDFJob'],
          icons: dcConfig.tree.icons
      }
    },
    created() {
        this.$addListener('changePathName', (id, label) => {
            let index = this.data.findIndex(d => d.id === id)
            if(index > -1) {
                this.data[index].label = label
            }
        })
    },
    destroyed() {
        this.$cancelEvent('changePathName')
    },
    watch: {},
    computed: {},
    methods: {
        toLink(type, id) {
            if(this.linkType.includes(type)) {
                let node = this.tree.getNode(id).data
                node.storyId = this.$route.query.storyId
                if(!node.storyId) {
                    if(this.$route.path !== '/pdcForm') {
                        node.storyId = JSON.parse(this.$route.query.from).storyId
                    }else {
                        node.storyId = JSON.parse(this.$route.query.from).query.storyId
                    }
                    
                }
                VUE.$router.push({ path: type.slice(-3).toLowerCase(), query: objClone(node,{},['id','pId','link','label','type','storyId'],true) });
            }
        }
    },
}
</script>
<style scoped>
.path{
    display: inline;
    opacity: 0.6;
    position: relative;
    top: -30px;
    font-size: 14px;
    font-weight: bold;
    left: 320px;
    z-index: 4;
}
img{
    width: 14px;
}
.link{
    color: blue;
    /* text-decoration: underline; */
    cursor: pointer;
}
</style>