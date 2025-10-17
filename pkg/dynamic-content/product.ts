import { IPlugin } from '@shell/core/types';

export const NAME = 'content-test';

export function init($plugin: IPlugin, store: any) {
  const { product } = $plugin.DSL(store, NAME);

  // registering a cluster-level product
  product({
    inStore:             'management',
    icon:                'comment',
    label:               'Content Test',
    removable:           false,
    showClusterSwitcher: false,
    category:            'global',
    to:                  { name: `${ NAME }`, params: { cluster: 'local' } }
  } as any);
}
