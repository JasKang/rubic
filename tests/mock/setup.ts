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
    const currRender = renderOptions
    const definition = Object.assign(
      {
        id: currRender.id,
        path: currRender.path,
        template: currRender.template || '<div></div>',
        usingComponents: currRender.usingComponents,
      },
      options
    )
    jComponent.register(definition)
  }

  // @ts-ignore
  global.Page = (options: any) => {
    const { behaviors, data, ...others } = options
    const routeBehavior = Behavior({
      lifetimes: {
        created() {
          this.route = '/pages/test/index'
        },
      },
    })
    return Component({
      behaviors: [routeBehavior, ...behaviors],
      data,
      methods: { ...others },
    })
  }
}

init()
