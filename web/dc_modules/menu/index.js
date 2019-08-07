export default  {
    render(createElement) {
        return createElement('el-menu', {
            props: {
                mode: this.object.type,
                collapse: this.object.collapse,
                'background-color': this.object.backgroundColor,
                'text-color': this.object.textColor,
                'active-text-color': this.object.activeColor,
                'default-active': this.object.default,
                'default-openeds': this.object.defaultOpened,
                'unique-opened': this.object.uniqueOpened,
                'menu-trigger': this.object.trigger,
                router: this.object.router,
                'collapse-transition': this.object.transition
            },
            style: {
                width: this.object.width
            },
            on: {
                select: this.select
            }
        }, this.object.data.map((item,index) => {
            if(item.children && item.children.length > 0) {
                return createElement('el-submenu', {
                    props: {
                        index: item.index
                    }
                }, Array.apply(null, { length: item.children.length + 1 }).map( (childItem, index) => {
                    if(index === 0) {
                        return createElement('template', {
                            slot: 'title'
                        }, [createElement('i', {
                            attrs: {
                                class: item.icon
                            },
                            style: {
                                'margin-right': item.icon ? '4px': 0,
                                color: item.iconColor ? item.iconColor : '#000'
                            },
                        }), createElement('span', item.title)])
                    }else {
                        let child = item.children[index - 1]
                        if(child.children && child.children.length > 0) {
                            return createElement('el-submenu', {
                                props: {
                                    index: child.index
                                }
                        }, Array.apply(null, {length: child.children.length + 1}).map((item, index) => {
                                    if(index === 0) {
                                        return createElement('template', {
                                            slot: 'title'
                                        }, [createElement('i', {
                                            attrs: {
                                                class: child.icon
                                            },
                                            style: {
                                                'margin-right': child.icon ? '4px': 0,
                                                color: child.iconColor ? child.iconColor : '#000'
                                            },
                                        }), createElement('span', child.title)])
                                    }else {
                                        let third = child.children[index - 1]
                                        return createElement('el-menu-item', {
                                            props: {
                                                index: third.index
                                            }
                                        }, [createElement('i', {
                                            attrs: {
                                                class: third.icon
                                            },
                                            style: {
                                                'margin-right': third.icon ? '4px': 0,
                                                color: third.iconColor ? third.iconColor : '#000'
                                            },
                                        }), createElement('span', third.title)])
                                    }
                                }))
                            }else {
                                return createElement('el-menu-item', {
                                    props: {
                                        index: child.index
                                    }
                                }, [createElement('i', {
                                    attrs: {
                                        class: child.icon
                                    },
                                    style: {
                                        'margin-right': child.icon ? '4px': 0,
                                        color: child.iconColor ? child.iconColor : '#000'
                                    },
                                }), createElement('span', child.title)])
                            }      
                        }
                        
                    }))
            }else {
                return createElement('el-menu-item', {
                    props: {
                        index: item.index
                    }
                }, [createElement('i', {
                    attrs: {
                        class: item.icon
                    },
                    style: {
                        'margin-right': item.icon ? '4px': 0,
                        color: item.iconColor ? item.iconColor : '#000'
                    }
                }), createElement('span', item.title)]) 
            }
        }))
    },
    data() {
        return {
            type: 'horizontal',
        }
    },
    props: [ 'object' ],
    created() {
        this.$nextTick(() => {
           
        })
    },
    methods: {
        select(index) {
            this.object.select(index)
        }
    }
}
