import React, {useState} from 'react';
import {
  View,
  ScrollView,
  TextInput,
  useEffect,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';

import {
  Container,
  Header,
  Content,
  Left,
  Text,
  Button,
  Icon,
  Right,
  CheckBox,
  Title,
  H1,
  Spinner,
  Fab,
} from 'native-base';

import {MaskedTextInput} from 'react-native-mask-text';
const filedata = require('./Master.json');
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalDropdown from 'react-native-modal-dropdown';
import SearchableDropdown from 'react-native-searchable-dropdown';
import DropDownPicker from 'react-native-dropdown-picker';
import MultiSelect from 'react-native-multiple-select';
import TcpSocket from 'react-native-tcp-socket';
import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'UserDatabase.db'});

import {useFocusEffect} from '@react-navigation/native';
const Binding = ({navigation}) => {
  const [asyncloc, setasyncloc] = useState([]);
  const [asyncapp, setasyncapp] = useState([]);
  const [asyncmodel, setasyncmodel] = useState([]);
  const [location, setlocation] = useState([]);
  const [owner, setowner] = useState([]);
  // const [appliance, setappliance] = useState([]);
  const [asyncbind, setasyncbind] = useState([]);
  const [model, setmodel] = useState([]);
  const [ipaddress, setipaddress] = useState('');
  const [macid, setmacid] = useState('');
  const [portnumber, setportnumber] = useState('');
  const [showmodal, setshowmodal] = useState(false);
  const [editmodal, seteditmodal] = useState(false);
  const [selectedloc, setselectedloc] = useState('');
  const [selectedappliance, setselectedappliance] = useState('');
  const [selectedmodel, setselectedmodel] = useState('');
  const [asyncapp1, setasyncapp1] = useState([]);
  const [ssid, setssid] = useState('');
  const [pwd, setpwd] = useState('');
  const [count, setcount] = useState([]);
  const [selmodel, setselmodel] = useState('');

  const [namegen, setnamegen] = useState('');
  const [convname, setconvname] = useState('');
  const [selobj, setselobj] = useState('');

  const locations = selectedItems => {
    setlocation(selectedItems);
    console.log(selectedItems);
  };

  // const appliances = selectedItems => {
  //   setappliance(selectedItems);
  //   console.log(selectedItems);
  // };

  const models = async selectedItems => {
    let selmodel = '';
    console.log(selectedItems);
    setmodel(prev => selectedItems);

    let obj = asyncmodel.find(o => o.Model === selectedItems.toString());
    console.log('obj', obj);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM device_count  where device =?',
        [obj.device_type],
        (tx, results) => {
          var temp = '';

          if (results.rows.length > 0) {
            console.log(results.rows.item(0));
            var instance = results.rows.item(0);
            temp = JSON.parse(instance.count) + 1;
          } else {
            temp = 1;
          }

          console.log('temps', temp);

          var namegeneration = obj.device_type + '_' + temp;

          console.log('namegenerated', namegeneration);

          var send = obj.device_type + ',' + temp;

          setselobj(send);

          setnamegen(prev => namegeneration);
          //setcount(temp.);
        },
        (tx, error) => {
          console.log(error);
        },
      );
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      retrieveData();
    }, [retrieveData]),
  );

  const retrieveData = async () => {
    try {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM Owner_Reg', [], (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));

          let ownerdata_obj = temp;
          console.log(ownerdata_obj[0].owner_name);
          setowner(ownerdata_obj[0]);
        });
      });
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM Location_Reg', [], (tx, results) => {
          var temp = [];
          for (let j = 0; j < results.rows.length; ++j)
            temp.push(results.rows.item(j));
          setasyncloc(temp);
        });
      });
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM Appliance_Reg where binded_unbinded =?',
          ['unbinded'],
          (tx, results) => {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push(results.rows.item(i));
            setasyncapp(temp);
          },
        );
      });
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM Appliance_Reg ', [], (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          setasyncapp1(temp);
        });
      });
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM Binding_Reg', [], (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          setasyncbind(temp);
        });
      });
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM models_list', [], (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            //   let modifiedmodels =
            //     results.rows.item(i).manufacturer +
            //     '-' +
            //     results.rows.item(i).Device_Type +
            //     '-' +
            //     results.rows.item(i).Model;

            //   temp.push({modifiedmodels});

            temp.push(results.rows.item(i));
          setasyncmodel(temp);
        });
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  const handledeletePress = () => {
    console.log(
      'chosen item to delete',
      selectedloc,
      selectedappliance,
      selectedmodel,
    );

    function deletebinding(selectedloc, selectedappliance, selectedmodel) {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM  Binding_Reg where location=? and appliance =? and model =?',
          [selectedloc, selectedappliance, selectedmodel],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              navigation.navigate('DummyScreen', {
                paramKey: 'Binding_delete',
              });
            }
          },
          (tx, error) => {
            console.log('error', error);
          },
        );
      });
      db.transaction(function (tx) {
        console.log('----------------');
        tx.executeSql(
          `UPDATE Appliance_Reg SET binded_unbinded=? where Appliance=?;`,
          ['unbinded', selectedappliance],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              console.log('updated');
            }
          },
          (tx, error) => {
            console.log(error);
          },
        );
      });
    }
    Alert.alert(
      'Are you sure ',
      ' you want  to delete',
      [
        {
          text: 'Ok',
          onPress: () =>
            deletebinding(selectedloc, selectedappliance, selectedmodel),
        },
        {
          text: 'cancel',
          onPress: () => console.log('cancel pressed'),
        },
      ],
      {cancelable: true},
    );
  };

  const handleSubmitPress = async () => {
    let selectedmodel = '';
    // if (location.length == 0) {
    //   alert('Please enter location');
    //   return;
    // }
    // if (appliance.length == 0) {
    //   alert('Please enter appliance');
    //   return;
    // }
    // if (model.length == 0) {
    //   alert('Please enter model');
    //   return;
    // }
    // if (!ipaddress) {
    //   alert('Please enter ipaddress');
    //   return;
    // }
    // if (!portnumber) {
    //   alert('Please enter portnumber');
    //   return;
    // }
    // if (!macid) {
    //   alert('Please enter macid');
    //   return;
    // }

    // let binding = owner.toString() + '_' + location + '_' + appliance;
    // console.log('binding', binding.toString());
    //console.log(convname, namegen);
    var appliance = '';

    if (convname.length > 0) {
      appliance = namegen + '_' + convname;
    } else {
      appliance = namegen;
    }

    console.log('appliance', appliance);
    // console.log(selobj.split(','));

    // console.log(location.toString(), appliance.toString(), model.toString());
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM models_list where Model =?`,
        [model.toString()],
        (tx, results) => {
          var len = results.rows.length;
          if (len > 0) {
            let res = results.rows.item(0);
            selectedmodel = res;
          }
          // console.log('len', len);
        },
        (tx, error) => {
          console.log('error', error);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM Binding_Reg where
        (location=? and appliance =? and model =?)`,
        [
          location.toString().toUpperCase(),
          appliance.toString().toUpperCase(),
          model.toString(),
        ],
        (tx, results) => {
          var len = results.rows.length;

          if (len == 0) {
            storebinding(
              selectedmodel,
              location.toString().toUpperCase(),
              appliance.toString().toUpperCase(),
              model.toString(),
              ipaddress,
              portnumber,
              macid.toUpperCase(),
            );
          } else {
            let res = results.rows.item(0);
            // console.log(res);
            navigation.navigate('DummyScreen', {
              paramKey: 'Binding_samedata',
            });
          }
        },
        (tx, error) => {
          console.log('error', error);
        },
      );
    });
  };

  function storebinding(
    selectedmodel,
    location,
    appliance,
    model,
    ipaddress,
    portnumber,
    macid,
  ) {
    console.log(
      location.toString().toUpperCase(),
      appliance.toString().toUpperCase(),
      model.toString(),
      'unpaired',
      'grey',
      selectedmodel.Properties,
      selectedmodel.Control_function,
      selectedmodel.pin_direction,
      selectedmodel.Valid_States,
      selectedmodel.output,
      selectedmodel.ACS_controller_model,
      selectedmodel.ESP_pin,
      ipaddress,
      portnumber,
      macid,
      'grey',
      'grey',
    );
    db.transaction(function (tx) {
      tx.executeSql(
        `INSERT INTO Binding_Reg (location,appliance,model,paired_unpaired,
        color,properties ,Control_function, pin_direction,Valid_States,output,
        ACS_controller_model,ESP_pin,ipaddress,portnumber,macid,lan ,wan,device_type,actions,unit )
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);  `,
        [
          location.toString().toUpperCase(),
          appliance.toString().toUpperCase(),
          model.toString(),
          'paired',
          'green',
          selectedmodel.Properties,
          selectedmodel.Control_function,
          selectedmodel.pin_direction,
          selectedmodel.Valid_States,
          selectedmodel.output,
          selectedmodel.ACS_controller_model,
          selectedmodel.ESP_pin,
          ipaddress,
          portnumber,
          macid,
          'grey',
          'grey',
          selectedmodel.device_type,
          selectedmodel.actions,
          selectedmodel.unit,
        ],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('DummyScreen', {
              paramKey: 'Binding',
            });
          }
        },
        (tx, error) => {
          console.log('db error', error);
          navigation.navigate('DummyScreen', {
            paramKey: 'Binding_samedata',
          });
        },
      );
    });

    var arr = selobj.split(',');

    db.transaction(function (tx) {
      console.log('----------------');
      tx.executeSql(
        `REPLACE INTO device_count(device, count) VALUES(` +
          JSON.stringify(arr[0].toString()) +
          `,` +
          JSON.stringify(arr[1].toString()) +
          `);`,
        [],
        (tx, results) => {
          console.log('Results', results.rowsAffected);

          // navigation.navigate('DummyScreen', {
          //   paramKey: 'Binding',
          // });
          console.log('updated');
        },
        (tx, error) => {
          console.log('error', error);
        },
      );
    });
    // db.transaction(function (tx) {
    //   console.log('----------------');
    //   tx.executeSql(
    //     `UPDATE Appliance_Reg SET binded_unbinded=? where Appliance=?;`,
    //     ['binded', appliance.toString().toUpperCase()],
    //     (tx, results) => {
    //       console.log('Results', results.rowsAffected);
    //       if (results.rowsAffected > 0) {
    //         // navigation.navigate('DummyScreen', {
    //         //   paramKey: 'Binding',
    //         // });
    //         console.log('updated');
    //       }
    //     },
    //     (tx, error) => {
    //       console.log(error);
    //       // navigation.navigate('DummyScreen', {
    //       //   paramKey: 'Binding_samedata',
    //       // });
    //     },
    //   );
    // });
  }

  async function handlerefresh() {
    let url = 'http://homeautomation.sowcare.net/data';
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('response from webservice ===>', data);
        db.transaction(function (tx) {
          tx.executeSql(
            `DELETE FROM models_list;`,
            [],
            (tx, results) => {
              console.log('Results', results.rowsAffected);

              if (results.rowsAffected > 0) {
                console.log('successfully Deleted ');
              }
            },
            (tx, error) => {
              console.log('error while Deleting models', error);
            },
          );
        });
        data.forEach(function (a, index) {
          //  console.log('a', a['Device Type']);
          //console.log(asyncbind.length);
          // let temp = [];
          // temp.push(a);
          //console.log(temp);
          storemodels(a);
        });
      })
      .catch(error => {
        console.error('error in webservice====>', error);
      });
  }
  function storemodels(info) {
    console.log('-----------------------');
    console.log('MODEL', info.Model);
    console.log('PROP', info.Properties);
    console.log('CONTO', info.Contol_function);
    // console.log('info', info['Valid States']);
    console.log('OUT', info.output);
    console.log('inf MODEL', info.ACS_controller_model);
    console.log('info ESPIN', info.ESP_pin);
    console.log('unit ', info.Unit);
    db.transaction(function (tx) {
      tx.executeSql(
        `INSERT INTO  models_list (
        Model ,Properties ,Control_function ,pin_direction,
              Valid_States ,output ,ACS_controller_model ,ESP_pin,device_type,actions,unit) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
        [
          info.Model,
          info.Properties,
          info.Contol_function,
          info.pin_direction,
          info.Unit,
          info.output,
          info.ACS_controller_model,
          info.ESP_pin,
          info.device_type,
          info.Actions,
          info.Unit,
        ],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('DummyScreen', {
              paramKey: 'Binding',
            });
          }
        },
        (tx, error) => {
          console.log('error while storing models', error);
        },
      );
    });
  }

  function handleeditPress() {
    let selectedmodel = '';
    console.log(
      location.length,
      appliance.length,
      model.length,
      ipaddress.length,
      portnumber.length,
      macid.length,
    );
    if (location.length == 0) {
      alert('Please enter location');
      return;
    }
    if (appliance.length == 0) {
      alert('Please enter appliance');
      return;
    }
    if (model.length == 0) {
      alert('Please enter model');
      return;
    }
    if (ipaddress.length < 13) {
      alert('Please enter ipaddress');
      return;
    }
    if (portnumber.length < 2) {
      alert('Please enter portnumber');
      return;
    }
    if (macid.length < 17) {
      alert('Please enter macid');
      return;
    }

    //console.log(location, appliance, model, ipaddress, portnumber, macid);

    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM models_list where Model =?`,
        [model.toString()],
        (tx, results) => {
          var len = results.rows.length;
          if (len > 0) {
            let res = results.rows.item(0);
            selectedmodel = res;
          }
          // console.log('len', len);
        },
        (tx, error) => {
          console.log('error', error);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM Binding_Reg where
        (location=? and appliance =? and model =?)`,
        [
          location.toString().toUpperCase(),
          appliance.toString().toUpperCase(),
          model.toString().toUpperCase(),
        ],
        (tx, results) => {
          var len = results.rows.length;

          if (len == 0) {
            storebindings(
              selectedmodel,
              location.toString().toUpperCase(),
              appliance.toString().toUpperCase(),
              model.toString().toUpperCase(),
              ipaddress,
              portnumber,

              macid.toUpperCase(),
            );
          } else {
            let res = results.rows.item(0);
            // console.log(res);
            navigation.navigate('DummyScreen', {
              paramKey: 'Binding_samedata',
            });
          }
        },
        (tx, error) => {
          console.log('error', error);
        },
      );
    });
  }

  function storebindings(
    selectedmodel,
    location,
    appliance,
    model,
    ipaddress,
    portnumber,
    ssid,
    pwd,
    macid,
  ) {
    console.log(
      location.toString().toUpperCase(),
      appliance.toString().toUpperCase(),
      model.toString().toUpperCase(),
      selectedmodel.Properties,
      selectedmodel.Control_function,
      selectedmodel.pin_direction,
      selectedmodel.Valid_States,
      selectedmodel.output,
      selectedmodel.ACS_controller_model,
      selectedmodel.ESP_pin,
      ipaddress,
      portnumber,
      macid,
      selectedloc,
      selectedappliance,
      selectedmodel,
    );

    db.transaction(function (tx) {
      tx.executeSql(
        `UPDATE Binding_Reg SET location=?,appliance=?,model=?,
        properties=?,Control_function=?,pin_direction=?,Valid_States=?,output=?,ACS_controller_model=?,ESP_pin=?,ipaddress=?,
        portnumber=?,
        macid=? 
        where  (location=? and appliance =? and model =?);`,
        [
          location.toString().toUpperCase(),
          appliance.toString().toUpperCase(),
          model.toString().toUpperCase(),
          selectedmodel.Properties,
          selectedmodel.Control_function,
          selectedmodel.pin_direction,
          selectedmodel.Valid_States,
          selectedmodel.output,
          selectedmodel.ACS_controller_model,
          selectedmodel.ESP_pin,
          ipaddress,
          portnumber,
          macid,
          selectedloc,
          selectedappliance,
          selectedmodel,
        ],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('DummyScreen', {
              paramKey: 'Binding',
            });
          }
        },
        (tx, error) => {
          console.log('DBV ERROR ', error);
          navigation.navigate('DummyScreen', {
            paramKey: 'Binding_samedata',
          });
        },
      );
    });

    // db.transaction(function (tx) {
    //   console.log('----------------');
    //   tx.executeSql(
    //     `UPDATE Appliance_Reg SET binded_unbinded=? where Appliance=?;`,
    //     ['binded', appliance.toString().toUpperCase()],
    //     (tx, results) => {
    //       console.log('Results', results.rowsAffected);
    //       if (results.rowsAffected > 0) {
    //         // navigation.navigate('DummyScreen', {
    //         //   paramKey: 'Binding',
    //         // });
    //         console.log('updated');
    //       }
    //     },
    //     (tx, error) => {
    //       console.log('DB ERROR ', error);
    //       // navigation.navigate('DummyScreen', {
    //       //   paramKey: 'Binding_samedata',
    //       // });
    //     },
    //   );
    // });
  }

  return (
    <>
      <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: 'orange',
        }}>
        <Button
          transparent
          onPress={() => {
            seteditmodal(!editmodal);
          }}>
          <Icon
            name="edit"
            type="Feather"
            style={{fontSize: 30, color: 'blue'}}
          />
        </Button>
        <Button
          transparent
          // onPress={() => {
          //   seteditmodal(!editmodal);
          //   setselectedloc(item.Location);
          // }}
        >
          <Icon
            name="camera"
            type="Feather"
            style={{fontSize: 30, color: 'green'}}
          />
        </Button>
        <Button transparent onPress={() => handledeletePress()}>
          <Icon name="trash" style={{fontSize: 30, color: 'red'}} />
        </Button>
      </View>
      <View
        style={{
          flex: 10,
          marginTop: 10,
          marginBottom: 65,
          marginLeft: 10,
          marginRight: 10,
          margin: 10,
        }}>
        <TouchableOpacity style={styles.button} onPress={() => handlerefresh()}>
          <Text
            style={[
              styles.textSign,
              {
                color: '#fff',
              },
            ]}>
            Set
          </Text>
        </TouchableOpacity>
        <Modal
          animationType={'slide'}
          transparent={true}
          visible={showmodal}
          onRequestClose={() => {
            console.log('Modal has been closed.');
          }}>
          <View style={styles.modal}>
            <Button
              transparent
              onPress={() => {
                setshowmodal(!showmodal);
              }}>
              <Icon name="close" style={{fontSize: 30, color: '#05375a'}} />
            </Button>
            <Text style={styles.text_footer}>Enter Your Location </Text>
            <View>
              <MultiSelect
                items={asyncloc}
                uniqueKey="Location"
                onSelectedItemsChange={locations}
                selectedItems={location}
                single={true}
                selectText="Pick Locations"
                searchInputPlaceholderText="Search Locations..."
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="Location"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#48d22b"
                submitButtonText="Submit"
              />
            </View>
            {/* <Text style={styles.text_footer}>Enter Your Appliance </Text>
            <View>
              <MultiSelect
                items={asyncapp}
                uniqueKey="Appliance"
                onSelectedItemsChange={appliances}
                selectedItems={appliance}
                single={true}
                selectText="Pick Appliances"
                searchInputPlaceholderText="Search Appliances..."
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="Appliance"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#48d22b"
                submitButtonText="Submit"
              />
            </View> */}
            <Text style={styles.text_footer}>Enter Your Model </Text>
            <View>
              <MultiSelect
                items={asyncmodel}
                uniqueKey="Model"
                onSelectedItemsChange={models}
                selectedItems={model}
                single={true}
                selectText="Pick Models"
                searchInputPlaceholderText="Search Models..."
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="Model"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#48d22b"
                submitButtonText="Submit"
              />
            </View>
            {/*
             *MASK 9==> NUMERIC ,S==>ALPHANUMERIC ,A===>ALPHABET
             */}
            <Text style={styles.text_footer}>{namegen}</Text>

            <View style={styles.action}>
              <TextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                placeholder="Enter your convenience name"
                onChangeText={text => setconvname(text)}
              />
            </View>

            <Text style={styles.text_footer}> MAC Id </Text>
            <View style={styles.action}>
              <MaskedTextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                autoCapitalize="words"
                placeholder="  Enter MAC ID  Ex:-B4:E6:2D:8D:73:C1 "
                mask="SS:SS:SS:SS:SS:SS"
                onChangeText={(text, rawText) => {
                  setmacid(text);
                  // console.log(rawText);
                }}
              />
            </View>
            <Text style={styles.text_footer}> IP Address </Text>
            <View style={styles.action}>
              <MaskedTextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                keyboardType="numeric"
                placeholder=" Enter IP Address Ex:-129.144.5.5"
                mask="999.999.9.9"
                onChangeText={(text, rawText) => {
                  setipaddress(text);
                  // console.log(rawText);
                }}
              />
            </View>
            <Text style={styles.text_footer}> Port Number </Text>
            <View style={styles.action}>
              <MaskedTextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                keyboardType="numeric"
                placeholder=" Enter Port Number Ex: 60"
                mask="9999"
                onChangeText={(text, rawText) => {
                  setportnumber(text);
                  // console.log(rawText);
                }}
              />
            </View>
            {/* <Text style={styles.text_footer}> SSID </Text>
            <View style={styles.action}>
              <TextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                placeholder=" Enter SSID"
                onChangeText={ssid => setssid(ssid)}
              />
            </View>
            <Text style={styles.text_footer}> PASSWORD</Text>
            <View style={styles.action}>
              <TextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                placeholder=" Enter PASSWORD"
                onChangeText={pwd => setpwd(pwd)}
              />
            </View> */}
            <Button style={styles.button} onPress={() => handleSubmitPress()}>
              <Text>Save Binding</Text>
            </Button>
          </View>
        </Modal>
        <Modal
          animationType={'slide'}
          transparent={true}
          visible={editmodal}
          onRequestClose={() => {
            console.log('Modal has been closed.');
          }}>
          <View style={styles.modal}>
            <Button
              transparent
              onPress={() => {
                seteditmodal(!editmodal);
              }}>
              <Icon name="close" style={{fontSize: 30, color: '#05375a'}} />
            </Button>

            <Text style={styles.text_footer}>{selectedloc}</Text>

            <Text style={styles.text_footer}>{selectedappliance} </Text>

            <Text style={styles.text_footer}>{selectedmodel} </Text>
            <Text style={styles.text_footer}> Location </Text>
            <View>
              <MultiSelect
                items={asyncloc}
                uniqueKey="Location"
                onSelectedItemsChange={locations}
                selectedItems={location}
                single={true}
                selectText="Pick Locations"
                searchInputPlaceholderText="Search Locations..."
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="Location"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#48d22b"
                submitButtonText="Submit"
              />
            </View>
            {/* <Text style={styles.text_footer}> Appliance </Text>
            <View>
              <MultiSelect
                items={asyncapp}
                uniqueKey="Appliance"
                onSelectedItemsChange={appliances}
                selectedItems={appliance}
                single={true}
                selectText="Pick Appliances"
                searchInputPlaceholderText="Search Appliances..."
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="Appliance"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#48d22b"
                submitButtonText="Submit"
              />
            </View> */}
            <Text style={styles.text_footer}> Model </Text>
            <View>
              <MultiSelect
                items={asyncmodel}
                uniqueKey="Model"
                onSelectedItemsChange={models}
                selectedItems={model}
                single={true}
                selectText="Pick Models"
                searchInputPlaceholderText="Search Models..."
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="Model"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#48d22b"
                submitButtonText="Submit"
              />
            </View>
            {/*
             *MASK 9==> NUMERIC ,S==>ALPHANUMERIC ,A===>ALPHABET
             */}

            <Text style={styles.text_footer}> MAC Id </Text>
            <View style={styles.action}>
              <MaskedTextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                autoCapitalize="words"
                placeholder="  Enter MAC ID  Ex:-B4:E6:2D:8D:73:C1 "
                mask="SS:SS:SS:SS:SS:SS"
                defaultValue={macid}
                onChangeText={(text, rawText) => {
                  setmacid(text);
                  // console.log(rawText);
                }}
              />
            </View>
            <Text style={styles.text_footer}> IP Address </Text>
            <View style={styles.action}>
              <MaskedTextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                placeholder=" Enter IP Address Ex:-129.144.50.56 "
                mask="999.999.99.99"
                defaultValue={ipaddress}
                onChangeText={(text, rawText) => {
                  setipaddress(text);
                  // console.log(rawText);
                }}
              />
            </View>
            <Text style={styles.text_footer}> Port Number </Text>
            <View style={styles.action}>
              <MaskedTextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                placeholder=" Enter Port Number Ex: 60"
                mask="99"
                defaultValue={portnumber}
                onChangeText={(text, rawText) => {
                  setportnumber(text);
                  // console.log(rawText);
                }}
              />
            </View>
            <Button style={styles.button} onPress={() => handleeditPress()}>
              <Text>Edit Binding</Text>
            </Button>
          </View>
        </Modal>
        {/* <Button style={styles.button} onPress={() => handlerefresh()}>
          <Text>Register App</Text>
        </Button> */}
        <View>
          <Text style={styles.text_footer}>{selectedloc}</Text>
          <Text style={styles.text_footer}>{selectedappliance}</Text>
          <Text style={styles.text_footer}>{selectedmodel}</Text>
        </View>

        <FlatList
          keyExtractor={(item, id) => id}
          data={asyncbind}
          renderItem={({item}) => (
            <View>
              <Button
                style={{alignSelf: 'center'}}
                onPress={() => {
                  setselectedloc(item.location);
                  setselectedappliance(item.appliance);
                  setselectedmodel(item.model);
                  setmacid(item.macid);
                  setportnumber(item.portnumber);
                  setipaddress(item.ipaddress);
                }}>
                <Text>
                  {item.location} -- {item.appliance}
                  {'\n'}
                  {item.model}
                </Text>
              </Button>
            </View>
          )}
          ItemSeparatorComponent={() => {
            return <View style={styles.separatorLine}></View>;
          }}
        />
      </View>
      <View>
        <Fab
          style={{backgroundColor: '#05375a'}}
          position="bottomRight"
          onPress={() => {
            setshowmodal(!showmodal);
          }}>
          <Icon name="add-outline" />
        </Fab>
      </View>
    </>
  );
};

export default Binding;

const styles = StyleSheet.create({
  text_footer: {
    fontWeight: 'bold',
    color: '#05375a',
    fontSize: 18,
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
    borderWidth: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  modal: {
    height: '100%',
    marginTop: 'auto',
    backgroundColor: 'white',
  },
  actionButton: {
    marginLeft: 200,
  },
  text: {
    color: '#3f2949',
    marginTop: 10,
  },
  button: {
    backgroundColor: 'green',
    justifyContent: 'center',
    width: 200,
    alignSelf: 'center',
  },

  separatorLine: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,.3)',
    margin: 3,
  },
});

// let bingo = [{
//   "Device": "fan",
//   "Manafacturer": "Havells"
// }, {
//   "Device": "Ceiling",
//   "Manafacturer": "bajaj"
// }]

// let obj = {
//   "Device": "Ceiling",
//   "Manafacturer": "bajaj"
// }
// const objString = JSON.stringify(obj);
// const val = bingo.find((item) => JSON.stringify(item) === objString);
// console.log(val)
////////////////////////

// let bingo = [{"Device": "fan", "Manafacturer": "Havells"}, {"Device": "Ceiling", "Manafacturer": "bajaj"}];

// let check1 ={"Device": "Ceiling", "Manafacturer": "bajaj"}
// //should return true or {"Device": "Ceiling", "Manafacturer": "bajaj"}

// let check2 ={"Device": "light", "Manafacturer": "bajaj"}
// //should return false or undefined

// function checkObjectExists(main, check) {
//   return JSON.stringify(main).indexOf(JSON.stringify(check)) >= 0;
// }

// console.log( checkObjectExists(bingo, check1) );   //true

// console.log( checkObjectExists(bingo, check2) );  //false

//////////////////
//pair:sahique;hall;fan;Havells_Ceilingfan_Fusion;#
//command:Havells_Ceilingfan_Fusion;speed;mid#
//command:Havells_Wallfan_Fusion;swing;on
/////_eventHandlers

// <View
//   style={{
//     flex: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   }}>
{
  /* <Button
                  onPress={() => handlepairing(item)}
                  style={{
                    backgroundColor: item.color,
                    width: '18%',
                    height: 45,
                  }}>
                  <Icon name="wifi" active />
                </Button> */
}

{
  /* <Button
                  transparent
                  onPress={() => {
                    seteditmodal(!editmodal);
                    setselectedloc(item.location);
                    setselectedappliance(item.appliance);
                    setselectedmodel(item.model);
                    setmacid(item.macid);
                    setportnumber(item.portnumber);
                    setipaddress(item.ipaddress);
                  }}>
                  <Icon
                    name="edit"
                    type="Feather"
                    style={{fontSize: 30, color: 'blue'}}
                  />
                </Button>
                <Button transparent onPress={() => handledeletePress(item)}>
                  <Icon name="trash" style={{fontSize: 30, color: 'red'}} />
                </Button>
              </View> */
}

/////
