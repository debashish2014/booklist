import { hashOf } from "applicationRoot/rootReducer";
import { bulkMerge } from "util/immutableHelpers";
import { BooksModuleType, BooksReducerType, BookSearchType } from "modules/books/reducers/reducer";

import update from "immutability-helper";

import { createSelector } from "reselect";
import {
  LOAD_BOOKS,
  LOAD_BOOKS_RESULTS,
  TOGGLE_SELECT_BOOK,
  BOOK_READ_CHANGING,
  BOOK_READ_CHANGED,
  TOGGLE_CHECK_ALL,
  SET_PENDING_DELETE_BOOK,
  CANCEL_PENDING_DELETE_BOOK,
  DELETE_BOOK,
  BOOK_DELETING,
  BOOK_DELETED,
  EDITORIAL_REVIEWS_LOADING,
  DETAILS_LOADED,
  EXPAND_BOOK,
  COLLAPSE_BOOK,
  SET_BOOKS_SUBJECTS,
  SET_BOOKS_TAGS,
  EDITING_BOOK_SAVED
} from "./actionNames";

import { BOOK_SAVED, MANUAL_BOOK_SAVED } from "modules/scan/reducers/actionNames";
import { selectBookSearchState } from "../bookSearch/reducer";

interface IEditorialReview {
  content: string;
  source: string;
}

interface IBookSummary {
  title: string;
  asin: string;
  authors: string[];
  smallImage: string;
}

export interface IBookRaw {
  _id: string;
  dateAdded: number;
  ean: string;
  editorialReviews: IEditorialReview[];
  similarBooks: IBookSummary[];
  isRead: boolean;
  readChanging?: boolean;
  isbn: string;
  smallImage: string;
  mediumImage: string;
  pages: any;
  publicationDate: any;
  publisher: string;
  authors: string[];
  subjects: string[];
  tags: string[];
  title: string;
  titleLower: string;
  userId: string;
  deleting?: boolean;
  pendingDelete?: boolean;
  expanded: boolean;
  detailsLoaded: boolean;
  detailsLoading: boolean;
}

export interface IBookDisplay extends IBookRaw {
  subjectObjects: any[];
  tagObjects: any[];
  dateAddedDisplay: string;
}

const initialBooksState = {
  booksHash: hashOf<IBookRaw>(),
  booksLoading: false,
  selectedBooks: {} as { [s: string]: boolean },
  resultsCount: 0,
  reloadOnActivate: false
};
export type BooksReducerType = typeof initialBooksState;

