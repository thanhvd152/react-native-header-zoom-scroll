import React from 'react'
import { StyleSheet, View, Animated, Platform, StatusBar, ScrollViewProps } from 'react-native'
import { getStatusBarHeight } from 'react-native-status-bar-height'
const statusBarHeight: number = Platform.OS == 'ios' ? getStatusBarHeight() : StatusBar.currentHeight || 0
export interface Props extends ScrollViewProps {
    headerComponent?: React.ComponentType<any> | React.ReactElement | null,
    headerHeight: number | 0,
    backgroundHeaderComponent?: React.ComponentType<any> | React.ReactElement | null,
    smallHeaderHeight: number | 0,
    contentSmallHeader: React.ComponentType<any> | React.ReactElement | null,
    statusBarBackground: string | 'transparent',
    fadeSmallHeader: boolean | false
}
const ScrollZoomHeader: React.FC<Props> = (props) => {
    const distanceHeader = props.headerHeight - props.smallHeaderHeight - statusBarHeight
    const ref = React.useRef(0);
    const scrollY = new Animated.Value(ref.current);



    let translateYCardTop = scrollY.interpolate({
        inputRange: [0, distanceHeader],
        outputRange: [0, -distanceHeader],
        extrapolate: 'clamp',
    });
    let scaleYCardTop = scrollY.interpolate({
        inputRange: [-(props.headerHeight || 0) / 2, 0],
        outputRange: [2, 1],
        extrapolateRight: 'clamp'
    });
    let opacitiCardTop = scrollY.interpolate({
        inputRange: [props.smallHeaderHeight, props.headerHeight],
        outputRange: [0, 1],
        extrapolateRight: 'clamp'
    });
    let translateYHeaderComponent = scrollY.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -1],
        // extrapolate: 'clamp',
    });

    const renderBackgroundHeaderComponent = React.useMemo(() => props.backgroundHeaderComponent, [props.backgroundHeaderComponent])
    const renderContentSmallHeader = React.useMemo(() => props.contentSmallHeader, [props.contentSmallHeader])
    const renderHeaderComponent = React.useMemo(() => props.headerComponent, [props.headerComponent])
    return (
        <>
            <Animated.ScrollView
                {...props}
                scrollEventThrottle={1}
                onScroll={Animated.event(
                    [
                        {
                            nativeEvent: {
                                contentOffset: { y: scrollY },
                            }
                        },

                    ],
                    {
                        listener: (event: any) => {
                            const offsetY = event.nativeEvent.contentOffset.y
                            ref.current = offsetY
                        },
                        useNativeDriver: false
                    }
                )}
            >
                <View style={{ height: (props.headerHeight || 0) - statusBarHeight }} />
                {props.children}
            </Animated.ScrollView>
            <Animated.View style={[styles.backgroundHeader, {
                height: props.headerHeight,
                transform: [{ scale: scaleYCardTop }, { translateY: translateYCardTop }]
            }]}>
                {renderBackgroundHeaderComponent}
            </Animated.View>
            <Animated.View style={[styles.wrapCustomComponent, { height: props.headerHeight, transform: [{ translateY: translateYHeaderComponent }] }]} >
                <View style={{ height: props.smallHeaderHeight + props.smallHeaderHeight }} />
                {renderHeaderComponent}
            </Animated.View>
            <Animated.View style={[styles.wrapSmallHeader, {
                height: (props.smallHeaderHeight || 0) + statusBarHeight,
                opacity: props.fadeSmallHeader ? opacitiCardTop : 1,
            }]}>
                <View style={{
                    width: '100%',
                    height: statusBarHeight,
                    backgroundColor: props.statusBarBackground
                }} />
                {renderContentSmallHeader}
            </Animated.View>
        </>
    )
}
export default ScrollZoomHeader
const styles = StyleSheet.create({
    backgroundHeader: {
        position: 'absolute',
        zIndex: 1,
        width: '100%'
    },
    wrapSmallHeader: {
        width: '100%',
        backgroundColor: 'transparent',
        position: 'absolute',
        zIndex: 3,
    },
    wrapCustomComponent: { position: 'absolute', width: '100%', zIndex: 2 }
})
