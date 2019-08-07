function saveNode(data){
  let dc = {
    dcLabel: data.head.label || data.head.name,
    textList: data.tabs[0].tableData.map(item=>{
      return {
        dataType: item.elementType || item.dataType,
        label: item.label
      }
    })
  }
  window.sessionStorage.setItem('dc',JSON.stringify(dc));
}

export default saveNode;