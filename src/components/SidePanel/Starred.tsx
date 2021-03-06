import React from "react";
import { Menu, Icon} from "semantic-ui-react";
import {connect} from "react-redux";
import {setCurrentChannel, setPrivateChannel} from "../../actions";
import { getUsersReference } from "../../Helpers/dbHelper";

export interface StarredProps {
    currentUser: any;
    setCurrentChannel: (channel: any) => void;
    setPrivateChannel: (channel: any) => void;
}
interface StarredState {
    user: any;
    usersRef:  any;
    activeChannel: string;
    starredChannels: any[]
}
class Starred extends React.Component<StarredProps> {
    state: StarredState = {
        user: this.props.currentUser,
        usersRef: getUsersReference(),
        activeChannel: "",
        starredChannels: [],
    }

    componentDidMount() {
        if(this.state.user){
            this.addListeners(this.state.user.uid);
        }
    }

    componentWillUnmount () {
        this.removeListeners();
    }

    addListeners = (userId: string) => {
        this.state.usersRef
            .child(userId)
            .child("starred")
            .on("child_added", (snap: any) => {
                if(snap){
                    const starredChannel = { id: snap.key, ...snap.val()}
                    this.setState({
                        starredChannels : [...this.state.starredChannels, starredChannel]
                    })
                }
            });

        this.state.usersRef
            .child(userId)
            .child("starred")
            .on("child_removed", (snap: any) => {
                if(snap){
                    const channelToRemove = { id: snap.key, ...snap.val()};
                    const filteredChannels = this.state.starredChannels.filter(channel => {
                        return channel.id !== channelToRemove.id;
                    })
                    this.setState({
                        starredChannels: filteredChannels
                    })
                }
            })
    }

    removeListeners = () => {
        this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
    }
    displayChannels = (starredChannels: any) => (
        starredChannels.length && starredChannels.map((channel: any) => (
            <Menu.Item 
                key={channel.id}
                onClick={() => this.changeChannel(channel)}
                name={channel.name}
                style={{opacity: 0.7}}
                active={channel.id === this.state.activeChannel}
            >
            # { channel.name }
            </Menu.Item>
        ))
    )
    setActiveChannel = (channel: any) => {
        this.setState({
            activeChannel: channel.id
        })
    }
    changeChannel = (channel: any) => {
        this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
    }

    render() {
        const {starredChannels} = this.state;
        return (
            <Menu.Menu className="menu">
            <Menu.Item>
                <span>
                    <Icon name="star" /> STARRED
                </span>{' '}
                ({ starredChannels.length })
            </Menu.Item>
            { this.displayChannels(starredChannels)}
        </Menu.Menu>
        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Starred);