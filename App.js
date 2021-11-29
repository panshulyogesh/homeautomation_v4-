/*
 *    REACT NATIVE  HOME AUTOMATION
 *    ANDROID CLIENT
 *    WRITTEN BY SNEHAL SANTOSH VELANKAR
 *
 */

import React, {useState, useRef, useEffect, useCallback} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';

import {createStackNavigator} from '@react-navigation/stack';

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import FirstPage from './pages/FirstPage';

import SecondPage from './pages/SecondPage';

import datacq from './pages/datacq';

import OwnerRegistration from './pages/OwnerRegistration';

import ApplianceRegistration from './pages/ApplianceRegistration';

import LocationRegistration from './pages/LocationRegistration';

import Binding from './pages/Binding';

import Pairing from './pages/Pairing';

import acqreg from './pages/acqreg';

import ModifyOwner from './pages/ModifyOwner';

import DummyScreen from './pages/DummyScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ReactNativeForegroundService from '@supersami/rn-foreground-service';

import TcpSocket from 'react-native-tcp-socket';

import {DeviceEventEmitter} from 'react-native';

import SendSMS from 'react-native-sms';
import SmsAndroid from 'react-native-get-sms-android';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';

import io from 'socket.io-client';

/////////////////////
//! REACT NATIVE SQLITE DATABASE CONNECTION
//! DATABASE NAME = UserDatabase.db
/////////////////////////
import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'UserDatabase.db'});

