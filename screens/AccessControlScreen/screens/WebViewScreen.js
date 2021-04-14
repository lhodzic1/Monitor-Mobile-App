import React, {useState, useEffect} from 'react';
import { View, StyleSheet, Text,} from 'react-native';
import {WebView} from 'react-native-webview';

export default function WebViewScreen({route, navigation}) {
    const [renderedOnce, setRenderedOnce] = useState(false);
    const updateSource = () => {
        setRenderedOnce(true);
    };
    const { location } = route.params;
    return (
        <WebView
        originWhitelist={['*']}
        source={renderedOnce ? {uri: location} : undefined}
        style={{flex: 1}}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        onLoad={updateSource}
    />
    );
}