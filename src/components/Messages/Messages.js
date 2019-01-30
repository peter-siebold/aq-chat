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
        numUniqueUsers: "",
        progressBar: false,
        searchLoading: false,
        searchResults: [],
        searchTerm: "",
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
            });
            this.countUniqueUsers(loadedMessages);
        })
    }

    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if(!acc.includes(message.user.name)){
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
        this.setState({ numUniqueUsers });
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

    displayChannelName = channel => channel ? `${channel.name}` : "";

    handleSearchChange = (event) => {
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true,
        }, () => this.handleSearchMessages())
    }

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, "gi");
        console.log(channelMessages);
        const searchResults = channelMessages.reduce((acc, message) => {
            if( (message.content && message.content.match(regex)) || 
                (message.user.name && message.user.name.match(regex)))
            {
                acc.push(message);
            }
            return acc;
        }, []);
        this.setState({ searchResults });
        setTimeout(() => this.setState({searchLoading: false}), 800);
    }

    render() {
        const {messagesRef, messages, channel, user, progressBar, numUniqueUsers, searchTerm, searchResults, searchLoading} = this.state;
        return (
            <React.Fragment>
                <MessagesHeader 
                    channelName={this.displayChannelName(channel) }
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                />
                <Segment>
                    <Comment.Group className={progressBar ? "messages__progress": "messages"}>
                        { 
                            searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)
                        }
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