function TabStack() {
  return (
    //!  DECLARING CONTROLLER SCREEN

    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'FirstPage') {
            iconName = focused ? 'person' : 'person';
          } else if (route.name === 'datacq') {
            iconName = focused ? 'recording' : 'recording';
          } else if (route.name === 'SecondPage') {
            iconName = focused ? 'settings' : 'settings';
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
      initialRouteName="Controller">
      <Tab.Screen
        name="FirstPage"
        tabBarLabel="controller"
        component={FirstPage}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="datacq"
        tabBarLabel="datacq"
        component={datacq}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="SecondPage"
        tabBarLabel="registration"
        component={SecondPage}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
const App = () => {
  var sms_poll_interval = 10000; // polling for sms in seconds(10secs)

  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  const sendChannel = useRef();
  const {roomID} = '7829890730';
  const [messages, setMessages] = useState([]);

  const onStart = () => {
    // Checking if the task i am going to create already exist and running, which means that the foreground is also running.
    if (ReactNativeForegroundService.is_task_running('taskid')) return;
    // Creating a task.
    ReactNativeForegroundService.add_task(() => tcpsocket(), {
      //delay: 1000000,
      onLoop: false,
      taskId: 'taskid',
      onError: e => console.log(`Error logging:`, e),
    });
    // starting  foreground service.
    return ReactNativeForegroundService.start({
      id: 144,
      title: 'DATA LOGGER IS RUNNING ',
      message: 'you are online!',
    });
  };

  const onStop = () => {
    // Make always sure to remove the task before stoping the service. and instead of re-adding the task you can always update the task.
    if (ReactNativeForegroundService.is_task_running('taskid')) {
      ReactNativeForegroundService.remove_task('taskid');
    }
    // Stoping Foreground service.
    return ReactNativeForegroundService.stop();
  };

  //! As soon as application is installed useeffect is called to create database tables
  useEffect(() => {
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='data_logger'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS data_logger', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS data_logger(date_time TEXT, logID TEXT,
               logType TEXT, project TEXT, location TEXT, position TEXT, longitude TEXT, latitude TEXT, parammOut TEXT,
                value TEXT, unit TEXT)`,
              [],
            );
            console.log(' created data logger table');
          }
        },
      );
    });

    //!  owner ref table is for registering owner
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Owner_Reg'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Owner_Reg', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS Owner_Reg(
              Id INTEGER PRIMARY KEY AUTOINCREMENT,
              owner_name TEXT,
              owner_password TEXT,
              MailId TEXT,
              PhoneNumber INT(15),
              Property_name TEXT, 
              Area TEXT,
              State TEXT,
              pincode TEXT,
              Street TEXT,
              Door_Number  TEXT,router_ssid TEXT,router_password TEXT,DAQ_STACTIC_IP TEXT, DAQ_STACTIC_Port TEXT,lan_ip TEXT,gatewayphno TEXT,
              wan_ip TEXT,wan_port TEXT,turn_server_ip TEXT,turn_server_port TEXT,turn_url TEXT,signalling_server_ip TEXT,signalling_server_port
              TEXT,signalling_server_url TEXT,dds_url TEXT,dds_port TEXT  )`,
              [],
            );
          }
        },
      );
    });

    //! location registration table for registering locations like hall , kitchen ,bedroom etc
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Location_Reg'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Location_Reg', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS Location_Reg(Location TEXT PRIMARY KEY,images TEXT)`,
              [],
            );
          }
        },
        function (tx, res) {
          console.log(error);
        },
      );
    });
    //! Appliance reg table for registering appliance like tv,fan,ac, light etc....
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Appliance_Reg'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Appliance_Reg', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS Appliance_Reg(Appliance TEXT PRIMARY KEY,binded_unbinded TEXT)`,
              [],
            );
          }
        },
      );
    });

    //column name = LOC, APPLIANCE,MODEL,PAIRED/UNPAIRED,>> IF PAIRED MACID,PROPERTIES,status
    //binding str=owner+loc+appli+model;

    //! Binding reg table is for binding each location , appliance with their specific models,properties,ip addresses etc
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Binding_Reg'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Binding_Reg', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS Binding_Reg(location TEXT,
              appliance TEXT, model TEXT,paired_unpaired TEXT,
              ipaddress TEXT,macid TEXT,portnumber TEXT,device_type TEXT,actions TEXT,
              properties TEXT,Control_function TEXT,pin_direction TEXT,Valid_States TEXT,output TEXT,lan TEXT,wan TEXT,
              ACS_controller_model TEXT,ESP_pin TEXT,status TEXT,color TEXT,unit TEXT,driver TEXT)`,
              [],
            );
          }
        },
      );
    });

    //!  models list table is to store appliance models properties which is a global reserve and is captured from a serveer
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='models_list'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS models_list', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS models_list(Model TEXT,device_type TEXT ,Properties TEXT,Control_function TEXT,pin_direction TEXT,
              Valid_States TEXT,output TEXT,ACS_controller_model TEXT,ESP_pin TEXT,actions TEXT,Unit TEXT,driver TEXT )`,
              [],
            );
          }
        },
      );
    });

    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Data_Acquisition '",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Data_Acquisition', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS Data_Acquisition(coordinates TEXT ,timestamp TEXT,bindingid TEXT,value TEXT)`,
              [],
            );
          }
        },
      );
    });
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Data_Acq_master'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Data_Acq_master', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS Data_Acq_master(daqip TEXT ,daqport TEXT,wifi_ssid TEXT,wifi_pwd TEXT)`,
              [],
            );
          }
        },
      );
    });
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='device_count'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS device_count', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS device_count(device TEXT PRIMARY KEY  ,count TEXT)`,
              [],
            );
          }
        },
      );
    });

    onStart();

    let subscription = DeviceEventEmitter.addListener(
      'notificationClickHandle',
      function (e) {
        console.log('Clicked on Foreground Service', e);
      },
    );
    return function cleanup() {
      subscription.remove();
    };
  }, []);

  //http://192.168.1.101:8085/26/$NETWORK/LAN;abcdefgh;123456;%
  // http://192.168.1.101:8085/$NETWORK/LAN;abcdefgh;123456;%

  function tcpsocket() {
    let server = TcpSocket.createServer(function (socket) {
      socket.on('data', data => {
        let str = data.toString();
        //  console.log('data fromm browseer', str);

        let data_obtained = '';
        let add_flag = 0;

        for (let i = 0; i < str.length; i++) {
          if (str[i] == '%') {
            add_flag = 0;
          }
          if (add_flag == 1) {
            data_obtained = data_obtained + str[i];
          }
          if (str[i] == '$') {
            add_flag = 1;
          }
        }
        console.log('data_obtained', data_obtained);

        let arr_split1 = data_obtained.split(';');
        let arr_split2 = arr_split1[1].split('|');
        console.log(arr_split1);
        console.log(arr_split2);
        storeindb(arr_split1, arr_split2);

        // let s = '';
        // arr_split1.forEach(element => {
        //   storeindb(element.split('|'));
        // });
      });
      socket.on('error', error => {
        console.log('An error ocurred with client socket ', error);
      });

      socket.on('close', error => {
        console.log('Closed connection with ', socket.address());
      });
    });

    server.listen({port: 9000, host: '192.168.0.4'}, () =>
      console.log('server is running on port 9000'),
    );
    server.on('error', error => {
      console.log('An error ocurred with the server', error);
    });

    server.on('close', () => {
      console.log('Server closed connection');
    });

    setInterval(getSMS, sms_poll_interval);

    socketRef.current = io.connect('http://10.0.2.16:8000');
    socketRef.current.emit('join room', roomID); // Provide Room ID here

    socketRef.current.on('other user', userID => {
      callUser(userID);
      otherUser.current = userID;
    });

    socketRef.current.on('user joined', userID => {
      otherUser.current = userID;
    });

    socketRef.current.on('offer', handleOffer);

    socketRef.current.on('answer', handleAnswer);

    socketRef.current.on('ice-candidate', handleNewICECandidateMsg);
  }

  function getSMS() {
    // delay =  get current time - interval
    //read all msgs which  are recieved greater than delay

    let filter = {
      box: 'inbox', // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all
      // the next 4 filters should NOT be used together, they are OR-ed so pick one
      read: 0, // 0 for unread SMS, 1 for SMS already read
      address: '+917829890730', // sender's phone number
      //body: 'home_automation_command', // content to match
      // the next 2 filters can be used for pagination
      indexFrom: 0, // start from index 0
      maxCount: 10, // count of SMS to return each time
    };
    SmsAndroid.list(
      JSON.stringify(filter),
      fail => {
        console.log('Failed with this error: ' + fail);
      },
      (count, smsList) => {
        //  console.log('Count: ', count);
        console.log('List: ', smsList);
        var arr = JSON.parse(smsList);

        arr.forEach(function (object) {
          // console.log('Object: ' + object);
          // console.log('-->' + object.date);
          // console.log('-->' + object.body);

          if (object.address == '+917829890730') {
            console.log('correct  validation');
            console.log('message -->' + object.body);
            let url =
              'http://' +
              '172.16.11.249' +
              ':' +
              '8085' +
              '/$' +
              object.body.toString() +
              '%';
            // 'http://172.16.9.146:8085/$84:0D:8E:1B:CD:20/SET/PANSHUL;84:0d:8e:1b:cd:20/0-0;GPIO0;%';
            console.log('url ==> ', url);
            fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'text/html',
              },
            })
              .then(response => {
                response.json();
                console.log(response.json());
              })
              .then(data => {
                console.log('data', data);
                let str = data.toString();
                //  console.log('data fromm browseer', str);

                let data_obtained = '';
                let add_flag = 0;

                for (let i = 0; i < str.length; i++) {
                  if (str[i] == '%') {
                    add_flag = 0;
                  }
                  if (add_flag == 1) {
                    data_obtained = data_obtained + str[i];
                  }
                  if (str[i] == '$') {
                    add_flag = 1;
                  }
                }
                console.log('data_obtained', data_obtained);
                let arr_split1 = data_obtained.split(':');

                // SendSMS.send(
                //   {
                //     body: data.toString(),
                //     recipients: [split[3]],
                //     successTypes: ['sent', 'queued'],
                //     allowAndroidSendWithoutReadPermission: true,
                //   },
                //   (completed, cancelled, error) => {
                //     if (completed) {
                //       console.log('SMS Sent Completed');
                //     } else if (cancelled) {
                //       console.log('SMS Sent Cancelled');
                //     } else if (error) {
                //       console.log('Some error occured');
                //     }
                //   },
                // );
              });
          }
          //alert('your message with selected id is --->' + object.body);
        });
      },
    );
  }

  function storeindb(params1, params2) {
    console.log('--------------------');
    console.log('macid', params1[0]);
    console.log('data', params2);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Binding_Reg where (macid = ?)',
        [params1[0]],
        (tx, results) => {
          // var temp = [];
          // for (let i = 0; i < results.rows.length; ++i)
          //   temp.push(results.rows.item(i));
          console.log('results', results);
          console.log('len', temp.length);
          console.log(results.rows.item(0));

          if (results.rows.item(0).pin_direction == 'in') {
            console.log('DATA TO BE STOREDD');
            for (let i = 0; i < params2.length - 1; i++) {
              logdata(results.rows.item(0), params2[i]);
            }
          }
        },
        (tx, err) => {
          console.log('err', err);
        },
      );
    });
  }

  function logdata(params1, params3) {
    console.log('-------------logdata');
    console.log(params1);
    console.log(params3);
    var today = new Date();
    var date =
      today.getFullYear() +
      '-' +
      (today.getMonth() + 1) +
      '-' +
      today.getDate();
    var date1 = today.getFullYear() + (today.getMonth() + 1) + today.getDate();
    var time =
      today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    var dateTime = date + ' ' + time;
    console.log('datetime', dateTime);

    db.transaction(function (tx) {
      tx.executeSql(
        `INSERT INTO data_logger (date_time, location, longitude,
         latitude, value, unit ) SELECT ?,?,?,?,?,?,?,?,?,?,?`,
        [
          datetime,
          'logid',
          params1.location,
          'long',
          'lat',
          params3,
          params1.unit,
        ],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            console.log('success in storing data');
          } else console.log('failed');
        },
        (tx, error) => {
          console.log('error', error);
        },
      );
    });
  }

  function callUser(userID) {
    // This will initiate the call
    console.log('[INFO] Initiated a call');
    peerRef.current = Peer(userID);
    sendChannel.current = peerRef.current.createDataChannel('sendChannel');

    // listen to incoming messages
    sendChannel.current.onmessage = handleReceiveMessage;
  }

  function Peer(userID) {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.stunprotocol.org',
        },
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com',
        },
      ],
    });

    peer.onicecandidate = handleICECandidateEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

    return peer;
  }

  function handleNegotiationNeededEvent(userID) {
    // Make Offer
    peerRef.current
      .createOffer()
      .then(offer => {
        return peerRef.current.setLocalDescription(offer);
      })
      .then(() => {
        const payload = {
          target: userID,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit('offer', payload);
      })
      .catch(err =>
        console.log('Error handling negotiation needed event', err),
      );
  }

  function handleOffer(incoming) {
    // Handle Offer made by the initiating peer
    console.log('[INFO] Handling Offer');
    peerRef.current = Peer();
    peerRef.current.ondatachannel = event => {
      sendChannel.current = event.channel;
      sendChannel.current.onmessage = handleReceiveMessage;
      console.log('[SUCCESS] Connection established');
    };

    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current
      .setRemoteDescription(desc)
      .then(() => {})
      .then(() => {
        return peerRef.current.createAnswer();
      })
      .then(answer => {
        return peerRef.current.setLocalDescription(answer);
      })
      .then(() => {
        const payload = {
          target: incoming.caller,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit('answer', payload);
      });
  }

  function handleAnswer(message) {
    // Handle answer by the remote peer
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current
      .setRemoteDescription(desc)
      .catch(e => console.log('Error handle answer', e));
  }

  function handleReceiveMessage(e) {
    console.log('[INFO] Message received from peer', e.data);
    const msg = [
      {
        _id: Math.random(1000).toString(),
        text: e.data,
        createdAt: new Date(),
        user: {
          _id: 2,
        },
      },
    ];
    //setMessages(previousMessages => GiftedChat.append(previousMessages, msg));
    // setMessages(messages => [...messages, {yours: false, value: e.data}]);
  }

  function handleICECandidateEvent(e) {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      socketRef.current.emit('ice-candidate', payload);
    }
  }

  function handleNewICECandidateMsg(incoming) {
    const candidate = new RTCIceCandidate(incoming);

    peerRef.current.addIceCandidate(candidate).catch(e => console.log(e));
  }

  function sendMessage(messages = []) {
    console.log(messages);
    sendChannel.current.send(messages[0].text);
    // setMessages(previousMessages =>
    //   GiftedChat.append(previousMessages, messages),
    // );
  }

  return (
    <NavigationContainer>
      <Image source={require('./logo.png')} />
      <Stack.Navigator
        initialRouteName="Controller"
        screenOptions={{
          headerStyle: {backgroundColor: `#008080`},
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: 'bold'},
        }}>
        <Stack.Screen
          name="TabStack"
          component={TabStack}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="OwnerRegistration"
          component={OwnerRegistration}
          options={{
            tabBarLabel: 'Owner Registration',
          }}
        />

        <Stack.Screen
          name="ModifyOwner"
          component={ModifyOwner}
          options={{
            tabBarLabel: ' Edit Owner Registration',
          }}
        />
        <Stack.Screen
          name="DummyScreen"
          component={DummyScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ApplianceRegistration"
          component={ApplianceRegistration}
          options={{
            tabBarLabel: 'Appliance Registration',
          }}
        />

        <Stack.Screen
          name="LocationRegistration"
          component={LocationRegistration}
          options={{
            tabBarLabel: 'Location Registration',
          }}
        />

        <Stack.Screen
          name="Binding"
          component={Binding}
          options={{
            tabBarLabel: 'Binding',
          }}
        />
        <Stack.Screen
          name="Pairing"
          component={Pairing}
          options={{
            tabBarLabel: 'Pairing',
          }}
        />

        <Stack.Screen
          name="acqreg"
          component={acqreg}
          options={{
            tabBarLabel: 'acqreg',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default App;
