import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to have @expo/vector-icons installed

const policies = [
  { id: 1, name: 'Business Owners Policy', details: 'Combines business property and liability insurance.', cost: 1000 },
  { id: 2, name: 'Commercial Auto', details: 'Covers business-owned vehicles.', cost: 1200 },
  { id: 3, name: 'Workers Compensation', details: 'Covers medical expenses and some lost wages for work-related injuries/illness', cost: 1300 },
  // ...other policies
];

const Acceptpolicy = ({ navigation }) => {
  const [selectedPolicies, setSelectedPolicies] = useState({});
  const [totalCost, setTotalCost] = useState(0);

  const handleSelectPolicy = (policy) => {
    const newSelectedPolicies = { ...selectedPolicies };
    if (newSelectedPolicies[policy.id]) {
      setTotalCost(totalCost - policy.cost);
      delete newSelectedPolicies[policy.id];
    } else {
      newSelectedPolicies[policy.id] = policy;
      setTotalCost(totalCost + policy.cost);
    }
    setSelectedPolicies(newSelectedPolicies);
  };

  const handleSubmit = () => {
    // Handle the submission of selected policies here
    navigation.navigate('Basepage'); // Replace with your navigation command
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerText}>Policy Options: </Text>
      {policies.map((policy) => (
        <TouchableOpacity key={policy.id} style={styles.policyContainer} onPress={() => handleSelectPolicy(policy)}>
          <Ionicons
            name={selectedPolicies[policy.id] ? 'checkbox' : 'square-outline'}
            size={24}
            color={selectedPolicies[policy.id] ? '#f01716' : 'grey'}
          />
          <View style={styles.policyInfo}>
            <Text style={styles.policyName}>{policy.name}</Text>
            <Text style={styles.policyDetails}>{policy.details}</Text>
          </View>
          <Text style={styles.policyCost}>${policy.cost}</Text>
        </TouchableOpacity>
      ))}
      <View style={styles.totalCostContainer}>
        <Text style={styles.totalCostText}>Total Cost: ${totalCost}</Text>
      </View>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit and Go to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 60
  },
  headerText:{
    fontWeight: '800',
    fontSize: '24',
    marginBottom: 10
  },
  policyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  policyInfo: {
    marginLeft: 10,
    flex: 1,
  },
  policyName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  policyDetails: {
    fontSize: 14,
  },
  policyCost: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  totalCostContainer: {
    marginTop: 20,
  },
  totalCostText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#f01716', // Your specified button color
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Acceptpolicy;
