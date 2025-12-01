import { useEffect, useState } from 'react';
import {
  Linking, Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getWaterPoints } from '../storage/waterStorage';
import {
  formatDate,
  getRatingStars,
  getStatusColor, getStatusText
} from '../utils/ratingUtils';

const WaterPointDetail = ({ route, navigation }) => {
  const { waterPoint: initialWaterPoint } = route.params;
  const [waterPoint, setWaterPoint] = useState(initialWaterPoint);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const points = await getWaterPoints();
      const updatedPoint = points.find(p => p.id === waterPoint.id);
      if (updatedPoint) setWaterPoint(updatedPoint);
    });
    return unsubscribe;
  }, [navigation, waterPoint.id]);

  const openInGoogleMaps = () => {
    const { latitude, longitude } = waterPoint.location;
    const label = encodeURIComponent(waterPoint.name);
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}&q=${label}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`
    });
    Linking.openURL(url).catch(() => {
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(webUrl);
    });
  };

  const handleReport = () => {
    navigation.navigate('ReportScreen', { waterPoint, type: 'report' });
  };

  const handleRate = () => {
    navigation.navigate('ReportScreen', { waterPoint, type: 'rating' });
  };

  const statusColor = getStatusColor(waterPoint.status);
  const statusText = getStatusText(waterPoint.status);
  const stars = getRatingStars(waterPoint.rating || 0);

  return (
    <ScrollView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{waterPoint.name}</Text>
        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
      </View>

      {/* Section d'informations principales */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Prix du bidon (20L)</Text>
          <Text style={styles.priceValue}>{waterPoint.price} FCFA</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Évaluation</Text>
          <Text style={styles.starsText}>{stars}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Dernière mise à jour</Text>
          <Text style={styles.valueText}>{formatDate(waterPoint.updatedAt)}</Text>
        </View>
        <TouchableOpacity style={styles.mapButton} onPress={openInGoogleMaps}>
          <Text style={styles.mapButtonText}>📍 Voir sur la carte</Text>
        </TouchableOpacity>
      </View>

      {/* Section rapports récents */}
      {waterPoint.reports && waterPoint.reports.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rapports récents</Text>
          {waterPoint.reports.slice(-3).reverse().map((report, index) => (
            <View key={index} style={styles.reportItem}>
              <Text style={styles.reportType}>{report.type.toUpperCase()}</Text>
              <Text style={styles.reportDescription}>{report.description}</Text>
              <Text style={styles.reportDate}>{formatDate(report.date)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Boutons d'action */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.reportButton]} onPress={handleReport}>
          <Text style={styles.actionButtonText}>🚨 Signaler un problème</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.rateButton]} onPress={handleRate}>
          <Text style={styles.actionButtonText}>⭐ Noter ce point</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    paddingTop: 40, // ← contenu descendu vers le bas
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 16,
    color: '#333',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  starsText: {
    fontSize: 18,
  },
  mapButton: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  reportItem: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  reportType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  reportDescription: {
    fontSize: 14,
    color: '#333',
    marginVertical: 3,
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 30,
  },
  actionButton: {
    flex: 0.48,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  reportButton: {
    backgroundColor: '#FF5722',
  },
  rateButton: {
    backgroundColor: '#FFC107',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WaterPointDetail;
