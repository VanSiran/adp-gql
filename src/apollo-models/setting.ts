import gql from 'graphql-tag';
import { Reducer } from '@/utils/apollo-connect';

import { message } from 'antd';
import defaultSettings, { DefaultSettings } from '../../config/defaultSettings';
import themeColorClient from '../components/SettingDrawer/themeColorClient';

export interface SettingModelType {
  namespace: 'settings';
  state: DefaultSettings;
  reducers: {
    getSetting: Reducer<DefaultSettings>;
    changeSetting: Reducer<DefaultSettings>;

    stateGql: any,
    cacheToState: (data: object) => object,
    stateToCache: (state: object) => object,
  };
}


const stateGql = gql`
  query {
    data: __STATE_settings @client {
      navTheme
      primaryColor
      layout
      contentWidth
      fixedHeader
      autoHideHeader
      fixSiderbar
      colorWeak
      menu {
        locale
      }
      title
      pwa
      iconfontUrl
    }
  }
`

const cacheToState = (data: object) => {
  return data.data
}

const stateToCache = (state: object) => {
  return {
    data: {
      __STATE_settings: state
    }
  }
}


const updateTheme = (newPrimaryColor?: string) => {
  if (newPrimaryColor) {
    const timeOut = 0;
    const hideMessage = message.loading('正在切换主题！', timeOut);
    themeColorClient.changeColor(newPrimaryColor).finally(() => hideMessage());
  }
};

const updateColorWeak: (colorWeak: boolean) => void = colorWeak => {
  const root = document.getElementById('root');
  if (root) {
    root.className = colorWeak ? 'colorWeak' : '';
  }
};

const SettingModel: SettingModelType = {
  namespace: 'settings',
  state: defaultSettings,
  reducers: {
    getSetting(state = defaultSettings) {
      const setting: Partial<DefaultSettings> = {};
      const urlParams = new URL(window.location.href);
      Object.keys(state).forEach(key => {
        if (urlParams.searchParams.has(key)) {
          const value = urlParams.searchParams.get(key);
          setting[key] = value === '1' ? true : value;
        }
      });
      const { primaryColor, colorWeak } = setting;

      if (primaryColor && state.primaryColor !== primaryColor) {
        updateTheme(primaryColor);
      }
      updateColorWeak(!!colorWeak);
      return {
        ...state,
        ...setting,
      };
    },
    changeSetting(state = defaultSettings, { payload }) {
      const urlParams = new URL(window.location.href);
      Object.keys(defaultSettings).forEach(key => {
        if (urlParams.searchParams.has(key)) {
          urlParams.searchParams.delete(key);
        }
      });
      Object.keys(payload).forEach(key => {
        if (key === 'collapse') {
          return;
        }
        // BUG: menu 是 object, 通过 urlParams.searchParams.set(key, value)
        // 序列化成 [object object], 导致搜索参数不能正确记录 menu 属性真实的值
        if (key === 'menu') {
          return;
        }

        let value = payload[key];
        if (value === true) {
          value = 1;
        }
        if (defaultSettings[key] !== value) {
          urlParams.searchParams.set(key, value);
        }
      });
      const { primaryColor, colorWeak, contentWidth } = payload;
      if (primaryColor && state.primaryColor !== primaryColor) {
        updateTheme(primaryColor);
      }
      if (state.contentWidth !== contentWidth && window.dispatchEvent) {
        window.dispatchEvent(new Event('resize'));
      }
      updateColorWeak(!!colorWeak);
      window.history.replaceState(null, 'setting', urlParams.href);
      return {
        ...state,
        ...payload,
      };
    },
  },

  stateToCache,
  cacheToState,
  stateGql,
};
export default SettingModel;