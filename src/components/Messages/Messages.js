import React from "react";
import { Segment, Comment } from "semantic-ui-react";
import firebase from "../../firebase";

import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";

class Messages extends React.Component{
    state = {
        channel: this.props.currentChannel,
        messages: [],
        messagesLoading: false,
        messagesRef: firebase.database().ref("messages"),
        progressBar: false,
        user: this.props.currentUser,
    }

    removeListeners = () => {
        this.state.messagesRef.off();
    }
    addListeners = channelId => {
        this.addMessageListener(channelId)
    }
    addMessageListener = channelId => {
        const loadedMessages = [];
        this.state.messagesRef.child(channelId).on("child_added", snap => {
            loadedMessages.push(snap.val())
            this.setState({
                messages: loadedMessages,
                messagesLoading: true,
            })
        })
    }
    componentDidMount(){
        const {channel, user} = this.state;

        if(channel && user){
            this.addListeners(channel.id);
        }
    }
    componentWillUnmount(){
        this.removeListeners();
    }
    displayMessages = messages => (
        messages.length > 0 && messages.map(message => (
            <Message 
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />
        ))
    )
    isProgressBarVisible = percent => {
        if(percent > 0){
            this.setState({ progressBar: true })
        }
    }

    render() {
        const {messagesRef, messages, channel, user, progressBar} = this.state;
        return (
            <React.Fragment>
                <MessagesHeader />
                <Segment>
                    <Comment.Group className={progressBar ? "messages__progress": "messages"}>
                        { this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                
                <MessageForm 
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isProgressBarVisible={this.isProgressBarVisible}
                />
            </React.Fragment>
        )
    }
}


export default Messages;