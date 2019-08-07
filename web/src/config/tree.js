const treeConfig = {
    emptyText: '暂无数据', //没有数据时显示的文本
    key: 'id', //作为唯一标识的字段
    lazy: true, //是否需要懒加载
    indent: 16, //节点的缩进距离
    expandAll: false, //是否展开所有节点
    highlightCurrent: true, //是否高亮选中节点
    hasCheckbox: true, //是否有选择框
    checkStrictly: false, //是否父子之间的选择框有关联
    fontSize: '14px',//字体大小
    props: { //各属性的字段定义
        label: 'label',
        children: 'children',
        disabled: 'disabled',
        isLeaf: 'isLeaf'
    },
    accordion: false,//是否只展开一个节点
    loadType: [], //懒加载的节点类型
    selectLeafOnly: true, //是否只选中叶节点
}

export default treeConfig