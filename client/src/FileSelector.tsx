import * as React from 'react';

interface FileSelectorProps {
    user: firebase.User | null,
    fileList: string[]
    onnavigate: (fileName: string) => void,
    oncreate: (fileName: string) => void
}

export default class FileSelector extends React.Component<FileSelectorProps, {}> {
    constructor(props: FileSelectorProps) {
        super(props);
        this.state = {
            fileList: ["Test File 1", "Test File 2", "Test File 3"]
        }
    }

    render() {
        if (this.props.user == null) {
            return <div className="file-selector hidden"></div>
        } else {
            let files = this.props.fileList.map((name: string) => {
                return (
                    <li className="file-entry" key={name} onClick={() => this.handleNavigate(name)}>
                        {name}
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

    newFile() {
        let name = prompt("File name");
        this.props.oncreate(name);
    }
}