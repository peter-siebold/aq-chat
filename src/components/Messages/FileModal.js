import React from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime from "mime-types";

export class FileModal extends React.Component {
    state = {
        file: null,
        authorized: ["image/jpeg", "image/png", "application/pdf"],
    }
    addFile = event => {
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
        console.log("send File");
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
    isAuthorized = filename => this.state.authorized.includes(mime.lookup(filename))

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