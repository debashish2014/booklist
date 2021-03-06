import React, { Component } from "react";
import { connect } from "react-redux";
import { selectBookSearchState } from "modules/books/reducers/bookSearch/reducer";

import BootstrapButton from "applicationRoot/components/bootstrapButton";

import * as bookSearchActionCreators from "../reducers/bookSearch/actionCreators";

import Modal from "applicationRoot/components/modal";
import SelectAvailableTags from "applicationRoot/components/selectAvailableTags";
import DisplaySelectedTags from "applicationRoot/components/displaySelectedTags";
import SelectAvailableSubjects from "applicationRoot/components/selectAvailableSubjects";
import DisplaySelectedSubjects from "applicationRoot/components/displaySelectedSubjects";

type LocalProps = {
  isOpen: boolean;
  onHide: any;
};

class BookSearchModal extends Component<ReturnType<typeof selectBookSearchState> & LocalProps & typeof bookSearchActionCreators, any> {
  state = {
    subjects: this.props.selectedSubjects.map(s => s._id),
    tags: this.props.selectedTags.map(t => t._id),
    noSubjectsFilter: !!this.props.noSubjects
  };

  selectSubject = subject => this.setState(state => ({ subjects: state.subjects.concat(subject._id) }));
  selectTag = tag => this.setState(state => ({ tags: state.tags.concat(tag._id) }));
  removeSubject = subject => this.setState(state => ({ subjects: state.subjects.filter(_id => _id != subject._id) }));
  removeTag = tag => this.setState(state => ({ tags: state.tags.filter(_id => _id != tag._id) }));

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.setState({
        subjects: this.props.selectedSubjects.map(s => s._id),
        tags: this.props.selectedTags.map(t => t._id)
      });
    }
  }

  applyFilters = evt => {
    let sort = "";
    let sortDirection = "";
    let sortValue = this.sortSelectEl.value;
    if (sortValue !== "_id|desc") {
      [sort, sortDirection] = sortValue.split("|");
    }

    evt.preventDefault();
    this.props.applyFilters({
      subjects: this.state.noSubjectsFilter ? [] : this.state.subjects,
      tags: this.state.tags,
      search: this.searchEl.value,
      pages: this.pagesEl.value,
      pagesOperator: this.pagesDirEl.value,
      author: this.authorEl.value,
      publisher: this.publisherEl.value,
      isRead: this.isReadE.checked ? "" : this.isRead0.checked ? "0" : "1",
      searchChildSubjects: this.childSubEl && this.childSubEl.checked,
      noSubjects: this.state.noSubjectsFilter,
      sort,
      sortDirection
    });
    this.props.onHide();
  };

  searchEl: any;
  pagesEl: any;
  pagesDirEl: any;
  isReadE: any;
  isRead0: any;
  childSubEl: any;
  authorEl: any;
  publisherEl: any;
  sortSelectEl: any;

  render() {
    let { isOpen, onHide } = this.props;
    return (
      <Modal {...{ isOpen, onHide, headerCaption: "Full search" }}>
        <form onSubmit={this.applyFilters}>
          <div className="row">
            <div className="col-sm-6 col-xs-12">
              <div className="form-group">
                <label>Title</label>
                <input defaultValue={this.props.search} ref={el => (this.searchEl = el)} placeholder="Search title" className="form-control" />
              </div>
            </div>
            <div className="col-sm-6 col-xs-12">
              <div className="form-group">
                <label>Pages</label>
                <div className="form-inline">
                  <div style={{ marginRight: 5, display: "inline-block" }} className="form-group">
                    <select ref={el => (this.pagesDirEl = el)} defaultValue={this.props.pagesOperator} className="form-control">
                      <option value="lt">{"<"}</option>
                      <option value="gt">{">"}</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ display: "inline-block" }}>
                    <input
                      defaultValue={this.props.pages}
                      ref={el => (this.pagesEl = el)}
                      style={{ width: "100px" }}
                      type="number"
                      placeholder="Pages"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xs-6">
              <div className="form-group">
                <label>Publisher</label>
                <input ref={el => (this.publisherEl = el)} defaultValue={this.props.publisher} placeholder="Publisher" className="form-control" />
              </div>
            </div>
            <div className="col-xs-6">
              <div className="form-group">
                <label>Author</label>
                <input ref={el => (this.authorEl = el)} defaultValue={this.props.author} placeholder="Author" className="form-control" />
              </div>
            </div>
            <div className="col-xs-6">
              <div className="form-group">
                <label>Is read?</label>
                <br />
                <div className="radio responsive-radios">
                  <label>
                    <input type="radio" defaultChecked={this.props.isRead == ""} ref={el => (this.isReadE = el)} name="isRead" />
                    Either
                  </label>
                </div>
                <div className="radio responsive-radios">
                  <label>
                    <input type="radio" defaultChecked={this.props.isRead == "1"} name="isRead" />
                    Yes
                  </label>
                </div>
                <div className="radio responsive-radios">
                  <label>
                    <input type="radio" defaultChecked={this.props.isRead == "0"} ref={el => (this.isRead0 = el)} name="isRead" />
                    No
                  </label>
                </div>
              </div>
            </div>
            <div className="col-xs-6">
              <div className="form-group">
                <label>Sort</label>
                <br />
                <select
                  ref={el => (this.sortSelectEl = el)}
                  style={{ marginBottom: 0 }}
                  defaultValue={this.props.bindableSortValue}
                  className="form-control margin-bottom"
                >
                  <option value="title|asc">Title A-Z</option>
                  <option value="title|desc">Title Z-A</option>
                  <option value="pages|asc">Pages, Low</option>
                  <option value="pages|desc">Pages, High</option>
                  <option value="_id|asc">Created, Earliest</option>
                  <option value="_id|desc">Created, Latest</option>
                </select>
              </div>
            </div>
          </div>
          <button style={{ display: "none" }} />
          <input type="submit" style={{ display: "inline", visibility: "hidden" }} />
        </form>
        <div className="row" style={{ position: "relative" }}>
          <div className="col-sm-3 col-xs-12">
            <SelectAvailableTags currentlySelected={this.state.tags} onSelect={this.selectTag} />
          </div>
          <div className="col-sm-9 col-xs-12">
            <div>
              <DisplaySelectedTags currentlySelected={this.state.tags} onRemove={this.removeTag} />
            </div>
          </div>
        </div>
        <br />
        {!this.state.noSubjectsFilter ? (
          <>
            <div className="row" style={{ position: "relative" }}>
              <div className="col-sm-3 col-xs-12">
                <SelectAvailableSubjects currentlySelected={this.state.subjects} onSelect={this.selectSubject} />
              </div>
              <div className="col-sm-9 col-xs-12">
                <div>
                  <DisplaySelectedSubjects currentlySelected={this.state.subjects} onRemove={this.removeSubject} />
                </div>
              </div>
            </div>
            <div className="checkbox">
              <label>
                <input type="checkbox" ref={el => (this.childSubEl = el)} defaultChecked={!!this.props.searchChildSubjects} /> Also search child
                subjects
              </label>
            </div>
          </>
        ) : null}
        <div className="checkbox" style={{ marginTop: "5px" }}>
          <label>
            <input
              type="checkbox"
              checked={!!this.state.noSubjectsFilter}
              onChange={el => this.setState({ noSubjectsFilter: !!el.target.checked })}
            />{" "}
            Search books with no subjects set
          </label>
        </div>
        <hr />
        <BootstrapButton preset="primary" className="pull-left" onClick={this.applyFilters}>
          Filter
        </BootstrapButton>
        &nbsp;
        <BootstrapButton preset="default" onClick={onHide}>
          Close
        </BootstrapButton>
      </Modal>
    );
  }
}

export default connect(
  selectBookSearchState,
  { ...bookSearchActionCreators }
)(BookSearchModal);
