import { Box, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import ChatBox from "../components/ChatBox";
import SideDrawer from "../components/miscllenious/SideDrawer";
import MyChats from "../components/MyChats";
import { ChatState } from "../Context/ChatProvider"

const Chat = () => {
    const { user } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);
    // console.log(Array.isArray(user),"<<<user")

    if (!user) {
        return null; // or loading indicator, redirect, or any appropriate action
    } 

    return (
        <div style={{ width: '100%' }}>
            
            {user ? <SideDrawer />  : <Spinner ml="auto" d="flex" />}
            <Box display="flex" justifyContent="space-between" w="100%" h="92vh" p="10px">
                {user && <MyChats fetchAgain={fetchAgain} />}
                {user && (
                    <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
                )}
            </Box>
        </div>
    )
}

export default Chat