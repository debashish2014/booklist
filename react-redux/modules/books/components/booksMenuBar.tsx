import React, { SFC } from "react";
const { useRef, useEffect } = React as any;
import { connect } from "react-redux";

import { selectBookSelection, selectBookLoadingInfo } from "modules/books/reducers/books/reducer";
import { selectBookSearchState, selectBookSearchUiView } from "modules/books/reducers/bookSearch/reducer";

import * as booksActionCreators from "../reducers/books/actionCreators";
import * as bookSearchActionCreators from "../reducers/bookSearch/actionCreators";

import { RemovableLabelDisplay } from "applicationRoot/components/labelDisplay";

import { selectAppUiState, combineSelectors } from "applicationRoot/rootReducer";

const menuBarSelector = combineSelectors(selectBookSearchState, selectBookSearchUiView, selectBookLoadingInfo, selectAppUiState, selectBookSelection);

interface IAddedMenuProps {
  editTags: any;
  editSubjects: any;
  startSubjectModification: any;
  startTagModification: any;
  beginEditFilters: any;
}
type actions = typeof bookSearchActionCreators & typeof booksActionCreators;

const filterDisplayStyles = { flex: "0 0 auto", alignSelf: "center", marginRight: "5px", marginTop: "4px", marginBottom: "4px" };

