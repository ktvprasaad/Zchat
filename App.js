import React, { Component } from 'react';
import { createAppContainer }  from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import KeyboardSpacer from 'react-native-keyboard-spacer';
// import { StyleSheet, Text, View, Alert, Button, TextInput } from 'react-native';
// import the screens we want to navigate
import Start from './components/Start';
import Chat from './components/Chat';

// Order of the screen stacked Start to Chat
const navigator = createStackNavigator({
  Start: { screen: Start },
  Chat: { screen: Chat }
});

const navigatorContainer = createAppContainer(navigator);
// Export it as the root component
export default navigatorContainer;
