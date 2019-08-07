<template>
  <div class="graph" ref="graph" @click.right.prevent v-loading="flowLoading" tabIndex="0" @keyup.ctrl.prevent.stop="keyup($event)" @keydown.prevent>
    
    <toolbarBtn :flow="flow"></toolbarBtn>
    
    <!-- 工具栏的展示切换开关 -->
    <el-button v-show="flow.btnGroup.show" @click="flow.btnGroup.event(flow)" class="btnGroup" :style="flow.btnGroup.style" :title="flow.btnGroup.title" size="mini">
      <i class="fa fa-bars"></i>
    </el-button>

    <list v-if="flow.listShow" :flow="flow"></list>

    <!-- 自定义弹窗 -->
    <el-popover ref="popoverDialog" :placement="popover.placement" :title="popover.title" :width="popover.width" trigger="focus" v-model="popover.show" :content="popover.content" :visible-arrow="popover.arrow" popper-class="ndoe-popper">
      <i class="fa fa-refresh popoverrefresh" title="刷新" v-show="popover.component == 'dc-staticFlow'" @click="flow.popoverRefresh()"></i>
      <i class="fa fa-remove popoverexist" title="关闭" @click="popoverShut()"></i>
      <component v-if="popover.component" :is="popover.component" :propData="popover.propData"></component>
      <i slot="reference" ref="popover" :style="`position:fixed;left:${popover.x};top:${popover.y}`"></i>
    </el-popover>

    <!-- 自动布局用的画板 -->
    <div :id="`svg_div${index}`" style="opacity:0"><div v-html="svg_div"></div></div>
    
    <!-- 流图画板 -->
    <div>
      <svg ref="svg" :class="`svgContainer ${flow.svgAnimate}`"
        :width="panelObj.panelWidth" :height="panelObj.panelHeight" :style="`background:${flow.svgBackground}`"
        :viewBox="`${panelObj.viewBoxX} ${panelObj.viewBoxY} ${panelObj.viewBoxWidth} ${panelObj.viewBoxHeight}`"  
        @mousedown.stop="selectStar($event)" @mouseup="selectOver()" 
        @mousemove="moveInPanel($event)" @mousedown.right="panelRightClick($event)"
        @drop.prevent="drop($event)" @dragover.prevent>
        <defs>  
          <!-- 绘制箭头 -->
          <marker :id="`arrow${index}`" markerUnits="strokeWidth" markerWidth="12" markerHeight="12" :fill="flow.line.arrow.color" :viewBox="flow.line.arrow.size" refX="6" refY="6" orient="auto">  
            <path :d="flow.line.arrow.path" :stroke-width="flow.line.arrow.strokeWidth" />   
          </marker>
          <!-- 绘制文本背景色 -->
          <filter x="0" y="0" width="1" height="1" :id="`textBgColor${index}`">
            <feFlood :flood-color="flow.textBgColor"/>
            <feComposite in="SourceGraphic"/>
          </filter>
        </defs>  

        <!-- 绘制连线 -->
        <g ref="lineContainer">
            <g v-for="(line, i) in lines" :key="i" v-if="nodes[line[0]].visible && nodes[line[1]].visible" @mouseenter="lineFloat($event,line)" @mouseout="lineSink($event,line)" @dblclick="dblClickLine(line)" @mousedown.right.prevent.stop="removeLine(i)">
              <title>{{lineTitle(line,'line')}}</title>
              <path :d="drawLine(line)" fill="none" :marker-end="`url(#arrow${index})`" :stroke-width="lineWidth" :stroke-opacity="flow.line.opacity" :style="`stroke:${focusLinesStyle(line,'line')}`" />
            </g>
            <g v-for="(line, i) in jumpLinks" :key="'jumpLinks'+i" v-if="nodes[line[0]].visible && nodes[line[1]].visible" @mouseenter="lineFloat($event,line)" @mouseout="lineSink($event,line)" @dblclick="dblClickLine(line)" @mousedown.right.prevent.stop="removeLine(i,'jumpLinks')">
              <title>{{lineTitle(line,'jumpLink')}}</title>
              <path :d="drawLine(line,'jump')" :stroke-dasharray="lineDashArray" fill="none" :marker-end="`url(#arrow${index})`" :stroke-width="lineWidth" :stroke-opacity="flow.line.opacity" :style="`stroke:${focusLinesStyle(line,'jumpLinks')}`" />
            </g>
        </g>
        
        <!-- 绘制节点 -->
        <g v-for="(node) in nodes" :key="node.id" v-if="node.visible" ref="node" :id="node.id" :opacity="node.hasOwnProperty('opacity') ? node.opacity : 1" style="transition: opacity 100ms;">
          <foreignObject v-if="flow.domType == 'html'" :x="node.x" :y="node.y" :width="node.width" :height="node.height" @mousedown.stop.prevent="choseNode($event,node)" @mouseup.stop.prevent="moveOver()" @click.right.stop.prevent="nodeRightClick($event,node)" :style="`overflow:visible;${flow.foreignObjectStyle}`" draggable="false">
            <component :is="flow.type || 'node'" :propData="{node:node,flow:flow}"></component>
          </foreignObject>
          <component v-else-if="flow.domType == 'svg'" :is="flow.type" :propData="{node:node,flow:flow}"></component>
        </g>

        <!-- 选框 -->
        <rect ref="selectBox" v-show="selectBox.attr.width"
          :x="selectBox.attr.x" :y="selectBox.attr.y" draggable="false"
          :width="selectBox.attr.width" :height="selectBox.attr.height" 
          :fill="selectBox.attr.nodesId.length ? flow.selectedFill : flow.selectingFill" :opacity="selectBox.attr.nodesId.length ? flow.selectedOpacity : flow.selectingOpacity" :stroke="flow.selectBoxStroke" :stroke-width="flow.selectBoxStrokeWidth"
          @mousedown.left.stop.prevent="selectBoxMoveStart($event)" 
          @mouseup="selectBoxMoveOver()" @dblclick="selectBoxDbClick($event)"
          @mousedown.right.stop.prevent="selectBoxRightClick($event)"/>
      </svg>
    </div>

    <dc-contextmenu :object="flow.contextmenu"></dc-contextmenu>

  </div>
</template>

<script>
import index from './index.js'
export default index
</script>

<style>
.graph .el-loading-mask{
  position: fixed;
}
.graph img{
  box-sizing: border-box;
}
.ndoe-popper{
  background: #fffffc;
  opacity: 0.95 !important;
}
</style>

<style scoped >
.popoverexist{
  position:absolute;
  top:10px;
  right:10px;
  color: red;
  cursor: pointer;
}
.popoverexist:hover{
  color: #ff461f;
}
.popoverrefresh{
  position:absolute;
  top:10px;
  right:30px;
  color: green;
  cursor: pointer;
}
.popoverrefresh:hover{
  color: #0eb83a;
}
.graph{
  overflow: auto;
  height: 100%;
  /*禁止文本选中*/
  -webkit-touch-callout: none;  
  -webkit-user-select: none;  
  -khtml-user-select: none;  
  -moz-user-select: none;  
  -ms-user-select: none;  
  user-select: none;
}
.graph:focus{
  outline: none;
}
.graph .svgContainer{
  display: inline-block;
  margin: 0;
  padding: 0;
  transition: width 100ms, height 100ms;
}
path{
  stroke: #333;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.btnGroup{
  position: fixed;
  z-index: 10;
  width:43px;
}
.graph rect{
  stroke:#333;
  stroke-width:1px;
  outline: none;
}
.graph .status{
  stroke-width:0;
  outline: none;
}
</style>