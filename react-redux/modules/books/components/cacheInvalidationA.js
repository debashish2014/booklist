import React, { Component, Fragment } from "react";
import { query, mutation } from "micro-graphql-react";
import {
  BOOKS_QUERY,
  BOOKS_MUTATION,
  BOOKS_MUTATION_MULTI,
  BOOK_CREATE,
  BOOK_DELETE,
  SUBJECTS_QUERY,
  SUBJECTS_MUTATION,
  SUBJECTS_MUTATION_MULTI,
  SUBJECT_CREATE,
  SUBJECT_DELETE
} from "./savedQueries";

@query(BOOKS_QUERY, props => ({ page: props.page }), {
  onMutation: { when: /(update|create|delete)Books?/, run: (args, resp, { hardReset }) => hardReset() }
})
export class BookQueryComponent extends Component {
  render() {
    let { data } = this.props;
    return <div>{data ? <ul>{data.allBooks.Books.map(book => <li key={book._id}>{book.title}</li>)}</ul> : null}</div>;
  }
}

@query(SUBJECTS_QUERY, props => ({ page: props.page }), {
  onMutation: { when: /(update|create|delete)Subjects?/, run: (args, resp, { hardReset }) => hardReset() }
})
export class SubjectQueryComponent extends Component {
  render() {
    let { data } = this.props;
    return <div>{data ? <ul>{data.allSubjects.Subjects.map(subject => <li key={subject._id}>{subject.name}</li>)}</ul> : null}</div>;
  }
}
