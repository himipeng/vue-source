interface ComponentInstance {
  setupState: Record<string, any> // setup() 返回的响应式对象
}

function setupComponent(instance: ComponentInstance, setupFn: () => Record<string, any>) {
  const setupResult = setupFn()
  instance.setupState = setupResult
}
