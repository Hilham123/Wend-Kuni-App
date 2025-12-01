// Import des briques de base
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';

// SafeArea
import { SafeAreaView } from 'react-native-safe-area-context';

// Expo Location
import * as Location from 'expo-location';

// Modules perso
import { getWaterPoints } from '../storage/waterStorage';
import WaterPointItem from '../components/WaterPointItem';
import { calculateDistance } from '../utils/ratingUtils';

const HomeScreen = ({ navigation }) => {
  const [waterPoints, setWaterPoints] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadData();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const points = await getWaterPoints();
      setWaterPoints(points);
      applyFilter(points, activeFilter);
    } catch (error) {
      Alert.alert('Erreur', "Impossible de charger les points d'eau");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (points, filter) => {
    let filtered = [...points];
    switch (filter) {
      case 'nearby':
        if (userLocation) {
          filtered.sort(
            (a, b) =>
              calculateDistance(a.location, userLocation) -
              calculateDistance(b.location, userLocation)
          );
        }
        break;
      case 'cheap':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'functional':
        filtered = filtered.filter(point => point.status === 'functional');
        break;
    }
    setFilteredPoints(filtered);
    setActiveFilter(filter);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* HEADER MODERNISÉ */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Points d'eau</Text>
          <Text style={styles.headerSubtitle}>
            Trouvez les points d'eau proches de chez vous !
          </Text>
        </View>

        {/* FILTRES */}
        <ScrollView
          horizontal
          style={styles.filterContainer}
          showsHorizontalScrollIndicator={false}
        >
          {[
            { label: 'Tous', value: 'all' },
            { label: 'Proche', value: 'nearby' },
            { label: 'Pas cher', value: 'cheap' },
            { label: 'Fonctionnel', value: 'functional' },
          ].map(filter => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                activeFilter === filter.value && styles.filterButtonActive
              ]}
              onPress={() => applyFilter(waterPoints, filter.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.value && styles.filterTextActive
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LISTE DES POINTS */}
        {filteredPoints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun point d'eau disponible.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPoints}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <WaterPointItem
                waterPoint={item}
                userLocation={userLocation}
                onPress={() =>
                  navigation.navigate('WaterPointDetail', { waterPoint: item })
                }
              />
            )}
          />
        )}

        {/* BOUTON AJOUT */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddWaterPoint', { userLocation })}
        >
          <Text style={styles.addButtonText}>+ Ajouter un point d'eau</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2196F3'
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  header: {
    width: '100%',
    backgroundColor: '#2196F3',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,

    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,

    alignItems: 'center',
  },

  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
  },

  headerSubtitle: {
    marginTop: 5,
    color: '#EAF6FF',
    fontSize: 15,
    textAlign: 'center',
  },

  filterContainer: {
    marginTop: 15,
    paddingHorizontal: 12,
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 10,
    borderRadius: 25,
    backgroundColor: '#E9E9E9',

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },

  filterButtonActive: {
    backgroundColor: '#2196F3',
  },

  filterText: {
    color: '#333',
    fontSize: 14,
  },

  filterTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 18,
    color: '#999',
  },

  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,

    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },

  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});

export default HomeScreen;