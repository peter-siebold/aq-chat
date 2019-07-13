import React from "react";
import firebase from "../../firebase";
import AvatarEditor from "react-avatar-editor";
import mime from "mime-types";

import {Grid, Header, Icon, Dropdown, Image, Modal, Input, Button} from "semantic-ui-react";
class UserPanel extends React.Component{
    state = {
        user: this.props.currentUser,
        modal: false,
        previewImage: "",
        croppedImage: "",
        blob: "",
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        usersRef : firebase.database().ref("users"),
        uploadedCroppedImage: "",
        metadata: {
            contentType: "image/jpeg"
        }
    }
    openModal  = () => this.setState({modal : true, });
    closeModal = () => this.setState({modal : false, });

    dropDownOptions = () => [
        {
            key: 'user',
            text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
            disabled: true
        },
        {
            key: 'avatar',
            text: <span onClick={this.openModal}>Change Avatar</span>,
        },
        {
            key: 'signout',
            text: <span onClick={this.handleSignout}>Sign Out</span>,
        },
    ];
    handleSignout = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                console.log("signed out");
            })
    }
    resetPreview = () => {
        this.setState({
            previewImage: "",
            croppedImage: "",
            blob: "",
        })
    }
    setMetaData = file => {
        if(file && file.name){
            const contentType = mime.lookup(file.name);
            if(contentType){
                const metadata = {
                    contentType
                }
                this.setState({
                    metadata
                })
            }
        }
    }
    handleChange = event => {
        const file = event.target.files[0];
        const reader = new FileReader();
        if(file) {
            this.resetPreview();
            this.setMetaData(file);
            reader.readAsDataURL(file);
            reader.addEventListener("load", () => {
                this.setState({
                    previewImage: reader.result
                })
            })
        }
    }
    uploadCroppedImage = () => {
        const {storageRef, userRef, metadata, blob} = this.state;
        console.log(this.state.metadata);
        storageRef
            .child(`avatars/users/${userRef.uid}`)
            .put(blob, metadata)
            .then(snap => {
                snap.ref.getDownloadURL().then(downloadUrl => {
                    this.setState({
                        uploadedCroppedImage: downloadUrl
                    }, () => this.changeAvatar())
                })
            })
    }
    handleCropImage = () => {
        if(this.avatarEditor){
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
                let imageUrl = URL.createObjectURL(blob);
                this.setState({
                    croppedImage: imageUrl,
                    blob
                })
            })
        }
    }

    changeAvatar = () => {
        this.state.userRef
            .updateProfile({
                photoURL: this.state.uploadedCroppedImage
            })
            .then(() => {
                console.log("Photo url updated");
                this.closeModal();
            })
            .catch(err => {
                console.error(err);
            })
            this.state.usersRef
                .child(this.state.user.uid)
                .update({ avatar : this.state.uploadedCroppedImage })
                .then(() => {
                    console.log("users avatar updated")
                })
                .catch(err => {
                    console.error(err);
                })

    }
    render() {
        const {user, modal, previewImage, croppedImage} = this.state;
        const {primaryColor} = this.props;
        return (
            <Grid style={{background: `${primaryColor}`}}>
                <Grid.Column>
                    <Grid.Row styles={{padding: '1.2em', margin: 0}}>
                        {/* App Header */}
                        <Header inverted floated="left" as="h2">
                        <Icon name="code" />
                        <Header.Content>aq Chat</Header.Content>
                        </Header>
                        {/* User Dropdown */} 
                        <Header style={{padding: '0.25em'}} as="h4" inverted>
                            <Dropdown 
                                trigger={
                                    <span>
                                        <Image src={user.photoURL} spaced="right" avatar />
                                        {user.displayName}
                                    </span>
                                } 
                                options={this.dropDownOptions()}
                            />
                        </Header>
                        {/* Change User Avatar Modal */}
                        <Modal basic open={modal} onClose={this.closeModal}>
                            <Modal.Header>Change Avatar</Modal.Header>
                            <Modal.Content>
                                <Input 
                                    fluid 
                                    type="file" 
                                    label="New Avatar" 
                                    name="previewImage" 
                                    onChange={this.handleChange}
                                />
                                <Grid centered stackable columns={2}>
                                    <Grid.Row centered>
                                        <Grid.Column className="ui center aligned grid">
                                            {/* Image Preview */}
                                            { previewImage && (
                                                <AvatarEditor 
                                                    ref={node => (this.avatarEditor = node)}
                                                    image={previewImage}
                                                    width={120}
                                                    height={120}
                                                    border={50}
                                                    scale={1.2}
                                                />
                                            )}
                                        </Grid.Column>
                                        <Grid.Column>
                                            {/* Cropped Image Preview */}
                                            { croppedImage && (
                                                <Image 
                                                    style={{margin: "5.5em auto"}}
                                                    width={100}
                                                    height={100}
                                                    src={croppedImage}
                                                />
                                            )}
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Modal.Content>
                            <Modal.Actions>
                                { croppedImage && (
                                    <Button color="green" inverted onClick={this.uploadCroppedImage}>
                                        <Icon name="save" /> Change Avatar
                                    </Button>
                                )}
                                <Button color="green" inverted onClick={this.handleCropImage}>
                                    <Icon name="image" /> Preview
                                </Button>
                                <Button color="red" inverted onClick={this.closeModal}>
                                    <Icon name="remove" /> Cancel
                                </Button>
                            </Modal.Actions>
                        </Modal>
                        </Grid.Row>
                </Grid.Column>
            </Grid>
        )
    }
}

export default UserPanel;