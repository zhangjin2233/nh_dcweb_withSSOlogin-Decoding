<template>
  <div 
  class="tree" 
  :style="`height: ${tree.height ? tree.height + ';overflow: auto;' : 'auto'}`">
    <el-tree
    :data="tree.data"
    ref="tree"
    :style="`font-size: ${tree.fontSize}`"
    :show-checkbox="tree.hasCheckbox"
    :expand-on-click-node="tree.clickNodeExpand"
    :node-key="tree.key"
    :empty-text="tree.emptyText"
    :indent="tree.indent"
    :default-expand-all="tree.expandAll"
    :default-expanded-keys="tree.defaultExpandedKeys"
    :highlight-current="tree.highlightCurrent"
    :check-strictly="tree.checkStrictly||tree.singleSelect"
    :accordion="tree.accordion"
    :lazy="tree.lazy"
    :load="loadNode"
    :props="tree.props"
    @node-click="nodeClick"
    @node-contextmenu="nodeContextmenu"
    @check-change="checkChange"
    @node-expand="nodeExpand"
    @node-collapse="nodeCollapse">
      <span class="custom-tree-node" :dataId="data[tree.key]" slot-scope="{ node, data }">
        <i class="node-icon" :style="`background-image: url(${data.icon})`" v-if="data.icon"></i>
        <span>{{ data.poolSize === undefined ? data.label :  data.label + '(并发数:' + data.poolSize + ')'}}</span>
      </span>
    </el-tree>
    <dc-contextmenu :object="tree.contextmenu" v-if="tree.contextmenu.show&&tree.hasContextmenu" :data="tree"></dc-contextmenu>
  </div>
</template>

<script>
import component from './index.js'
export default {
    mixins: [component]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.node-icon{
  display: inline-block;
  width: 14px;
  height: 14px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%; 
}
</style>
