import Vue, { VueConstructor } from 'vue';
import { Store } from 'vuex';
import { StateType } from './vuex/stores/types/state';

interface Vuee extends Vue {
  $store: Store<StateType>;
}

export type VVue = VueConstructor<Vuee>;