export function booksReducer(state = initialBooksState, action): BooksReducerType {
  switch (action.type) {
    case LOAD_BOOKS:
      return { ...state, booksLoading: true, reloadOnActivate: false };
    case LOAD_BOOKS_RESULTS:
      return { ...state, booksLoading: false, selectedBooks: {}, booksHash: createBooksHash(action.books), resultsCount: action.resultsCount };
    case EDITING_BOOK_SAVED:
      return update(state, { booksHash: { [action.book._id]: { $merge: action.book } } });
    case TOGGLE_SELECT_BOOK:
      return update(state, { selectedBooks: { [action._id]: { $set: !state.selectedBooks[action._id] } } });
    case SET_BOOKS_SUBJECTS: {
      let remove = new Set<string>(action.remove);
      return update(state, {
        booksHash: {
          ...action.books.reduce(
            (hash, _id) => (
              (hash[_id] = {
                subjects: { $apply: currentSubjects => Array.from(new Set(currentSubjects.filter(t => !remove.has(t)).concat(action.add))) }
              }),
              hash
            ),
            {}
          )
        }
      });
    }
    case SET_BOOKS_TAGS: {
      let remove = new Set<string>(action.remove);
      return update(state, {
        booksHash: {
          ...action.books.reduce(
            (hash, _id) => (
              (hash[_id] = {
                tags: { $apply: currentTags => Array.from(new Set(currentTags.filter(t => !remove.has(t)).concat(action.add))) }
              }),
              hash
            ),
            {}
          )
        }
      });
    }
    case BOOK_SAVED:
    case MANUAL_BOOK_SAVED:
      return { ...state, reloadOnActivate: true };
    case BOOK_READ_CHANGING:
      return update(state, { booksHash: bulkMerge(action._ids, { readChanging: true }) });
    case BOOK_READ_CHANGED:
      return update(state, { booksHash: bulkMerge(action._ids, { readChanging: false, isRead: action.value }) });
    case TOGGLE_CHECK_ALL:
      let selectedCount = Object.keys(state.selectedBooks).filter(k => state.selectedBooks[k]).length,
        allBooksCount = Object.keys(state.booksHash).length,
        willSelectAll = !selectedCount || (selectedCount && allBooksCount != selectedCount);

      return update(state, {
        selectedBooks: { $set: willSelectAll ? Object.keys(state.booksHash).reduce((hash, _id) => ((hash[_id] = true), hash), {}) : {} }
      });
    case SET_PENDING_DELETE_BOOK:
      return update(state, { booksHash: { [action._id]: { $merge: { pendingDelete: true } } } });
    case CANCEL_PENDING_DELETE_BOOK:
      return update(state, { booksHash: { [action._id]: { $merge: { pendingDelete: false } } } });
    case BOOK_DELETING:
      return update(state, { booksHash: { [action._id]: { $merge: { deleting: true } } } });
    case BOOK_DELETED:
      return update(state, { booksHash: { $unset: [action._id] } });
    case EDITORIAL_REVIEWS_LOADING:
      return update(state, { booksHash: { [action._id]: { $merge: { detailsLoading: true } } } });
    case EXPAND_BOOK:
      return update(state, { booksHash: { [action._id]: { $merge: { expanded: true } } } });
    case COLLAPSE_BOOK:
      return update(state, { booksHash: { [action._id]: { $merge: { expanded: false } } } });
    case DETAILS_LOADED:
      return update(state, {
        booksHash: {
          [action._id]: {
            $merge: {
              detailsLoading: false,
              detailsLoaded: true,
              expanded: true,
              similarBooks: action.similarBooks,
              editorialReviews: action.editorialReviews
            }
          }
        }
      });
  }
  return state;
}

function createBooksHash(booksArr) {
  let result = {};
  booksArr.forEach(book => {
    if (!book.subjects) {
      book.subjects = [];
    }
    if (!book.tags) {
      book.tags = [];
    }
    result[book._id] = book;
  });
  return result;
}

export const selectBookList = createSelector(
  (state: BooksModuleType) => state.booksModule.books.booksLoading,
  (state: BooksModuleType) => state.booksModule.books.booksHash,
  (state: BooksModuleType) => state.app.subjectHash,
  (state: BooksModuleType) => state.app.tagHash,
  (booksLoading, booksHash, subjectsHash, tagHash) => {
    let books = Object.keys(booksHash).map(_id => ({ ...booksHash[_id] }));
    books.forEach((b: IBookDisplay) => {
      b.subjectObjects = (b.subjects || []).map(s => subjectsHash[s]).filter(s => s);
      b.tagObjects = (b.tags || []).map(s => tagHash[s]).filter(s => s);
      b.authors = b.authors || [];

      let d = new Date(+b.dateAdded);
      b.dateAddedDisplay = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    });
    return { booksList: books as IBookDisplay[], booksLoading };
  }
);

export const selectBookLoadingInfo = createSelector(
  (state: BooksModuleType) => state.booksModule.books,
  selectBookSearchState,
  (booksModule, bookSearch) => {
    let totalPages = Math.ceil(booksModule.resultsCount / bookSearch.pageSize);
    return { resultsCount: booksModule.resultsCount, booksLoading: booksModule.booksLoading, totalPages };
  }
);

export const selectBookSelection = createSelector(
  (state: BooksModuleType) => state.booksModule.books.booksHash,
  (state: BooksModuleType) => state.booksModule.books.selectedBooks,
  (booksHash, selectedBooks) => {
    let selectedIds = Object.keys(selectedBooks).filter(_id => selectedBooks[_id]).length;
    return {
      allAreChecked: Object.keys(booksHash).length == selectedIds,
      selectedBooksCount: selectedIds,
      selectedBookHash: selectedBooks
    };
  }
);
