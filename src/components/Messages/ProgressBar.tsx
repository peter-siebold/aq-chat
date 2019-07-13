import React from "react";
import { Progress } from "semantic-ui-react";
export interface ProgressBarProps {
    percentUploaded?: any
}
export const ProgressBar = ({percentUploaded}: ProgressBarProps) => (
        <Progress 
            className="progress__bar"
            percent={percentUploaded}
            progress
            indicating
            size="medium"
            inverted
        />
)

export default ProgressBar;