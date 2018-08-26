export interface SideMenuState {
  visible: boolean;
}

const initialState: SideMenuState = {
  visible: true
};

export default {
  namespace: 'side',
  state: initialState,
  actions: {
    close(state) {
      return {
        ...state,
        visible: false
      };
    },
    show(state) {
      return {
        ...state,
        visible: true
      };
    },
    toggle(state) {
      return {
        ...state,
        visible: !state.visible
      };
    }
  },
  effects: {}
};
