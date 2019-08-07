<template>
  <div class="treeContainer" v-loading="loading">
    <dc-tree :object="tree"></dc-tree>
    <dc-contextmenu :object="contextmenu"></dc-contextmenu>
  </div>
</template>

<script>

export default {
  name: 'nodeTree',
  props: ['propData'],
  data () {
    return {
      loading: false,
      contextmenu: new dc.Contextmenu(),
      tree: new dc.Tree({
        height: '300px',
        hasCheckbox: true,
        singleSelect: false,
        lazy: false,
        hasContextmenu: false,
        nodeContextmenu: (e, nodeData, node)=>{
          let arr;
          switch(this.propData.dcType){
            case "sdc":
              arr = ["SDCRoot","SDCFolder"];
              break;
            case "adc":
              arr = ["ADCRoot","ADCFolder"];
              break;
            case "cdc":
              arr = ["ADC","CDCFoler"];
              break;
            default:
              break;
          }
          if(arr.includes[nodeData.type]){
            let contextmenu = [{
              text: '创建文件夹',
              icon: 'fa fa-plus-square-o',
              iconColor: 'green',
              click:()=>{
                this.contextmenu.hideMenu();
                let form = new dc.Form({
                  structure: [{
                    type: 'string',
                    readOnly: false,
                    canBeEmpty: false,
                    name: 'label',
                    label: '名称',
                  }],
                  data: { label:''},
                  btns: [{
                    label: '确定',
                    type: 'primary',
                    click:(form, btn, index)=>{
                      let data = {
                        pId: nodeData.id,
                        type: this.propData.dcType.toUpperCase()+'Folder',
                        name: form.data.label,
                      }
                      DCHttp.req({url:'/api/catalog/create', params:data}).then(res=>{
                        if(res) {
                          this.initData();
                          this.$closeDialog()
                        }
                      })
                    }
                  }, {
                    label: '取消',
                    click: (form, btn, index)=>{
                        this.$closeDialog()
                    }
                  }]
                })
                this.$openDialog({
                  title: '创建',
                  width: '400px',
                  component: 'dc-form',
                  data: { object: form }
                })
              }
            },
            {
              text: '创建'+this.propData.dcType.toUpperCase(),
              icon: 'fa fa-plus',
              iconColor: 'green',
              click:()=>{
                const storyNode = Tree.getParentNode(nodeData.link, "Story");
                this.contextmenu.hideMenu();
                this.$closeDialog();
                this.$router.push({ path: this.propData.dcType == 'cdc' ? '/cdcForm' : this.propData.dcType, query: objClone(nodeData,{from: JSON.stringify(this.$route.query),storyId:storyNode.data.link,adcId:nodeData.link},['id','pId','link','label','type'],true) });
              }
            }]
            this.contextmenu.showMenu(e,contextmenu);
          }
        }
      }),
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    });
  },
  methods:{
    initData(){
      this.loading = true;
      DCHttp.req({url:this.propData.url, params:this.propData.reqData}).then(res=>{
        if(res){
          this.loading = false;
          this.tree.setData(res.CONTENT.treeList);
          res.CONTENT.treeList.length && this.tree.set('defaultExpandedKeys', [res.CONTENT.treeList[0].id])
        }
      });
    },
    
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.treeContainer{
  overflow: auto;
}
</style>
