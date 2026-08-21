import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Notification System Setup
// Notification System Setup
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as any),
});


export default function App() {
  const [screen, setScreen] = useState('Home'); // 'Home' ya 'Add' screen switch karne ke liye
  const [schedules, setSchedules] = useState<any[]>([]);
  const [society, setSociety] = useState('');
  const [flat, setFlat] = useState('');
  const [time, setTime] = useState('');

  // App chalu hote hi data load karna aur Notification permission lena
  useEffect(() => {
    loadData();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Alarm bajane ke liye notification permission zaroori hai!');
    }
  };

  // Local Storage (TinyDB ki tarah) se data nikalna
  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('bhangar_schedules');
      if (savedData) {
        setSchedules(JSON.parse(savedData));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Naya Data Save Karna
  const handleSave = async () => {
    if (!society || !flat || !time) {
      Alert.alert('Error', 'Sabhi details bharna zaroori hai!');
      return;
    }

    const newSchedule = {
      id: Date.now().toString(),
      society,
      flat,
      time,
    };

    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    await AsyncStorage.setItem('bhangar_schedules', JSON.stringify(updatedSchedules));

    // Demo Notification: Abhi test karne ke liye Save karte hi 5 second baad notification aayega
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Bhangar Lene Jana Hai! ⏰",
        body: `${society} - Flat ${flat} mein jane ka time ho gaya hai.`,
        sound: true,
      },
      trigger: { seconds: 5 } as any,

    });

    Alert.alert('Saved!', 'Customer save ho gaya hai!');
    setSociety(''); setFlat(''); setTime('');
    setScreen('Home');
  };

  // Schedule Delete/Done Karna
  const deleteSchedule = async (id: string) => {
    const filtered = schedules.filter(item => item.id !== id);
    setSchedules(filtered);
    await AsyncStorage.setItem('bhangar_schedules', JSON.stringify(filtered));
  };

  // --- PEHLI SCREEN: HOME (Route List) ---
  if (screen === 'Home') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bhangar Route 🚚</Text>
        </View>

        <FlatList
          data={schedules}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.cardTitle}>{item.society}</Text>
                <Text style={styles.cardSubTitle}>Flat No: {item.flat}</Text>
                <Text style={styles.cardTime}>⏰ Time: {item.time}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteSchedule(item.id)} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>Ho Gaya</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Aaj ka koi kaam baki nahi hai!</Text>}
        />

        {/* Naya Customer Add Karne Ka Float Button */}
        <TouchableOpacity style={styles.fab} onPress={() => setScreen('Add')}>
          <Text style={styles.fabText}>+ Naya Schedule</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- DUSRI SCREEN: ADD CUSTOMER ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setScreen('Home')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{"< Back"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Naya Customer</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Society Ka Naam</Text>
        <TextInput style={styles.input} placeholder="e.g. Gokuldham Society" value={society} onChangeText={setSociety} />

        <Text style={styles.label}>Flat Number</Text>
        <TextInput style={styles.input} placeholder="e.g. 101" value={flat} onChangeText={setFlat} keyboardType="numeric" />

        <Text style={styles.label}>Time Set Karein</Text>
        <TextInput style={styles.input} placeholder="e.g. 10:30 AM" value={time} onChangeText={setTime} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Data Save Karein</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- APP KA DESIGN (Styling) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', elevation: 5 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  fab: { backgroundColor: '#FF5722', position: 'absolute', bottom: 30, right: 20, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3 },
  fabText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  cardSubTitle: { fontSize: 16, color: '#4B5563', marginTop: 3 },
  cardTime: { fontSize: 15, color: '#FF5722', marginTop: 8, fontWeight: 'bold' },
  doneBtn: { backgroundColor: '#E5E7EB', padding: 12, borderRadius: 8 },
  doneBtnText: { color: '#374151', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#9CA3AF', fontSize: 18 },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#374151' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#D1D5DB', fontSize: 16 },
  saveBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, elevation: 2 },
  saveBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  backBtn: { marginRight: 15 },
  backBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
