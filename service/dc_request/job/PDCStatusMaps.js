let profix = 'STATUS_'
module.exports = [{
    index: 10,
    value: profix + 'CHECKING',
    label: '暂待处理',
    status: 'Checking Condition'
}, {
    index: 6,
    value: profix + 'FINISH_FAILED',
    label: '运行出错',
    status: 'Run Failed'
}, {
    index: 7,
    value: profix + 'FINISH_IGNORE_FAIL',
    label: '忽略错误',
    status: 'Ignore Fail'
}, {
    index: 5,
    value: profix + 'FINISH_OK',
    label: '运行成功',
    status: 'Run OK'
}, {
    index: 8,
    value: profix + 'FINISH_TERMINATED',
    label: '强制终止',
    status: 'Terminated'
}, {
    index: 3,
    value: profix + 'POOLING',
    label: '排队中',
    status: 'Pooling'
}, {
    index: 4,
    value: profix + 'RUNNING',
    label: '运行中',
    status: 'Running'
}, {
    index: 2,
    value: profix + 'SUSPEND',
    label: '挂起',
    status: 'Suspend'
}, {
    index: 1,
    value: profix + 'TOTAL',
    label: '全部',
    status: 'Total'
}, {
    index: 9,
    value: profix + 'WAITING',
    label: '等待中',
    status: 'Waiting'
}]