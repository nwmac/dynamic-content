<script>
import day from 'dayjs';
import { LabeledInput } from '@components/Form/LabeledInput';
import { getVersionData } from '@shell/config/version';
import { MANAGEMENT } from '@shell/config/types';
import { fetchOrCreateSetting } from '@shell/utils/settings';
import { getConfig } from '../utils/config';
import { SETTING } from '../utils/settings';

const UPDATE_DATE_FORMAT = 'YYYY-MM-DD'; // Format of the fetch date

const LOCAL_STORAGE_UPDATE_FETCH_DATE = 'rancher-updates-fetch-next'; // Local storage setting that holds the date when we should next try and fetch content
const LOCAL_STORAGE_UPDATE_CONTENT = 'rancher-updates-last-content';
const LOCAL_STORAGE_TEST_DATA = 'rancher-updates-test-data';
const LOCAL_STORAGE_CONTENT_DEBUG_LOG = 'rancher-updates-debug-log';

// Dynamic content
export const READ_NEW_RELEASE = 'read-new-release';
export const READ_SUPPORT_NOTICE = 'read-support-notice';
export const READ_UPCOMING_SUPPORT_NOTICE = 'read-upcoming-support-notice';

export default {
  name:       'DynamicContentTestPage',
  layout:     'plain',
  components: { LabeledInput },

  mounted() {
    window.addEventListener('dynamicContentLog', this.dynamicContentLogEvent);
  },

  unmounted() {
    window.removeEventListener('dynamicContentLog', this.dynamicContentLogEvent);
  },

  data() {
    const versionInfo = getVersionData();
    const enabledSetting = this.$store.getters['management/byId'](MANAGEMENT.SETTING, SETTING.DYNAMIC_CONTENT_ENABLED);
    const mode = enabledSetting?.value || false;
    let enabled = enabledSetting?.value === 'debug';

    let content = '';
    let version = versionInfo.Version.split('-')[0];
    let logs = [];

    const config = getConfig(this.$store.getters);

    try {
      content = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_UPDATE_CONTENT) || '{}');

      const data = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_TEST_DATA) || '{}');

      if (!content.settings?.debugVersion) {
        enabled = false;
      } else {
        version = content.settings.debugVersion;
      }

      if (JSON.stringify(data) !== JSON.stringify(content)) {
        enabled = false;
      }

      logs = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_CONTENT_DEBUG_LOG) || '[]');
    } catch {}

    return {
      content: JSON.stringify(content, null, 2),
      version,
      logs,
      enabled,
      mode,
      config,
    };
  },
  methods: {
    save() {
      const c = JSON.parse(this.content);

      c.settings = c.settings || {};
      c.settings.debugVersion = this.version;

      window.localStorage.setItem(LOCAL_STORAGE_TEST_DATA, JSON.stringify(c));
      window.localStorage.setItem(LOCAL_STORAGE_UPDATE_CONTENT, JSON.stringify(c));

      const nextFetch = day().add(3, 'day');
      const nextFetchString = nextFetch.format(UPDATE_DATE_FORMAT);

      window.localStorage.setItem(LOCAL_STORAGE_UPDATE_FETCH_DATE, nextFetchString);

      window.location.reload();
    },

    clearNotifications() {
      this.$store.dispatch('notifications/clearAll');
    },

    clearLogs() {
      window.localStorage.setItem(LOCAL_STORAGE_CONTENT_DEBUG_LOG, '[]');

      this.logs = [];
    },

    dynamicContentLogEvent(e) {
      this.logs.unshift(e.detail);
    },

    async resetPrefs() {
      await this.$store.dispatch('prefs/set', { key: READ_NEW_RELEASE, value: '' });
      await this.$store.dispatch('prefs/set', { key: READ_SUPPORT_NOTICE, value: '' });
      await this.$store.dispatch('prefs/set', { key: READ_UPCOMING_SUPPORT_NOTICE, value: '' });
    },

    async configure(mode) {
      const setting = await fetchOrCreateSetting(this.$store, SETTING.DYNAMIC_CONTENT_ENABLED, mode);

      setting.value = mode;

      await setting.save();

      if (mode === 'debug') {
        this.content = window.localStorage.getItem(LOCAL_STORAGE_UPDATE_CONTENT) || '{}';

        this.save();
      } else {
        const c = JSON.parse(this.content);

        delete c.settings?.debugVersion;

        // Clear out local storage
        window.localStorage.removeItem(LOCAL_STORAGE_UPDATE_FETCH_DATE);
        window.localStorage.setItem(LOCAL_STORAGE_UPDATE_CONTENT, JSON.stringify(c));
        window.localStorage.removeItem(LOCAL_STORAGE_TEST_DATA);
        window.localStorage.removeItem(LOCAL_STORAGE_CONTENT_DEBUG_LOG);

        window.location.reload();
      }
    }
  },

  computed: {
    sortedLogs() {
      return ([...this.logs]).sort((a, b) => {
        return new Date(b) - new Date(a);
      }).map((item) => {
        let argValue = item.arg;

        if (item.arg) {
          if (typeof item.arg === 'string') {
            argValue = item.arg;
          } else {
            argValue = JSON.stringify(item.arg, null, 2);
          }
        }

        return {
          ...item,
          argValue
        };
      });
    }
  }
};
</script>
<template>
  <div class="content-header">
    <h1>Dynamic Content Test</h1>
    <button
      v-if="!enabled"
      type="button"
      class="role-primary btn"
      @click="configure('debug')"
    >
      Enable Debug Mode
    </button>
    <button
      v-else
      type="button"
      class="role-primary btn"
      @click="configure('false')"
    >
      Disable Debug Mode
    </button>
  </div>
  <div
    v-if="!enabled"
    class="test-debug"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="64px"
      viewBox="0 -960 960 960"
      width="64px"
      fill="#1f1f1f"
    >
      <path d="M480-200q66 0 113-47t47-113v-160q0-66-47-113t-113-47q-66 0-113 47t-47 113v160q0 66 47 113t113 47Zm-80-120h160v-80H400v80Zm0-160h160v-80H400v80Zm80 40Zm0 320q-65 0-120.5-32T272-240H160v-80h84q-3-20-3.5-40t-.5-40h-80v-80h80q0-20 .5-40t3.5-40h-84v-80h112q14-23 31.5-43t40.5-35l-64-66 56-56 86 86q28-9 57-9t57 9l88-86 56 56-66 66q23 15 41.5 34.5T688-640h112v80h-84q3 20 3.5 40t.5 40h80v80h-80q0 20-.5 40t-3.5 40h84v80H688q-32 56-87.5 88T480-120Z" />
    </svg>
    <h2>Dynamic Content debugging not enabled</h2>
  </div>
  <div
    v-else
    class="two-columns"
  >
    <div class="left-column">
      <h2>Test Configuration</h2>
      <LabeledInput
        v-model:value="version"
        label="Version"
        class="version"
      />
      <textarea
        v-model="content"
        rows="30"
        class="test-content"
      />
      <div class="buttons">
        <div>
          <button
            type="button"
            class="role-primary btn"
            @click="clearNotifications()"
          >
            Clear Notifications
          </button>
          <button
            type="button"
            class="role-primary btn"
            @click="resetPrefs()"
          >
            Reset Read Prefs
          </button>
        </div>
        <button
          type="button"
          class="role-primary btn"
          @click="save()"
        >
          Update
        </button>
      </div>
      <h2 class="mt-20">Configuration</h2>
      <div class="config-settings">
        <div v-for="v, k in config" class="config-setting">
          <div>{{ k[0].toUpperCase() + k.slice(1) }}</div>
          <div v-if="typeof v === 'boolean'">
            <i v-if="v" class="icon icon-checkmark" />
            <i v-else class="icon icon-minus" />
          </div>
          <div v-else>{{ v }}</div>
        </div>
      </div>
    </div>
    <div class="logs">
      <div class="logs-header">
        <h2>Logs</h2>
        <button
          type="button"
          class="role-primary btn"
          @click="clearLogs()"
        >
          Clear Logs
        </button>
      </div>
      <div class="logs-items">
        <div
          v-for="log in sortedLogs"
          :key="log.uuid"
          class="log-item"
          :class="{'log-debug': log.level === 'debug' }"
        >
          <div class="log-indicator">
            <i
              v-if="log.level === 'error'"
              class="icon icon-notify-error"
            />
            <i
              v-if="log.level === 'info'"
              class="icon icon-notify-info"
            />
            <svg
              v-if="log.level === 'debug'"
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#1f1f1f"
            >
              <path d="M480-200q66 0 113-47t47-113v-160q0-66-47-113t-113-47q-66 0-113 47t-47 113v160q0 66 47 113t113 47Zm-80-120h160v-80H400v80Zm0-160h160v-80H400v80Zm80 40Zm0 320q-65 0-120.5-32T272-240H160v-80h84q-3-20-3.5-40t-.5-40h-80v-80h80q0-20 .5-40t3.5-40h-84v-80h112q14-23 31.5-43t40.5-35l-64-66 56-56 86 86q28-9 57-9t57 9l88-86 56 56-66 66q23 15 41.5 34.5T688-640h112v80h-84q3 20 3.5 40t.5 40h80v80h-80q0 20-.5 40t-3.5 40h84v80H688q-32 56-87.5 88T480-120Z" />
            </svg>
          </div>
          <LiveDate
            :value="log.timestamp"
            class="log-date"
          />
          <div class="log-msg">
            {{ log.message }}
            <i
              v-if="log.arg"
              v-clean-tooltip="log.argValue"
              class="icon icon-comment"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  h1, h3 {
    margin: 20px 0;
  }

  h2 {
    font-size: 18px;
  }

  .content-header {
    display: flex;
    align-items: center;

    > h1 {
      flex: 1;
      margin: 0;
      margin-bottom: 10px;
    }

    button {
      max-height: 40px;
    }
  }

  .test-debug {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 20%;
  }

  .two-columns {
    display: grid;
    grid-template-columns: 50% 50%;
    margin-top: 20px;

    .left-column {
      padding-right: 10px;
    }

    .logs {
      pre {
        white-space: pre-wrap;
      }

      .logs-header {
        display: flex;
        align-items: center;

        button {
          max-height: 30px;
          min-height: 30px;
          margin-bottom: 5px;
        }

        :first-child {
          flex: 1;
        }
      }

      .logs-items {
        border: 1px solid var(--border);
        height: calc(100vh - 180px);
        overflow-y: scroll;

        .log-item {
          display: flex;
          border-bottom: 1px solid var(--border);
          padding: 8px;

          &.log-debug {
            opacity: 0.8;
          }

          .log-indicator {
            text-align: center;
            flex: 0 0 24px;
            align-self: center;
            display: flex;
            justify-content: center;

            > svg {
              width: 20px;
              height: 20px;
            }
          }

          .log-msg {
            word-break: break-all;
          }

          .log-date {
            min-width: 64px;
          }

          :not(:first-child) {
            margin-left: 5px;
            align-self: center;
          }

          .icon {
            font-size: 16px;
          }
          .icon-notify-error {
            color: var(--error);
          }
          .icon-notify-info {
            color: var(--info);
          }
        }
      }
    }
  }

  .version {
    max-width: 200px;
  }

  .test-content {
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
    border: 1px solid var(--border);
    margin: 0;
    margin-top: 20px;
  }

  .buttons {
    display: flex;
    margin-top: 10px;

    :first-child {
      flex: 1;
    }
  }

  .config-settings {
    display: table;

    > .config-setting {
      display: table-row;

      DIV {
        display: table-cell;
      }

      :first-child {
        opacity: 0.8;
        padding: 2px 20px 2px 0;
      }
    }
  }
</style>
