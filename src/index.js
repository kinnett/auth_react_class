import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';
import { PublicClientApplication, LogLevel } from '@azure/msal-browser';
import { MsalProvider, MsalConsumer } from '@azure/msal-react';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/App.css';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import { useMsal, useIsAuthenticated } from "@azure/msal-react"

export const msalConfig = {
    auth: {
        clientId: "49d035ba-25be-4edc-ad05-324f1baed32f",
        authority: "https://login.microsoftonline.com/common/",
        redirectUri: "https://localhost:3000/login"
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
    },
    system: {	
        loggerOptions: {	
            loggerCallback: (level, message, containsPii) => {	
                if (containsPii) {		
                    return;		
                }		
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }	
            }	
        }	
    }
};

class ProfileContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            graphData: null
        };
        this.requestProfileData = this.requestProfileData.bind(this);
    }

    requestProfileData() {
        const { instance, accounts } = this.props.msalContext;
        instance
            .acquireTokenSilent({
                ...loginRequest,
                account: accounts[0],
            })
            .then((response) => {
                var token = response.accessToken;
                callMsGraph(token)
                    .then((response) => {
                        this.setState({ graphData: response });
                    });
            });
    }

    render() {
        const { accounts } = this.props.msalContext;
        return (
            <>
                <h5 className="card-title">Welcome {accounts[0]?.name}</h5>
                <Button variant="secondary" onClick={this.requestProfileData}>
                    Request Profile Information
                </Button>
                {this.state.graphData ? (
                    <ProfileData graphData={this.state.graphData} />
                ) : null}
            </>
        );
    }
}

class MainContent extends React.Component {
    render() {
        return (
            <div className="App">
                <MsalConsumer>
                    {msalContext => <ProfileContent msalContext={msalContext} />}
                </MsalConsumer>
            </div>
        );
    }
}

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
    }

    handleLogin() {
        const { instance } = this.props.msalContext;
        instance.loginRedirect(loginRequest);
    }

    render() {
        return (
            <div>
                <button onClick={this.handleLogin}>Log in</button>
            </div>
        );
    }
}

export const loginRequest = {
    scopes: ["https://graph.windows.net/.default"]
};

export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};

export async function callMsGraph(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
    headers.append("Authorization", bearer);
    const options = {
        method: "GET",
        headers: headers
    };
    return fetch(graphConfig.graphMeEndpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const ProfileData = (props) => {
    return (
        <div id="profile-div">
            <p><strong>First Name: </strong> {props.graphData.givenName}</p>
            <p><strong>Last Name: </strong> {props.graphData.surname}</p>
            <p><strong>Email: </strong> {props.graphData.userPrincipalName}</p>
            <p><strong>Id: </strong> {props.graphData.id}</p>
        </div>
    );
};


export const PageLayout = (props) => {
    const isAuthenticated = useIsAuthenticated();

    return (
        <>
            <Navbar bg="primary" variant="dark" className="navbarStyle">
                <a className="navbar-brand" href="/">
                    Microsoft Identity Platform
                </a>
                <div className="collapse navbar-collapse justify-content-end">
                    {isAuthenticated ? <SignOutButton /> : <SignInButton />}
                </div>
            </Navbar>
            <h5>
                <center>Welcome to the Microsoft Authentication Library For Javascript - React Quickstart</center>
            </h5>
            <br />
            <br />
            {props.children}
        </>
    );
};

export const SignOutButton = () => {
    const { instance } = useMsal();

    const handleLogout = (logoutType) => {
        if (logoutType === "popup") {
            instance.logoutPopup({
                postLogoutRedirectUri: "/",
                mainWindowRedirectUri: "/"
            });
        } else if (logoutType === "redirect") {
            instance.logoutRedirect({
                postLogoutRedirectUri: "/",
            });
        }
    }

    
    return (
        <DropdownButton variant="secondary" className="ml-auto" drop="start" title="Sign Out">
            <Dropdown.Item as="button" onClick={() => handleLogout("popup")}>Sign out using Popup</Dropdown.Item>
            <Dropdown.Item as="button" onClick={() => handleLogout("redirect")}>Sign out using Redirect</Dropdown.Item>
        </DropdownButton>
    )
}

export const SignInButton = () => {
    const { instance } = useMsal();

    const handleLogin = (loginType) => {
        if (loginType === "popup") {
            instance.loginPopup(loginRequest).catch(e => {
                console.log(e);
            });
        } else if (loginType === "redirect") {
            instance.loginRedirect(loginRequest).catch(e => {
                console.log(e);
            });
        }
    }
    return (
        <DropdownButton variant="secondary" className="ml-auto" drop="start" title="Sign In">
            <Dropdown.Item as="button" onClick={() => handleLogin("popup")}>Sign in using Popup</Dropdown.Item>
            <Dropdown.Item as="button" onClick={() => handleLogin("redirect")}>Sign in using Redirect</Dropdown.Item>
        </DropdownButton>
    )
}

class App extends React.Component {
    render() {
        return (
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <PageLayout>
                            <MainContent />
                        </PageLayout>
                    } />
                </Routes>
            </Router>
        );
    }
}

const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <MsalProvider instance={msalInstance}>
            <App />
        </MsalProvider>
    </React.StrictMode>
);
