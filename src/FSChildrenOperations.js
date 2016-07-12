import ReactMultiChildUpdateTypes from 'react/lib/ReactMultiChildUpdateTypes';

function removeDelimitedText(parentNode, startNode, closingComment) {
  while (true) {
    var node = startNode.nextSibling;
    if (node === closingComment) {
      // The closing comment is removed by ReactMultiChild.
      break;
    } else {
      parentNode.removeChild(node);
    }
  }
}

function insertChildAt(parentNode, childNode, referenceNode) {
    // We rely exclusively on `insertBefore(node, null)` instead of also using
    // `appendChild(node)`. (Using `undefined` is not allowed by all browsers so
    // we are careful to use `null`.)
    parentNode.insertBefore(childNode, referenceNode);
}

export function replaceDelimitedText(openingComment, closingComment, stringText) {
  var parentNode = openingComment.parentNode;
  var nodeAfterComment = openingComment.nextSibling;
  if (nodeAfterComment === closingComment) {
    // There are no text nodes between the opening and closing comments; insert
    // a new one if stringText isn't empty.
    if (stringText) {
      insertChildAt(
        parentNode,
        document.createTextNode(stringText),
        nodeAfterComment
      );
    }
  } else {
    if (stringText) {
      removeDelimitedText(parentNode, nodeAfterComment, closingComment);
    } else {
      removeDelimitedText(parentNode, openingComment, closingComment);
    }
  }
}

/**
 * Updates a component's children by processing a series of updates. The
 * update configurations are each expected to have a `parentNode` property.
 *
 * @param {Object} parentNode List of update configurations.
 * @param {array<object>} updates List of update configurations.
 * @internal
 */
export function processUpdates(parentNode, updates) {
  for (var k = 0; k < updates.length; k++) {
    var update = updates[k];
    switch (update.type) {
      case ReactMultiChildUpdateTypes.INSERT_MARKUP:
        insertLazyTreeChildAt(
          parentNode,
          update.content,
          getNodeAfter(parentNode, update.afterNode)
        );

    }
  }
}
