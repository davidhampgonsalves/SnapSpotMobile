/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var bgGeo = require('react-native-background-geolocation');
var ActivityView = require('react-native-activity-view');
var uuid = require("uuid");

var API_HOST = 'http://192.241.229.86:9000';
var STATES = {
  starting: 'STARTING',
  started: 'STARTED',
  stopped: 'STOPPED',
};

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
} = React;

var SnapSpotMobile = React.createClass({
  getInitialState: function() {
    bgGeo.configure({
      desiredAccuracy: 0,
      stationaryRadius: 50,
      distanceFilter: 50,
      disableElasticity: false, // <-- [iOS] Default is 'false'.  Set true to disable speed-based distanceFilter elasticity
      locationUpdateInterval: 5000,
      minimumActivityRecognitionConfidence: 80,   // 0-100%.  Minimum activity-confidence for a state-change 
      fastestLocationUpdateInterval: 5000,
      activityRecognitionInterval: 10000,
      stopTimeout: 0,
      activityType: 'AutomotiveNavigation',

      // Application config
      debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
      forceReloadOnLocationChange: false,  // <-- [Android] If the user closes the app **while location-tracking is started** , reboot app when a new location is recorded (WARNING: possibly distruptive to user) 
      forceReloadOnMotionChange: false,    // <-- [Android] If the user closes the app **while location-tracking is started** , reboot app when device changes stationary-state (stationary->moving or vice-versa) --WARNING: possibly distruptive to user) 
      forceReloadOnGeofence: false,        // <-- [Android] If the user closes the app **while location-tracking is started** , reboot app when a geofence crossing occurs --WARNING: possibly distruptive to user) 
      stopOnTerminate: false,              // <-- [Android] Allow the background-service to run headless when user closes the app.
      startOnBoot: false,                   // <-- [Android] Auto start background-service in headless mode when device is powered-up.

      // HTTP / SQLite config
      maxDaysToPersist: 0,    // <-- Maximum days to persist a location in plugin's SQLite database when HTTP fails
    });

    // This handler fires whenever bgGeo receives a location update.
    bgGeo.on('location', (location) => {
      console.log('- [js]location: ', JSON.stringify(location));

      //TODO: handle trip not created an queue position 

      var url = API_HOST + "v1/trip/" + this.state.id + "position/" + this.state.id;
      var params = {
        'secret': this.state.secret,
        'lat': location.coords.latitude,
        'lon': location.coords.longitude,
      };

      fetch(url, {method: "POST", body: JSON.stringify(params)})
        .then((resp) => resp.json())
        .then((resp) => {
          console.log(resp);
        })
        .catch((error) => {
          console.warn(error);
        });
      
      //todo; where can I put this that doesn't cause infinate loop
      //wipe sql cach on each location 
      // bgGeo.sync(function(locations, taskId) {
      //   console.log('delete sql database locations: ', locations);
      //   bgGeo.finish(taskId);
      // });
    });

    return {state: STATES.stopped};
  },

  _shareTrip() {
    this.setState({tripState: STATES.starting});

    // TODO: only start if user shared after this is committed: https://github.com/naoufal/react-native-activity-view/pull/21
    ActivityView.show({
      text: 'ActivityView for React Native',
      url: 'https://github.com/naoufal/react-native-activity-view',
      imageUrl: 'https://facebook.github.io/react/img/logo_og.png'
    });

    var id = uuid.v4();
    var url = API_HOST + "/v1/trip/" + id;
    fetch(url, {method: "POST", body: JSON.stringify({remaining-minutes: 30})})
      .then((response) => response.json())
      .then((resp) => {
        this.setState({
          id: id,
          secret: resp.secret,
          state: STATES.started,
        });
      }).catch((error) => {
        console.warn(error);
      });
    bgGeo.start(function() { console.log('- [js] bgGeo started successfully'); });
  },

  _endTrip() {
    this.setState({
      state: STATES.stopped,
      secret: null,
      id: null,
    });

    bgGeo.stop();
  },

  render() {
    return (
      <View style={styles.viewMain}>
        <View style={styles.slider}>
          <Text> This would be the time slider and counter </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableHighlight onPress={this._endTrip} style={styles.btn}>
            <Text style={styles.txt}>End Trip</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this._shareTrip} style={styles.btn}>
            <Text style={styles.txt}>
              {this.state.state !== STATES.stopped ? "Re-Share Trip" : "Share Trip" }
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  viewMain: {
    flex:1,
    paddingTop: 30,
  }, txt: {
    textAlign: 'center', 
    color: '#FFF',
    fontSize: 20,
    padding: 30,
  }, slider: {
    flex: 2,
  }, btn: {
    flex: 1,
    backgroundColor: 'blue',
  },
});

AppRegistry.registerComponent('SnapSpotMobile', () => SnapSpotMobile);
