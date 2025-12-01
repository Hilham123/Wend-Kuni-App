import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { addWaterPoint, deleteWaterPoint } from '../storage/waterStorage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const AddWaterPoint = ({ route, navigation }) => {
  const { userLocation, waterPointId } = route.params || {};

  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [price, setPrice] = useState('25');
  const [status, setStatus] = useState('functional');
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (userLocation) {
      setLocation(userLocation);
    } else {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Impossible d’accéder à la localisation.');
        setLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer la localisation.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !district.trim() || !price.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const priceValue = parseInt(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Prix invalide', 'Veuillez entrer un prix numérique valide.');
      return;
    }

    if (!location) {
      Alert.alert('Localisation requise', 'La localisation GPS est nécessaire.');
      return;
    }

    const newWaterPoint = {
      id: uuidv4(),
      name: name.trim(),
      district: district.trim(),
      price: priceValue,
      status,
      rating: 0,
      ratings: [],
      reports: [],
      location,
      lastUpdate: new Date().toISOString(),
    };

    const success = await addWaterPoint(newWaterPoint);

    if (success) {
      Alert.alert('Succès', 'Le point d\'eau a été ajouté.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde.');
    }
  };

  const handleDelete = async () => {
    if (!waterPointId) {
      Alert.alert('Erreur', 'Impossible de supprimer ce point d\'eau.');
      return;
    }

    Alert.alert(
      'Confirmer la suppression',
      'Voulez-vous vraiment supprimer ce point d\'eau ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive', 
          onPress: async () => {
            const success = await deleteWaterPoint(waterPointId);
            if (success) {
              Alert.alert('Supprimé', 'Le point d\'eau a été supprimé.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } else {
              Alert.alert('Erreur', 'Impossible de supprimer le point d\'eau.');
            }
          }
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nom du point d'eau *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Borne Fontaine Dassasgo"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Quartier *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Dassasgo"
          value={district}
          onChangeText={setDistrict}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Prix du bidon (FCFA) *</Text>
        <TextInput
          style={styles.input}
          placeholder="25"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
      </View>

      <View style={styles.statusContainer}>
        <TouchableOpacity
          style={[styles.statusButton, status === 'functional' && styles.statusButtonActive]}
          onPress={() => setStatus('functional')}
        >
          <Text style={[styles.statusButtonText, status === 'functional' && styles.statusButtonTextActive]}>
            Fonctionnel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, status === 'broken' && styles.statusButtonActive]}
          onPress={() => setStatus('broken')}
        >
          <Text style={[styles.statusButtonText, status === 'broken' && styles.statusButtonTextActive]}>
            Hors service
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Localisation</Text>
        {loadingLocation ? (
          <ActivityIndicator size="small" color="#2196F3" />
        ) : (
          <View style={styles.locationBox}>
            <Text style={styles.locationText}>
              {location ? `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}` : 'Non récupérée'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        {waterPointId && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#F5F5F5',
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15, fontSize: 16, backgroundColor: '#FFF', color: '#333' },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statusButton: { flex: 1, paddingVertical: 12, borderRadius: 25, alignItems: 'center', marginHorizontal: 5, backgroundColor: '#DDD' },
  statusButtonActive: { backgroundColor: '#2196F3' },
  statusButtonText: { fontSize: 14, fontWeight: '500', color: '#333' },
  statusButtonTextActive: { color: '#FFF' },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 25, alignItems: 'center', backgroundColor: '#AAA', marginRight: 10 },
  cancelButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 25, alignItems: 'center', backgroundColor: '#2196F3', marginLeft: 10 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  locationBox: { backgroundColor: '#E3F2FD', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, borderWidth: 1, borderColor: '#90CAF9', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  locationText: { fontSize: 16, color: '#0D47A1', textAlign: 'center', fontWeight: '500' },
  deleteButton: { flex: 1, paddingVertical: 14, borderRadius: 25, alignItems: 'center', backgroundColor: '#FF3D00', marginHorizontal: 5 },
  deleteButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default AddWaterPoint;
