import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAxios } from '../../../../../redux/createInstance';
import { loginSuccess } from '../../../../../redux/authSlice';
import {
    Button,
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    ScrollViewBase,
    ScrollViewComponent,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { uploadFile } from '../../../../../redux/apiRequest/fileApiRequest';

import { UserContext } from '../../../../../context/UserContext';
import { ChatContext } from '../../../../../context/ChatContext';
import { TYPE_IMG, TYPE_MSG, TYPE_NOTIFICATION } from '../../../../../context/TypeChat';
import { setSender } from '../../../../../redux/userSlice';

import {
    addUserGroupChat,
    deleteGroupChat,
    getListGroupChat,
    getMsgs,
    getMsgsGroupChat,
    removeUserGroupChat,
    updateGroupChat,
    updateMsg,
} from '../../../../../redux/apiRequest/chatApiRequest';
// import LoadingChat from './LoadingChat';

export default function MessageChat({ navigation, route }) {
    const dataSender = route.params.item;
    const isUser = route.params.item.sender === undefined ? false : true;

    const user = useSelector((state) => state.auth.login?.currentUser);
    const sender = useSelector((state) => state.user.sender?.user);
    const chat = useSelector((state) => state.chat.message?.content);
    const individualChat = useSelector((state) => state.chat.individualChat);
    const isGroupChat = useSelector((state) => state.groupChat?.groupChat.isGroupChat);
    const listGroupChat = useSelector((state) => state.groupChat?.groupChat.actor);
    // const urlImage = useSelector((state) => state.file?.upload?.url.url);

    const chatContext = useContext(ChatContext);
    const createChat = chatContext.createChat;
    const setSendData = chatContext.setSendData;
    const sendData = chatContext.sendData;
    const setIndividualChatId = chatContext.setIndividualChatId;

    const userContext = useContext(UserContext);
    const setActiveUser = userContext.setActiveUser;

    const bottomRef = useRef(null);

    const [currentSender, setCurrentSender] = useState(sender);

    const [currentListGroupChat, setCurrentListGroupChat] = useState(listGroupChat);
    const [currentGroupChat, setCurrentGroupChat] = useState(
        currentListGroupChat.filter((groupChat) => groupChat.groupName === currentSender?.profileName)[0],
    );
    const [changeNameGroup, setChangeNameGroup] = useState(currentGroupChat?.groupName);
    const [adminGroup, setAdminGroup] = useState(currentGroupChat?.groupAdmin._id);
    const [isListUser, setListUser] = useState(currentGroupChat?.user);

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');

    const dispatch = useDispatch();

    const currentUserId = user?._id;
    const currentSenderId = currentSender?._id;
    const accessToken = user?.accessToken;

    let axiosJWTLogin = createAxios(user, dispatch, loginSuccess);

    const handleOpen = async () => {
        setOpen(true);
        const list = await getListGroupChat(accessToken, currentUserId, dispatch, axiosJWTLogin);
        setCurrentListGroupChat(list);
    };
    const handleClose = async () => {
        setOpen(false);
    };

    const handleRemoveUser = (item) => async () => {
        setListUser(isListUser.filter((user) => user._id !== item._id));
        const apiGroupChat = {
            idGroup: currentGroupChat._id,
            idUser: item._id,
        };
        await removeUserGroupChat(accessToken, dispatch, apiGroupChat, axiosJWTLogin);
    };

    const setNameGroup = (event) => {
        setChangeNameGroup(event.target.value);
    };

    const handleSetKeyAdmin = (userAdmin) => async () => {
        setAdminGroup(userAdmin?._id);
        const apiSetAdmin = {
            groupAdmin: userAdmin,
        };
        await updateGroupChat(accessToken, dispatch, currentGroupChat._id, apiSetAdmin, axiosJWTLogin);
    };

    const handleClickApply = async () => {
        if (currentGroupChat.groupName !== changeNameGroup.trim()) {
            const apiSetGroupName = {
                groupName: changeNameGroup.trim(),
            };

            //update group name in chat
            const updateSenderName = {
                ...currentSender,
                profileName: changeNameGroup.trim(),
            };
            setCurrentSender(updateSenderName);
            await updateGroupChat(accessToken, dispatch, currentGroupChat._id, apiSetGroupName, axiosJWTLogin);
            getListGroupChat(accessToken, currentUserId, dispatch, axiosJWTLogin);
        }

        if (currentGroupChat?.groupImage !== urlImage) {
            //upload image to cloud
            const bodyFormData = new FormData();
            bodyFormData.append('file', image);
            const uploadImage = await uploadFile(accessToken, dispatch, axiosJWTLogin, bodyFormData);
            setUrlImage(uploadImage.url);

            window.setTimeout(async function () {
                //set group chat profile img
                const apiSetGroupProfileImg = {
                    groupImage: uploadImage.url[0],
                };

                //update group profile img in chat
                const updateSenderProfileImg = {
                    ...currentSender,
                    profileImg: uploadImage.url,
                };
                await setCurrentSender(updateSenderProfileImg);

                await updateGroupChat(
                    accessToken,
                    dispatch,
                    currentGroupChat._id,
                    apiSetGroupProfileImg,
                    axiosJWTLogin,
                );

                getListGroupChat(accessToken, currentUserId, dispatch, axiosJWTLogin);
            }, 1000);
        }

        handleClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message !== '') {
            createChat(TYPE_MSG, message, []);
            setMessage('');
        }
    };

    const addMsgImgWithInfo = (url) => {
        createChat(TYPE_IMG, '', url);
    };

    const convertTime = (time) => {
        const formattedDate = moment(time).utcOffset('+0700').format('HH:mm DD [tháng] MM, YYYY');

        return formattedDate;
    };
    //POP THE EMOJI PICKER UP
    const [inputStr, setInputStr] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const emojiPicker = (event, emojiObject) => {
        setInputStr((prevInput) => prevInput + emojiObject.emoji);
        setShowPicker(false);
    };

    const [isMessageQuestion, setMessageQuestion] = useState('');

    const typeChat = (type, mess) => {
        switch (type) {
            case TYPE_MSG:
                return <Text style={styles.chatText}>{mess.message.content}</Text>;
            case TYPE_IMG:
                return imgChat(mess.message?.imageContent.length, mess.message?.imageContent);
            case TYPE_NOTIFICATION:
                const content = mess.message.content;
                const question = content.split('/');
                if (mess.sender === currentUserId)
                    return <Text style={styles.chatText}>Bạn đã gửi tin nhắn tham gia nhóm</Text>;
                else
                    return formQuestion(
                        question,
                        isMessageQuestion === '' ? question[1] : isMessageQuestion,
                        mess.message._id,
                    );
            default:
                return <></>;
        }
    };

    const formQuestion = (question, key, id) => {
        switch (key) {
            case 'Y':
                return <Text style={styles.chatText}>Bạn đã tham gia nhóm gì đó ....</Text>;
            case 'N':
                return <Text style={styles.chatText}>Bạn từ chối đã tham gia nhóm gì đó ....</Text>;
            case '=':
                return (
                    <View>
                        <Text style={styles.chatText}>{question[0]}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Button size="small" onPress={() => handleAnswer(question, 'Y', id)} title={'có'} />

                            <Button size="small" onPress={() => handleAnswer(question, 'N', id)} title={'Không'} />
                        </View>
                    </View>
                );
            default:
                return <></>;
        }
    };

    const handleAnswer = async (question, answer, id) => {
        setMessageQuestion(answer);
        const newAnswer = question[0] + '/' + answer + '/' + question[2];
        const content = {
            content: newAnswer,
        };
        if (answer === 'Y') {
            const apiGroupChat = {
                idGroup: question[2],
                idUser: currentUserId,
            };
            await addUserGroupChat(accessToken, dispatch, apiGroupChat, axiosJWTLogin);
            await getListGroupChat(accessToken, currentUserId, dispatch, axiosJWTLogin);
        }
        updateMsg(accessToken, dispatch, id, content, axiosJWTLogin);
    };

    const imgChat = (length, images) => {
        const chatImage = (srcGroup) =>
            images?.map((img, index) => {
                return <Image key={index} style={styles.image} alt="not fount" source={{ uri: img + srcGroup }} />;
            });

        if (length > 0) {
            switch (length) {
                case 1:
                    return chatImage('');
                default:
                    return (
                        <View
                        // className={cx('groupImage')}
                        >
                            {chatImage('?w=164&h=164&fit=crop&auto=format')}
                        </View>
                    );
            }
        } else return <Image alt="not fount" width={'20px'} source={''} />;
    };

    // Modal Add user Open and Close
    const [isModalAddUser, setModalAddUser] = useState(false);
    const handleOpenModalAddUser = () => setModalAddUser(true);
    const handleCloseModalAddUser = () => setModalAddUser(false);

    // MODAL CHANGE IMAGE IN GROUP
    const [urlImage, setUrlImage] = useState(currentGroupChat?.groupImage);
    const [image, setImage] = useState({});
    const handleChangeImageGroup = (event) => {
        if (event.target.files && event.target.files[0]) {
            setUrlImage(URL.createObjectURL(event.target.files[0]));
            setImage(event.target.files[0]);
        }
    };

    // EVENT OUT GROUP
    const handleOutGroup = () => {
        const userOutGroup = {
            _id: currentUserId,
            profileName: user.profileName,
        };

        handleRemoveUser(userOutGroup)();
        dispatch(setSender(null));
        dispatch(getListGroupChat(accessToken, currentUserId, dispatch, axiosJWTLogin));
        handleClose();
    };

    // EVENT REMOVE GROUP
    const handleClickRemoveGroup = async () => {
        await deleteGroupChat(accessToken, dispatch, currentGroupChat._id, axiosJWTLogin);
        dispatch(setSender(null));
        await getListGroupChat(accessToken, currentUserId, dispatch, axiosJWTLogin);
        handleClose();
    };

    // //SAVE MSG WHEN RELOAD PAGE
    // useEffect(() => {
    //     if (!isGroupChat) {
    //         const apiSent = {
    //             sender: currentSenderId,
    //             user: currentUserId,
    //         };
    //         if (window.performance) {
    //             if (performance.navigation.type == 1) {
    //                 getMsgs(accessToken, dispatch, apiSent, axiosJWTLogin);
    //             }
    //         }
    //     } else {
    //         const apiSent = {
    //             groupId: currentSenderId,
    //         };
    //         getMsgsGroupChat(accessToken, dispatch, apiSent, axiosJWTLogin);
    //     }
    // }, []);

    useEffect(() => {
        setIndividualChatId(individualChat.idChat);
    }, [individualChat.idChat]);

    useEffect(() => {
        setSendData(chat);
    }, [chat]);

    useEffect(() => {
        setCurrentSender(sender);
    }, [sender]);

    useEffect(() => {
        // 👇️ scroll to bottom every time messages change
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sendData]);

    useEffect(() => {
        setCurrentGroupChat(
            currentListGroupChat.filter((groupChat) => groupChat.groupName === currentSender?.profileName)[0],
        );
        setChangeNameGroup(currentGroupChat?.groupName);
        setAdminGroup(currentGroupChat?.groupAdmin._id);
        setListUser(currentGroupChat?.user);
        setUrlImage(currentGroupChat?.groupImage);
    }, [currentListGroupChat, currentGroupChat]);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View style={styles.profileSender}>
                    <View style={styles.avata}>
                        {isUser ? (
                            <Image style={styles.image} source={{ uri: dataSender.sender.profileImg }} />
                        ) : (
                            <Image style={styles.image} source={{ uri: dataSender.groupImage }} />
                        )}
                    </View>
                    <View style={styles.textContent}>
                        <Text style={styles.name}>{isUser ? dataSender.sender.profileName : dataSender.groupName}</Text>
                        <Text style={styles.active}>Online</Text>
                    </View>
                </View>
            ),
        });
    }, [navigation]);

    return (
        <ImageBackground
            style={styles.container}
            resizeMode="cover"
            source={{
                uri: 'https://res.cloudinary.com/dpux6zwj3/image/upload/v1667673550/Avata/bgcolor_t3meet.png',
            }}
        >
            <ScrollView>
                <View style={[styles.chatAvata]}>
                    {isUser ? (
                        <Image style={styles.chatImage} source={{ uri: dataSender.sender.profileImg }} />
                    ) : (
                        <Image style={styles.image} source={{ uri: dataSender.groupImage }} />
                    )}
                </View>
                <View style={styles.contentChat}>
                    {sendData?.map((mess, index) => {
                        const nameSender = mess.message.userGroupChat?.profileName || currentSender?.profileName;
                        const nameUser = user?.profileName;
                        const isUser = mess.sender === currentUserId;

                        return (
                            <React.Fragment key={index}>
                                <View style={isUser ? styles.user : styles.sender}>
                                    <Image
                                        style={styles.userImage}
                                        source={{
                                            uri: isGroupChat
                                                ? mess.message.userGroupChat?.profileImg
                                                : isUser
                                                ? currentSender?.profileImg
                                                : currentSender?.profileImg,
                                        }}
                                    />
                                    <View style={styles.contain}>
                                        <Text style={styles.chatName}>
                                            {mess.sender === currentUserId ? nameUser : nameSender}
                                        </Text>
                                        {typeChat(mess.message?.type_Msg, mess)}
                                    </View>
                                </View>
                            </React.Fragment>
                        );
                    })}
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    // Styles profile Sender
    profileSender: {
        flex: 1,
        flexDirection: 'row',
        marginRight: 90,
    },
    avata: {
        marginRight: 10,
    },
    image: {
        width: 50,
        height: 50,
        resizeMode: 'center',
        borderRadius: 50,
    },
    textContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 20,
        fontWeight: '500',
    },
    active: {
        fontSize: 14,
        fontWeight: '400',
        color: '#34C759',
    },

    // Styles Main
    container: {
        flex: 1,
    },
    chatAvata: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },

    contentChat: {
        flex: 1,
        minHeight: 455,
        justifyContent: 'flex-end',
    },
    sender: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 10,
    },
    user: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-end',
        padding: 10,
    },
    contain: {
        padding: 10,
        backgroundColor: '#f3a3ad',

        borderRadius: 10,
        elevation: 5,
    },
    userImage: {
        resizeMode: 'center',
        marginLeft: 10,

        width: 40,
        height: 40,

        borderRadius: 50,
    },
    senderImage: {
        resizeMode: 'center',
        marginRight: 10,

        width: 40,
        height: 40,

        borderRadius: 50,
    },
    chatName: {
        fontSize: 14,
        color: '#606060',
    },
    chatText: {
        fontSize: 16,
    },
});
