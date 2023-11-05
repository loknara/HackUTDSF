import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity
} from 'react-native';
import Conversation from "./Conversation";

const InfoForm = ({navigation}) => {
    const [firstName, setFirstName] = useState('Lokesh');
    const [lastName, setLastName] = useState('Nara');
    const [dateOfBirth, setDateOfBirth] = useState('2003-01-13');
    const [email, setEmail] = useState('lokeshnarasani@gmail.com');
  
    // Helper function to validate email
    const validateEmail = (email) => {
      const re = /\S+@\S+\.\S+/;
      return re.test(email);
    };
  
    // Helper function to validate date of birth
    const validateDateOfBirth = (dob) => {
      const re = /^\d{4}-\d{2}-\d{2}$/;
      return re.test(dob);
    };
  
    const handleSubmit = () => {
      if (!firstName || !lastName || !dateOfBirth || !email) {
        Alert.alert('Error', 'Please fill out all fields.');
        return;
      }
  
      if (!validateDateOfBirth(dateOfBirth)) {
        Alert.alert('Error', 'Please enter a valid date of birth (YYYY-MM-DD).');
        return;
      }
  
      if (!validateEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
      }
  
      // If everything is valid, submit the form (or do whatever is needed next)
      Alert.alert('Form Submitted', `Name: ${firstName} ${lastName}\nDate of Birth: ${dateOfBirth}\nEmail: ${email}`);
      navigation.navigate('Conversation');
    };
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0} // Adjust this value as needed
      >
      <ScrollView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <Text style={styles.label}>First Name:</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
            />

            <Text style={styles.label}>Last Name:</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
            />

            <Text style={styles.label}>Date of Birth:</Text>
            <TextInput
              style={styles.input}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.baseButtonContainer}>
                <TouchableOpacity
                    style={styles.baseButton}
                    onPress={handleSubmit}
                    >
                        <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default InfoForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:55
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 4,
  },
  baseButton: {
    backgroundColor: '#FF6347',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowOpacity: 0.3,
    shadowRadius: 3,
},
buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
},
 baseButtonContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            marginBottom: 20,
},
});
