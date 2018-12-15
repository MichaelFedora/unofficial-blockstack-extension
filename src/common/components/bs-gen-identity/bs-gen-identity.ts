import Vue from 'vue';
import { FieldFlags } from 'vee-validate';
import { VVue } from 'common/vvue';
import { dispatch } from 'common/vuex/remote-interface';

export default (Vue as VVue).component('bs-gen-identity', {
  props: {
    startOffset: { required: false, type: Number, default: null },
    startAdvance: { required: false, type: Boolean, default: false }
  },
  data() {
    return {
      offset: null,
      pass: '',
      error: '',
      working: false,
      advance: false
    }
  },
  computed: {
    validOffset: function() {
      if(!this.offset) return true;
      else return this.offset > 0 && !this.$store.state.identity.identities.find(a => a.index === this.offset)
    },
    excluded: function() {
      return this.$store.state.identity.identities.map(a => a.index);
    }
  },
  mounted() {
    this.offset = this.startOffset || this.offset;
    this.advance = this.startAdvance || this.advance;
  },
  methods: {
    getType(field: FieldFlags, ignoreTouched?: boolean) {
      if(!field || (!field.dirty && (ignoreTouched || !field.touched))) return '';
      if(field.valid) return 'is-success';
      return 'is-danger';
    },
    async confirm() {
      if(this.working) return;
      this.working = true;
      let index = this.advance && this.validOffset ? this.offset : null;
      if(!index)
        index = this.$store.state.identity.identities[this.$store.state.identity.identities.length - 1].index + 1;
      console.log('adding identity: ', this.advance, this.offset, index);
      await dispatch('identity/create', { password: this.pass, index }).then(async () => {
        const identity = this.$store.state.identity.identities.find(acc => acc.index === index);
        this.$emit('done', { identity, index });
        (this.$parent as any).close()
      }).then(() => this.working = false);
    }
  }
});
