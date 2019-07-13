import React from "react";
import {Menu, Icon, Modal, Form, Input, Button, Label} from "semantic-ui-react";
import firebase from "../../firebase";
import {connect} from "react-redux";
import {setCurrentChannel, setPrivateChannel} from "../../actions";

export interface ChannelsProps {
    currentUser: any;
    setCurrentChannel: (channel: any) => void;
    setPrivateChannel: (channel: any) => void;
}
interface ChannelsState {
    activeChannel: string;
    channelDetails: string;
    channel: any | null;
    channelName: string;
    channels: never[];
    channelsRef: firebase.database.Reference;
    messagesRef: firebase.database.Reference;
    notifications: any[];
    firstLoad: boolean;
    modal: boolean;
    typingRef: firebase.database.Reference;
    user: any;
}
class Channels extends React.Component<ChannelsProps>{
    state: ChannelsState = {
        activeChannel: "",
        channelDetails: "",
        channel: null,
        channelName: "",
        channels: [],
        channelsRef : firebase.database().ref("channels"),
        messagesRef : firebase.database().ref("messages"),
        notifications: [],
        firstLoad: true,
        modal: false,
        typingRef: firebase.database().ref("typing"),
        user: this.props.currentUser,
    }
    closeModal = () => {
        this.setState({
            modal: false
        })
    }
    openModal = () => {
        this.setState({
            modal: true
        })
    }
    handleChange = (event: any) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }
    // @ts-ignore
    isFormValid = ({channelName, channelDetails}) => channelName && channelDetails;
    handleSubmit = (event: any) => {
        event.preventDefault();
        if(this.isFormValid(this.state)){
            this.addChannel();
        }
    }
    addChannel = () => {
        const {channelName, channelDetails, channelsRef, user} = this.state;
        const key = channelsRef.push().key;

        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        }

        channelsRef
            .child(key as any)
            .update(newChannel)
            .then(() => {
                this.setState({
                    channelName: "",
                    channelDetails: ""
                });
                this.closeModal();
            })
            .catch(err => {
                console.error(err);
            })
    }

    componentDidMount() {
        this.addListeners();
    }

    componentWillUnmount(){
        this.removeListeners();
    }

    addListeners = () => {
        let loadedChannels: any[] = [];
        this.state.channelsRef.on("child_added", (snap: any) => {
            loadedChannels.push(snap.val());
            this.setState({ channels: loadedChannels}, () => this.setFirstChannel());
            this.addNotificationListeners(snap.key)
        })
    }
    addNotificationListeners = (channelId: string) => {
        this.state.messagesRef.child(channelId).on("value", snap => {
            if(this.state.channel && snap){
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap);
            }
        })
    }
    handleNotifications = (channelId: string, currentChannelId: string, notifications: any[], snap: firebase.database.DataSnapshot) => {
        let lastTotal = 0;
        let index = notifications.findIndex(notification => notification.id === channelId);

        if(index !== -1) {
            if(channelId !== currentChannelId){
                lastTotal = notifications[index].total;

                if(snap.numChildren() - lastTotal > 0){
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren();
        } else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0,
            })
        }
        this.setState({
            notifications
        })
    }
    getNotificationCount = (channel: any) => {
        let count = 0;
        this.state.notifications.forEach(notification => {
            if(notification.id === channel.id){
                count = notification.count
            }
        })
        if(count > 0){
            return count;
        }
    }
    removeListeners = () => {
        this.state.channelsRef.off();
        this.state.channels.forEach(channel => {
            // @ts-ignore
            this.state.messagesRef(channel.id).off();
        })
    }

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];
        if(this.state.firstLoad && this.state.channels.length > 0){
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({ channel: firstChannel });
        }
        this.setState({ firstLoad: false })
    }

    /**
     *
     *
     * @memberof Channels
     */
    displayChannels = (channels: any[]) => (
        channels.length && channels.map(channel => (
            <Menu.Item 
                key={channel.id}
                onClick={() => this.changeChannel(channel)}
                name={channel.name}
                style={{opacity: 0.7}}
                active={channel.id === this.state.activeChannel}
            >
            { 
                this.getNotificationCount(channel) && (
                    <Label color="red">{this.getNotificationCount(channel)}</Label>
                )
            }
            # { channel.name }
            </Menu.Item>
        ))
    )

    changeChannel = (channel: any) => {
        this.setActiveChannel(channel);
        this.clearNotifications();
        
        this.state.typingRef
        .child(this.state.channel.id)
        .child(this.state.user.uid)
        .remove()
        
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({ channel });
    }
    setActiveChannel = (channel: any) => {
        this.setState({
            activeChannel: channel.id
        })
    }


    clearNotifications = ( )=> {
        let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id);

        if(index !== -1) {
            let updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count = 0;
            this.setState({
                notifications: updatedNotifications
            })
        }
    }

    render() {
        const {channels, modal} = this.state;
        return (
            <React.Fragment>
                <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                            <Icon name="exchange" /> CHANNELS
                        </span>{' '}
                        ({ channels.length }) <Icon name="add" onClick={this.openModal} />
                    </Menu.Item>
                    { this.displayChannels(channels)}
                </Menu.Menu>
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Add a Channel</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input 
                                    fluid
                                    label="Name of Channel"
                                    name="channelName"
                                    onChange={this.handleChange}
                                /> 
                            </Form.Field>
                            <Form.Field>
                                <Input 
                                    fluid
                                    label="About the Channel"
                                    name="channelDetails"
                                    onChange={this.handleChange}
                                /> 
                            </Form.Field>
                        </Form>
                    </Modal.Content>

                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSubmit}>
                            <Icon name="checkmark"/> Add
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal} >
                            <Icon name="remove"/> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Channels);