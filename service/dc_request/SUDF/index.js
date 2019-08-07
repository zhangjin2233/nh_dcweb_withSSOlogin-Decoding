let Class = 'SUDFMgr'

module.exports = {
    async detail(ctx) {
        let params = ctx.reqData
    },
    async create(ctx) {
        let params = ctx.reqData
        let data = await createRequest(Class, 'newSUDF', {}, 'GET', 'sudf')
                   .and(createRequest('StoryMgr', 'getStory', { storyId:  params.storyId}, 'GET', 'story')).coSend(ctx)
        let newSudf = (await createRequest(Class, 'createUDF', { story: data.story.CONTENT, sudf: data.sudf.CONTENT }, 'POST').send(ctx)).CONTENT
        if(params.catalogId) {
            let catalogs = await createRequest('CatalogMgr', 'getCatalogByRealMoId', {nodeType: 'SUDF', realMoId: newSudf.ID}, 'GET', 'sudf')
                        .and(createRequest('CatalogMgr', 'getCatalog', { catalogId: params.catalogId }, 'GET', 'target')).coSend(ctx)
            await createRequest('CatalogMgr', 'moveCatalog', { nodeType: 'SUDF', catalog: catalogs.sudf.CONTENT, targetCatalog: catalogs.target.CONTENT }).send(ctx)
        }
        return newSudf
    }
}