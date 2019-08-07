export default {
  req: {
    getFlow: {
      url: '/api/CDF/get',
      data: {
        flowName: 'id',
      }
    },
    saveFlow: {
      url: '/api/CDF/save',
    },
  },
  dcType: 'cdc',
  nodeDbClick(e,node,Vue){ //节点双击
    VUE.$router.push({ path: '/cdcForm', query: {
      id: node.id,
      link: node.id,
      label: node.title,
      type: this.dcType,
      flowName: this.flowName,
      from: JSON.stringify(Vue.$route.query),
    }});
  }
}