import { StatusBar } from "expo-status-bar";
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, ImageBackground, Animated, Text, TouchableOpacity } from "react-native";
import { TamaguiProvider, TextArea } from "tamagui";
import config from "./tamagui.config";
import { Button, XStack, Image } from "tamagui";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Audio } from 'expo-av';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { FAST_API_URL } from "./constants";
import io from 'socket.io-client';


const MAX_SCALE = 1.5; // maximum scale when loud
const MIN_SCALE = 0.4; // minimum scale when quiet
const MAX_DB = -10; // quite loud very loud very loud
const MIN_DB = -70; // very quiet

const Fileclaim = ({navigation}) => {
    const [recording, setRecording] = useState(null);
    const [recordingStatus, setRecordingStatus] = useState('idle');
    const [audioPermission, setAudioPermission] = useState(null);
    const [curAudio, setCurAudio] = useState("");
    const [userSpokenText, setUserSpokenText] = useState("");
    const [timerDone, setTimerDone] = useState("");
    const [audioRefs, setAudioRefs] = useState({});
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState('');
    const [textResponse, setTextResponse] = useState('');
    const [arr, SetArr] = useState([]);

    const [textTypeCount, setTextTypeCount] = useState(0);
    const [showButton, setShowButton] = useState(false);
    const [showMic, setShowMic] = useState(true);
    const [image, setImage] = useState(null);

    const [microphoneScale] = useState(new Animated.Value(1));

    const startRecordingAnim = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(microphoneScale, {
                    toValue: 1.2,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(microphoneScale, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        console.log(result);
    
        if (!result.cancelled) {
          setImage(result.uri);
          // You can also upload the image to your server here
        }
      };

    const stopRecordingAnim = () => {
        microphoneScale.stopAnimation();
    };

    const onStatusUpdate = (status) => {
        const normalizedValue = (status.metering - MIN_DB) / (MAX_DB - MIN_DB);
        const scaleValue = normalizedValue * (MAX_SCALE - MIN_SCALE) + MIN_SCALE;

        if (typeof scaleValue === 'number' && scaleValue > 0 && scaleValue < 2) {
            Animated.timing(microphoneScale, {
                toValue: scaleValue,
                duration: 3,
                useNativeDriver: true,
            }).start();
        }
    }

    let total = ''
    useEffect(() => {
        async function getPermission() {
            await Audio.requestPermissionsAsync().then((permission) => {
                console.log('Permission Granted: ' + permission.granted);
                setAudioPermission(permission.granted)
            }).catch(error => {
                console.log(error);
            });
        }
        
        const socketIo = io(`${FAST_API_URL}`, {
            transports: ["websocket"],
            path: "/ws/socket.io",
        });
        setSocket(socketIo);

        socketIo.emit('chatbot', {
            "user_id": "john_doe",
            "command": "create_claim"
        });
        
        socketIo.on('chatbot', (result) => {
            let parsedResult = JSON.parse(result);
            let type = parsedResult.type

            if(type == "text") {
                console.log(parsedResult.text)
                setTextResponse(parsedResult.text);
                SetArr(arr.concat([parsedResult.text]));
                console.log(arr);

            }else if (type == "partial-text") {
                setTextResponse(parsedResult.text);
            }else if (type == "chunk") {
                console.log("Got chunk with length " + parsedResult.chunk.length)
                total += parsedResult.chunk;
            } else if (type == "status") {
                console.log("Playing chunk")
                setTextTypeCount((prevCount) => {
                    console.log("this is prevcount before" + prevCount)
                    const newCount = prevCount + 1;
                    console.log("this is prevcount" + prevCount)
                    if (newCount === 3) {
                        setShowMic(false);
                    }
                    if (newCount === 3) {
                        setShowButton(true);
                    }
                    return newCount;
                });
            }

        });

        getPermission();
        return () => {
            if (recording) {
                stopRecording();
            }
        };
    }, []);

    async function startRecording() {
        try {
            // needed for IoS
            if (audioPermission) {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                })
            }
            startRecordingAnim();
            const newRecording = new Audio.Recording();
            newRecording.setOnRecordingStatusUpdate(onStatusUpdate);
            newRecording.setProgressUpdateInterval(10);
            console.log('Starting Recording')
            await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            await newRecording.startAsync();
            setRecording(newRecording);
            setRecordingStatus('recording');

        } catch (error) {
            console.error('Failed to start recording', error);
        }
    }

    useEffect(() => {
        const startYO = async () => {
            await setTimeout(() => {
                setTimerDone(true);
            }, 5000);
        }
        if (recordingStatus === 'recording') {
            startYO();
        }
    }, [recordingStatus])

    async function stopRecording() {
        try {
            if (recordingStatus === 'recording') {
                console.log('Stopping Recording')
                await recording.stopAndUnloadAsync();
                const recordingUri = recording.getURI();

                stopRecordingAnim();

                // Create a file name for the recording
                const fileName = `recording-${Date.now()}.caf`;

                // Move the recording to the new directory with the new file name
                await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', { intermediates: true });
                await FileSystem.moveAsync({
                    from: recordingUri,
                    to: FileSystem.documentDirectory + 'recordings/' + `${fileName}`
                });

                // upload the uri and send the post
                uploadAudio(FileSystem.documentDirectory + 'recordings/' + `${fileName}`);

                // // This is for simply playing the sound back
                // const playbackObject = new Audio.Sound();
                // await playbackObject.loadAsync({ uri: FileSystem.documentDirectory + 'recordings/' + `${fileName}` });
                // await playbackObject.playAsync();


                // resert our states to record again
                setRecording(null);
                setRecordingStatus('stopped');
            }
        } catch (error) {
            console.error('Failed to stop recording', error);
        }
    }

    async function handleRecordButtonPress() {
        if (recording) {
            const audioUri = await stopRecording(recording);
            if (audioUri) {
                console.log('Saved audio file to', savedUri);
            }
        } else {
            setUserSpokenText("");
            await startRecording();
        }
    }

    const uploadAudio = async (audioUri) => {
        if (!audioUri) return;

        const data = new FormData();
        data.append('file', {
            uri: audioUri,
            name: 'audio.caf',
            type: 'audio/caf',
        });
        console.log('Uploading: ', data);
        try {
            const axiosInstance = axios.create({
                maxRedirects: 5, // Set the maximum number of redirects to follow
                validateStatus: (status) => status >= 200 && status < 400, // Validate the response status
            });

            const response = await axiosInstance.post(`${FAST_API_URL}/api/v1/upload_audio/`, data);
            console.log('Uploaded and transcribed: ', response.data);
            socket.emit('chatbot', {
                "user_id": "john_doe",
                "command": "get_response",
                "query": response.data.message.transcription
            });

            setUserSpokenText(response.data.message.transcription);
            

        } catch (error) {
            console.error('Error uploading:', error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Request data:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
            }
        }
    };

    return (
        <TamaguiProvider config={config}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.headerText}>{textResponse}</Text>
    
                <View style={styles.textAreaContainer}>
                    <TextArea
                        value={userSpokenText}
                        style={styles.textArea}
                    />
                </View>

           
                <View style={styles.uploadButtonContainer}>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.uploadedImage} />}
          </View>
        
    
          {showMic && (
                <Animated.View
                    style={[
                        styles.microphoneContainer,
                        { transform: [{ scale: microphoneScale }] },
                    ]}
                >
                    <TouchableOpacity
                        onPress={handleRecordButtonPress}
                        style={styles.microphoneButton}
                    >
                        <Icon
                            name={recording ? 'circle' : 'microphone'}
                            size={150}
                            color={recording ? 'red' : 'black'}
                        />
                    </TouchableOpacity>
                </Animated.View>
                )}
                {/* <Text style={styles.pText}>{curAudio}</Text> */}
                
                <View style={styles.baseButtonContainer}>
                    {showButton && (
                    <TouchableOpacity
                        style={styles.baseButton}
                        onPress={() => navigation.navigate('Basepage')}
                    >
                        <Text style={styles.buttonText}>Go to Dashboard</Text>
                    </TouchableOpacity>
                    )}
                </View>
                 
                {/* Audio elements hidden */}
            </ScrollView>
        </TamaguiProvider>
    )
                    }
    export default Fileclaim;
    const styles = StyleSheet.create({
        uploadButtonContainer: {
            alignItems: 'center',
            marginVertical: 20,
          },
          uploadButton: {
            backgroundColor: '#f01716', // Your specified button color
            paddingHorizontal: 30,
            paddingVertical: 12,
            borderRadius: 5,
            elevation: 2,
          },
          uploadButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
          },
          uploadedImage: {
            width: 200,
            height: 200,
            marginTop: 20,
            borderRadius: 5, // Optional: if you want rounded corners for the image
          },
        container: {
            flex: 1,
            backgroundColor: '#f0f0f0', // Soft background color for the entire view
        },
        contentContainer: {
            paddingTop: 50,
            paddingBottom: 20,
            paddingHorizontal: 10,
            alignItems: 'center',
        },
        headerText: {
            fontSize: 18,
            marginBottom: 20,
            marginTop: 20,
            minHeight: 340,
            fontWeight: '600',
            textAlign: 'center',
            color: '#333', // Dark text for better readability
        },
        textAreaContainer: {
            width: '100%',
            height: "auto",
            alignItems: 'center',
            marginBottom: 30,
        },
        textArea: {
            width: '90%',
            height: 100,
            borderWidth: 1,
            borderColor: "#ddd", // Soft border color
            borderRadius: 10,
            padding: 10,
            fontSize: 16,
            color: '#333', // Matching text color
            backgroundColor: 'white', // White text area background
        },
        microphoneContainer: {
            marginVertical: 40,
            alignItems: 'center',
        },
        microphoneButton: {
            padding: 20,
            borderRadius: 75, // Perfect circle
            backgroundColor: '#eee', // Soft color for the button
            elevation: 6,
            shadowRadius: 5,
            shadowOpacity: 0.3,
        },
        pText: {
            fontSize: 18,
            color: '#666', // Softer text color
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: 'white',
            borderRadius: 10,
            elevation: 2,
            shadowOpacity: 0.2,
            marginBottom: 20,
        },
        // baseButtonContainer: {
        //     justifyContent: 'center',
        //     alignItems: 'center',
        //     width: '100%',
        //     marginBottom: 20,
        // },
        baseButton: {
            backgroundColor: '#f01716',
            paddingHorizontal: 30,
            paddingVertical: 12,
            borderRadius: 25,
            elevation: 4,
            shadowOpacity: 0.3,
            shadowRadius: 3,
        },
        buttonText: {
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
            },
            imageUploadContainer: {
                alignItems: 'center',
                marginVertical: 20,
              },
              uploadedImage: {
                width: 200,
                height: 200,
                marginTop: 20,
              },
        });
    