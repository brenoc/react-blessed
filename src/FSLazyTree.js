
const enableLazy = false;

export function queueChild(parentTree, childTree) {
  if (enableLazy) {
    parentTree.children.push(childTree);
  } else {
    parentTree.node.appendChild(childTree.node);
  }
}

export function queueText(tree, text) {
  if (enableLazy) {
    tree.text = text;
  } else {
    setTextContent(tree.node, text);
  }
}

function toString() {
  return this.node.nodeName;
}

export default function FSLazyTree(node) {
  return {
    node: node,
    children: [],
    html: null,
    text: null,
    toString,
  };
}
