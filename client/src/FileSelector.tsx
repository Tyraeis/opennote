import * as React from 'react';

interface FileSelectorProps {
    user: firebase.User | null,
    fileList: string[],
    onnavigate: (fileName: string) => void,
    oncreate: (fileName: string) => void,
    ondelete: (fileName: string) => void
}

export default class FileSelector extends React.Component<FileSelectorProps, {}> {
    constructor(props: FileSelectorProps) {
        super(props);
    }

    render() {
        if (this.props.user == null) {
            return <div className="file-selector hidden"></div>
        } else {
            let files = this.props.fileList.map((name: string) => {
                return (
                    <li className="file-entry" key={name}>
                        <div className="file-name" onClick={() => this.handleNavigate(name)}>
                            {name}
                        </div>
                        <div className="delete-file" onClick={() => this.handleDelete(name)}>
                            ×
                        </div>
                    </li>
                )
            })

            return (
                <div className="file-selector">
                    <ul className="file-list">
                        {files}
                    </ul>
                    <div className="flex-spacer"></div>
                    <div className="new-file" onClick={() => this.newFile()}>
                        + New File
                    </div>
                </div>
            )
        }

    }

    handleNavigate(file: string) {
        this.props.onnavigate(file);
    }

    handleDelete(file: string) {
        if (confirm('Are you sure you want to delete "'+file+'"?')) {
            this.props.ondelete(file);
        }
    }

    newFile() {
        let name = prompt("File name");
        this.props.oncreate(name);
    }
}