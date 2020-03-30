import React from 'react';
import { View, Text, Platform, AsyncStorage, Image } from 'react-native';
// GiftedChat - react native's library with inbuilt features such as text input field,
// speech bubbles, send button
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
// To make the text space visible when typing and adjust the already typed message to display 
// appropriately
import KeyboardSpacer from 'react-native-keyboard-spacer';
import NetInfo from '@react-native-community/netinfo';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';

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
          image: null,
          location: null,
          isConnected: false
        };  

        this.referenceMessageUser = null;
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
        if (isConnected == true) {
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

            // create a reference to the active user's documents (messages)
            this.referenceMessageUser = firebase.firestore().collection("messages");
            // listen for collection changes for current user
            this.unsubscribe = this.referenceMessageUser.orderBy('createdAt','desc').onSnapshot(this.onCollectionUpdate);

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
          user: data.user,
          image: data.image || null,
          location: data.location || null
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
        user: message.user,
        image: message.image || '',
        location: message.location || null
      });
    }

    saveMessages = async() => {
      try {
        await AsyncStorage.setItem('messages',JSON.stringify(this.state.messages));
      } catch (error) {
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

    renderCustomActions = (props) => {
      return <CustomActions {...props} />;
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

    renderCustomView (props) {
      const { currentMessage } = props;
      if (currentMessage.location) {
          return (
              <MapView
                  style={{width: 150,
                  height: 100,
                  borderRadius: 13,
                  margin: 3}}
                  region={{
                      latitude: currentMessage.location.latitude,
                      longitude: currentMessage.location.longitude,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                  }}
              />
          );
      }
      return null;
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
            {this.state.image && 
              <Image source={{uri: this.state.image.uri}} style={{width: 200, height: 200}}/>}
            <GiftedChat
              renderBubble={this.renderBubble.bind(this)}
              renderInputToolbar={this.renderInputToolbar.bind(this)}
              renderCustomView={this.renderCustomView.bind(this)}
              messages={this.state.messages}
              onSend={messages => this.onSend(messages)}
              user={this.state.user}
              renderActions={this.renderCustomActions}
            />
            {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
          </View>
        );
    }
}


