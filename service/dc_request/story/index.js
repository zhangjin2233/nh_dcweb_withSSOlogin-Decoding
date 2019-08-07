let Class = 'StoryMgr'

module.exports = {
    async create(ctx) { //创建story
        await new HttpRequest({
            Class: Class,
            FUNC: 'createStory',
            params: {
                storyName: ctx.reqData.name,
                enLabel: ctx.reqData.enLabel,
                desc: ctx.reqData.desc
            }
        }).send(ctx)
        return 'OK'
    },
    async delete(ctx) { //删除Story
        await new HttpRequest({
            Class: Class,
            FUNC: 'deleteStory',
            params: {
                storyId: ctx.reqData.id,
            }
        }).send(ctx)
        return 'OK'
    }
}