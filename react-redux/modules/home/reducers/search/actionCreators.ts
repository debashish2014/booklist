import { graphqlClient } from "applicationRoot/rootReducerActionCreators";

import GetBooksQuery from "graphQL/home/searchBooks.graphql";
import { SET_SEARCH_VALUES, SEARCH_BOOKS_COMPLETE, SEARCH_BOOKS } from "./actionNames";
import { selectSearchVariables } from "./reducer";

export const booksSearch = searchValues => (dispatch, getState) => {
  dispatch({ type: SET_SEARCH_VALUES, values: { ...searchValues, page: 1 } });
  let queryVariables = selectSearchVariables(getState());

  dispatch({ type: SEARCH_BOOKS });

  return graphqlClient.runQuery(GetBooksQuery, queryVariables).then(resp => {
    if (resp.data && resp.data.allBooks && resp.data.allBooks.Books && resp.data.allBooks.Meta) {
      dispatch({ type: SEARCH_BOOKS_COMPLETE, results: resp.data.allBooks.Books, count: resp.data.allBooks.Meta.count });
    }
  });
};
