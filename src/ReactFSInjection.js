/**
 * React Blessed Dependency Injection
 * ===================================
 *
 * Injecting the renderer's needed dependencies into React's internals.
 */
import ReactInjection from 'react/lib/ReactInjection';
import ReactComponentEnvironment from 'react/lib/ReactComponentEnvironment';
import ReactFSReconcileTransaction from './ReactFSReconcileTransaction';
import ReactFSComponent from './ReactFSComponent';
import ReactFSEmptyComponent from './ReactFSEmptyComponent';

export default function inject() {

  ReactInjection.HostComponent.injectGenericComponentClass(
    ReactFSComponent
  );

  ReactInjection.HostComponent.injectTextComponentClass(
    ReactFSFileComponent
  );

  ReactInjection.Updates.injectReconcileTransaction(
    ReactReconcileTransaction
  );

  // NOTE: we're monkeypatching ReactComponentEnvironment because
  // ReactInjection.Component.injectEnvironment() currently throws,
  // as it's already injected by ReactDOM for backward compat in 0.14 betas.
  // Read more: https://github.com/Yomguithereal/react-blessed/issues/5
  ReactComponentEnvironment.processChildrenUpdates = function () {};
  ReactComponentEnvironment.replaceNodeWithMarkup = function() {};
  ReactComponentEnvironment.unmountIDFromEnvironment = function() {};
}
