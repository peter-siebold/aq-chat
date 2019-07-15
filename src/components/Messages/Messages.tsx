import React from "react";
import { Segment, Comment } from "semantic-ui-react";

import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

import {connect} from "react-redux";
import {setUserPosts} from "../../actions";
import { getUsersReference, getTypingReference, getPrivateMessagesReference, getMessagesReference, getConnectedReference } from "../../Helpers/dbHelper";

export interface MessagesProps {
    currentChannel: any;
    isPrivateChannel: any;
    currentUser: any;
    setUserPosts: (userPosts: any) => void
}

interface MessagesState {
    channel: any;
    connectedRef: any;
    isChannelStarred: boolean;
    listeners: any[];
    messages: any[];
    messagesLoading: boolean;
    messagesRef: any;
    numUniqueUsers: any;
    privateChannel: any;
    privateMessagesRef: any;
    progressBar: any;
    searchLoading: any;
    searchResults: any;
    searchTerm: any;
    typingRef: any;
    typingUsers: any;
    usersRef: any;
    user: any;
}
class Messages extends React.Component<MessagesProps>{
    state: MessagesState = {
        channel: this.props.currentChannel,
        connectedRef: getConnectedReference(),
        isChannelStarred: false,
        listeners: [],
        messages: [],
        messagesLoading: true,
        messagesRef: getMessagesReference(),
        numUniqueUsers: "",
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: getPrivateMessagesReference(),
        progressBar: false,
        searchLoading: false,
        searchResults: [],
        searchTerm: "",
        typingRef: getTypingReference(),
        typingUsers: [],
        usersRef : getUsersReference(),
        user: this.props.currentUser,
    }
    messagesEnd ?: HTMLDivElement | null;

