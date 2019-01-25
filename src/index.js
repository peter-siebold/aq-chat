import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import App from './components/App';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
// import firebase from "./firebase";

import * as serviceWorker from './serviceWorker';

import {BrowserRouter as Router, Switch, Route} from "react-router-dom";

const Root = () => (
    <Router>
        <Switch>
            <Route exact path="/" component={App} />
            <Route path="/register" component={Register} />
            <Route path="/login" component={Login} />
        </Switch>
    </Router>
);


ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
