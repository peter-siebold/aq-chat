import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import App from './components/App';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import firebase from "./firebase";

import * as serviceWorker from './serviceWorker';

import {BrowserRouter as Router, Switch, Route, withRouter} from "react-router-dom";
import {createStore} from "redux";
import {Provider, connect} from "react-redux";
import {composeWithDevTools} from "redux-devtools-extension";
import rootReducer from './reducers';
import {setUser} from "./actions"


const store = createStore(rootReducer, composeWithDevTools());
class Root extends React.Component {
    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if(user) {
                this.props.setUser(user);
                this.props.history.push("/");
            }
        })
    }
    render(){
        return(
            <Switch>
                <Route exact path="/" component={App} />
                <Route path="/register" component={Register} />
                <Route path="/login" component={Login} />
            </Switch>
       );
    }
}
const RootWithStore = connect(null, {setUser})(Root);
const RootWithAuth = withRouter(RootWithStore);

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <RootWithAuth />
        </Router> 
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
