import React, { Component } from 'react';
import { StyleSheet, ScrollView, View, Text, Linking, SafeAreaView } from 'react-native';
import Meteor, { withTracker, useTracker } from '@ajaybhatia/react-native-meteor';
import { List, ListItem, Icon } from 'react-native-elements'

import { initializeMeteorOffline } from './react-native-meteor-offline';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';

Meteor.connect('ws://localhost:3000/websocket');
//initializeMeteorOffline({ log: true });

const data = [
  {
    title: 'Meteor',
    url: 'https://www.meteor.com',
  },
  {
    title: 'Learn React Native + Meteor',
    url: 'http://learn.handlebarlabs.com/p/react-native-meteor',
  },
  {
    title: 'React Native',
    url: 'http://facebook.github.io/react-native/',
  }
];

class RNDemo extends Component {

  constructor(props) {
    super(props);
    this.listRef = React.
      createRef();
    this.state = {
      linksGenerated: []
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.links !== undefined && nextProps.links.length > 0) {
      return AsyncStorage.setItem('links', JSON.stringify(nextProps.links))
    }
    else return null
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.links !== this.props.links) {
      this.GetAsyncStorageData()
    }
  }
  addItem = () => {
    const item = data[Math.floor(Math.random() * data.length)];
    Meteor.call('links.insert', item.title, item.url, (error) => {
      if (error) {
        console.log('Insert error', error.error);
      }
    });
  };

  pressItem = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        }
      })
      .catch((err) => console.log('Linking error: ', err));
  };
  GetAsyncStorageData = async () => {
    const Saved = await AsyncStorage.getItem('links');
    if (Saved != null) {
      this.setState({
        linksGenerated: JSON.parse(Saved)
      })
    }
  }
  getAllItems = (status, links) => {
    console.log(status, "status")
    return (
      <View style={{ backgroundColor: '#f8f8f8' }}>
        <ListItem
          title="Connection Status"
          rightTitle={status.status}
          hideChevron
          rightTitleStyle = {{width : '130%'}}
        />
        {links.map((link) => {
          return (
            <ListItem
              key={link._id}
              title={link.title}
              subtitle={link.url}
              onPress={() => this.pressItem(link.url)}
            />
          );
        })}
        <Icon
          raised
          name='plus'
          type='font-awesome'
          color='#00aced'
          containerStyle={{ position: 'absolute', bottom: 30, right: 20 }}
          disabled
          onPress={() => this.addItem()}
        />

        <Text>Open up App.js to start working on your app!</Text>
      </View>
    )
  }

  render() {
    console.log(this.state, "this.state")
    const { linksGenerated } = this.state
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView >
          {this.props.links ? this.getAllItems(this.props.status, linksGenerated) : <Text>NOT READY</Text>}
        </ScrollView>
      </SafeAreaView>
    );
    //}
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default withTracker(params => {

  const linksHandle = Meteor.subscribe('links');
  const loading = !linksHandle.ready();
  const linksExists = !loading;

  return {
    linksExists,
    links: Meteor.collection('links').find({}, { sort: { createdAt: -1 } }),
    status: Meteor.status(),
    //docs: GroundedMeteor.collection('links', 'getUsersById').find({}),
  };
})(RNDemo);