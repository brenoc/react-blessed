import ReactMultiChild from 'react/lib/ReactMultiChild';
import FSLazyTree, { queueChild, queueText } from './FSLazyTree';
import ReactFSIDOperations from './ReactFSIDOperations';
import { replaceDelimitedText } from './FSChildrenOperations';
/**
 * Text nodes violate a couple assumptions that React makes about components:
 *
 *  - When mounting text into the DOM, adjacent text nodes are merged.
 *  - Text nodes cannot be assigned a React root ID.
 *
 * This component is used to wrap strings between comment nodes so that they
 * can undergo the same reconciliation that is applied to elements.
 *
 * TODO: Investigate representing React components in the DOM with text nodes.
 *
 * @class ReactDOMTextComponent
 * @extends ReactComponent
 * @internal
 */
class ReactFSFileComponent {

  constructor(element) {
    // TODO: This is really a ReactText (ReactNode), not a ReactElement
    this._currentElement = text;
    this._stringText = '' + text;
    // ReactDOMComponentTree uses these:
    this._hostNode = null;
    this._hostParent = null;

    // Properties
    this._domID = null;
    this._mountIndex = 0;
    this._closingComment = null;
    this._commentNodes = null;
  }

  /**
   * Creates the markup for this text node. This node is not intended to have
   * any features besides containing text content.
   *
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {string} Markup for this text node.
   * @internal
   */
  mountComponent(transaction, hostParent, hostContainerInfo, context) {
    var domID = hostContainerInfo._idCounter++;
    var openingValue = ' react-text: ' + domID + ' ';
    var closingValue = ' /react-text ';

    this._domID = domID;
    this._hostParent = hostParent;

    if (transaction.useCreateElement) {
      var ownerDocument = hostContainerInfo._ownerDocument;
      var openingComment = ownerDocument.createComment(openingValue);
      var closingComment = ownerDocument.createComment(closingValue);
      var lazyTree = DOMLazyTree(ownerDocument.createDocumentFragment());
      queueChild(lazyTree, DOMLazyTree(openingComment));
      if (this._stringText) {
        queueChild(
          lazyTree,
          DOMLazyTree(ownerDocument.createTextNode(this._stringText))
        );
      }
      queueChild(lazyTree, DOMLazyTree(closingComment));
      ReactDOMComponentTree.precacheNode(this, openingComment);
      this._closingComment = closingComment;
      return lazyTree;
    } else {
      var escapedText = escapeTextContentForBrowser(this._stringText);

      if (transaction.renderToStaticMarkup) {
        // Normally we'd wrap this between comment nodes for the reasons stated
        // above, but since this is a situation where React won't take over
        // (static pages), we can simply return the text as it is.
        return escapedText;
      }

      return (
        '<!--' + openingValue + '-->' + escapedText +
        '<!--' + closingValue + '-->'
      );
    }
  }


  /**
   * Updates this component by updating the text content.
   *
   * @param {ReactText} nextText The next text content
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  receiveComponent(nextElement, transaction) {
    if (nextText !== this._currentElement) {
      this._currentElement = nextText;
      var nextStringText = '' + nextText;
      if (nextStringText !== this._stringText) {
        // TODO: Save this as pending props and use performUpdateIfNecessary
        // and/or updateComponent to do the actual update for consistency with
        // other component types?
        this._stringText = nextStringText;
        var commentNodes = this.getHostNode();
        replaceDelimitedText(
          commentNodes[0],
          commentNodes[1],
          nextStringText
        );
      }
    }
  }

  /**
   * Destroys all event registrations for this instance. Does not remove from
   * the File System. That must be done by the parent.
   *
   * @internal
   */
  unmountComponent(safely) {
    this._closingComment = null;
    this._commentNodes = null;
    ReactDOMComponentTree.uncacheNode(this);
  }

  getHostNode() {
    var hostNode = this._commentNodes;
    if (hostNode) {
      return hostNode;
    }
    if (!this._closingComment) {
      var openingComment = ReactDOMComponentTree.getNodeFromInstance(this);
      var node = openingComment.nextSibling;
      while (true) {
        invariant(
          node != null,
          'Missing closing comment for text component %s',
          this._domID
        );
        if (node.nodeType === 8 && node.nodeValue === ' /react-text ') {
          this._closingComment = node;
          break;
        }
        node = node.nextSibling;
      }
    }
    hostNode = [this._hostNode, this._closingComment];
    this._commentNodes = hostNode;
    return hostNode;
  }
}

export default ReactFSFileComponent;