    removeListeners = (listeners: any) => {
        listeners.forEach((listener: any) => {
            listener.ref.child(listener.id).off(listener.event)
        })
    }
    addListeners = (channelId: string) => {
        this.addMessageListener(channelId);
        this.addTypingListeners(channelId);
    }
    addTypingListeners = (channelId: string) => {
        let typingUsers: any[] = [];
        this.state.typingRef.child(channelId).on("child_added", (snap: any) => {
            if(snap.key !== this.state.user.uid){
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                })
                this.setState({
                    typingUsers
                })
            }
        });
        this.addToListeners(channelId, this.state.typingRef, "child_added");

        this.state.typingRef.child(channelId).on("child_removed", (snap: any) => {
            const index = typingUsers.findIndex(user => user.id === snap.key);
            if(index !== -1){
                typingUsers = typingUsers.filter(user => user.id !== snap.key);
                this.setState({ typingUsers });
            }
        });
        this.addToListeners(channelId, this.state.typingRef, "child_removed");

        this.state.connectedRef.on("value", (snap: any) => {
            if(snap.val() === true){
                this.state.typingRef
                    .child(channelId)
                    .child(this.state.user.uid)
                    .onDisconnect()
                    .remove((err: any) => {
                        if(err !== null){
                            console.error(err);
                        }
                    })
            }
        })
    }

    addMessageListener = (channelId: string) => {
        const loadedMessages: any[] = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on("child_added", (snap: any) => {
            loadedMessages.push(snap.val())
            this.setState({
                messages: loadedMessages,
                messagesLoading: false,
            });
            this.countUniqueUsers(loadedMessages);
            this.countUsersPosts(loadedMessages);
        });
        this.addToListeners(channelId, ref, "child_added");
    }
    addUsersStarsListener = (channelId: string, userId: string) => {
        this.state.usersRef
            .child(userId)
            .child("starred")
            .once("value")
            .then((data: any) => {
                if(data.val() !== null) {
                    const channelIds = Object.keys(data.val());
                    const prevStarred = channelIds.includes(channelId)
                    this.setState({
                        isChannelStarred: prevStarred
                    })
                }
            })
    }

    getMessagesRef = () => {
        const {messagesRef, privateMessagesRef, privateChannel} = this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    }

    countUniqueUsers = (messages: any) => {
        const uniqueUsers = messages.reduce((acc: any, message: any) => {
            if(!acc.includes(message.user.name)){
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
        this.setState({ numUniqueUsers });
    }

    countUsersPosts = (messages: any) => {
        let userPosts = messages.reduce((acc: any, message: any) => {
            if(message.user.name in acc){
                acc[message.user.name].count += 1;
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1,
                }
            }
            return acc;
        }, {});
        this.props.setUserPosts(userPosts);
    }

    componentDidMount(){
        const {channel, user, listeners} = this.state;

        if(channel && user){
            this.removeListeners(listeners)
            this.addListeners(channel.id);
            this.addUsersStarsListener(channel.id, user.uid);
        }
    }
    componentWillUnmount(){
        this.removeListeners(this.state.listeners);
        this.state.connectedRef.off();
    }

    componentDidUpdate(prevProps: any, prevState: MessagesState) {
        if(this.messagesEnd){
            this.scrollToBottom();
        }
    }

    addToListeners = (id: string, ref: any, event: any) => {
        const index = this.state.listeners.findIndex(listener => {
            return (
                listener.id === id && listener.ref === ref && listener.event === event
            )
        });

        if(index === -1){
            const newListener = { id, ref, event };
            this.setState({ listeners : this.state.listeners.concat(newListener)})
        }
    }

    scrollToBottom = () => {
        if(this.messagesEnd){
            this.messagesEnd.scrollIntoView({ behavior : "smooth"});
        }
    }

    displayMessages = (messages: any[]) => (
        messages.length > 0 && messages.map(message => (
            <Message 
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />
        ))
    )
    isProgressBarVisible = (percent: number) => {
        if(percent > 0){
            this.setState({ progressBar: true })
        }
    }

    displayChannelName = (channel: any) => {
        return channel ? `${this.state.privateChannel ? "@" : "#"}${channel.name}` : ""
    };

    handleSearchChange = (event: any) => {
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true,
        }, () => this.handleSearchMessages())
    }

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, "gi");

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

    handleStar = () => {
        this.setState((prevState: MessagesState) => ({
            isChannelStarred: !prevState.isChannelStarred
        }), () => this.starChannel())
    }
    starChannel = () => {
        if(this.state.isChannelStarred){
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .update({
                    [this.state.channel.id] : {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            avatar: this.state.channel.createdBy.avatar,
                            name: this.state.channel.createdBy.name,
                        }
                    }
                })
        } else {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove((err: any) => {
                    if(err !== null) {
                        console.error(err);
                    }
                })
        }
    }
    displayTypingUsers = (users: any[]) => (
        users.length > 0 && users.map(user => (
            <div style={{ display: "flex", alignItems: "center", marginBottom: '0.2em'  }} key={user.id}>
                <span className="user__typing">{user.name} is typing</span> <Typing />
            </div>
        ))
    )

    displayMessageSkeleton = (loading: boolean) => (
        loading ? (
            <React.Fragment>
                { 
                    [...Array(10)].map((_, i) =>(
                        <Skeleton key={i} />
                    ))
                }
            </React.Fragment>
        ) : null
    )

    render() {
        const {messagesRef, messages, channel, user, progressBar, numUniqueUsers, searchTerm, searchResults, searchLoading, privateChannel, isChannelStarred, typingUsers, messagesLoading} = this.state;
        return (
            <React.Fragment>
                <MessagesHeader 
                    channelName={this.displayChannelName(channel) }
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                    handleStar={this.handleStar}
                    isChannelStarred={isChannelStarred}
                />
                <Segment>
                    <Comment.Group className={progressBar ? "messages__progress": "messages"}>
                        { this.displayMessageSkeleton(messagesLoading) }
                        { searchTerm 
                            ? this.displayMessages(searchResults) 
                            : this.displayMessages(messages)
                        }
                        { this.displayTypingUsers(typingUsers)}
                        <div ref={node => (this.messagesEnd = node)}></div>
                    </Comment.Group>
                </Segment>
                
                <MessageForm 
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isProgressBarVisible={this.isProgressBarVisible}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </React.Fragment>
        )
    }
}


export default connect(null, {setUserPosts})(Messages);