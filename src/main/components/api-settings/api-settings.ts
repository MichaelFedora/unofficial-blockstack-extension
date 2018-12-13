import Vue from 'vue';
import { VVue } from 'common/vvue';
import { mapState } from 'vuex';
import { StateType } from 'common/vuex/stores/types/state';
import { commit, dispatch } from 'common/vuex/remote-interface';
import Axios, { AxiosResponse } from 'axios';
import SemVer from 'semver';

export default (Vue as VVue).component('bs-main-api-settings', {
  data() {
    return {
      coreApi: '',
      gaiaHubOverride: '',
      working: false,
    }
  },
  computed: {
    applicable: function() {
      return this.coreApi !== this.currentCoreAPI || this.gaiaHubOverride !== this.currentGaiaHubOverride;
    },
    ...mapState({
      gaiaHubUrl: (state: StateType) => state.settings.api.gaiaHubUrl,
      currentCoreAPI: (state: StateType) => state.settings.api.coreApi,
      currentGaiaHubOverride: (state: StateType) => state.settings.api.gaiaHubOverride
    }) as { gaiaHubUrl: () => string, currentCoreAPI: () => string, currentGaiaHubOverride: () => string }
  },
  mounted() {
    this.cancel();
  },
  methods: {
    async apply() {
      this.working = true;
      let failed = '';
      if(this.coreApi !== this.currentCoreAPI) {
        let res: AxiosResponse<{ status: string, version: string }>;
        await Axios.get(this.coreApi + '/v1/node/ping').then(
          r => res = r,
          e => failed = `Core node doesn't have /v1/node/ping or is not online.`);
        if(!failed && res.data && res.data.status && res.data.version) {
          const v = SemVer.coerce(res.data.version);
          if(res.data.status !== 'alive') failed = 'Core node does not have "alive" status.';
          else if(!SemVer.valid(v)) failed = 'Core node does not have valid (coerced) SemVer version.'
          else if (!SemVer.gte(v, '20.0.0')) failed = `Core node does not have version >= 20.0.0; is ${res.data.version} instead.`;
          else await commit('updateApi', { coreApi: this.coreApi });
        } else failed = failed || 'Core node ping response is not according to the `{ status: string, version: string }` schema.'

        if(failed) {
          this.$dialog.alert({
            title: 'Error setting Core API Url',
            message: `<div class='content'><blockquote>${failed}</blockquote></div>`,
            type: 'is-danger',
          });
          this.working = false;
          return;
        }
      }

      if(this.gaiaHubOverride !== this.currentGaiaHubOverride) {

        const oldOverride = this.currentGaiaHubOverride;

        if(this.gaiaHubOverride === this.gaiaHubUrl) {
          await commit('updateApi', { gaiaHubOverride: '' });
          this.gaiaHubOverride = '';

        } else await commit('updateApi', { gaiaHubOverride: this.gaiaHubOverride });

        await dispatch('resetApi').catch(e => console.error('Error resetting the Api settings: ' + e));
        await dispatch('connectSharedService').catch(e => failed = 'Could not connect to Gaia Hub: ' + e);

        if(failed) {
          await commit('updateApi', { gaiaHubOverride: oldOverride });
          this.$dialog.alert({
            title: 'Error setting Gaia Hub Override',
            message: `<div class='content'><blockquote>${failed}</blockquote></div>`,
            type: 'is-danger',
          });
          this.working = false;
          return;
        }
      }

      this.$dialog.alert({
        title: 'Settings Saved',
        message: 'Settings have been saved!',
        type: 'is-success',
      });
      this.working = false;
    },
    cancel() {
      this.coreApi = this.currentCoreAPI;
      this.gaiaHubOverride = this.currentGaiaHubOverride;
    }
  }
});
