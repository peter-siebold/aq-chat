import React from "react";
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from "semantic-ui-react";
import {  CompactPicker } from "react-color";
import firebase from "../../firebase";
import {connect} from "react-redux"
import {setColors} from "../../actions";

export interface ColorPanelProps {
    currentUser: any;
    setColors: (primary: string, secondary: string) => void;
}
class ColorPanel extends React.Component<ColorPanelProps>{
    state = {
        modal: false,
        primary: '',
        secondary: '',
        user: this.props.currentUser,
        usersRef: firebase.database().ref("users"),
        userColors: [],
    }

    componentDidMount() {
        if(this.state.user){
            this.addListener(this.state.user.uid);
        }
    }

    componentWillUnmount(){
        this.removeListener();
    }

    addListener = (userId: string) => {
        let userColors: any = [];
        this.state.usersRef
            .child(`${userId}/colors`)
            .on("child_added", (snap: any) => {
                userColors.unshift(snap.val());
                this.setState({
                    userColors
                })
            })

    }
    removeListener = () => {
        this.state.usersRef
        .child(`${this.state.user.uid}/colors`).off();
    }
    openModal = () => this.setState({ modal : true})
    closeModal = () => this.setState({ modal : false})
    handleChangePrimary = (color: any) => this.setState({
        primary: color.hex
    })
    handleChangeSecondary = (color: any) => this.setState({
        secondary: color.hex
    })

    handleSaveColors = () => {
        if(this.state.primary && this.state.secondary){
            this.saveColors(this.state.primary, this.state.secondary)
        }
    }
    saveColors = (primary: string, secondary: string) => {
        this.state.usersRef
            .child(`${this.state.user.uid}/colors`)
            .push()
            .update({
                primary,
                secondary
            })
            .then(() =>{
                console.log("colors added");
                this.closeModal();
            })
            .catch(err => {
                console.error(err);
            })
    }

    displayUserColors = (colors: any[]) => (
        colors.length > 0 && colors.map((color, i) => (
            <React.Fragment key={i}>
                <Divider />
                <div 
                    className="color__container" 
                    onClick={() => this.props.setColors(color.primary, color.secondary)}
                >
                    <div className="color__square" style={{background:  color.primary}}>
                        <div className="color__overlay" style={{background:  color.secondary}}>

                        </div>
                    </div>
                </div>
            </React.Fragment>
        ))
    )

    render() {
        const { modal, primary, secondary, userColors} = this.state;
        return (
           <Sidebar
            as={Menu}
            icon="labeled"
            inverted
            vertical
            visible
            width="very thin"
           >
            <Divider />
            <Button icon="add" size="small" color="blue" onClick={this.openModal} />
            {this.displayUserColors(userColors)}
            <Modal basic open={modal} onClose={this.closeModal}>
                <Modal.Header>
                    Choose App Colors
                </Modal.Header>
                <Modal.Content>
                    <Segment>
                        <Label content="Primary Color" />
                        <CompactPicker
                            color={primary}
                            onChange={this.handleChangePrimary}
                        />
                    </Segment>
                    <Segment>
                        <Label content="Secondary Color" />
                        <CompactPicker
                            color={secondary}
                            onChange={this.handleChangeSecondary}
                        />
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="green" inverted onClick={this.handleSaveColors}>
                        <Icon name="checkmark" /> Save Colors
                    </Button>
                    <Button color="red" inverted onClick={this.closeModal}>
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
           </Sidebar>
        )
    }
}


export default connect(null, {setColors})(ColorPanel);