const BooksMenuBar: SFC<ReturnType<typeof menuBarSelector> & actions & IAddedMenuProps> = props => {
  const quickSearchEl = useRef(null);

  useEffect(() => void (quickSearchEl.current.value = props.search), [props.search]);

  const quickSearch = evt => {
    evt.preventDefault();
    props.quickSearch(evt.currentTarget.value);
  };
  const resetSearch = () => {
    quickSearchEl.current.value = props.search;
  };
  const quickSearchType = evt => {
    if (evt.keyCode == 13) {
      quickSearch(evt);
    }
  };

  let { isPublic, publicBooksHeader, publicName, page, pageSize, selectedBooksCount, totalPages, activeFilterCount, online, resultsCount } = props;
  let booksHeader = isPublic ? publicBooksHeader || `${publicName}'s Books` : "Your Books";

  let canPageUp = online ? page < totalPages : resultsCount == pageSize;
  let canPageDown = page > 1;
  let canPageOne = page > 1;
  let canPageLast = page < totalPages;

  let resultsDisplay = resultsCount ? `${resultsCount} book${resultsCount === 1 ? "" : "s"}` : "";
  let removeAllFiltersLabel = {
    backgroundColor: "red",
    textColor: "white",
    name: "Remove all filters"
  };

  return (
    <div>
      <div className="booksMenuBar" style={{ fontSize: "11pt", paddingBottom: "5px" }}>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {isPublic ? <h4 style={{ marginTop: "5px", marginRight: "5px", marginBottom: 0, alignSelf: "center" }}>{booksHeader}</h4> : null}
          {!selectedBooksCount ? (
            <div className="visible-tiny" style={{ flex: "0 0 auto", marginTop: "5px", marginRight: "5px" }}>
              <div className="btn-group">
                <button onClick={props.pageDown} disabled={!canPageDown} className="btn btn-default">
                  <i className="fal fa-angle-left" />
                </button>
                <button onClick={props.pageUp} disabled={!canPageUp} className="btn btn-default">
                  <i className="fal fa-angle-right" />
                </button>
              </div>
            </div>
          ) : null}
          <div className="hidden-tiny" style={{ flex: "0 0 auto", marginTop: "5px", marginRight: "5px" }}>
            <div className="btn-group">
              <button onClick={props.pageOne} disabled={!canPageOne} className="btn btn-default">
                <i className="fal fa-angle-double-left" />
              </button>
              <button onClick={props.pageDown} disabled={!canPageDown} className="btn btn-default" style={{ marginRight: "5px" }}>
                <i className="fal fa-angle-left" />
              </button>
            </div>
            {online && resultsCount ? (
              <span style={{ display: "inline" }}>
                <span className="hidden-xs">Page</span> {page}
                <span className="hidden-xs"> of {totalPages}</span>
              </span>
            ) : null}
            <div className="btn-group">
              <button onClick={props.pageUp} disabled={!canPageUp} className="btn btn-default" style={{ marginLeft: "5px" }}>
                <i className="fal fa-angle-right" />
              </button>
              {online ? (
                <button onClick={props.pageLast} disabled={!canPageLast} className="btn btn-default">
                  <i className="fal fa-angle-double-right" />
                </button>
              ) : null}
            </div>
          </div>
          <div style={{ flex: "0 0 auto", marginTop: "5px", marginRight: "5px" }}>
            <div className="btn-group">
              <input
                ref={quickSearchEl}
                defaultValue={props.search}
                onBlur={resetSearch}
                name="search"
                className="form-control hidden-tiny"
                placeholder="Title search"
                onKeyDown={quickSearchType}
                style={{
                  float: "left",
                  display: "inline-block",
                  width: "100px",
                  borderTopRightRadius: isPublic && selectedBooksCount ? "4px" : 0,
                  borderBottomRightRadius: isPublic && selectedBooksCount ? "4px" : 0,
                  borderRightWidth: isPublic && selectedBooksCount ? "1px" : 0
                }}
              />
              {!selectedBooksCount ? (
                <>
                  {online ? (
                    <>
                      <button
                        title="Filter search"
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        onClick={props.beginEditFilters}
                        className="btn btn-default btn-reset"
                      >
                        <i className="fal fa-filter" />
                      </button>
                      {!isPublic ? (
                        <>
                          <button title="Edit subjects" onClick={props.editSubjects} className="btn btn-default ">
                            <i className="fal fa-sitemap" />
                          </button>
                          <button title="Edit tags" onClick={props.editTags} className="btn btn-default ">
                            <i className="fal fa-tags" />
                          </button>
                        </>
                      ) : null}
                    </>
                  ) : null}
                  <button
                    style={{ position: "static" }}
                    onClick={props.setViewDesktop}
                    className={"btn btn-default " + (props.isGridView ? "active" : "")}
                  >
                    <i className="fal fa-table" />
                  </button>
                  <button
                    style={{ position: "static" }}
                    onClick={props.setViewBasicList}
                    className={"btn btn-default " + (props.isBasicList ? "active" : "")}
                  >
                    <i className="fal fa-list" />
                  </button>
                </>
              ) : !isPublic ? (
                <>
                  <button title="Add/remove subjects" onClick={props.startSubjectModification} className={"btn btn-default btn-reset"}>
                    <i className="fal fa-sitemap" />
                  </button>
                  <button title="Add/remove tags" onClick={props.startTagModification} className="btn btn-default">
                    <i className="fal fa-tags" />
                  </button>
                  <button title="Set read" onClick={props.setSelectedRead} className={"btn btn-default"}>
                    <i className="fal fa-eye" />
                  </button>
                  <button title="Set un-read" onClick={props.setSelectedUnRead} className="btn btn-default put-line-through">
                    <i className="fal fa-eye-slash" />
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div style={{ flex: "1 1 auto", display: "flex", alignItems: "flex-start", alignContent: "center", flexWrap: "wrap", marginTop: "5px" }}>
            {online && resultsCount ? (
              <div style={{ flex: "0 0 auto", marginRight: "5px", alignSelf: "center" }}>
                <span className="visible-tiny">
                  Page {page} of {totalPages}
                  &nbsp;&nbsp;
                </span>
                {resultsDisplay}
              </div>
            ) : null}

            {props.search ? (
              <RemovableLabelDisplay
                style={{ flex: "0 0 auto", alignSelf: "center", marginRight: "5px", marginTop: "4px", marginBottom: "4px" }}
                item={{ name: `"${props.search}"` }}
                doRemove={() => props.removeFilters("search")}
              />
            ) : null}
            {props.isRead == "1" || props.isRead == "0" ? (
              <RemovableLabelDisplay
                style={{ flex: "0 0 auto", alignSelf: "center", marginRight: "5px", marginTop: "4px", marginBottom: "4px" }}
                item={{ backgroundColor: `${props.isRead == "1" ? "green" : "red"}` }}
                doRemove={() => props.removeFilters("isRead")}
              >
                <span>
                  {props.isRead == "1" ? "Is Read" : "Not Read"}
                  &nbsp;
                  {props.isRead == "1" ? <i className="far fa-check" /> : null}
                </span>
              </RemovableLabelDisplay>
            ) : null}
            {props.publisher ? (
              <RemovableLabelDisplay
                style={filterDisplayStyles}
                item={{ name: `publisher: "${props.publisher}"` }}
                doRemove={() => props.removeFilters("publisher")}
              />
            ) : null}
            {props.author ? (
              <RemovableLabelDisplay
                style={filterDisplayStyles}
                item={{ name: `author: "${props.author}"` }}
                doRemove={() => props.removeFilters("author")}
              />
            ) : null}
            {props.pages || props.pages == "0" ? (
              <RemovableLabelDisplay
                style={filterDisplayStyles}
                item={{ name: `pages: ${props.pagesOperator == "lt" ? "<" : ">"} ${props.pages}` }}
                doRemove={() => props.removeFilters("pages", "pagesOperator")}
              />
            ) : null}
            {props.noSubjects ? (
              <RemovableLabelDisplay style={filterDisplayStyles} item={{ name: `No subjects` }} doRemove={() => props.removeFilters("noSubjects")} />
            ) : null}

            {props.selectedSubjects.map(s => (
              <RemovableLabelDisplay style={filterDisplayStyles} item={s} doRemove={() => props.removeFilterSubject(s._id)} />
            ))}
            {props.selectedTags.map(t => (
              <RemovableLabelDisplay style={filterDisplayStyles} item={t} doRemove={() => props.removeFilterTag(t._id)} />
            ))}
            {activeFilterCount > 1 ? (
              <RemovableLabelDisplay style={filterDisplayStyles} item={removeAllFiltersLabel} doRemove={props.clearAllFilters} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(
  menuBarSelector,
  { ...bookSearchActionCreators, ...booksActionCreators }
)(BooksMenuBar);
