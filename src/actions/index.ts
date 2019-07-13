import * as actionTypes from "./types";

/* User Actions */
export const setUser = (user: any) => {
    return {
        type: actionTypes.SET_USER,
        payload: {
            currentUser: user,
        }
    }
}

export const clearUser = () => {
    return {
        type: actionTypes.CLEAR_USER,
    }
}

/* Channel Actions */


export const setCurrentChannel = (channel: any) => {
    return {
        type: actionTypes.SET_CURRENT_CHANNEL,
        payload: {
            currentChannel : channel
        },
    }
}

export const setPrivateChannel = (isPrivateChannel: boolean) => {
    return {
        type: actionTypes.SET_PRIVATE_CHANNEL,
        payload: {
            isPrivateChannel
        }
    }
}

export const setUserPosts = (userPosts: any) => {
    return {
        type: actionTypes.SET_USER_POSTS,
        payload: {
            userPosts
        }
    }
}

export const setColors = (primaryColor: any, secondaryColor: any) => {
    return {
        type: actionTypes.SET_COLORS,
        payload: {
            primaryColor,
            secondaryColor
        }
    }
}