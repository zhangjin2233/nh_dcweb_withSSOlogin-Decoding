const FormatTable = {
    source(table) {
        return {
            "aliasName": table.name, //来源表的别名，一般从SqlMapping里可以获取
            "streamType": "external", //视图的类型，一般从SqlMapping里可以获取
            "name": table.title, //来源视图的名称，一般为guid+output，从SqlMapping里可以获取
            "x": table.x,
            "y": table.y,
            "height": table.height,
            "width": table.width,
            "fields": formatRows(table.rows)
        }
    },
    view(table) {
        return {
            "streamType": "internal",
            "name": table.title,
            "viewType": 'normal',
            "x": table.x,
            "width": table.width,
            "y": table.y,
            "from": table.raw.desc,
            "where": table.raw.desc,
            "desc": table.raw.desc,
            "groupBy": table.raw.groupBy,
            "limit": table.raw.limit,
            "orderBy": table.raw.orderBy,
            //个性化的额外信息,前端以以下的为准
            "fromExt": table.form.fromExt,
            "joinExt": table.form.joinExt,
            "whereExt": table.form.whereExt,
            "fields": formatRows(table.rows),
            "height": table.height
        }
    },
    set(table) {
        return {
            "streamType": "internal",
            "setOpType": table.setOpType,
            "setOpViews": table.tags,
            "name": table.title,
            "viewType": 'setOp',
            "x": table.x,
            "desc": table.raw.desc,
            "width": table.width,
            "y": table.y,
            "fields": formatRows(table.rows),
            "height": table.height,
            "fromExt": '',
            "joinExt": [],
            "whereExt": [],
            
        }
    },
    target(table) {
        return {
            //输出集的
            "from": table.raw.from,
            "where": table.raw.where,
            "groupBy": table.raw.groupBy,
            "limit": table.raw.limit,
            "orderBy": table.raw.orderBy,
            "fromExt": table.form.fromExt,
            "joinExt": table.form.joinExt,
            "whereExt": table.form.whereExt,
            "having": table.raw.having,

            "desc": table.raw.desc,
            "schema": table.raw.schema,
            "isAutoRebuild": table.raw.isAutoRebuild,
            "isDistinct": table.raw.isDistinct,
            "env": table.raw.env,
            "ds": table.raw.ds,
            "streamType": "output",
            "name": table.title,
            "viewType": 'normal',
            "x": table.x,
            "width": table.width,
            "y": table.y,
            "clearSql": table.raw.clearSql,
            "extendClause": table.raw.extendClause,
            "fields": formatRows(table.rows),
            "table": table.raw.table,
            "height": table.height
        }
    },
    outputset(table) {
        return  {
            "streamType": "output",
            "setOpType": table.setOpType,
            "setOpViews": table.tags,
            "name": table.title,
            "desc": table.raw.desc,
            "viewType": 'setOp',
            "x": table.x,
            "width": table.width,
            "y": table.y,
            "fields": formatRows(table.rows),
            "height": table.height,
            "fromExt": '',
            "joinExt": [],
            "whereExt": []
        }
    }
}

let formatRows = (rows) => {
    let viewType = VUE.$store.state.sqlViewType
    return rows.map(row => {
        let fieldName = ''
        let label = ''
        if (viewType === 'business') {
            fieldName = row.data[2] ? row.data[2].value : ''
            label = row.data[0].value
        }else {
            label = row.data[2] ? row.data[2].value : ''
            fieldName= row.data[0].value
        }
        return {
            "canBeNull": row.raw.canBeNull, //true / false
            "extend": row.raw.extend,
            "fieldName": fieldName, //字段名
            "expression": row.expression, //表达式
            "defaultV": row.raw.defaultV, //默认值
            "dataType": row.data[1].value, //界面上显示的类型，并不是字段的真实类型，1-NUMBER 2-INTEGER 3-LONG 4-STRING 5-RAW 6-TIMESTAMP 7-DATE 8-TIME
            "isPrimaryKey": row.raw.isPrimaryKey, // true / false
            "label": label, //字段标签，一般为中文别名
            "userType": row.raw.userType, //字段类型，如 VARCHAR(225)
            "uuid": row.raw.uuid ? row.raw.uuid : row.id //这个字段的uuid，目前暂定不需要前端生成，但是需要注意的是字符串内也有一层双引号
        }
    })
}

export default FormatTable