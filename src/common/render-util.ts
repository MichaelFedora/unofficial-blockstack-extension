import { CreateElement } from 'vue';

export function makeCenterStyle() {
  return {
    display: 'flex',
    flexFlow: 'column',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: '0',
    left: '0',
    height: '100%',
    width: '100%',
    backgroundColor: '#fafafa'
  }
};

export function makeInitializerComponent(h: CreateElement, loadingComponent: any) {
  return h('div', { staticStyle: makeCenterStyle() }, [h(loadingComponent)]);
}
