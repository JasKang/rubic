export type StyleIsolation = 'isolated' | 'apply-shared' | 'shared'
export type PageStyleIsolation = StyleIsolation | 'page-isolated' | 'page-apply-shared' | 'page-shared'

export type RelationOption = {
  /** 目标组件的相对关系 */
  type: 'parent' | 'child' | 'ancestor' | 'descendant'
  /** 关系生命周期函数，当关系被建立在页面节点树中时触发，触发时机在组件attached生命周期之后 */
  linked?(target: any): void
  /** 关系生命周期函数，当关系在页面节点树中发生改变时触发，触发时机在组件moved生命周期之后 */
  linkChanged?(target: any): void
  /** 关系生命周期函数，当关系脱离页面节点树时触发，触发时机在组件detached生命周期之后 */
  unlinked?(target: any): void
  /** 如果这一项被设置，则它表示关联的目标节点所应具有的behavior，所有拥有这一behavior的组件节点都会被关联 */
  target?: string | undefined
}

export type ComponentInnerOptions = {
  /**
   * 启用多slot支持
   */
  multipleSlots?: boolean
  /**
   * 组件样式隔离
   */
  styleIsolation?: StyleIsolation
  /**
   * 虚拟化组件节点
   */
  virtualHost?: boolean
}

export type PageInnerOptions = {
  /**
   * 组件样式隔离
   */
  styleIsolation?: PageStyleIsolation
}
