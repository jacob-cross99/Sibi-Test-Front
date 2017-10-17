import React, { Component } from 'react';
import axios from 'axios';
import { Modal } from 'react-bootstrap';

import { SIBI } from './config';

import './App.css';
import logo from './logo.png'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingSearch: false,
      loadingMore: false,
      loadingDetail: false,
      users: [],
      user: {},
      showDetailModal: false,
      search: {
        page: 0,
      },
      noMore: false
    };

    this.loadMore = this.loadMore.bind(this);
    this.search = this.search.bind(this);
    this.firstNameChange = this.firstNameChange.bind(this);
    this.lastNameChange = this.lastNameChange.bind(this);
  }

  renderAlert() {
    if(this.state.error !== undefined) return (
      <div className="alert alert-danger alert-dismissible" role="alert">
        <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => this.setState({ error: undefined }) }>
          <span aria-hidden="true">&times;</span>
        </button>

        { this.state.error }
      </div>
    );
  }

  renderSearchButton() {
    if(this.state.loadingSearch) return (
      <button className="btn btn-default" disabled type="button">
        <i className="fa fa-spinner fa-pulse"></i>
      </button>
    )

    return <button className="btn btn-default" type="button" onClick={ this.search }>Search</button>
  }

  renderNoMore() {
    if(this.state.noMore === true) return (
      <h4>There's no more results</h4>
    )
  }

  renderLoadMoreButton() {
    if(this.state.noMore === true || this.state.loadingSearch === true) return;
    if(this.state.loadingMore === true) return (
      <button className="btn btn-default" disabled type="button">
        <i className="fa fa-spinner fa-pulse"></i>
        Loading
      </button>
    );

    return (
      <button className="btn btn-default" type="button" onClick={ this.loadMore }>
        Load More
      </button>
    );
  }

  firstNameChange(e) {
    this.setState({ search: { ...this.state.search, first_name: e.target.value } })
  }

  lastNameChange(e) {
    this.setState({ search: { ...this.state.search, last_name: e.target.value } })
  }

  loadMore() {
    this.setState({ loadingMore: true });

    axios.get(`${ SIBI.host }/users`, {
      params: this.state.search
    }).then(resp => {
      let data = resp.data;
      if(data.error !== undefined) return this.setState({ error: data.message, loadingMore: false });
      if(data.users.length === 0) return this.setState({ loadingMore: false, noMore: true });

      let search = this.state.search;
      search.page++;

      this.setState({ users: [ ...this.state.users, ...data.users ], search, loadingMore: false });
    }).catch(err => {
      this.setState({ error: 'Failed to connect with API, please try again or contact support if this issue persists', loadingMore: false });
    });
  }

  viewDetails(user) {
    this.setState({ user, loadingDetail: true });

    axios.get(`${ SIBI.host }/users/${ user.id }`).then(resp => {
      let data = resp.data;
      if(data.error !== undefined) return this.setState({ error: data.message, loadingDetail: false });
      this.setState({ user: data.user, loadingDetail: false, showDetailModal: true });
    }).catch(err => {
      this.setState({ error: 'Failed to connect with API, please try again or contact support if this issue persists', loadingDetail: false });
    });
  }

  search() {
    let search = this.state.search;
    search.page = 0;

    this.setState({ loadingSearch: true, noMore: false, users: [], search });

    axios.get(`${ SIBI.host }/users`, {
      params: this.state.search
    }).then(resp => {
      console.log(resp.data);

      let data = resp.data;
      if(data.error !== undefined) return this.setState({ error: data.message, loadingSearch: false });
      search.page++;
      this.setState({ users: data.users, loadingSearch: false, search });
    }).catch(err => {
      this.setState({ error: 'Failed to connect with API, please try again or contact support if this issue persists', loadingSearch: false });
    });
  }

  renderUser() {
    return Object.keys(this.state.user).map((property, index) => {
      return (
        <tr key={ index }>
          <td>{ property }</td>
          <td>{ this.state.user[property] }</td>
        </tr>
      );
    });
  }

  renderDetailButton(user) {
    if(this.state.loadingDetail === true && this.state.user.id === user.id) return (
      <button className="btn btn-default" disabled>
        <i className="fa fa-spinner fa-pulse"></i>
      </button>
    );

    return (
      <button className="btn btn-default" onClick={() => this.viewDetails(user)}>View Details</button>
    );
  }

  renderUsers() {
    return this.state.users.map((user, index) => {
      return (
        <tr key={ user.id }>
          <td>{ user.id }</td>
          <td>{ user.givenName }</td>
          <td>{ user.surname }</td>
          <td>{ user.username }</td>
          <td>{ user.age }</td>
          <td>{ user.gender }</td>
          <td>
            { this.renderDetailButton(user) }
          </td>
        </tr>
      );
    });
  }

  componentWillMount() {
    this.loadMore();
  }

  render() {
    return (
      <div className="app">
        <header className="row app-header">
          <img src={ logo } className="app-logo" alt="logo" />
          <h1 className="app-title">User Search</h1>
        </header>
        <div className="container p20">
          <div className="row">
            { this.renderAlert() }
          </div>
          <div className="row">
            <div className="col-sm-3 col-sm-offset-3">
              <input type="text" className="form-control" placeholder="First name" onChange={ this.firstNameChange } />
            </div>
            <div className="col-sm-3">
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Last name" onChange={ this.lastNameChange } />
                <span className="input-group-btn">
                  { this.renderSearchButton() }
                </span>
              </div>
            </div>
          </div>

          <div className="row p20">
            <Modal show={ this.state.showDetailModal } onHide={() => this.setState({ showDetailModal: false })}>
              <Modal.Header closeButton>
                <Modal.Title>{ this.state.user.givenName } { this.state.user.middleInitial } { this.state.user.surname }</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <table className="table table-inverse">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.renderUser() }
                  </tbody>
                </table>
              </Modal.Body>
            </Modal>
            <table className="table table-inverse">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>View More</th>
                </tr>
              </thead>
              <tbody>
                { this.renderUsers() }
              </tbody>
            </table>
            { this.renderLoadMoreButton() }
            { this.renderNoMore() }
          </div>
        </div>
      </div>
    );
  }
}

export default App;