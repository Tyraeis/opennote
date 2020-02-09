import * as React from 'react';
import Page from './Page';
import Toolbar from './Toolbar';
import FileSelector from './FileSelector';
import API from './API';

interface AppState {
    user: firebase.User | null,
    documentList: string[],
    documentName: string,
    statusMessage: string
}

export default class App extends React.Component<{}, AppState> {
    canvas = React.createRef<HTMLCanvasElement>();
    page: Page | null;
    
    saveTimeout: NodeJS.Timeout | null = null;
    saveNeeded: boolean = false;
    saving: boolean = false;

    constructor(props: {}) {
        super(props);
        this.state = {
            user: null,
            documentList: [],
            documentName: '',
            statusMessage: ''
        }
        //this.root = document.getElementById('root');
        //this.page = new Page(this.root);
        //this.toolbar = new Toolbar((color: string) => this.handleColorChange(color));
        this.mainLoop();
    }

    render() {
        return (
            <div id="app">
                <Toolbar
                    onpenchange={this.handlePenChange.bind(this)}
                    onlogin={this.handleLogin.bind(this)}
                    onlogout={this.handleLogout.bind(this)}
                    documentName={this.state.documentName}
                    statusMessage={this.state.statusMessage}
                    user={this.state.user}
                ></Toolbar>
                <div className="content">
                    <div className="canvas-container">
                        <canvas ref={this.canvas}></canvas>
                    </div>
                    <FileSelector
                        user={this.state.user}
                        fileList={this.state.documentList}
                        onnavigate={(name) => this.handleNavigate(name)}
                        oncreate={(name) => this.handleCreate(name)}
                        ondelete={(name) => this.handleDelete(name)}
                    ></FileSelector>
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.page = new Page(this.canvas.current!)
        this.page.onchange = () => this.handlePageChanged();
    }

    updateDocumentList() {
        API.getDocuments()
            .then((docs) => {
                this.setState({
                    documentList: docs
                });
            });
    }

    saveCurrentDocument() {
        if (this.state.user == null || this.state.documentName == '') {
            return;
        }

        this.saveNeeded = false;
        this.saving = true;
        this.setState({
            statusMessage: "Saving..."
        });
        console.log("Saving...");
        API.updateDocument(this.state.documentName, this.page.export())
            .then(() => {
                this.saving = false;
                if (this.saveNeeded) {
                    this.handlePageChanged();
                }
                this.setState({
                    statusMessage: "Saved."
                });
                console.log("Document saved");
            })
            .catch((err) => {
                this.saving = false;
                this.setState({
                    statusMessage: "Save Failed."
                });
                console.log("Error saving document", err);
            })
    }

    handlePageChanged() {
        if (this.state.user == null || this.state.documentName == '') {
            return;
        }

        this.saveNeeded = true;
        if (this.saving) {
            return;
        }
        if (this.saveTimeout != null) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => this.saveCurrentDocument(), 1000);
    }

    handlePenChange(pen: { color: string, weight: number }) {
        console.log(pen);
        this.page!.color = pen.color;
    }

    handleLogin(user: firebase.User) {
        this.setState({
            user: user
        });
        this.updateDocumentList();
    }

    handleLogout() {
        this.setState({
            user: null,
            documentList: []
        });
    }

    handleNavigate(fileName: string) {
        API.getDocument(fileName)
            .then((doc: { content: string }) => {
                this.setState({
                    documentName: fileName
                });
                this.page!.import(doc.content);
            })
    }

    handleCreate(fileName: string) {
        API.createDocument(fileName)
            .then(() => {
                if (this.state.documentName != '') this.page!.clear();
                return API.updateDocument(fileName, this.page!.export())
            })
            .then(() => {
                this.updateDocumentList();
                this.handleNavigate(fileName);
            })
            .catch((reason) => {
                console.log(reason);
                alert("Document creation failed");
            })
    }

    handleDelete(fileName: string) {
        this.setState({
            statusMessage: "Deleting " + fileName + "..."
        })
        API.removeDocument(fileName)
            .then(() => {
                if (fileName == this.state.documentName) {
                    this.page!.clear();
                    this.setState({
                        documentName: ''
                    });
                }
                this.setState({
                    statusMessage: "Deleted " + fileName + "."
                })
                return this.updateDocumentList()
            })
            .catch((reason) => {
                console.log(reason);
                alert("Error deleting document");
            });
    }

    mainLoop() {
        if (this.page != null) {
            this.page.render();
        }
        requestAnimationFrame(() => this.mainLoop());
    }
}