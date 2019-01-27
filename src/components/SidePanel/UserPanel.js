import React from "react";
import {Grid, Header, Icon, Dropdown} from "semantic-ui-react";
import {darkPurple} from "../../Shared/Styles";
import firebase from "../../firebase"
class UserPanel extends React.Component{
    dropDownOptions = () => [
        {
            key: 'user',
            text: <span>Signed in as <strong>User</strong></span>,
            disabled: true
        },
        {
            key: 'avatar',
            text: <span>Change Avatar</span>,
        },
        {
            key: 'signout',
            text: <span onClick={this.handleSignout}>Sign Out</span>,
        },
    ];
    handleSignout = () => {
        console.log("try to signout")
        firebase
            .auth()
            .signOut()
            .then(() => {
                console.log("signed out");
            })
    }
    render() {
        return (
            <Grid style={{background: `${darkPurple}`}}>
                <Grid.Column>
                    <Grid.Row styles={{padding: '1.2em', margin: 0}}>
                        {/* App Header */}
                        <Header inverted floated="left" as="h2">
                        <Icon name="code" />
                        <Header.Content>aq Chat</Header.Content>
                        </Header>
                        </Grid.Row>
                        {/* User Dropdown */} 
                        <Header style={{padding: '0.25em'}} as="h4" inverted>
                            <Dropdown trigger={
                                <span>User</span>
                            } options={this.dropDownOptions()}/>
                        </Header>
                </Grid.Column>
            </Grid>
        )
    }
}


export default UserPanel;