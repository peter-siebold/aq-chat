import React from "react";
import {Menu} from "semantic-ui-react";
import {fontBigger} from "../../Shared/Styles"
import UserPanel from "./UserPanel";
import Channels from "./Channels"
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";

export interface SidePanelProps {
    currentUser: any;
    primaryColor: any;
}
class SidePanel extends React.Component<SidePanelProps>{
    render() {
        const {currentUser, primaryColor} = this.props;
        return (
            <Menu 
                size="large"
                inverted
                fixed="left"
                vertical
                style={{background : `${primaryColor}`, fontSize: `${fontBigger}`}}
            >
                <UserPanel primaryColor={primaryColor} currentUser={currentUser} />
                <Starred currentUser={currentUser}  />
                <Channels currentUser={currentUser} />
                <DirectMessages currentUser={currentUser} />
            </Menu>
        )
    }
}


export default SidePanel;