import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, Text, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native'; 
import DateTimePicker from "@react-native-community/datetimepicker";
import { Formik } from 'formik';
import { Fontisto } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import {AuthContext} from '../../../contexts/authContext';
import DropDownPicker from 'react-native-dropdown-picker';
import ModalDropdown from 'react-native-modal-dropdown';
import NumericInput from 'react-native-numeric-input';



async function postScreenshot({token, location, description, date, taskId, deviceId, duration, status}) {
  try {
    const endTime = new Date(date);
    endTime.setHours(duration.durationHr);
    endTime.setMinutes(duration.durationMin);
    
    let response = await fetch("https://si-2021.167.99.244.168.nip.io/api/UserTasks/" + taskId, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({deviceId: deviceId,
        startTime: date,
        endTime: endTime,
        location: location,
        description: description,
        statusId: status})
    });
    var json = await response.json();
  } catch (error) {
    console.error(error);
  }
};


export default function EditTask({route, navigation}) {
  // let tempTime = new Date(Date.parse(route.params.task.endTime) - (Date.parse(route.params.task.startTime))); 
  const [date, setDate] = useState(new Date(route.params.task.startTime));
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  // const [durationHr, setDurationHr] = useState(new Date(route.params.task.endTime).getHours());
  const [durationHr, setDurationHr] = useState(new Date(route.params.task.endTime).getHours());
  const [durationMin, setDurationMin] = useState(new Date(route.params.task.endTime).getMinutes());
  const [deviceSelected, setDeviceSelected] = useState(true);
  const [devices, setDevices] = useState([]);
  const [device, setDevice] = useState(route.params.task.device);
  const [devicesName, setDevicesName] = useState([]);
  const [locationName, setLocationName] = useState("");
  var {getSavedToken} = React.useContext(AuthContext);
  let deviceArray = ['No device selected'];
  let statusArray = ["Not started", "In progress", "On hold", "Done"];

  useEffect(()=>{
    async function getData(getSavedToken){
        try {
            const token = await getSavedToken();
            const response = await fetch("https://si-2021.167.99.244.168.nip.io/api/device/AllDevices", {
                method: 'GET',
                headers: {"Authorization" : "Bearer " + token},
              });
              var data = await response.json();
              var data = data.data;
              for(let device of data) {
                deviceArray.push(device.name);
              }
              setDevices(data);
              setDevicesName(deviceArray);
        } catch (error) {
            console.error(error);
        }
    }
    getData(getSavedToken);
    if (route.params.task.deviceId) {
      setLocationName(route.params.task.device.location);
    } else {
      setDeviceSelected(false)
      setLocationName(route.params.task.location);
    }
  }, []);
  

  const {task} = route.params;
  
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const onSelectDropDown2 = (index) => {
      task.statusId = index + 1;
  };

  const onSelectDropDown = (index) => {
    if(index == 0) {
      setDeviceSelected(false);
    }
    else {
      setDeviceSelected(true);
      setDevice(devices[index-1]);
      setLocationName(devices[index-1].location)
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
      <View style={styles.container}>
        <Formik
          initialValues={{ description: task.description}}
        >
          {props => (
            <View>
              <ModalDropdown
                style={styles.input}
                dropdownStyle={styles.dropdown}
                options={devicesName}
                onSelect = {onSelectDropDown}
                defaultValue = { device ? device.name : "Pick device..."  }
                textStyle = {{fontSize: 16, color:"#aaa"}}
                />

              <TextInput
                style={styles.input}
                multiline
                placeholder='Location...'
                onChangeText={text => setLocationName(text)}
                value={locationName}
                editable={!deviceSelected}  
              />

              <TextInput
                style={styles.input2}
                multiline
                placeholder='Description...'
                onChangeText={props.handleChange('description')}
                value={props.values.description}
              />

              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>  
                <View style={styles.conainerIcon}>
                  <Text style={styles.text}>Select date: </Text>
                  <Fontisto name="date" onPress={showDatepicker} size={24} color="black" />
                </View>
                <View style={styles.conainerIcon}>
                  <Text style={styles.text}>Select time: </Text>
                  <Ionicons name="ios-time-outline" onPress={showTimepicker} size={24} color="black" />
                </View>
              </View>
              <View style={{marginBottom: 10}}>
              <Text style={styles.text}>Set duration: </Text>
                    <View style={styles.labels}>
                    <Text style={styles.text2}>HOUR: </Text>
                    <NumericInput 
                              value={durationHr} 
                              onChange={value => setDurationHr(value)} 
                              totalWidth={140} 
                              totalHeight={35} 
                              iconSize={25}
                              step={1}
                              maxValue={24}
                              minValue={0}
                              valueType='real'
                              rounded 
                              textColor='#0D47A1' 
                              iconStyle={{ color: 'white' }} 
                              rightButtonBackgroundColor='#0074e8' 
                              leftButtonBackgroundColor='#0074e8'/>
                    </View>
                        <View style={styles.labels}>
                        <Text style={styles.text2}>MINUTES: </Text>
                    <NumericInput 
                              value={durationMin} 
                              onChange={value => setDurationMin(value)} 
                              totalWidth={140} 
                              totalHeight={35} 
                              iconSize={25}
                              step={5}
                              maxValue={60}
                              minValue={0}
                              valueType='real'
                              rounded 
                              textColor='#0D47A1' 
                              iconStyle={{ color: 'white' }} 
                              rightButtonBackgroundColor='#0074e8' 
                              leftButtonBackgroundColor='#0074e8'/>
                          </View>
              </View>
              <View style={{marginBottom: 20}}>
                <Text style={styles.text}>Select status: </Text>
                <ModalDropdown
                options={statusArray}
                onSelect = {onSelectDropDown2}
                defaultValue = { "Pick status..." }/>
              </View>
                  {show && (
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={date}
                      mode={mode}
                      is24Hour={true}
                      display="default"
                      onChange={onChange}
                      minimumDate={new Date()}
                    />
                  )}
                  
              <Button title="Save"  onPress={
                async () => {
                  let token = await getSavedToken();
                  deviceSelected ?
                  await postScreenshot({token, description: props.values.description, location: null, date, taskId: task.taskId, deviceId: device.deviceId, duration: {durationHr, durationMin}, status: task.statusId})
                  : await postScreenshot({token, description: props.values.description, location: locationName, date, taskId: task.taskId, deviceId: null, duration: {durationHr, durationMin}, status: task.statusId})
                  navigation.popToTop()
              }} />
             
              
            </View>
            
          )}
        </Formik>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  input: {
    width: 200,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
    marginTop: 10,
    fontSize: 16
  },
  input2: {
    width: 250,
    height: 130,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
    marginTop: 10,
    textAlignVertical: 'top',
    fontSize: 16
  },
  conainerIcon: {
    flexDirection: "row",
    marginVertical: 15,
  },
  text: {
    fontSize: 16
  },
  labels: {
    flexDirection: 'row',
    alignItems:'center',
    marginVertical: 4,
    justifyContent: 'space-between'
  },
});