import React, { Component } from 'react';
import { StyleSheet, ImageBackground, Text, TextInput, View, TouchableOpacity, Button  } from 'react-native';

// Starting screen invoked thru App.js
export default class Start extends React.Component {
    constructor(props) {
      super(props);
      this.state = { 
        name: '', 
        color: '',
      };  
    }

// TouchableOpacity with the propperties accessible, accessibilityLabel and accessibilityHint as part
// of Web Accessibility
    render() {
      return (
        <ImageBackground source={require('../assets/bg.png')} style={styles.bgIamge}>
          <Text style={styles.title}>Zchat!</Text>
          <View style={styles.container}>
            <TextInput
              style={styles.name}
              onChangeText={(name) => this.setState({name})}
              value={this.state.name}
              placeholder='Your Name'
            />
            <Text style={styles.textColor}>Choose Background Color:</Text>
            <View style={styles.bgButtonColors}>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Very dark shade of green for chat screen background"
                onPress={() => this.setState({ color: '#090C08'})}
                style={[styles.bgButton, styles.bgColor1]}
              />
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Medium dark shade of blue-magenta for chat screen background"
                onPress={() => this.setState({ color: '#474056'})}
                style={[styles.bgButton, styles.bgColor2]}
              />
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Cyan-blue for chat screen background"
                onPress={() => this.setState({ color: '#8A95A5'})}
                style={[styles.bgButton, styles.bgColor3]}
              />
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Medium light shade of green for chat screen background"
                onPress={() => this.setState({ color: '#B9C6AE'})}
                style={[styles.bgButton, styles.bgColor4]}
              />
          </View>
          <Button
            title="Start Chatting" 
            style={styles.chatButton}
            onPress={() => this.props.navigation.navigate('Chat',{ name: this.state.name, color: this.state.color})}
          /> 
        </View>
        </ImageBackground>
      );
    } 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: '44%',
    width: '88%',
    marginTop: 150,
    marginBottom: 20
  },
  title: {
    alignItems: 'center',
    fontSize: 45,
    fontWeight: "600",
    color: '#FFFFFF',
    marginTop: 20
  },
  bgIamge: {
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    borderWidth: 1, 
    borderColor: 'gray', 
    borderWidth: 1,
    marginBottom: 20,
    marginTop: 30,
    width: '88%',
    height: '10%'
  },
  textColor: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    marginTop: 5,
},
  bgButtonColors: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    margin: 5,
  },
  bgButton:{
    height: 50,
    width: 50,
    borderRadius: 100,
    margin: 5
  },
  bgColor1:{
    backgroundColor: '#090C08'
  },
  bgColor2:{
    backgroundColor: '#474056'
  },
  bgColor3:{
    backgroundColor: '#8A95A5'
  },
  bgColor4:{
    backgroundColor: '#B9C6AE'
  },
  chatButton: {
    fontSize: 16, 
    fontWeight: '600', 
    color: '#FFFFFF', 
    backgroundColor: '#757083',
    width: '88%',  
    height: '44%',
    marginBottom: 40 
  }
});

