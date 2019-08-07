import method from './method.js'
export default {
    dataSource: {
        title: '数据源定义',
        create_btns: [ method.save('dataSource', 'create'), method.back('dataSource') ],
        update_btns: [ method.save('dataSource', 'update'), method.back('dataSource'), method.formRefresh('dataSource')],
        getData(table, form, name) {
            method.getData('dataSource', table, form, name)
        },
        tableBtns: [ method.addRow(), method.removeRow() ],
        BDTest(testObj, table, form) {
            method.BDTest(testObj, table, form)
        }
    },
    enum: {
        title: '枚举定义',
        create_btns: [ method.save('enum', 'create'), method.back('enum') ],
        update_btns: [ method.save('enum', 'update'), method.back('enum'), method.formRefresh('enum') ],
        getData(table, form, name) {
            method.getData('enum', table, form, name)
        },
        tableBtns: [ method.addRow(), method.removeRow() ],
    },
    entity: {
        title: '实体定义',
        create_btns: [ method.save('entity', 'create'), method.back('entity') ],
        update_btns: [ method.save('entity', 'update'), method.back('entity'), method.formRefresh('entity') ],
        getData(table, form, name) {
            method.getData('entity', table, form, name)
        },
        tableBtns: [ method.addRow('entity'), method.removeRow() ],
    },
    agent: {
        title: '代理机',
        create_btns: [ method.save('agent', 'create'), method.back('agent') ],
        update_btns: [ method.save('agent', 'update'), method.back('agent'), method.formRefresh('agent') ],
        getData(table, form, name) {
            method.getData('agent', table, form, name)
        },
        tableBtns: [],
    },
    icon: {
        
    },
    params: {
        title: '参数定义',
        create_btns: [ method.save('params', 'create'), method.back('params') ],
        update_btns: [ method.save('params', 'update'), method.back('params'), method.formRefresh('params') ],
        getData(table, form, name) {
            method.getData('params', table, form, name)
        },
        tableBtns: [],
    },
    attrsTable: {
        title: '属性表定义',
        create_btns: [ method.save('attrsTable', 'create'), method.back('attrsTable') ],
        update_btns: [ method.save('attrsTable', 'update'), method.back('attrsTable'), method.formRefresh('attrsTable') ],
        getData(table, form, name) {
            method.getData('attrsTable', table, form, name)
        },
        tableBtns: [ method.addRow(), method.removeRow() ],
    },
    service: {
        title: '服务器定义',
        create_btns: [ method.save('service', 'create'), method.back('service') ],
        update_btns: [ method.save('service', 'update'), method.back('service'), method.formRefresh('service') ],
        getData(table, form, name) {
            method.getData('service', table, form, name)
        },
        tableBtns: [ method.addRow(), method.removeRow() ],
    },
    resource: {},
    globaldataset: {
        title: '全局数据集',
        create_btns: [ method.save('globaldataset', 'create'), method.back('globaldataset') ],
        update_btns: [ method.save('globaldataset', 'update'), method.back('globaldataset'), method.formRefresh('globaldataset') ],
        getData(table, form, name) {
            method.getData('globaldataset', table, form, name)
        },
        tableBtns: [ method.addRow('globaldataset'), method.removeRow('globaldataset'), method.upRow(), method.downRow() ],
    }
}
