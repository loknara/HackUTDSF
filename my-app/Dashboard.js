import { H1, TamaguiProvider } from "tamagui";
import { View, Text } from "react-native";
import config from "./tamagui.config";
import { Video } from "expo-av";
import { useRef } from "react";
import React from "react";
import { Route } from "@react-navigation/routers";

const Dashboard = ({route}) => {

    return(
        <TamaguiProvider config={config}>

            <View alignItems='center' justifyContent='center' flex='1'>
                <H1 marginVertical={30}>Thanks for doing your check-in!</H1>
                <Text>Your results have been sent to your doctor for further analysis. Take care!</Text>
            </View>

        </TamaguiProvider>
    );

}


export default Dashboard;