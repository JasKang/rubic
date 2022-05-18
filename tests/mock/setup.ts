import jComponent from 'j-component'

function init() {
  let renderOptions: any = null
  // @ts-ignore
  global.setCurrentRender = (options: any) => {
    renderOptions = options
  }
  // @ts-ignore
  global.Behavior = (options: any) => {
    return jComponent.behavior(options)
  }

  // @ts-ignore
  global.App = (options: any) => {
    return options
  }

  // @ts-ignore
  global.Component = (options: any) => {
    const definition = Object.assign(
      {
        id: renderOptions.id,
        path: renderOptions.path,
        template: renderOptions.template || '<div></div>',
        usingComponents: renderOptions.usingComponents,
      },
      options
    )
    if (options.__IS_PAGE__) {
      const routeBehavior = Behavior({
        lifetimes: {
          created(this: any) {
            this.route = '/pages/test/index'
          },
        },
      })
      definition.behaviors = [routeBehavior, ...definition.behaviors]
    }
    jComponent.register(definition)
  }
}

init()
