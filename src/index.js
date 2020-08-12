import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery/dist/jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie'
import './index.scss';

function FormInput(props) {
    return (
        <div className="form-group mb-2">
            <label className="pr-2">
                {props.label}
            </label>
            <input className="form-control" type={props.type} name={props.name} onChange={props.onChange} required={props.required}/>
            <small className="text-danger">{props.error}</small>
        </div>
    );
}

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            fields: {},
            errors: {}
        }
    }

    handleChange(ev) {
        let fields = this.state.fields;
        fields[ev.target.name] = ev.target.value;
        this.setState({
            fields: fields
        });
    }

    handleSubmit(ev) {
        ev.preventDefault();

        // Make an AJAX call to our login endpoint //
        let fields = this.state.fields;
        let errors = this.state.errors;
        let me = this;
        errors = {};
        $.ajax({
            method: "post",
            url: "http://localhost:5000/login",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify(fields),
            success: function(result) {
                if(result !== false) {
                    // Login success // 
                    me.props.setUser(result);
                } else {
                    // Oopsie //
                    errors["username"] = "Incorrect combination for username/password";
                    errors["password"] = "Incorrect combination for username/password";
                    me.setState({errors: errors});
                }
            }
        });

        // const logins = this.props.logins;
        // for(let i = 0; i < logins.length; i++) {
        //     if(logins[i].username === this.state.username && logins[i].password === this.state.password) {
        //         this.setState({
        //             login: logins[i]
        //         });
        //     }
        // }
        // if(!this.state.login) {
        //     this.setState({
        //         errorMessage: "Incorrect username/password combination."
        //     });
        // }
    }

    render() {
        if(this.state.login == null) {
            return(
                <form className="m-2 p-2" onSubmit={this.handleSubmit}>
                    <fieldset>
                        <legend>Login</legend>
                        <FormInput type="text" name="username" error={this.state.errors["username"]} onChange={this.handleChange} required label="Username"/>
                        <FormInput type="password" name="password" error={this.state.errors["password"]} onChange={this.handleChange} required label="Password"/>
                        <br/>
                        <input className="btn btn-primary" type="submit" value="Login"/>
                    </fieldset>
                </form>
            );
        } else {
            return(
                <div>
                    <h1>Welcome, {this.state.login.username}</h1>
                    <button onClick={() => this.setState({login: null, errorMessage: ""})}>Logout</button>
                </div>
            );
        }
    }
}

class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            fields: {},
            errors: {}
        }
    }

    handleChange(ev) {
        let fields = this.state.fields;
        fields[ev.target.name] = ev.target.value;
        this.setState({
            fields: fields
        });
    }

    handleSubmit(ev) {
        ev.preventDefault();
        
        // Validation Logic //
        let fields = this.state.fields;
        console.dir(fields["username"]);
        let passwordPattern = /^(?=.*[A-Za-z])(?=.*\d{2,})[A-Za-z\d]{8,}$/;
        let usernamePattern = /\w{5,}/;
        if(usernamePattern.test(fields["username"]) && passwordPattern.test(fields["password"])) {
            // Validated, but we first need to check if the username is taken. So send a POST request //
            let errors = this.state.errors;
            let me = this;
            errors = {};

            $.ajax({
                method: "POST",
                url: "http://localhost:5000/usernameCheck", // You need to have 'http://' on the url otherwise you get CORS error //
                data: JSON.stringify({username: fields["username"]}),
                headers: {
                    "Content-Type": "application/json"
                },
                success: function(response) {
                    if(response) {
                        // Username is free //
                        // Now we have to make another AJAX POST request //
                        
                        $.ajax({
                            method: "POST",
                            url: "http://localhost:5000/register",
                            data: JSON.stringify(fields),
                            headers: {
                                "Content-Type": "application/json"
                            },
                            success: function(response) {
                                if(response !== false) {
                                    me.props.setUser(response);
                                } else {
                                    alert("Something has gone wrong when submitting the details.");
                                }
                            }
                        });
                    } else {
                        // Username is not free //
                        errors["username"] = "This username is already taken. Try logging in instead.";
                        me.setState({errors: errors});
                    }
                }
            });
        } else {
            let errors = this.state.errors;
            errors = {};
            if(!usernamePattern.test(fields["username"])) {
                errors["username"] = "This username does match the criteria.";
            }
            if(!passwordPattern.test(fields["password"])) {
                errors["password"] = "This password does match the criteria.";
            }
            this.setState({errors: errors});
        }
    }

    render() {
        return(
            <form className="m-2 p-2" onSubmit={this.handleSubmit}>
                <fieldset>
                    <legend>Register</legend>
                    <FormInput type="text" name="username" error={this.state.errors["username"]} onChange={this.handleChange} required label="Username"/>
                    <small className="text-muted">Usernames must be a minimum of 5 characters.</small>
                    <FormInput type="password" name="password" error={this.state.errors["password"]} onChange={this.handleChange} required label="Password"/>
                    <small className="text-muted">Passwords must be a minimum of 8 characters, and contain at least 2 numbers.</small>
                    <br/>
                    <input className="btn btn-primary mt-2" type="submit" value="Register"/>
                </fieldset>
            </form>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.setUser = this.setUser.bind(this);
        this.state = {
            user: Cookies.get('user') != null ? JSON.parse(Cookies.get('user')) : null
        }
    }

    setUser(user) {
        Cookies.set('user', user, {expires: 1});
        this.setState({user: user});
    }

    logout() {
        Cookies.remove('user');
        this.setState({user: null});
    }

    render() {
        if(!this.state.user) {
            return(
                <div>
                    <LoginForm setUser={this.setUser}/>
                    <RegisterForm setUser={this.setUser}/>
                </div>
            );
        } else {
            return (
                <div>
                    <h3>Hello, {this.state.user.username}!</h3>
                    <button onClick={() => this.logout()}>Logout</button>
                </div>
            );
        }
    }
}

const logins = [
    {
        username: "ookiiani",
        password: "pass123"
    }
]
ReactDOM.render(<App logins={logins}/>, document.getElementById('root'));