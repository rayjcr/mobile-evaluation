const state = {
  student: [],
};
const mutations = {
  selectedStudent(state, arr) {
    state.student = arr;
  },
};
const actions = {};
const getters = {
  selectedxsList(state) {
    return state.student;
  },
};
export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}
