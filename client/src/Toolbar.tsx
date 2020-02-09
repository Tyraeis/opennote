import * as React from 'react';
import API from './API';

interface Pen {
    color: string,
    weight: number
}

interface ToolbarProps {
    onpenchange: (pen: Pen) => void,
    onlogin: (user: firebase.User) => void,
    onlogout: () => void,
    documentName: string,
    statusMessage: string,
    user: firebase.User | null
}

interface ToolbarState {
    color: string,
    pens: Pen[],
}

export default class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
    constructor(props: ToolbarProps) {
        super(props);
        this.state = {
            color: "#000",
            pens: [
                {
                    color: "#000",
                    weight: 5
                },
                {
                    color: "#f00",
                    weight: 5
                },
                {
                    color: "#0a0",
                    weight: 5
                },
                {
                    color: "#22f",
                    weight: 5
                },
            ]
        };
    }

    render() {
        let buttons = this.state.pens.map((button: Pen, index: number) => {
            let buttonId = 'pen' + index + 'Button';
            return <div key={index} className="pen">
                <input id={buttonId} className="pen-button" type="radio" name="pen" onChange={this.handlePenChange.bind(this)} data-value={index} />
                <label htmlFor={buttonId} className="pen-label">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <circle cx="12" cy="12" r={button.weight} fill={button.color}></circle>
                    </svg>
                </label>
            </div>
        });

        return (
            <header className="toolbar">
                <a className="toolbar-brand" href="#">OpenNote</a>
                <div className="toolbar-group pen-selector">
                    {buttons}
                </div>
                <div className="toolbar-group">
                    <div className="toolbar-text">
                        {this.props.documentName}
                    </div>
                    <div className="toolbar-text text-secondary">
                        {this.props.statusMessage}
                    </div>
                </div>
                <div className="flex-spacer"></div>
                <div className="toolbar-group login-container">
                    { this.props.user == null ?
                        <button onClick={this.login.bind(this)}>
                            Sign in
                        </button>
                    : 
                        <React.Fragment>
                            <div className="toolbar-text">
                                {this.props.user.displayName}
                            </div>
                            <button onClick={this.logout.bind(this)}>
                                Sign out
                            </button>
                        </React.Fragment>
                    }
                </div>
            </header>
        )
    }

    handlePenChange(evt: React.ChangeEvent<HTMLInputElement>) {
        console.log(this);
        let button = this.state.pens[Number(evt.target.dataset.value)];
        this.props.onpenchange(button);
    }

    login() {
        API.signIn()
            .then((cred: firebase.auth.UserCredential) => {
                this.props.onlogin(cred.user);
            });
    }

    logout() {
        API.signOut()
            .then(() => {
                this.props.onlogout();
            })
    }
}