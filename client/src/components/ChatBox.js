import { Box } from '@chakra-ui/react';
import React from 'react'
import { ChatState } from '../Context/ChatProvider'
import SingleChat from './SingleChat';

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
    const { selectedChat } = ChatState;
    return (
        <Box
            // display={{ md: "flex", base: selectedChat ? "flex" : "none" }}
            // d={{ base: selectedChat ? "flex" : "none", md: "flex" }}
            display="flex"
            alignItems="center"
            flexDir="column"
            p={3}
            bg="white"
            w={{ base: "100%", md: "68%" }}
            borderRadius="lg"
            borderWidth="1px"
        >
            <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </Box>
    )
}

export default ChatBox