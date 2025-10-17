import { isRancherPrime } from '@shell/config/version';
import { Configuration, Distribution } from './types';
import { MANAGEMENT } from '@shell/config/types';

// Default endpoint ($dist is either 'community' or 'prime')
const DEFAULT_ENDPOINT = 'https://updates.rancher.io/rancher/$dist/updates';

// We only support retrieving content from secure endpoints
const HTTPS_PREFIX = 'https://';


// Adapted from: https://github.com/rancher/ui/blob/08c379a9529f740666a704b52522a468986c3520/lib/shared/addon/utils/constants.js#L564
// Setting IDs
export const SETTING = {
  /**
   * Dynamic Content settings
   */
  DYNAMIC_CONTENT_ENABLED:  'ui-content-enabled',
  DYNAMIC_CONTENT_ENDPOINT: 'ui-content-endpoint',
} as const;

/**
 * Get configuration data based on the distribution and Rancher settings
 *
 * @param getters Store getters to access the store
 * @returns Dynamic Content configuration
 */
export function getConfig(getters: any): Configuration {
  const prime = isRancherPrime();
  const distribution: Distribution = prime ? 'prime' : 'community';

  // Default configuration
  const config: Configuration = {
    enabled:  true,
    debug:    false,
    log:      false,
    endpoint: DEFAULT_ENDPOINT,
    prime,
    distribution,
  };

  // Update 'enabled' and 'endpoint' from Rancher settings, if applicable
  try {
    const enabledSetting = getters['management/byId'](MANAGEMENT.SETTING, SETTING.DYNAMIC_CONTENT_ENABLED);

    if (enabledSetting?.value) {
      // Any value other than 'false' means enabled (can't disable on Prime)
      config.enabled = config.prime ? enabledSetting.value !== 'false' : true;
      config.debug = enabledSetting.value === 'debug';
      config.log = enabledSetting.value === 'log' || config.debug;
    }

    // Can only override the url when Prime
    const urlSetting = getters['management/byId'](MANAGEMENT.SETTING, SETTING.DYNAMIC_CONTENT_ENDPOINT);

    // Are we Prime, do we have a URL and does the URL start with the https prefix? If so, use it
    if (prime && urlSetting?.value && urlSetting.value.startsWith(HTTPS_PREFIX)) {
      config.endpoint = urlSetting.value;
    }
  } catch (e) {
    console.error('Error reading dynamic content settings', e); // eslint-disable-line no-console
  }

  return config;
}
