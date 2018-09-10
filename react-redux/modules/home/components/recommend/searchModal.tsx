import React, { Component } from "react";
import { connect } from "react-redux";

import Modal from "applicationRoot/components/modal";
import SelectAvailableTags from "applicationRoot/components/selectAvailableTags";
import DisplaySelectedTags from "applicationRoot/components/displaySelectedTags";
import SelectAvailableSubjects from "applicationRoot/components/selectAvailableSubjects";
import DisplaySelectedSubjects from "applicationRoot/components/displaySelectedSubjects";

import { selectSearchVals, selectSearchStatus } from "../../reducers/search/reducer";
import { booksSearch } from "../../reducers/search/actionCreators";
import { combineSelectors } from "applicationRoot/rootReducer";

interface LocalProps {
  isOpen: boolean;
  onHide: any;
}

const selector = combineSelectors(selectSearchVals, selectSearchStatus) as any;
type SelectorType = ReturnType<typeof selectSearchVals> & ReturnType<typeof selectSearchStatus>;

@connect(
  selector,
  { booksSearch }
)
export default class SearchModal extends Component<Partial<LocalProps & SelectorType & { booksSearch }>, any> {
  state = { subjects: [], tags: [] };
  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.setState({
        subjects: this.props.subjects,
        tags: this.props.tags
      });
    }
  }
  selectSubject = subject => this.setState(state => ({ subjects: state.subjects.concat(subject._id) }));
  selectTag = tag => this.setState(state => ({ tags: state.tags.concat(tag._id) }));
  removeSubject = subject => this.setState(state => ({ subjects: state.subjects.filter(_id => _id != subject._id) }));
  removeTag = tag => this.setState(state => ({ tags: state.tags.filter(_id => _id != tag._id) }));

  searchEl: any;
  childSubEl: any;
  isReadE: any;
  isRead0: any;
  isRead1: any;
  applyFilters = evt => {
    evt.preventDefault();
    this.props.booksSearch({
      title: this.searchEl.value,
      isRead: this.isReadE.checked ? "" : this.isRead0.checked ? 0 : 1,
      subjects: this.state.subjects,
      tags: this.state.tags,
      searchChildSubjects: this.childSubEl.checked
    });
  };
  render() {
    let { isOpen, onHide } = this.props;
    return (
      <Modal {...{ isOpen, onHide, headerCaption: "Search your books" }}>
        <form onSubmit={this.applyFilters}>
          <div className="row">
            <div className="col-xs-6">
              <div className="form-group">
                <label>Title</label>
                <input defaultValue={this.props.title} ref={el => (this.searchEl = el)} placeholder="Search title" className="form-control" />
              </div>
            </div>

            <div className="col-xs-6">
              <div className="form-group">
                <label>Is read?</label>
                <br />
                <div style={{ display: "inline" }} className="radio">
                  <label>
                    <input type="radio" defaultChecked={this.props.isRead == ""} ref={el => (this.isReadE = el)} name="isRead" />
                    Either
                  </label>
                </div>
                <div style={{ display: "inline", marginLeft: "20px" }} className="radio">
                  <label>
                    <input type="radio" defaultChecked={this.props.isRead == "1"} name="isRead" />
                    Yes
                  </label>
                </div>
                <div style={{ display: "inline", marginLeft: "20px" }} className="radio">
                  <label>
                    <input type="radio" defaultChecked={this.props.isRead == "0"} ref={el => (this.isRead0 = el)} name="isRead" />
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
        <div className="row" style={{ position: "relative" }}>
          <div className="col-xs-3">
            <SelectAvailableTags currentlySelected={this.state.tags} onSelect={this.selectTag} />
          </div>
          <div className="col-xs-9">
            <div>
              <DisplaySelectedTags currentlySelected={this.state.tags} onRemove={this.removeTag} />
            </div>
          </div>
        </div>
        <br />
        <>
          <div className="row" style={{ position: "relative" }}>
            <div className="col-xs-3">
              <SelectAvailableSubjects currentlySelected={this.state.subjects} onSelect={this.selectSubject} />
            </div>
            <div className="col-xs-9">
              <div>
                <DisplaySelectedSubjects currentlySelected={this.state.subjects} onRemove={this.removeSubject} />
              </div>
            </div>
          </div>
          <div className="row" style={{ position: "relative" }}>
            <div className="col-xs-6">
              <div className="checkbox">
                <label>
                  <input type="checkbox" ref={el => (this.childSubEl = el)} defaultChecked={!!this.props.searchChildSubjects} /> Also search child
                  subjects
                </label>
              </div>
            </div>
            <div className="col-xs-6">
              {this.props.searching ? (
                <button disabled={true} className="btn btn-default">
                  <i className="fa fa-fw fa-spin fa-spinner" />
                </button>
              ) : (
                <button onClick={this.applyFilters} className="btn btn-default">
                  <i className="fal fa-search" />
                </button>
              )}
            </div>
          </div>
        </>
        {typeof this.props.resultsCount === "number" ? <SearchResults /> : null}
      </Modal>
    );
  }
}

@connect(selectSearchStatus)
class SearchResults extends Component<Partial<ReturnType<typeof selectSearchStatus>>, any> {
  render() {
    return (
      <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "5px" }}>
        {this.props.resultsCount ? (
          <table className="table table-condensed table-striped">
            <thead>
              <th />
              <th />
              <th />
            </thead>
            <tbody>
              {this.props.searchResults.map(book => (
                <tr>
                  <td>
                    <button style={{ cursor: "pointer" }} className="btn btn-primary">
                      Add to list&nbsp;
                      <i className="fal fa-plus" />
                    </button>
                  </td>
                  <td>
                    <img src={book.smallImage} />
                  </td>
                  <td>
                    {book.title}
                    {book.authors && book.authors.length ? (
                      <>
                        <br />
                        <span style={{ fontStyle: "italic" }}>{book.authors.join(", ")}</span>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-warning">No results</div>
        )}
      </div>
    );
  }
}
