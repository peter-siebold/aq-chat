import React from "react";
import {Menu} from "semantic-ui-react";
import {darkPurple, fontBigger} from "../../Shared/Styles"
import UserPanel from "./UserPanel";

class SidePanel extends React.Component{
    render() {
        return (
            <Menu 
                size="large"
                inverted
                fixed="left"
                vertical
                style={{background : `${darkPurple}`, fontSize: `${fontBigger}`}}
            >
                <UserPanel />
            </Menu>
        )
    }
}


export default SidePanel;