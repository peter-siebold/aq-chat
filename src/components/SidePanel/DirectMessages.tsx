import React from "react";
import { Menu, Icon } from "semantic-ui-react";
import {connect} from "react-redux";
import {setCurrentChannel, setPrivateChannel} from "../../actions";
import { getUsersReference, getConnectedReference, getPresenceReference } from "../../Helpers/dbHelper";

export interface DirectMessagesProps {
    currentUser: any;
    setCurrentChannel: (channel: any) => void;
    setPrivateChannel: (channel: any) => void;

}
interface DirectMessagesState {
    activeChannel: string;
    user: any;
    users: any[];
    usersRef: any;
    connectedRef: any;
    presenceRef: any;
    errors: any[];
}
export class DirectMessages extends React.Component<DirectMessagesProps>{
    state: DirectMessagesState = {
        activeChannel: "",
        user: this.props.currentUser,
        users: [],
        usersRef: getUsersReference(),
        connectedRef: getConnectedReference(),
        presenceRef: getPresenceReference(),
        errors: [],
    }

    componentDidMount() {
        if(this.state.user) {
            this.addListeners(this.state.user.uid);
        }
    }
    componentWillUnmount(){
        this.removeListeners();
    }

    addListeners = (currentUserUid: string) => {
        let loadedUsers: any[] = [];
        this.state.usersRef.on("child_added", (snap: any) => {
            if(snap){
                if(currentUserUid !== snap.key){
                    let user = snap.val();
                    user["uid"] = snap.key;
                    user["status"] = "offline";
                    loadedUsers.push(user);
                    this.setState({users: loadedUsers})
                }
            }
        });

        this.state.connectedRef.on("value", (snap: any) => {
            if(snap && snap.val() === true){
                const ref = this.state.presenceRef.child(currentUserUid);
                ref.set(true);
                ref.onDisconnect().remove((err: any) => {
                    if(err !== null){
                        console.error(err);
                    }
                })

            }
        });


        this.state.presenceRef.on("child_added", (snap: any) => {
            if(snap && currentUserUid !== snap.key){
                this.addStatusToUser(snap.key);
            }
        });

        this.state.presenceRef.on("child_removed", (snap: any) => {
            if(snap && currentUserUid !== snap.key){
                this.addStatusToUser(snap.key, false);
            }
        });
    }

    addStatusToUser = (userId: any, connected = true) => {
        const updatedUsers = this.state.users.reduce((acc, user) => {
            if(user.uid === userId){
                user["status"] = `${connected ? "online": "offline"}`;
            }
            return acc.concat(user);
        }, []);
        this.setState({
            users: updatedUsers
        })
    }

    removeListeners = () => {
        this.state.usersRef.off();
        this.state.presenceRef.off();
        this.state.connectedRef.off();
    }

    isUserOnline = (user: any) => user.status === "online";

    changeChannel = (user: any) => {
        const channelId = this.getChannelId(user.uid);
        const channelData = {
            id: channelId,
            name: user.name,
        };
        this.props.setCurrentChannel(channelData);
        this.props.setPrivateChannel(true);
        this.setActiveChannel(user.uid);
    }
    setActiveChannel = (userId: string) => {
        this.setState({
            activeChannel: userId
        })
    }
    getChannelId = (userId: string) => {
        const currentUserId = this.state.user.uid;
        return userId < currentUserId ?
                `${userId}/${currentUserId}` : 
                `${currentUserId}/${userId}`;
    }
    render(){
        const {users, activeChannel} = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail" /> DIRECT MESSAGES
                    </span>{" "}
                    ({ users.length})
                </Menu.Item>
                {
                    users.map(user => (
                      <Menu.Item 
                        key={user.uid}
                        active={user.uid === activeChannel}
                        onClick={() => this.changeChannel(user)}
                        style={{opacity: "0.7", fontStyle: "italic"}}
                      >
                        <Icon
                            name="circle"
                            color={this.isUserOnline(user) ? "green" : "red"} 
                        />
                        @ {user.name}
                      </Menu.Item>
                    ))
                }
            </Menu.Menu>
        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(DirectMessages);