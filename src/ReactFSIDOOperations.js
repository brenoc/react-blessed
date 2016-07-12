import ReactFSComponentTree from 'ReactFSComponentTree';
import FSChildrenOperations from 'FSChildrenOperations';

export function dangerouslyProcessChildrenUpdates(parentInst, updates) {
  const node = ReactFSComponentTree.getNodeFromInstance(parentInst);
  FSChildrenOperations.processUpdates(node, updates);
}
