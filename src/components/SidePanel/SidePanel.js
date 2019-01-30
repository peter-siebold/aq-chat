import React from "react";
import {Menu} from "semantic-ui-react";
import {darkPurple, fontBigger} from "../../Shared/Styles"
import UserPanel from "./UserPanel";
import Channels from "./Channels"
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";
class SidePanel extends React.Component{
    render() {
        const {currentUser} = this.props;
        return (
            <Menu 
                size="large"
                inverted
                fixed="left"
                vertical
                style={{background : `${darkPurple}`, fontSize: `${fontBigger}`}}
            >
                <UserPanel currentUser={currentUser} />
                <Starred />
                <Channels currentUser={currentUser} />
                <DirectMessages currentUser={currentUser} />
            </Menu>
        )
    }
}


export default SidePanel;