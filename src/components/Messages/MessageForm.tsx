import React from "react";
import uuidv4 from "uuid/v4";
import firebase from "../../firebase";
import { Segment, Button, Input } from "semantic-ui-react";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";
import {getFileExt} from "../../Shared/helpers"
import {Picker, emojiIndex, BaseEmoji} from "emoji-mart";
import "emoji-mart/css/emoji-mart.css"

export interface MessageFormProps {
    currentUser: any;
    currentChannel: any;
    setCurrentChannel?: (channel: any) => void;
    setPrivateChannel?: (channel: any) => void;
    getMessagesRef: () => firebase.database.Reference;
    isPrivateChannel: boolean;
    isProgressBarVisible: (percent: number) => void;
    messagesRef ?: firebase.database.Reference
}
interface MessageFormState {
    channel: any;
    emojiPicker: boolean;
    errors: any[];
    loading: boolean;
    message: string;
    modal: boolean;
    percentUploaded: number;
    storageRef: firebase.storage.Reference;
    typingRef: firebase.database.Reference;
    uploadState: string;
    uploadTask:  firebase.storage.UploadTask | null;
    user: any;
}
class MessageForm extends React.Component<MessageFormProps>{
    state: MessageFormState = {
        channel: this.props.currentChannel,
        emojiPicker: false,
        errors: [],
        loading: false,
        message: "",
        modal: false,
        percentUploaded: 0,
        storageRef: firebase.storage().ref(),
        typingRef: firebase.database().ref("typing"),
        uploadState: "",
        uploadTask: null,
        user: this.props.currentUser,
    }
    messageInputRef?: Input | null;
    componentWillUnmount() {
        if(this.state.uploadTask !== null) {
            this.state.uploadTask.cancel();
            this.setState({
                uploadTask: null
            })
        }
    }

    openModal = () => this.setState({ modal: true})
    closeModal = () => this.setState({ modal : false})

    handleChange = (event: any) => {
        this.setState({
            [event.target.name] : event.target.value
        })
    }

    handleKeyDown = (event: any) => {

        if(event.keyCode === 13){
            this.sendMessage()
        }

        const {message, typingRef, channel, user} = this.state;

        if(message) {
            typingRef
            .child(channel.id)
            .child(user.uid)
            .set(user.displayName)
        } else {
            typingRef
            .child(channel.id)
            .child(user.uid)
            .remove()
        }
    }
    handleTogglePicker = () => {
        this.setState({ emojiPicker : !this.state.emojiPicker})
    }

    handleAddEmoji = (emoji: any) => {
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons}` );
        this.setState({
            message : newMessage,
            emojiPicker: false,
        })
        setTimeout(() => (this.messageInputRef as Input).focus(), 0);
    }


    colonToUnicode = (message: any) => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, (x: string) => {
          x = x.replace(/:/g, "");
          let emoji = emojiIndex.emojis[x];
          if (typeof emoji !== "undefined") {
            let unicode = (emoji as BaseEmoji).native;
            if (typeof unicode !== "undefined") {
              return unicode;
            }
          }
          x = ":" + x + ":";
          return x;
        });
      };

    createMessage = (fileUrl = null) => {
        const message: any = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                avatar: this.state.user.photoURL,
                id: this.state.user.uid,
                name: this.state.user.displayName,
            },
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
        const {message, channel, typingRef, user} = this.state;
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
                    });
                    typingRef
                    .child(channel.id)
                    .child(user.uid)
                    .remove()
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

    getPath = () => {
        if(this.props.isPrivateChannel){
            return `chat/private/${this.state.channel.id}`
        } else {
            return "chat/public";
        }
    }

    uploadFile = (file: any, metadata: any) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const fileExt = getFileExt(file, metadata);    
        const filePath = `${this.getPath()}/${uuidv4()}.${fileExt}`

        this.setState({
            uploadState: "uploading",
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        }, () => {
            if(this.state.uploadTask){
                this.state.uploadTask.on("state_changed", (snap:any) => {
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
                    if(this.state.uploadTask){
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
                    }
                })

            }
        })
    }

    sendFileMessage = (fileUrl: any, ref: firebase.database.Reference, pathToUpload: any) => {
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
        const {errors, message, loading, modal, uploadState, percentUploaded, emojiPicker} = this.state
        return (
            <Segment className="message__form">
                {
                    emojiPicker&& (
                        <Picker 
                            set="apple"
                            style={{position: "absolute"}}
                            title="Pick your emoji"
                            emoji="point_up"
                            onSelect={this.handleAddEmoji}
                        />
                    )
                }
                <Input 
                    fluid
                    name="message"
                    value={message}
                    onChange={this.handleChange}
                    onKeyUp={this.handleKeyDown}
                    ref={node => (this.messageInputRef = node)}
                    style={{marginBottom: '0.7em'}}
                    label={
                        <Button 
                            icon={emojiPicker ? "close" : "add"} 
                            content={emojiPicker ? 'Close' : null}
                            onClick={this.handleTogglePicker} 
                        />
                    }
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
                {
                    uploadState === "uploading" ? (
                        <ProgressBar percentUploaded={percentUploaded} />
                    ): false
                }
            </Segment>
        )
    }
}


export default MessageForm;