webpackJsonp([20],{UBsi:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i={mixins:[{name:"childMenu",data:function(){return{contextmenu:{}}},props:["data","father"],created:function(){this.contextmenu=new dc.Contextmenu,this.contextmenu.itemHoverStyle=this.father.itemHoverStyle,this.contextmenu.itemStyle=this.father.itemStyle;var t=this.father.currentItem.position.left+this.father.currentItem.size.width+10,e=this.father.currentItem.position.top;this.contextmenu.showMenu([t,e],this.data)},methods:{},computed:{},components:{"context-menu":function(){return new Promise(function(t){t()}).then(n.bind(null,"0JeQ"))}}}]},o={render:function(){var t=this.$createElement;return(this._self._c||t)("context-menu",{staticClass:"childMenu",attrs:{object:this.contextmenu}})},staticRenderFns:[]};var r=n("VU/8")(i,o,!1,function(t){n("xipT")},"data-v-3720870e",null);e.default=r.exports},xipT:function(t,e){}});