import ReactMultiChild from 'react/lib/ReactMultiChild';
import FSLazyTree, { queueChild, queueText } from './FSLazyTree';
import ReactFSIDOperations from './ReactFSIDOperations';

/**
 * Creates a new React class that is idempotent and capable of containing other
 * React components. It accepts event listeners and DOM properties that are
 * valid according to `DOMProperty`.
 *
 *  - Event listeners: `onClick`, `onMouseDown`, etc.
 *  - DOM properties: `className`, `name`, `title`, etc.
 *
 * The `style` property functions differently from the DOM API. It accepts an
 * object mapping of style properties to values.
 *
 * @constructor ReactDOMComponent
 * @extends ReactMultiChild
 */
class ReactFSComponent {

  constructor(element) {
    var tag = element.type;
    validateDangerousTag(tag);
    this._currentElement = element;
    this._tag = tag.toLowerCase();
    this._namespaceURI = null;
    this._renderedChildren = null;
    this._previousStyle = null;
    this._previousStyleCopy = null;
    this._hostNode = null;
    this._hostParent = null;
    this._rootNodeID = null;
    this._domID = null;
    this._hostContainerInfo = null;
    this._wrapperState = null;
    this._topLevelWrapper = null;
    this._flags = 0;
  }

  /**
   * Generates root tag markup then recurses. This method has side effects and
   * is not idempotent.
   *
   * @internal
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {?ReactDOMComponent} the containing DOM component instance
   * @param {?object} info about the host container
   * @param {object} context
   * @return {string} The computed markup.
   */
  mountComponent(transaction, hostParent, hostContainerInfo, context) {
    this._rootNodeID = globalIdCounter++;
    this._domID = hostContainerInfo._idCounter++;
    this._hostParent = hostParent;
    this._hostContainerInfo = hostContainerInfo;

    var props = this._currentElement.props;
    this._rootNodeID = rootID;

    // We create tags in the namespace of their parent container, except HTML
    // tags get no namespace.
    var namespaceURI;
    var parentTag;
    if (hostParent != null) {
      namespaceURI = hostParent._namespaceURI;
      parentTag = hostParent._tag;
    } else if (hostContainerInfo._tag) {
      namespaceURI = hostContainerInfo._namespaceURI;
      parentTag = hostContainerInfo._tag;
    }
    this._namespaceURI = namespaceURI;

    let mountImage;
    // Create element here...
    let el = create element;


    ReactDOMComponentTree.precacheNode(this, el);
    this._flags |= Flags.hasCachedChildNodes;
    // Critical path in react
    this._updateDOMProperties(null, props, transaction);
    var lazyTree = FSLazyTree(el);


    this._createInitialChildren(transaction, props, context, lazyTree);
    mountImage = lazyTree;

    return this;
  }

  _createInitialChildren(transaction, props, context, lazyTree) {
    const contentToUse =
      CONTENT_TYPES[typeof props.children] ? props.children : null;
    const childrenToUse = contentToUse != null ? null : props.children;
    if (contentToUse != null) {
      // TODO: Validate that text is allowed as a child of this node
      queueText(lazyTree, contentToUse);
    } else if (childrenToUse != null) {
      let mountImages = this.mountChildren(
        childrenToUse,
        transaction,
        context
      );
      for (var i = 0; i < mountImages.length; i++) {
        queueChild(lazyTree, mountImages[i]);
      }
    }
  }

  /**
   * Receives a next element and updates the component.
   *
   * @internal
   * @param {ReactElement} nextElement
   * @param {ReactFSReconcileTransaction} transaction
   * @param {object} context
   */
  receiveComponent(nextElement, transaction, context) {
    var prevElement = this._currentElement;
    this._currentElement = nextElement;
    this.updateComponent(transaction, prevElement, nextElement, context);
  }

  /**
   * Updates a DOM component after it has already been allocated and
   * attached to the DOM. Reconciles the root DOM node, then recurses.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {ReactElement} prevElement
   * @param {ReactElement} nextElement
   * @internal
   * @overridable
   */
  updateComponent(transaction, prevElement, nextElement, context) {
    var lastProps = prevElement.props;
    var nextProps = this._currentElement.props;

    this._updateDOMProperties(lastProps, nextProps, transaction);
    this._updateDOMChildren(
      lastProps,
      nextProps,
      transaction,
      context
    );
  }

  /**
   * Reconciles the children with the various properties that affect the
   * children content.
   *
   * @param {object} lastProps
   * @param {object} nextProps
   * @param {ReactReconcileTransaction} transaction
   * @param {object} context
   */
  _updateDOMChildren(lastProps, nextProps, transaction, context) {
    var lastContent =
      CONTENT_TYPES[typeof lastProps.children] ? lastProps.children : null;
    var nextContent =
      CONTENT_TYPES[typeof nextProps.children] ? nextProps.children : null;

    // Note the use of `!=` which checks for null or undefined.
    var lastChildren = lastContent != null ? null : lastProps.children;
    var nextChildren = nextContent != null ? null : nextProps.children;

    // If we're switching from children to content/html or vice versa, remove
    // the old content
    var lastHasContentOrHtml = lastContent != null || lastHtml != null;
    var nextHasContentOrHtml = nextContent != null || nextHtml != null;
    if (lastChildren != null && nextChildren == null) {
      this.updateChildren(null, transaction, context);
    } else if (lastHasContentOrHtml && !nextHasContentOrHtml) {
      this.updateTextContent('');
      if (__DEV__) {
        ReactInstrumentation.debugTool.onSetChildren(this._debugID, []);
      }
    }

    if (nextContent != null) {
      if (lastContent !== nextContent) {
        this.updateTextContent('' + nextContent);
        if (__DEV__) {
          setContentChildForInstrumentation.call(this, nextContent);
        }
      }
    } else if (nextHtml != null) {
      if (lastHtml !== nextHtml) {
        this.updateMarkup('' + nextHtml);
      }
      if (__DEV__) {
        ReactInstrumentation.debugTool.onSetChildren(this._debugID, []);
      }
    } else if (nextChildren != null) {
      if (__DEV__) {
        setContentChildForInstrumentation.call(this, null);
      }

      this.updateChildren(nextChildren, transaction, context);
    }
  }


  /**
   * Destroys all event registrations for this instance. Does not remove from
   * the File System. That must be done by the parent.
   *
   * @internal
   */
  unmountComponent(safely) {
    this.unmountChildren(safely);
    // ReactDOMComponentTree.uncacheNode(this);
    // EventPluginHub.deleteAllListeners(this);
    ReactComponentBrowserEnvironment.unmountIDFromEnvironment(this._rootNodeID);
    ReactTitaniumIDOperations.drop(this._rootNodeID);
    this._rootNodeID = null;
  }

  getHostNode() {
    return getNode(this);
  }

  getPublicInstance() {
    //return getNode(this);
    return this;
  }

}

Object.assign(
  ReactFSComponent.prototype,
  ReactMultiChild.Mixin
);

ReactFSComponent.displayName = 'ReactFSComponent';

export default ReactFSComponent;
