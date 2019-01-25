import React from "react";
import {Grid, Form, Segment, Button, Header, Message, Icon} from "semantic-ui-react";
import {Link} from "react-router-dom";
import firebase from "../../firebase";
import md5 from "md5";

class Register extends React.Component {
    state = {
        username: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        errors: [],
        loading: false,
        usersRef: firebase.database().ref("users")
    }
    isFormEmpty = ({username, email, password, passwordConfirmation}) => {
        return !username.length || !email.length || ! password.length || !passwordConfirmation.length;
    }

    validatePassword= (password) => password || true;

    isPasswordValid = ({password, passwordConfirmation}) => {
        const minPasswordLength = 6;
        if( password !== passwordConfirmation) {
            return false;
        } else if(password.length <  minPasswordLength || passwordConfirmation < minPasswordLength ){
            return false;
        } else if(this.validatePassword(password)){
            return true;
        }
    }

    displayErrors = errors => errors.map((error, index) => (
        <p key={index}>
            {error.message} 
        </p>
    ));

    isFormValid = () => {
        let errors = [];
        let error;
        if(this.isFormEmpty(this.state)){
            error= { message: "Fill in all fields"}
            this.setState({ errors: errors.concat(error) });
            return false;
        } else if(!this.isPasswordValid(this.state)){           
            error= { message: "Password is invalid"}
            this.setState({ errors: errors.concat(error) });
            return false;
        } else {
            this.setState({ errors });
            return true;
        }
    }
    /**
     *
     *
     * @memberof Register
     */
    handleChange = (event) => {
        this.setState({
            [event.target.name] : event.target.value
        })
    }
    /**
     *
     *
     * @memberof Register
     */
    handleSubmit = (event) => {
        event.preventDefault();
        if(this.isFormValid()){
            this.setState({
                errors: [],
                loading: true,
            });
            const {email, password} = this.state;
            firebase
                .auth()
                .createUserWithEmailAndPassword(email, password)
                .then(createdUser => {
                    createdUser.user.updateProfile({
                        displayName : this.state.username,
                        photoURL : `http://gravatar.com/avatar/${ md5(createdUser.user.email)}?d=identicon`
                    }).then(() => {
                        this.saveUser(createdUser).then(() => {
                            console.log("User saved ")
                        });
                        // this.setState({
                        //     loading: false
                        // })
                    }).catch(err => {
                        this.setState({
                            errors: this.state.errors.concat(err),
                            loading: false
                        })
                        console.log(err)                        
                    })
                    console.log(createdUser)
                })
                .catch(err => {
                    this.setState({
                        errors: this.state.errors.concat(err),
                        loading: false
                    })
                    console.log(err)
                })
        }
    }

    saveUser = createdUser => {
        // this.setState({
        //     userRef: createdUser
        // })
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        });
    }

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.message.toLowerCase().includes(inputName)) ? "error" : "";
    }

    render() {

        const {username, email, password, passwordConfirmation, errors, loading} = this.state;

        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as="h1" icon color="blue" textAlign="center">
                        <Icon name="puzzle piece" color="blue" />
                        Register to aq chat
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input fluid name="username" icon="user" iconPosition="left" placeholder="Username" onChange={this.handleChange} type="text" value={username} className={this.handleInputError(errors, "username")}/>
                            <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email Address" onChange={this.handleChange} type="email" value={email} className={this.handleInputError(errors, "email")}/>
                            <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password" onChange={this.handleChange} type="password" value={password} className={this.handleInputError(errors, "password")}/>
                            <Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left" placeholder="Password Confirmation" onChange={this.handleChange} type="password" value={passwordConfirmation} className={this.handleInputError(errors, "password")}/>

                            <Button className={loading ? "loading" : ""} disabled={loading} color="blue" fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {
                       errors.length > 0 && (
                            <Message error>
                                <h3>Error</h3>
                                { this.displayErrors(errors) }
                            </Message>
                        )
                    }
                    <Message>Already a user? <Link to="/login"> Login</Link></Message>
                </Grid.Column>

            </Grid>
        )
    }
}

export default Register;