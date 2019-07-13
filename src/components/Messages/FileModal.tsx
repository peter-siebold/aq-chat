import React from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime from "mime-types";

export interface FileModalProps {
    uploadFile: any;
    closeModal: () => void;
    modal: boolean;
}
interface FileModalState {
    file: any | null;
    authorized: string[];
}
export class FileModal extends React.Component<FileModalProps> {
    state: FileModalState = {
        file: null,
        authorized: ["image/jpeg", "image/png", "application/pdf"],
    }
    addFile = (event: any) => {
        const file = event.target.files[0];
        if(file){
            this.setState({
                file
            })
        }
    }
    sendFile = () => {
        const {file} = this.state;
        const {uploadFile, closeModal} = this.props;

        if(file !== null) {
            console.log("file exists");
            if(this.isAuthorized(file.name)){
                console.log("file authorized");
                const metadata = {
                    contentType : mime.lookup(file.name)
                };
                uploadFile(file, metadata);
                closeModal();
                this.clearFile();
            }
        }
    }
    onCancel = () => {
        const {closeModal} = this.props;
        this.clearFile();
        closeModal();
    }
    clearFile = () => {
        this.setState({
            file: null
        })
    }
    isAuthorized = (filename: string) => this.state.authorized.includes(mime.lookup(filename) as string)

    render(){
        const {modal} = this.props;
        return(
            <Modal basic open={modal} onClose={this.onCancel}>
                <Modal.Header>
                    Chose an Image File
                </Modal.Header>
                <Modal.Content>
                    <Input
                        fluid
                        label="File types: jpg, png"
                        name="file"
                        type="file"
                        onChange={this.addFile}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        color="green"
                        inverted
                        onClick={this.sendFile}
                    >
                        <Icon name="checkmark" /> Send
                    </Button>
                    <Button
                        color="red"
                        inverted
                        onClick={this.onCancel}
                    >
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default FileModal;