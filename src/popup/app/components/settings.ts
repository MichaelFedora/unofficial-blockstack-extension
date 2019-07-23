import Vue from 'vue';
import { VVue } from 'common/vvue';
import { mapState, mapGetters } from 'vuex';
import { StateType } from 'common/vuex/stores/types/state';
import { commit, dispatch } from 'common/vuex/remote-interface';
import Axios, { AxiosResponse } from 'axios';
import SemVer from 'semver';
import { decrypt } from 'common/util';
import ChangePasswordComponent from 'common/components/bs-change-password/bs-change-password';
import { FieldFlags } from 'vee-validate';
import { DEFAULT_CORE_API_ENDPOINT, DEFAULT_GAIA_HUB } from 'common/settings/default';
import { browser } from 'webextension-polyfill-ts';

export default (Vue as VVue).component('bs-popup-settings', {
  props: {
    toggle: { required: true, type: Boolean }
  },
  data() {
    return {
      email: '',
      coreApi: '',
      gaiaHubUrl: '',
      working: false,
      version: browser.runtime.getManifest().version
    }
  },
  computed: {
    applicable(): boolean {
      return this.email !== this.currentEmail ||
            this.coreApi !== this.currentCoreAPI ||
            this.gaiaHubUrl !== this.currentGaiaHubUrl;
    },

    ...mapGetters({
      loggedIn: 'account/isLoggedIn'
    }) as { loggedIn: () => boolean },

    ...mapState({
      currentEmail: (state: StateType) => state.account.email,
      currentGaiaHubUrl: (state: StateType) => state.settings.api.gaiaHubUrl,
      currentCoreAPI: (state: StateType) => state.settings.api.coreApi,
    }) as { currentEmail: () => string, currentCoreAPI: () => string, currentGaiaHubUrl: () => string },

    fullForm(): boolean {
      return this.coreApi && this.gaiaHubUrl ? true : false;
    },
    defaults(): boolean {
      return this.coreApi === DEFAULT_CORE_API_ENDPOINT && this.gaiaHubUrl === DEFAULT_GAIA_HUB;
    }
  },
  mounted() {
    this.cancel();
  },
  methods: {
    getType(field: FieldFlags, ignoreTouched?: boolean) {
      if(!field || (!field.dirty && (ignoreTouched || !field.touched))) return '';
      if(field.valid) return 'is-success';
      return 'is-danger';
    },
    async apply() {
      this.working = true;
      let failed = '';
      let failCount = 0;

      if(this.email !== this.currentEmail) {
        await commit('account/update', { email: this.email });
      }

      if(this.coreApi !== this.currentCoreAPI) {
        let res: AxiosResponse<{ status: string, version: string }>;
        await Axios.get(this.coreApi + '/v1/node/ping').then(
          r => res = r,
          e => failed = `Core node doesn't have /v1/node/ping, is not online, or is invalid.`);
        if(!failed && res.data && res.data.status && res.data.version) {
          const v = SemVer.coerce(res.data.version);
          if(res.data.status !== 'alive') failed = 'Core node does not have "alive" status.';
          else if(!SemVer.valid(v)) failed = 'Core node does not have valid (coerced) SemVer version.';
          else if (!SemVer.gte(v, '20.0.0')) failed = `Core node does not have version >= 20.0.0; is ${res.data.version} instead.`;
          else await commit('updateApi', { coreApi: this.coreApi });
        } else failed = failed || 'Core node ping response is not according to the `{ status: string, version: string }` schema.'

        if(failed) {
          await new Promise(resolve => this.$dialog.alert({
            title: 'Error setting Core API Url',
            message: `<div class='content'><blockquote>${failed}</blockquote></div>`,
            type: 'is-danger',
            onConfirm: () => resolve()
          }));
          failed = '';
          failCount++;
        }
      }

      if(this.gaiaHubUrl !== this.currentGaiaHubUrl) {

        const oldGaiaHubUrl = this.currentGaiaHubUrl;

        await dispatch('resetApi').catch(e => console.error('Error resetting the Api settings: ' + e));
        await commit('updateApi', { gaiaHubUrl: this.gaiaHubUrl });
        if(this.loggedIn) {
          await dispatch('connectSharedService').catch(e => failed = 'Could not connect to Gaia Hub: ' + e);

        } else {
          let res: AxiosResponse<{ challenge_text: string, latest_auth_version: string, read_url_prefix: string }>;
          await Axios.get(this.gaiaHubUrl + '/' + 'hub_info').then(
            r => res = r,
            e => failed = failed = `Gaia Hub doesn't have /hub_info, is not online, or is invalid.`);

          if(!failed && res.data && res.data.latest_auth_version && res.data.read_url_prefix) {
            const v = SemVer.coerce(res.data.latest_auth_version);
            if(!SemVer.valid(v)) failed = 'Gaia Hub latest_auth_version does not have a valid (coerced) SemVer version.';
            if(!SemVer.gte(v, '1.0.0')) failed = 'Gaia Hub latest_auth_version is not >= v1';
            // check read_url_prefix?
          } else failed = failed || 'Gaia Hub `/hub_info` response is not according to the'
          + ' `{ latest_auth_version: string, read_url_prefix: string }` schema.'
        }

        if(failed) {
          await commit('updateApi', { gaiaHubUrl: oldGaiaHubUrl });
          await new Promise(resolve => this.$dialog.alert({
            title: 'Error setting Gaia Hub Override',
            message: `<div class='content'><blockquote>${failed}</blockquote></div>`,
            type: 'is-danger',
            onConfirm: () => resolve()
          }));
          failed = '';
          failCount++;
        }
      }

      if(failCount <= 0) {
        this.$dialog.alert({
          title: 'Settings Saved',
          message: 'Settings have been saved!',
          type: 'is-success',
        });
      } else {
        this.$dialog.alert({
          title: 'Some Settings Saved',
          message: 'Settings that worked have been saved!',
          type: 'is-warning',
        });
      }
      this.working = false;
    },
    cancel() {
      this.email = this.currentEmail;
      this.coreApi = this.currentCoreAPI;
      this.gaiaHubUrl = this.currentGaiaHubUrl;
    },
    resetDefaults() {
      this.coreApi = DEFAULT_CORE_API_ENDPOINT;
      this.gaiaHubUrl = DEFAULT_GAIA_HUB;
    },
    showRecoveryKey() {
      this.$dialog.prompt({
        message: 'Enter your password to view your Backup Phrase',
        confirmText: 'Authenticate',
        inputAttrs: {
          placeholder: 'password',
          type: 'password'
        },
        onConfirm: (value) => {
          decrypt(this.$store.state.account.encryptedBackupPhrase, value, this.$store.state.account.iv).then(phrase => {
            this.$dialog.alert({
              title: 'Backup Phrase',
              message: `<div class='content'>
              Anyone with this key can get into your account. Keep it safe.
              <blockquote style='font-family:monospace'>${phrase}</blockquote>
              </div>`,
              confirmText: 'Got it!'
            })
          }, e => {
            console.error('Error decrypting phrase: ' + e);
            this.$dialog.alert({
              title: 'Error decrypting phrase',
              message: `<div class='content'><blockquote>${e}</blockquote>It was probably just a wrong password.</div>`,
              type: 'is-danger',
              onConfirm: () => this.showRecoveryKey()
            });
          });
        }
      }); // prompt
    },
    changePassword() {
      this.$modal.open({
        parent: this,
        component: ChangePasswordComponent,
        hasModalCard: true
      });
    },
    exit() {
      this.$emit('update:toggle', false);
    }
  }
});
