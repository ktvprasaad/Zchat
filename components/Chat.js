import React from 'react';
import { View, Text, Platform, AsyncStorage } from 'react-native';
// GiftedChat - react native's library with inbuilt features such as text input field,
// speech bubbles, send button
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
// To make the text space visible when typing and adjust the already typed message to display 
// appropriately
import KeyboardSpacer from 'react-native-keyboard-spacer';
import NetInfo from '@react-native-community/netinfo';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        if (!firebase.apps.length) {
          firebase.initializeApp({
            apiKey: "AIzaSyC5b2Cn6Gu5xTOb3f2Yp6rNNgfEyv_9yFg",
            authDomain: "hello-world-5c4dc.firebaseapp.com",
            databaseURL: "https://hello-world-5c4dc.firebaseio.com",
            projectId: "hello-world-5c4dc",
            storageBucket: "hello-world-5c4dc.appspot.com",
            messagingSenderId: "1009813200767",
            appId: "1:1009813200767:web:afcc9d858a6d7b64de044a",
            measurementId: "G-6FMLF7RG6M"
          });
        }

        this.state = { 
          messages: [],
          uid: 0,
          user: {
            _id: '',
            name: '',
            avatar: ''
          },
          isConnected: false
        };  

        this.referenceMessages = firebase.firestore().collection('messages');
    }

    // Received name & color as parameter from called screen 'Start' 
    static navigationOptions = ({ navigation }) => {
      return {
        title: navigation.state.params.name
      };
    };

    getMessages = async() => {
      //await operator to work with promises easier, it waits until asyncStorage promise settles
      let messages = '';
      try {
        messaages = await AsyncStorage.getItem('messages') || [];
        this.setState({
          messages: JSON.parse(messages)
        });
      } catch(error) {
        console.log(error.message);
      }
    }

    componentDidMount() {
      NetInfo.isConnected.fetch().then(isConnected => {
        if (isConnected) {
          console.log('online');

          this.authUnsubscribe = firebase.auth().onAuthStateChanged(async(user) => {
            if(!user){
              await firebase.auth().signInAnonymously();
            }

            if(this.props.navigation.state.params.name) {
              this.setUser(user.uid, this.props.navigation.state.params.name);
            } else {
              this.setUser(user.uid);
            }

            this.setState({
              uid: user.uid,
              isConnected: true
            });
        
            this.unsubscribe = this.referenceMessages.orderBy('createdAt','desc').onSnapshot(this.onCollectionUpdate);

          });
        } else {
          console.log('offline');
          this.setState({
            isConnected: false,
          })
          this.getMessages();
        }
      })
    }

    onCollectionUpdate = (querySnapshot) => {
      const messages = [];
      // go through each document
      querySnapshot.forEach((doc) => {
        // get the QueryDocumentSnapshot's data
        var data = doc.data();
        messages.push({
          _id: data._id,
          text: data.text,
          createdAt: data.createdAt.toDate(),
          user: data.user
        });
      });
      this.setState({
        messages
      });
    };

    setUser = (_id, name='Anonymous') => {
      this.setState({
        user: {
          _id: _id,
          name: name,
          avatar: 'https://placeimg.com/140/140/tech'
        },
        uid: _id
      })
    }

    addMessage() {
      let message = this.state.messages[0];
      this.referenceMessages.add({
        _id: message._id,
        text: message.text || '',
        createdAt: message.createdAt,
        user: message.user
      });
    }

    saveMessages = async() => {
      try {
        await AsyncStorage.setItem('messages',JSON.stringify(this.state.messages));
      } catch (erro) {
        console.log(error.message);
      }
    }

    deleteMessages = async() => {
      try {
        await AsyncStorage.removeItem('messsages');
      } catch (error) {
        console.log(error.message);
      }
    }

    onSend(messages = []) {
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
        this.saveMessages();
      })
    }
    
    componentWillUnmount() {
      // this.unsubscribe();
      // stop listening to authentication
      this.authUnsubscribe();
      // stop listening for changes
      this.unsubscribe();
    }

    renderBubble(props) {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor: 'black'
            },
            left: {
              backgroundColor: 'white'
            }
          }}
        />  
      )
    }

    renderInputToolbar(props) {
      if(this.state.isConnected == false ) {
      } else {
        return(
          <InputToolbar
          {...props}
          />
        )
      }
    }

    render() {
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: this.props.navigation.state.params.color
            }}
          >
            <Text>{this.state.loggedInText}</Text>
            <GiftedChat
              renderBubble={this.renderBubble.bind(this)}
              messages={this.state.messages}
              onSend={messages => this.onSend(messages)}
              user={this.state.user}
            />
            {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
          </View>
        );
    }
}


