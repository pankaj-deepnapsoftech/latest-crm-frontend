

import {
    Box,
    Flex,
    Text,
    Input,
    IconButton,
    VStack,
    HStack,
    Spacer,
    useColorModeValue
} from "@chakra-ui/react";
import { ArrowUpIcon, CloseIcon } from "@chakra-ui/icons";


const messages = [
    { id: 1, sender: "user", text: "Hey! How are you?" },
    { id: 2, sender: "bot", text: "I'm good, thanks! What about you?" },
    { id: 3, sender: "user", text: "Doing great!" },
];
const Chatdrawer = ({ dataId: id, closeDrawerHandler }) => {

    const userBg = useColorModeValue("blue.500", "blue.300");
    const botBg = useColorModeValue("gray.200", "gray.700");
    const userColor = useColorModeValue("white", "gray.900");
    const botColor = useColorModeValue("black", "white");

    return (
        <>
            <Flex direction="column" h="100vh" w="full" bg={useColorModeValue("gray.100", "gray.900")}>
                <Flex
                    p={4}
                    bg={useColorModeValue("white", "gray.800")}
                    boxShadow="md"
                    align="center"
                    justify="space-between"
                >
                    <Text fontSize="xl" fontWeight="semibold">
                        {id?.customer_name || "Chat App"}
                    </Text>
                    <IconButton
                        aria-label="Close chat"
                        icon={<CloseIcon />}
                        size="sm"
                        onClick={closeDrawerHandler}
                        variant="ghost"
                    />
                </Flex>
                
                {/* <Box p={4} bg={useColorModeValue("white", "gray.800")} boxShadow="md" textAlign="center" fontSize="xl" fontWeight="semibold">
                    {id?.customer_name || "Chat App"}
                </Box> */}
                
                <VStack flex="1" overflowY="auto" p={4} spacing={4} align="stretch">
                    {messages.map((msg) => (
                        <Flex
                            key={msg.id}
                            justify={msg.sender === "user" ? "flex-end" : "flex-start"}
                        >
                            <Box
                                maxW={{ base: "70%", md: "60%", lg: "50%" }}
                                p={3}
                                borderRadius="2xl"
                                bg={msg.sender === "user" ? userBg : botBg}
                                color={msg.sender === "user" ? userColor : botColor}
                                boxShadow="md"
                            >
                                <Text>{msg.text}</Text>
                            </Box>
                        </Flex>
                    ))}
                </VStack>

                <HStack p={4} bg={useColorModeValue("white", "gray.800")} borderTopWidth="1px">
                    <Input placeholder="Type a message..." borderRadius="full" />
                    <IconButton
                        aria-label="Send message"
                        icon={<ArrowUpIcon />}
                        borderRadius="full"
                        colorScheme="blue"
                    />
                </HStack>
            </Flex>
        </>
        
    )
  
};

export default Chatdrawer;
