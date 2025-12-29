import React from 'react';

import {MaterialBottomTabs as Tabs} from '@/components/material-bottom-tabs';

import {IconSymbol} from '@/components/ui/icon-symbol';
import {useTheme} from "react-native-paper";

export default function TabLayout() {
    const theme = useTheme();

    return (
        <Tabs
            activeIndicatorStyle={{backgroundColor: theme.colors.primaryContainer}}
            barStyle={{
                alignContent: "center",
                backgroundColor: theme.colors.surface,
                elevation: 2,
                zIndex: 2,
            }}
            compact
            shifting
            sceneAnimationEnabled={false}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.onSurface}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="house.fill" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="shows"
                options={{
                    title: 'Shows',
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="theatermasks.fill" color={color}/>,
                }}
            />
        </Tabs>
    );
}
