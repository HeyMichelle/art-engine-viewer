import { createStore } from "vuex";

export default createStore({
  state: {
    metadata: [],
    filters: [],
    results: [],
    allTraits: [],
    traitTypes: [],
    currentDetailIndex: 0,
  },
  getters: {},
  mutations: {
    SET_RESULTS(state, _results) {
      state.results = _results;
    },
    SET_FILTERS(state, _filters) {
      state.filters = _filters;
    },
    SET_METADATA(state, _metadata) {
      state.metadata = _metadata;
    },
    SET_TRAITS(state, _traitsData) {
      state.allTraits = _traitsData;
    },
    SET_TRAIT_TYPES(state, _traits) {
      state.traitTypes = _traits;
    },
    SET_CURRENT_INDEX(state, _index) {
      state.currentDetailIndex = _index;
    },
  },
  actions: {
    INITIALIZE_TRAITS({ commit }, metadata) {
      console.log("init traits,", metadata);
      commit("SET_METADATA", metadata);
      commit("SET_RESULTS", metadata);

      const allTraits = metadata.reduce((acc, item) => {
        // loop over each item in the entire metadata. this could be
        // time intensive.
        // Initialize the trait if it has not been initialized yet in the acc
        // initialize the value at count 1 it it has not been init yet
        // sum al the counts
        item.attributes.forEach((attribute) => {
          acc[attribute.trait_type] = {
            ...acc[attribute.trait_type],
            [attribute.value]: {
              filterState: false,
              count: acc[attribute.trait_type]
                ? acc[attribute.trait_type][attribute.value]
                  ? acc[attribute.trait_type][attribute.value].count + 1
                  : 1
                : 1,
            },
          };
        });
        return acc;
      }, {});

      const traitTypes = Object.keys(allTraits);
      commit("SET_TRAIT_TYPES", traitTypes);
      commit("SET_TRAITS", allTraits);
    },
    /**
     *
     * @param {context} param0 Unwraped context params for commit,state
     * @param {Array} filters [...{}] filters of types and value pairs
     */
    UPDATE_RESULTS({ commit, state }, filters) {
      // TODO: do the filtering of the metadata here
      const subset = state.metadata.filter((item) => {
        return item.attributes.includes(
          (attribute) =>
            attribute.trait_type === filters.trait_type &&
            attribute.value === attribute.value
        );
      });

      commit("SET_RESULTS", subset);
    },

    ADD_FILTER({ commit, dispatch, state }, filter) {
      const filters = [...state.filters, { ...filter, filterState: true }];
      const updateState = {
        ...state.allTraits,
      };
      updateState[filter.trait_type][filter.value].filterState = true;

      commit("SET_TRAITS", updateState);
      commit("SET_FILTERS", filters);
      dispatch("FILTER");
    },

    REMOVE_FILTER({ commit, dispatch, state }, traitFilter) {
      const filters = state.filters.filter(
        (trait) =>
          trait.trait_type !== traitFilter.trait_type &&
          trait.value !== traitFilter.value
      );
      const updateState = {
        ...state.allTraits,
      };
      updateState[traitFilter.trait_type][
        traitFilter.value
      ].filterState = false;
      commit("SET_TRAITS", updateState);
      commit("SET_FILTERS", filters);
      dispatch("FILTER");
    },

    FILTER({ commit, state }) {
      if (!state.filters.length || state.filters.length === 0) {
        // clear all filter results and show all
        commit("SET_RESULTS", state.metadata);
        return;
      }
      const results = state.metadata.filter((item) => {
        // if the items attributes match any of the filters, return true
        const matches = item.attributes.filter((attribute) => {
          // eslint-disable-next-line
          // debugger;
          // TODO: currently treats all filters as "OR"
          // should ad; a "drill down", "AND" functionality/mode
          return state.filters.some((f) => {
            return (
              f.trait_type === attribute.trait_type &&
              f.value === attribute.value
            );
          });
        });
        return matches.length > 0;
      });
      console.log({ results });
      commit("SET_RESULTS", results);
    },

    // Set the metadata array index of the current selected item
    CURRENT_DETAIL_INDEX({ commit }, _index) {
      commit("SET_CURRENT_INDEX", _index);
    },
  },
  modules: {},
});
