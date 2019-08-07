export default {
  req: {
    getFlow: {
      url: '/api/ADF/get',
      data: {
        flowName: 'id',
      }
    },
    saveFlow: {
      url: '/api/ADF/save',
    },
  },
  dcType: 'adc',
  nodeDbClick(e,node,Vue){ //节点双击
    VUE.$router.push({ path: this.dcType, query: {
      id: node.id,
      link: node.id,
      label: node.title,
      type: this.dcType,
      flowName: this.flowName,
      from: JSON.stringify(Vue.$route.query),
    }});
  }
}