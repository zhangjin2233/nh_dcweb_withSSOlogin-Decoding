const tableConfig = {
    pageTool: "total, sizes, prev, pager, next, jumper", //表格的分页设置
    btnMargin: 0, //表格上方的按钮之间的间距
    btnGroupMargin: 10, //按钮组离表格的间距
    paginationMargin: 20, //分页器离表格的间距
    btnSize: 'mini', //表格上方的按钮尺寸
    currentSize: 25, //当前每页可选的数据数量
    pageSizes: [25, 50, 100, 200], //分页器每页可选的数据数量
    hasSearch: false,//是否有搜索框
    hasPage: true, //是否有分页器
    hasBottomBtn: true, // 是否有提交按钮
    hasColSelect: false,//是否有选择列
    colSelectWidth: 40,//选择列宽度
    border: true, //是否有边框  
    reqKeys: {
        total: 'total', // 数据问题的数据的字段
        pageSize: 'pageSize', //每页数据的数量的字段
        pageNo: 'pageNo', //页码的字段
        keywork: 'keyword' //关键字的字段
    },
    bottomBtnAlign: 'right', // 提交按钮的对齐方式
    paginationAlign: 'center', // 分页器的对齐方式
    sortable: false, //是否可排序
    height: '', //表格高度
    maxHeight: '500px',//表格最大高度
    size: 'mini', //表格的尺寸
    width: '100%', //表格的宽度
    searchWidth: '240px', //搜索框的搜索
    hasSelect: false, //是否有搜索框
    hiddenCols: [], //隐藏的列
    align: 'left' //表格的对齐方式
}

export default tableConfig