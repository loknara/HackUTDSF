import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const Quote = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);

  const totalDue = 3500;
  const progress = (amountPaid / totalDue) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.paymentDue}>
        Payments Due
      </Text>
      <Text style={styles.paymentAmount}>
        $0/$3500 paid
      </Text>
      <TouchableOpacity style={styles.filedClaims} onPress={() => setModalVisible(true)}>
        <Image
          source={require("./assets/car.jpg")} // Replace with your image URL
          style={styles.thumbnail}
        />
        <View style={styles.claimDetails}>
          <Text style={styles.claimNumber}>
            Claim Number: NBD37
          </Text>
          <Text style={styles.claimDate}>
            Date: 2023-11-05
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Lokesh's business vehicle got into a minor wreck. According to his policy, he has commercial auto which covers business-owned vehicles, so he is covered</Text>
            <Image
              source={require("./assets/car.jpg")} // Replace with your detailed image URL
              style={styles.detailedImage}
            />
            <TouchableOpacity
              style={styles.hideButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.hideButtonText}>Hide Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    progressBarBackground: {
        width: '100%',
        height: 20,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 20,
      },
      progressBarFill: {
        height: '100%',
        backgroundColor: '#2196F3',
        borderRadius: 10,
      },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      },
      circleGraph: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
      },
      paymentDue: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
      },
      paymentAmount: {
        fontSize: 16,
      },
      filedClaims: {
        flexDirection: 'row',
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
      },
      thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 25, // making it round
        marginRight: 10,
      },
      claimDetails: {
        flex: 1,
      },
      claimNumber: {
        fontSize: 16,
        fontWeight: 'bold',
      },
      claimDate: {
        fontSize: 14,
      },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailedImage: {
    width: 300, // Set your desired width
    height: 200, // Set your desired height
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  hideButton: {
    backgroundColor: '#f01716',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  hideButtonText: {
    fontWeight: 'bold', // Add bold font weight for the text
    color: 'white', // Optional: change the text color to white for better visibility
  },
});

export default Quote;
