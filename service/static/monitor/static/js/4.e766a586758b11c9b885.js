webpackJsonp([4],{Ciwm:function(t,e,o){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n={mixins:[{name:"frame",data:function(){return{canMove:!1,canResizeRight:!1,canResizeBottom:!1,canResizeLeftBottom:!1,memory:{top:"200px",left:"200px",width:"50%",height:"50%"},isFullsrceen:!1,transform:"transform: translate(-50%, -50%);"}},created:function(){this.object.center&&(this.object.top="50%",this.object.left="50%")},props:["object"],methods:{mousemove:function(t,e){switch(e){case"move":this.canMove&&(this.object.top=t.target.parentNode.offsetTop+t.movementY+"px",this.object.left=t.target.parentNode.offsetLeft+t.movementX+"px");break;case"right":this.canResizeRight&&(this.object.width=t.target.parentNode.offsetWidth+t.movementX+"px");break;case"bottom":this.canResizeBottom&&(this.object.height=t.target.parentNode.offsetHeight+t.movementY+"px");break;case"leftBottom":this.canResizeLeftBottom&&(this.object.height=t.target.parentNode.offsetHeight+t.movementY+"px",this.object.width=t.target.parentNode.offsetWidth+t.movementX+"px")}},close:function(){this.$closeFrame(this.object.id),this.object.close&&this.object.close()}},watch:{isFullsrceen:function(t){if(t){for(var e in this.memory)this.memory[e]=this.object[e];this.object.width="100%",this.object.height="100%",this.object.left=0,this.object.top=0}else for(var o in this.memory)this.object[o]=this.memory[o]}}}]},s={render:function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("div",{staticClass:"frame",style:"width: "+t.object.width+"; \nheight: "+t.object.height+"; \ntop: "+t.object.top+"; \nleft: "+t.object.left+"; \nz-index: "+t.object.zIndex+";"},[o("div",{staticClass:"header",style:"background: "+t.object.headerBackgroundColor+";",on:{mousedown:function(e){e.stopPropagation(),e.preventDefault(),t.canMove=!0},mouseup:function(e){e.stopPropagation(),e.preventDefault(),t.canMove=!1},mouseout:function(e){e.stopPropagation(),e.preventDefault(),t.canMove=!1},mousemove:function(e){e.stopPropagation(),e.preventDefault(),t.mousemove(e,"move")}}},[o("span",[t._v(t._s(t.object.title))])]),t._v(" "),o("div",{staticClass:"body",style:"background: "+t.object.backgroundColor+";color: "+t.object.color+";font-size: "+t.object.fontSize},[t.object.html?o("div",{domProps:{innerHTML:t._s(t.object.html)}}):t._e(),t._v(" "),o(t.object.component,{tag:"component",attrs:{propData:t.object.data}})],1),t._v(" "),o("div",{staticClass:"btns"},[t.object.minimization?o("i",{staticClass:"fa fa-minus",on:{click:function(e){t.object.show=!1}}}):t._e(),t._v(" "),t.object.maximization?o("i",{staticClass:"fa fa-window-maximize",class:{"fa-window-restore":t.isFullsrceen},on:{click:function(e){t.isFullsrceen=!t.isFullsrceen}}}):t._e(),t._v(" "),o("i",{staticClass:"fa fa-close",on:{click:t.close}})]),t._v(" "),o("div",{staticClass:"resize-left",on:{mousedown:function(e){e.stopPropagation(),e.preventDefault(),t.canResizeRight=!0},mouseup:function(e){e.stopPropagation(),e.preventDefault(),t.canResizeRight=!1},mouseout:function(e){e.stopPropagation(),e.preventDefault(),t.canResizeRight=!1},mousemove:function(e){e.stopPropagation(),e.preventDefault(),t.mousemove(e,"right")}}}),t._v(" "),o("div",{staticClass:"resize-bottom",on:{mousedown:function(e){e.stopPropagation(),e.preventDefault(),t.canResizeBottom=!0},mouseup:function(e){e.stopPropagation(),e.preventDefault(),t.canResizeBottom=!1},mouseout:function(e){e.stopPropagation(),e.preventDefault(),t.canResizeBottom=!1},mousemove:function(e){e.stopPropagation(),e.preventDefault(),t.mousemove(e,"bottom")}}}),t._v(" "),o("div",{staticClass:"resize-left-bottom",on:{mousedown:function(e){e.stopPropagation(),e.preventDefault(),t.canResizeLeftBottom=!0},mouseup:function(e){e.stopPropagation(),e.preventDefault(),t.canResizeLeftBottom=!1},mouseout:function(e){e.stopPropagation(),e.preventDefault(),t.canResizeLeftBottom=!1},mousemove:function(e){e.stopPropagation(),e.preventDefault(),t.mousemove(e,"leftBottom")}}})])},staticRenderFns:[]};var i=o("VU/8")(n,s,!1,function(t){o("QlWH")},"data-v-ff8fa9ee",null);e.default=i.exports},QlWH:function(t,e){}});