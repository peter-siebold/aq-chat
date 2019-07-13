import React from "react";
import { Segment, Header, Input, Icon } from "semantic-ui-react";

export interface MessagesHeaderProps {
    channelName: any;
    numUniqueUsers:any; 
    handleSearchChange:any;
    searchLoading:any;
    isPrivateChannel:any;
    handleStar:any;
    isChannelStarred:any;
}
class MessagesHeader extends React.Component<MessagesHeaderProps>{
    render() {
        const {channelName, numUniqueUsers, handleSearchChange, searchLoading, isPrivateChannel, handleStar, isChannelStarred} = this.props;
        return (
            <Segment clearing>
                {/* Channel Title */}
                <Header
                    fluid="true"
                    as="h2"
                    floated="left"
                    style={{marginBottom : 0}}
                >
                    <span>
                        {channelName}
                        { !isPrivateChannel && (
                            <Icon 
                                name={isChannelStarred ? "star" : "star outline"} 
                                color={isChannelStarred ? "yellow": "black" } 
                                onClick={handleStar} 
                            />
                        )}
                    </span>
                    <Header.Subheader>
                        {numUniqueUsers}
                    </Header.Subheader>
                </Header>
                {/* Channel Search Input */}
                <Header floated="right">
                    <Input 
                        size="mini"
                        icon="search"
                        name="searchTerm"
                        placeholder="Search Messages"
                        loading={searchLoading}
                        onChange={handleSearchChange}
                    />
                </Header>
            </Segment>
               
        )
    }
}


export default MessagesHeader;