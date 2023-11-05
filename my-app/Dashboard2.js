import { H1, TamaguiProvider, Slider } from "tamagui";
import { View, Text } from "react-native";
import config from "./tamagui.config";
import { Video } from "expo-av";
import { useRef, useState } from "react";
import React from "react";
import { Route } from "@react-navigation/routers";
// import { LineChart, Path, Grid } from 'react-native-svg-charts'

const Dashboard2 = ({route}) => {

    const data = [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ]

    // const Shadow = ({ line }) => (
    //     <Path
    //         key={'shadow'}
    //         y={2}
    //         d={line}
    //         fill={'none'}
    //         strokeWidth={4}
    //         stroke={'rgba(134, 65, 244, 0.2)'}
    //     />
    // )


    return(
        <TamaguiProvider config={config}>
            <View alignItems='center' flex='1'>
                <H1 marginVertical={30}>Welcome back, John Doe!</H1>
                {/* <LineChart
                    style={ { height: 200 } }
                    data={ data }
                    svg={{ stroke: 'rgb(134, 65, 244)' }}
                    contentInset={ { top: 20, bottom: 20 } }
                    >
                    <Grid/>
                    <Shadow/>
                </LineChart> */}


            </View>
        </TamaguiProvider>
    );

}



export default Dashboard2;