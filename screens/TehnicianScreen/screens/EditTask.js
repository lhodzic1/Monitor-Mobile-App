import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, Text, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native'; 
import DateTimePicker from "@react-native-community/datetimepicker";
import { Formik } from 'formik';
import { Fontisto } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import {AuthContext} from '../../../contexts/authContext';
import DropDownPicker from 'react-native-dropdown-picker';
import ModalDropdown from 'react-native-modal-dropdown';



async function postScreenshot({token, location, description, date, taskId, status}) {
  try {
    console.log("Dosao");
    console.log({location, description, date, taskId});
    let response = await fetch("https://si-2021.167.99.244.168.nip.io/api/UserTasks/" + taskId, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({deviceId: null,
        startTime: date,
        endTime: date,
        location: location,
        description: description,
        statusId: status})
    });
    var json = await response.json();
    console.log(json);
  } catch (error) {
    console.error(error);
  }
};


export default function EditTask({route, navigation}) {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [durationHr, setDurationHr] = useState(0);
  const [durationMin, setDurationMin] = useState(0);
  const [deviceSelected, setDeviceSelected] = useState(false);
  const [devices, setDevices] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [locationArray, setLocationArray] = useState([]);
  var {getSavedToken} = React.useContext(AuthContext);
  let deviceArray = ['No device selected'];
  let statusArray = ["Not started", "In progress", "On hold", "Done"];

  useEffect(()=>{
    async function getData(getSavedToken){
        try {
            const token = await getSavedToken();
            const response = await fetch("https://si-2021.167.99.244.168.nip.io/api/device/AllDevices", {
                method: 'GET',
                headers: {"Authorization" : "Bearer "+ token},
              });
              var data = await response.json();
              var data = data.data;
              let locations = [];
              for(let device of data) {
                deviceArray.push(device.name);
                locations.push(device.location)
              }
              setDevices(deviceArray);
              setLocationArray(locations);
        } catch (error) {
            console.error(error);
        }
    }
    getData(getSavedToken);
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
      console.log(task.statusId);
  };

  const onSelectDropDown = (index) => {
    if(index == 0) {
      setDeviceSelected(false);
    }
    else {
      setDeviceSelected(true);
      setLocationName(locationArray[index]);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
      <View style={styles.container}>
        <Formik
          initialValues={{ location: task.location, description: task.description}}
        >
          {props => (
            <View>
              
            
              <ModalDropdown
                style={styles.input}
                dropdownStyle={styles.dropdown}
                options={devices}
                onSelect = {onSelectDropDown}
                />

              <TextInput
                style={styles.input}
                multiline
                placeholder='Pick device to show location...'
                onChangeText={text => setLocationName(text)}
                value={locationName}
                editable={!deviceSelected}  
              />

              <TextInput
                style={styles.input}
                placeholder='Location'
                onChangeText={props.handleChange('location')}
                value={props.values.location}
                //value={task.location}
              />

              <TextInput
                style={styles.input2}
                multiline
                placeholder='Description...'
                onChangeText={props.handleChange('description')}
                value={props.values.description}
                // value={task.description}
              />


              <View style={styles.conainerIcon}>
                <Text style={styles.text}>Select date: </Text>
                <Fontisto name="date" onPress={showDatepicker} size={24} color="black" />
              </View>
              <View style={styles.conainerIcon}>
                <Text style={styles.text}>Select time: </Text>
                <Ionicons name="ios-time-outline" onPress={showTimepicker} size={24} color="black" />
                </View>
              <View>
                <Text style={styles.text}>Select status: </Text>
                <ModalDropdown
                options={statusArray}
                onSelect = {onSelectDropDown2}/>

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
                  await postScreenshot({token, description: props.values.description, location: props.values.location, date, taskId: task.taskId, status: task.statusId});
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
    marginTop: 20,
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
    height: 150,
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
  }
});