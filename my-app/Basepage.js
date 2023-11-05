// BasePage.js
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View, ImageBackground, Animated, Text } from "react-native";
import { TamaguiProvider, TextArea } from "tamagui";
import config from "./tamagui.config";
import { Button, XStack, Image } from "tamagui";
import Fileclaim from "./Fileclaim";
import Policy from "./Policy";



const BasePage = ({navigation}) => {
    const buttonsTranslateY = useRef(new Animated.Value(600)).current;
  const backgroundTranslateY = useRef(new Animated.Value(500)).current;
  const logoTranslateY = useRef(new Animated.Value(-300)).current;

  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  const startCheckInAnimations = () => {
    // Animated.sequence([
    //   Animated.parallel([
    //     Animated.timing(logoTranslateY, {
    //       toValue: -300,
    //       duration: 500,
    //       useNativeDriver: true,
    //     }),
    //     Animated.timing(buttonsTranslateY, {
    //       toValue: 2000,
    //       duration: 500,
    //       useNativeDriver: true,
    //     }),
    //   ]),

    //   Animated.timing(backgroundTranslateY, {
    //     toValue: -800,
    //     duration: 500,
    //     useNativeDriver: true,
    //   }),
    // ]).start();
    navigation.navigate('Conversation');
  };

  useEffect(() => {
    if (loaded) {
      Animated.sequence([
        // First, execute these two animations in parallel.
        Animated.parallel([
          Animated.timing(logoTranslateY, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(backgroundTranslateY, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        // Once the parallel animations are done, execute this one.
        Animated.timing(buttonsTranslateY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={config}>
      <View style={styles.container}>
        <Animated.View
          style={{
            ...styles.backgroundImageContainer,
            transform: [{ translateY: logoTranslateY }],
          }}
        >
          <ImageBackground
            source={require("./assets/sflol.png")}
            resizeMode="cover"
            style={styles.backgroundImage}
          >
            <Animated.View
              style={{
                ...styles.logoContainer,
                transform: [{ translateY: logoTranslateY }],
                justifyContent: 'center', // Center content vertically
                alignItems: 'center', // Center content horizontally
              }}
            >
            <Text
              style={{
                fontSize: 32, // You can adjust the size as needed
                fontWeight: 'bold', // Optional: if you want the text to be bold
                color: 'black', // Adjust the color as needed
              }}
            >
              Dashboard
            </Text>
</Animated.View>

            {/* <Animated.View
              style={{
                ...styles.logoContainer,
                transform: [{ translateY: logoTranslateY }],
              }}
            >
              <Image
                style={{
                  resizeMode: "cover",
                  height: 100,
                  width: 350,
                }}
                source={require("./assets/logo.png")}
              />
            </Animated.View> */}

          <Animated.View
            style={{
              ...styles.buttonContainer,
              transform: [{ translateY: buttonsTranslateY }],
            }}
          >
            <XStack style={styles.buttonSpacing}>
              <Button
                width="75%"
                height={60}
                fontSize={21}
                backgroundColor={"white"}
                color={"$red9"}
                // onPress={() => startCheckInAnimations()}
              >
                See current Quote
              </Button>
            </XStack>
            <XStack>
              <Button
                width="75%"
                height={60}
                fontSize={21}
                backgroundColor={"white"}
                color={"$red9"}
                onPress={() => navigation.navigate('Fileclaim')}
              >
                File Claim
              </Button>
            </XStack>
            <XStack>
              <Button
                width="75%"
                height={60}
                fontSize={21}
                backgroundColor={"white"}
                color={"$red9"}
                onPress={() => navigation.navigate('Policy')}
              >
                View Policy
              </Button>
            </XStack>
          </Animated.View>
        </ImageBackground>
      </Animated.View>

      <StatusBar style="auto" />
    </View>
  </TamaguiProvider>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-end",
  },
  backgroundImageContainer: {
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  logoContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 100,
  },
  buttonSpacing: {
    marginBottom: 30,
  },
});

//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Welcome to BasePage!</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   text: {
//     fontSize: 24,
//     marginBottom: 20,
//   },
// });

export default BasePage;



