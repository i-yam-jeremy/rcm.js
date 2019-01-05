
class RuntimeInspector {

  constructor(RcmTreeNode root) {
    //TODO
  }

  // Gets the current node that is about to be executed
  get currentNode() {
    return this.__currentNode
  }

  // Sets a value in the current scope
  setInScope(key, value) {
    this.__scope[key] = value
  }

  // Gets a value in the current scope
  getInScope(key) {
    return this.__scope[key]
  }

  // Gets all keys in the current scope
  getScopeKeys() {
    return Object.keys(this.__scope)
  }

  // Executes the current node WITHOUT going into sub nodes for next nodes
  void step()

  // Executes the current node WITH going into sub nodes for next nodes
  void next()

  // Skips the current node without evaluating it (also skips the node's children)
  void skip()

}
