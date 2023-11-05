import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const policies = [
  { id: 1, name: 'Business Owners Policy', details: 'Combines business property and liability insurance.' },
  { id: 2, name: 'Commercial Auto', details: 'Covers business-owned vehicles.' },
  {  id: 3, name: 'Workers Compensation', details: 'Covers medical expenses and some lost wages for work-related injuries/illness' },
  // ...other policies
];

const PolicyPage = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Insurance Policies</Text>
      {policies.map((policy) => (
        <View key={policy.id} style={styles.card}>
          <Text style={styles.policyName}>{policy.name}</Text>
          <Text style={styles.policyDetails}>{policy.details}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PolicyPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
    marginTop: 60
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  policyName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  policyDetails: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#blue',
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'center',
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
});
