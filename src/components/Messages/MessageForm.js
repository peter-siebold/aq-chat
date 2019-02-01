import React from "react";
import uuidv4 from "uuid/v4";
import firebase from "../../firebase";
import { Segment, Button, Input } from "semantic-ui-react";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";
import {getFileExt} from "../../Shared/helpers"
class MessageForm extends React.Component{
    state = {
        channel: this.props.currentChannel,
        errors: [],
        loading: false,
        message: "",
        modal: false,
        percentUploaded: 0,
        storageRef: firebase.storage().ref(),
        uploadState: "",
        uploadTask: null,
        user: this.props.currentUser,
    }
    
    openModal = () => this.setState({ modal: true})
    closeModal = () => this.setState({ modal : false})

    handleChange = event => {
        this.setState({
            [event.target.name] : event.target.value
        })
    }
    createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                avatar: this.state.user.photoURL,
                id: this.state.user.uid,
                name: this.state.user.displayName,
            },
            // content: this.state.message
        };
        if(fileUrl !== null){
            message["image"] = fileUrl;
        } else {
            message["content"] = this.state.message
        }
        return message;
    }
    sendMessage = () => {
        const {getMessagesRef} = this.props;
        const {message, channel} = this.state;
        if(message){
            this.setState({loading: true});
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({
                        loading: false,
                        message: "",
                        errors: []
                    })
                })
                .catch(err => {
                    this.setState({
                        loading: false,
                        errors: this.state.errors.concat(err)
                    });
                })
        } else {
            this.setState({
                errors: this.state.errors.concat({ message: "Add a message" })
            })
        }
    }
    // getFileExt = (file, metadata) => {
    //     let fileExt = "";
    //     if(metadata.contentType){
    //         if(metadata.contentType.match(/(?!.*\/)(.*$)/)){
    //             fileExt = metadata.contentType.match(/(?!.*\/)(.*$)/)[0]
    //         }
    //     }
    //     if(!fileExt && file && file.name){
    //         if(file.name.match(/(?!.*\.)(.*$)/) ){
    //             fileExt = file.name.match(/(?!.*\.)(.*$)/)[0];
    //         }
    //     }
    //     if(!fileExt) {
    //         fileExt = "";
    //     }
    //     return fileExt;
    // }
    getPath = () => {
        if(this.props.isPrivateChannel){
            return `chat/private-${this.state.channel.id}`
        } else {
            return "chat/public";
        }
    }

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const fileExt = getFileExt(file, metadata);    
        const filePath = `${this.getPath()}/${uuidv4()}.${fileExt}`

        this.setState({
            uploadState: "uploading",
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        }, () => {
            this.state.uploadTask.on("state_changed", snap => {
                const percentUploaded = Math.round( (snap.bytesTransferred / snap.totalBytes) * 100 );
                this.props.isProgressBarVisible(percentUploaded);
                this.setState({percentUploaded})
            }, err => {
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err),
                    uploadState: "error",
                    uploadTask: null,
                })
            }, 
            () => {
                 this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
                     this.sendFileMessage(downloadUrl, ref, pathToUpload);
                 })
                .catch(err => {
                    console.error(err);
                    this.setState({
                        errors: this.state.errors.concat(err),
                        uploadState: "error",
                        uploadTask: null,
                    })
                });
            })
        })
    }

    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({ uploadState: "done"})
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err),
                    uploadState: "error",
                    uploadTask: null,
                })
            })
    }

    render() {
        const {errors, message, loading, modal, uploadState, percentUploaded} = this.state
        return (
            <Segment className="message__form">
                <Input 
                    fluid
                    name="message"
                    value={message}
                    onChange={this.handleChange}
                    style={{marginBottom: '0.7em'}}
                    label={<Button icon={"add"} />}
                    labelPosition="left"
                    placeholder="write your message"
                    className={errors.some(error => error.message.includes("message")) ? "error" : ""}
                />
                <Button.Group icon widths="2">
                    <Button 
                        color="orange"
                        onClick={this.sendMessage}
                        disabled={loading}
                        content="Add Reply"
                        labelPosition="left"
                        icon="edit"
                    />
                    <Button 
                        color="teal"
                        disabled={uploadState === "uploading"} 
                        onClick={this.openModal}
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"
                    />
                </Button.Group>
                <FileModal
                    modal={modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile}
                />
                <ProgressBar 
                    uploadState={uploadState}
                    percentUploaded={percentUploaded}
                />
            </Segment>
        )
    }
}


export default MessageForm;