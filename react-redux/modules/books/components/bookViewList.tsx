import React, { Component } from "react";

const LOAD_BOOKS = compress`query getAllBooks($title:String, $page: Int) {
  allBooks(title_contains:$title, PAGE: $page, PAGE_SIZE: 3){
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
        <input style={{ width: "300px" }} ref={el => (this.el = el)} defaultValue={book.title} />
        <button onClick={() => updateBook({ _id: book._id, title: this.el.value })}>Save</button>
      </div>
    );
  }
}

const hardResetStrategy = name => ({
  when: new RegExp(`(update|create|delete)${name}s?`),
  run: ({ hardReset }) => hardReset()
});

import { Client, setDefaultClient, GraphQL, buildQuery, buildMutation, compress, Cache, query } from "micro-graphql-react";

const graphqlClient = new Client({
  endpoint: "/graphql",
  fetchOptions: { credentials: "include" },
  cacheSize: 2
});

setDefaultClient(graphqlClient);

@query(LOAD_BOOKS, (props: any) => ({ title: props.title, page: props.page }), {
  onMutation: { when: /(update|create|delete)Books?/, run: ({ hardReset }) => hardReset() }
})
export class BookQueryComponent extends Component<any, any> {
  render() {
    let { data } = this.props;
    return <div>{data ? <ul>{data.allBooks.Books.map(b => <li key={b._id}>{b.title}</li>)}</ul> : null}</div>;
  }
}

export default class BookViewingList extends Component<any, any> {
  state = { titleSearch: "", page: 1, editingBook: null };
  el: any;
  editBook = book => {
    this.setState({ editingBook: book });
  };
  render() {
    let { page, titleSearch } = this.state;
    return (
      <div style={{ padding: "30px" }}>
        <input ref={el => (this.el = el)} />
        <button onClick={() => this.setState({ titleSearch: this.el.value })}>Update</button>
        {this.state.page > 1 ? <button onClick={() => this.setState({ page: this.state.page - 1 })}>Prev</button> : null}
        <button onClick={() => this.setState({ page: this.state.page + 1 })}>Next</button>
        <br />
        <br />

        <GraphQL
          query={{
            loadBooks: buildQuery(LOAD_BOOKS, { title: titleSearch, page }, { onMutation: hardResetStrategy("Book") })
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

        <BookQueryComponent title={titleSearch} page={page} />
      </div>
    );
  }
}
