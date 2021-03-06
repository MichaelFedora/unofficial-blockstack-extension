import Vue from 'vue';
import { VVue } from '../../vvue';
import { mapGetters, mapState } from 'vuex';
import ccopy from 'clipboard-copy';
import { validateMnemonic, mnemonicToSeed, generateMnemonic } from 'bip39';
import * as bip32 from 'bip32';
import { BIP32Interface } from 'bip32';
import { randomBytes } from 'crypto';
import { dispatch, commit } from '../../vuex/remote-interface';
import { encrypt, createIv } from '../../util';
import { FieldFlags } from 'vee-validate';
import { StateType } from '../../vuex/stores/types/state';

export default (Vue as VVue).component('bs-login', {
  props: {
    done: { required: false, type: Boolean },
  },
  data() {
    return {
      view: '',

      phrase: '',
      email: '',
      pass: '',
      confirm: '',

      error: '',
    }
  },
  computed: {
    ...mapGetters({
      loggedIn: 'account/isLoggedIn'
    }) as { loggedIn: () => boolean },
    ...mapState({
      logoutReason: (state: StateType) => state.meta.logoutReason,
    }) as { logoutReason: () => string },

    fullForm(): boolean {
      return ((this.view === 'restore' ? this.phrase : true) && this.pass && this.confirm) ? true : false;
    },
  },
  mounted() {
    if(!this.$store.getters['account/isLoggedIn'])
      this.$emit('update:done', false);
    else
      this.$emit('update:done', true);
  },
  watch: {
    view(n) {
      if(n !== 'showKey')
        this.phrase = '';
      this.pass = '';
      this.email = '';
      this.confirm = '';
      this.$emit('error', '');
      if(this.$store.state.meta.logoutReason) commit('setLogoutReason', '');
      this.$validator.reset();
    },
    loggedIn(n) {
      if(!n) {
        this.view = '';
        this.$emit('update:done', false);
      }
    }
  },
  methods: {
    getType(field: FieldFlags, ignoreTouched?: boolean) {
      if(!field || (!field.dirty && (ignoreTouched || !field.touched))) return '';
      if(field.valid) return 'is-success';
      return 'is-danger';
    },
    copy(text: string) {
      ccopy(text);
    },
    async initializeWallet() {
      console.log('Initializing Wallet!');
      let masterKeychain: BIP32Interface = null;
      if(this.phrase && validateMnemonic(this.phrase)) {
        const seedBuffer = await mnemonicToSeed(this.phrase);
        masterKeychain = bip32.fromSeed(seedBuffer);
      } else if(!this.phrase) {
        this.phrase = generateMnemonic(128, randomBytes);
        const seedBuffer = await mnemonicToSeed(this.phrase);
        masterKeychain = bip32.fromSeed(seedBuffer);
      } else {
        throw new Error('Tried to initialize a wallet with a bad phrase');
      }
      const iv = await createIv();
      return encrypt(this.phrase, this.pass, iv).then(encryptedBackupPhrase => {
        console.log('Creating account w/ enc phrase: "' + encryptedBackupPhrase + '"!');
        return dispatch('account/createAccount',
              { email: this.email, encryptedBackupPhrase, iv, masterKeychain: masterKeychain.toBase58() });
      });
    },
    async initializeIdentity(autoGenProfile?: boolean) {
      console.log('Initializing identity...');
      return dispatch('connectSharedService')
        .then(() => dispatch('identity/downloadAll') as Promise<boolean[]>)
        .then(async results => {
          for(let i = 0, a = results[0]; i < results.length; a = results[++i]) {
            if(a) continue;
            const id = this.$store.state.identity.identities[i];
            console.log('Trying to download profile for ID-' + id.address + ' again...');
            const b = await dispatch('identity/download', { index: id.index }).then(() => true, () => false);
            if(b) continue;
            console.log('No profile (after two tries) for address ID-' + id.address + '.');
            let genProfile = autoGenProfile || false;
            if(!autoGenProfile) {
              this.$emit('working', false);
              genProfile = await new Promise<boolean>(resolve => this.$emit('showDialog', { type: 'confirm', options: {
                title: 'Login - No Profile',
                message: 'No profile found for '
                  + (i === 0 ? 'the main' : `a derived (${id.index})`)
                  + ` identity ID-${id.address} - create a new one?`,
                cancelText: 'Cancel & Logout',
                confirmText: 'Go for it',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
              }}));
              this.$emit('working', true);
            }
            if(genProfile) {
              await dispatch('identity/upload', { index: id.index });
              console.log('Uploaded profile for ID {' + id.index + '}!');
            } else { await dispatch('logout'); this.$emit('working', false); return; }
          }
        });
    },
    restore() {
      console.log('Restoring!');
      this.email = '';
      this.$emit('working', true);

      if(!validateMnemonic(this.phrase)) {
        console.error(this.error = 'Invalid keychain phrase entered!');
        this.$emit('error', this.error);
        this.$emit('working', false);
        return;
      }

      if(this.pass !== this.confirm) {
        console.error(this.error = 'Confirm-password is not equal to the password!');
        this.$emit('error', this.error);
        this.$emit('working', false);
        return;
      }

      this.initializeWallet()
        .then(() => this.initializeIdentity())
        .then(() => {
          console.log('Successfully logged in!')
          this.$emit('working', false);
          this.finish();
        }).catch(async e => {
          await dispatch('logout');
          console.error(this.error = 'Error finalizing restore: ' + e);
          console.error(e);
          this.$emit('error', this.error);
          this.view = 'restore';
          this.$emit('working', false);
      });
    },
    register() {
      console.log('Registering!');
      this.$emit('working', true);

      if(this.pass !== this.confirm) {
        console.error(this.error = 'Confirm-password is not equal to the password!');
        this.$emit('error', this.error);
        this.$emit('working', false);
        return;
      }

      this.initializeWallet()
        .then(() => this.initializeIdentity(true))
        .then(() => {
          console.log('Registered!');
          this.view = 'showKey';
          this.$emit('working', false);
        },
        e => {
          console.error(this.error = 'Error finalizing after register: ' + e);
          console.error(e);
          this.$emit('error', this.error);
          this.view = 'register';
          this.$emit('working', false);
      });
      this.view = 'showKey'
      this.$emit('working', false);
    },
    finish() {
      this.view = '';
      this.phrase = '';
      this.$emit('update:done', true);
      this.$emit('working', false);
    }
  }
});
