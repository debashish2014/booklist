import React, { Component } from "react";

const LOAD_BOOKS = `query getAllBooks($title:String) {
  allBooks(title_contains:$title){
    Books{
      _id,
      title
    }
  }
}`;

const UPDATE_BOOK = `mutation updateBook($_id: String, $title:String) {
  updateBook(_id: $_id, Updates: { title: $title }){
    Book{ _id, title }
  }
}`;

class DisplayBooks extends Component<any, any> {
  render() {
    let { books, editBook } = this.props;
    return (
      <ul>
        {books.map(book => (
          <li>
            <span>
              {book.title} <button onClick={() => editBook(book)}>edit</button>
            </span>
          </li>
        ))}
      </ul>
    );
  }
}

class UpdateBook extends Component<any, any> {
  el: any;
  render() {
    let { book, updateBook } = this.props;
    return (
      <div>
        <input ref={el => (this.el = el)} defaultValue={book.title} />
        <button onClick={() => updateBook({ _id: book._id, title: this.el.value })}>Save</button>
      </div>
    );
  }
}

const hardResetStrategy = name => ({
  when: new RegExp(`(update|create|delete)${name}s?`),
  run: (args, resp, { hardReset }) => hardReset()
});

import { GraphQL, buildQuery, buildMutation } from "micro-graphql-react";

export default class BookViewingList extends Component<any, any> {
  state = { titleSearch: "", editingBook: null };
  el: any;
  editBook = book => {
    this.setState({ editingBook: book });
  };
  render() {
    return (
      <div style={{ padding: "30px" }}>
        <input ref={el => (this.el = el)} />
        <button onClick={() => this.setState({ titleSearch: this.el.value })}>Update</button>
        <br />
        <br />

        <GraphQL
          query={{
            loadBooks: buildQuery(LOAD_BOOKS, { title: this.state.titleSearch }, { onMutation: hardResetStrategy("Book") })
          }}
          mutation={{ updateBook: buildMutation(UPDATE_BOOK) }}
        >
          {({ loadBooks: { loading, loaded, data, error }, updateBook: { runMutation } }) => (
            <div>
              {loading ? <span>Loading...</span> : null}
              {loaded && data && data.allBooks ? <DisplayBooks books={data.allBooks.Books} editBook={this.editBook} /> : null}
              <br />
              {this.state.editingBook ? <UpdateBook book={this.state.editingBook} updateBook={runMutation} /> : null}
            </div>
          )}
        </GraphQL>
      </div>
    );
  }
}
