import React, {useEffect, useState} from 'react';
import {Button, FlatList, Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import { Audio } from 'expo-av';
import {SafeAreaView} from "react-native-safe-area-context";
import { FileSystem } from 'react-native-unimodules';

export default function App() {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    async function loadRecordings() {
      const directory = `${FileSystem.cacheDirectory}Audio/`;
      const files = await FileSystem.readDirectoryAsync(directory);
      const recordings = await Promise.all(
          files.map(async (file) => {
            const path = `${directory}${file}`;
            const { sound } = await Audio.Sound.createAsync({ uri: path });
            return { uri: path, sound };
          })
      );
      setRecordings(recordings);
    }
    loadRecordings();
  }, [recording]);

  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording..');
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
  }

  async function playSound(sound) {
    try {
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound', error);
    }
  }

  async function stopSound(sound) {
    try {
      await sound.stopAsync();
    } catch (error) {
      console.log('Error stopping sound', error);
    }
  }

  async function deleteRecording(uri) {
    try {
      await FileSystem.deleteAsync(uri);
      setRecordings((prevRecordings) =>
          prevRecordings.filter((recording) => recording.uri !== uri)
      );
    } catch (error) {
      console.log('Error deleting recording', error);
    }
  }

  const createRecords = ({item}) => {
    return (
        <View style={styles.menuContainerButtons}>
          <Text style={styles.menuTitle}>{item.uri.split('/').pop().substring(0, 20) + "..."}</Text>
          <TouchableOpacity style={styles.menuButton} onPress={() => playSound(item.sound)}>
            <Text>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={() => stopSound(item.sound)}>
            <Text>Stop</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={() => deleteRecording(item.uri)}>
            <Text>Delete</Text>
          </TouchableOpacity>
        </View>
    )
  }

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.recordingContainer}>
          <FlatList
              data={recordings}
              keyExtractor={(item) => item.uri}
              renderItem={createRecords}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <Button style={styles.button} disabled={recording !== undefined} title='Start Recording' onPress={startRecording}/>
          <Button style={styles.button} disabled={!recording} title='Stop Recording' onPress={stopRecording}/>
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray',
  },
  recordingContainer: {
    flex: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonsContainer: {
    flex: 1,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: "#73728F",
  },
  button: {
    margin: 4,
  },
  record: {

  },
  menuButton: {
    margin: 4,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#80988C",
  },
  menuContainerButtons: {
    flexDirection: 'row',
    justifyContent: "space-around",
    alignItems: 'center'
  },
  menuTitle: {
    marginRight: 10,
  }

});
