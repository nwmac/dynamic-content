import { importTypes } from '@rancher/auto-import';
import { IPlugin } from '@shell/core/types';
import { NAME } from './product';
import TestPage from './components/TestPage.vue';

// Init the package
export default function(plugin: IPlugin): void {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  // Built-in icon
  // plugin.metadata.icon = require('./assets/icon.svg');

  // Load a product
  plugin.addProduct(require('./product'));

  plugin.addRoute({
    name:      `${ NAME }`,
    path:      `/${ NAME }`,
    component: TestPage
  });
}
