import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addReport, updateRating } from '../storage/waterStorage';

const ReportScreen = ({ route, navigation }) => {
  const { waterPoint, type } = route.params;

  const [selectedType, setSelectedType] = useState('panne');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmitReport = async () => {
    if (!description.trim()) {
      Alert.alert('Description requise', 'Veuillez décrire le problème.');
      return;
    }
    const report = { type: selectedType, description: description.trim() };
    const success = await addReport(waterPoint.id, report);
    if (success) {
      Alert.alert('Merci !', 'Votre rapport a bien été envoyé.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Note requise', 'Veuillez sélectionner une note de 1 à 5.');
      return;
    }
    const success = await updateRating(waterPoint.id, rating);
    if (success) {
      Alert.alert('Merci !', 'Votre note a été enregistrée.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  // Interface de notation
  if (type === 'rating') {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Noter ce point d'eau</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity key={value} onPress={() => setRating(value)}>
              <Text style={styles.starText}>{rating >= value ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitRating}>
          <Text style={styles.submitButtonText}>Envoyer la note</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Interface de signalement
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Signaler un problème</Text>
      <View style={styles.typeSelectorContainer}>
        {['panne', 'fuite', 'autre'].map((typeOption) => (
          <TouchableOpacity
            key={typeOption}
            style={[
              styles.typeButton,
              selectedType === typeOption && styles.typeButtonActive,
            ]}
            onPress={() => setSelectedType(typeOption)}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === typeOption && styles.typeButtonTextActive,
              ]}
            >
              {typeOption.charAt(0).toUpperCase() + typeOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.textArea}
        placeholder="Décrivez le problème en détail..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReport}>
        <Text style={styles.submitButtonText}>Envoyer le rapport</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  typeButtonActive: {
    backgroundColor: '#2196F3',
  },
  typeButtonText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  textArea: {
    height: 120,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  starText: {
    fontSize: 36,
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReportScreen;
