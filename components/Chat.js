import React from 'react';
import { View, Text, Platform, AsyncStorage, Image } from 'react-native';
/** 
 * @description 
 * GiftedChat - react native's library with inbuilt features such as text input field,
 * speech bubbles, send button
 */
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
/**  
 * @description 
 * KeyboardSpacer - To make the text space visible when typing and adjust the already typed message to display 
 * appropriately on the adroid devices
 */
import KeyboardSpacer from 'react-native-keyboard-spacer';
import NetInfo from '@react-native-community/netinfo';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';

const firebase = require('firebase');
require('firebase/firestore');

/**
 * @class Chat screen invoked from Start screen.
 */
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

  /**  
   * @description
   * Receive name & color as parameter from 'Start' screen.
   * @function navigationOptions - static function
   * @param {string} navigation
   * @returns {string} - user name & background color.
   */ 
    static navigationOptions = ({ navigation }) => {
      return {
        title: navigation.state.params.name
      };
    };

  /**
   * @function getMessages
   * @returns Parsed messages from local storage, stored using AsyncStorage when the app is offline.
   * @description
   * AsyncStorage to save and get messages locally when the app is offline.
   * async() always returns Promise and require await where Promise is returned 
   */
    getMessages = async() => {
      //await operator to work with promises easier, it waits until asyncStorage promise settles
      let messages = '';
      try {
        messages = await AsyncStorage.getItem('messages') || [];
        this.setState({
          messages: JSON.parse(messages)
        });
      } catch(error) {
        console.log(error.message);
      }
    }

  /**  
   * @referenceMessageUser create a reference to the active user's documents (messages)
   * @unsubscribe listen for collection changes for current user and fires onSnapshot() - listener, thru which 
   * onCollectionUpdate is called to pull the documents from 'messages' collection to update in in this state's 
   * messages in order to render them.
   * @description NetInfo to know if the internet connection is available thru isConnected property.
   */ 
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

 /** 
  * @description 
  * forEach - Go through each document
  * doc -  Get the QueryDocumentSnapshot's data
  */
    onCollectionUpdate = (querySnapshot) => {
      const messages = [];
      // go through each document
      querySnapshot.forEach((doc) => {
        // get the QueryDocumentSnapshot's data
        let data = doc.data();
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

 /**
  * @description User name default to 'Zchat', when the user navigates into the Chat screen without user name.
  */
    setUser = (_id, name='Zchat') => {
      this.setState({
        user: {
          _id: _id,
          name: name,
          // avatar: 'https://placeimg.com/140/140/tech',
          avatar: `https://ui-avatars.com/api/?background=fc466b&color=ffffff&rounded=true&name=${name}`,
        },
        uid: _id
      })
    }

 /**
  * @description To add new message to the 'messages' collection in the firebase database.
  */
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

  /**
   * @function saveMessages
   * @description To store new message to the locally thru AsyncStorage when the app is offline.
   */
    saveMessages = async() => {
      try {
        await AsyncStorage.setItem('messages',JSON.stringify(this.state.messages));
      } catch (error) {
        console.log(error.message);
      }
    }

  /**
    * @function deleteMessages
    * @description To delete message from the local storage.
    */
    deleteMessages = async() => {
      try {
        await AsyncStorage.removeItem('messsages');
      } catch (error) {
        console.log(error.message);
      }
    }

  /**
   * @param {object} messages - user keyed-in messages to append to this state and show all the messages on the app display
   */
    onSend(messages = []) {
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
        this.saveMessages();
      })
    }

  /** 
   * @description Stop listening to authentication & Stop listening for changes
   */
    componentWillUnmount() {
      // this.unsubscribe();
      // stop listening to authentication
      this.authUnsubscribe();
      // stop listening for changes
      this.unsubscribe();
    }

  /**
   * @param {*} props - ...props - refers to inheriting props from Bubble
   */
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

  /**
   * @function renderCustomActions
   * @param {props} - props
   * @description onActionPress '+' to render the options to pick an image, take a photo or get their location.
   * @returns ...props
   */ 
    renderCustomActions = (props) => {
      return <CustomActions {...props} />;
    }

  /**
   * @function renderInputToolbar
   * @param {props} - props
   * @returns ...props
   */ 
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

  /**
   * @function renderCustomView
   * @param {props} - props
   * @returns MapView
   */ 
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


