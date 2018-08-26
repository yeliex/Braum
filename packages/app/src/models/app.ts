export interface AppState {
  path: string
}

const initialState: AppState = {
  path: '/'
};

export default {
  namespace: 'app',
  state: initialState,
  actions: {
    path(state, {path = '/'}) {
      return {
        ...state,
        path
      };
    }
  },
  effects: {}
};
