import React from "react";
import {Menu, Icon, Modal, Form, Input, Button} from "semantic-ui-react";
import firebase from "../../firebase";
class Channels extends React.Component{
    state = {
        channels: [],
        channelName: "",
        channelDetails: "",
        channelsRef : firebase.database().ref("channels"),
        modal: false,
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
    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }
    handleSubmit = event => {
        event.preventDefault();
        if(this.isFormValid(this.state)){
            this.addChannel();
        }
    }
    addChannel = () => {
        const {channelName, channelDetails, channelsRef, user} = this.state;
        const key = channelsRef.push().key;

        const newChannel = {
            key,
            channelName,
            channelDetails,
            createdBy: {
                name: user.displayName,
                avater: user.photoURL
            }
        }

        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({
                    channelName: "",
                    channelDetails: ""
                });
                this.closeModal();
                console.log("Channel added successfully.")
            })
            .catch(err => {
                console.error(err);
            })
    }
    isFormValid = ({channelName, channelDetails}) => channelName && channelDetails;

    render() {
        const {channels, modal} = this.state;
        return (
            <React.Fragment>
                <Menu.Menu style={{ paddingBottom: '2em'}}>
                    <Menu.Item>
                        <span>
                            <Icon name="exchange" /> CHANNELS
                        </span>{' '}
                        ({ channels.length }) <Icon name="add" onClick={this.openModal} />
                    </Menu.Item>
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

export default Channels;