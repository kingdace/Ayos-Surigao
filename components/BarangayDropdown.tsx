import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { SURIGAO_BARANGAYS } from '../types/simple-auth';

interface Props {
  selectedBarangay: string;
  onSelectBarangay: (code: string, name: string) => void;
  placeholder?: string;
}

const BarangayDropdown: React.FC<Props> = ({
  selectedBarangay,
  onSelectBarangay,
  placeholder = 'Select your barangay'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const selectedBarangayData = SURIGAO_BARANGAYS.find(b => b.code === selectedBarangay);
  
  const filteredBarangays = SURIGAO_BARANGAYS.filter(barangay =>
    barangay.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (code: string, name: string) => {
    onSelectBarangay(code, name);
    setIsVisible(false);
    setSearchText('');
  };

  const renderBarangayItem = ({ item }: { item: typeof SURIGAO_BARANGAYS[0] }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        selectedBarangay === item.code && styles.selectedItem
      ]}
      onPress={() => handleSelect(item.code, item.name)}
    >
      <Text style={[
        styles.dropdownItemText,
        selectedBarangay === item.code && styles.selectedItemText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[
          styles.dropdownText,
          !selectedBarangayData && styles.placeholderText
        ]}>
          {selectedBarangayData ? selectedBarangayData.name : placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Barangay</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search barangay..."
                placeholderTextColor={Colors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            <FlatList
              data={filteredBarangays}
              renderItem={renderBarangayItem}
              keyExtractor={(item) => item.code}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.background,
    minHeight: 56,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  dropdownArrow: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    maxHeight: '80%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.backgroundLight,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedItem: {
    backgroundColor: Colors.backgroundLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  selectedItemText: {
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default BarangayDropdown;
