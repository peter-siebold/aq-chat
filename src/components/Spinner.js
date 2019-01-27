import React from "react";
import {Loader, Dimmer} from "semantic-ui-react";
export const Spinner = props => {
    const message = props && props.message ? props.message : "Preparing Chat ...";
    return (
        <Dimmer active>
            <Loader size="huge" content={message} />
        </Dimmer>
    );
}

export default Spinner;