import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ArrowDownWard from '../../assets/svgs/arrowDownward.svg';
import ArrowUpIcon from '../../assets/svgs/arrowUpWard.svg';
import { styles } from '../../screens/branches/tasks/style';

interface SortModalProps {
  isVisible: boolean;
  sortField: 'name' | 'number';
  sortOrder: 'asc' | 'desc';
  onClose: () => void;
  onSort: (field: 'name' | 'number', order: 'asc' | 'desc') => void;
}

const SortModal: React.FC<SortModalProps> = ({ isVisible, sortField, sortOrder, onClose, onSort }) => {
  if (!isVisible) return null;
  return (
    <View style={[styles.dropdownCard, { position: 'absolute', top: 170, right: 24, zIndex: 100 }]}> {/* Adjust top/right for placement */}
      <View style={styles.sortModalHeader}>
        <Text style={styles.sortModalTitle}>Sort By</Text>
        <TouchableOpacity onPress={onClose} style={styles.sortModalCloseBtn}>
          <View style={styles.sortModalCloseCircle}>
            <Text style={{ fontSize: 18, color: '#007AFF', bottom: 2 }}>x</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.sortModalBody}>
        <Text style={styles.sortModalField}>Name</Text>
        <View style={styles.sortModalOrderBtns}>
          <TouchableOpacity
            style={[styles.sortModalOrderBtn, sortField === 'name' && sortOrder === 'desc' ? styles.activeSortBtn : null]}
            onPress={() => onSort('name', 'desc')}
          >
            <ArrowDownWard width={15} height={15} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortModalOrderBtn, sortField === 'name' && sortOrder === 'asc' ? styles.activeSortBtn : null]}
            onPress={() => onSort('name', 'asc')}
          >
            <ArrowUpIcon width={15} height={15} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.sortModalBody, { marginTop: 14 }]}>
        <Text style={styles.sortModalField}>Number</Text>
        <View style={styles.sortModalOrderBtns}>
          <TouchableOpacity
            style={[styles.sortModalOrderBtn, sortField === 'number' && sortOrder === 'desc' ? styles.activeSortBtn : null]}
            onPress={() => onSort('number', 'desc')}
          >
            <ArrowDownWard width={15} height={15} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortModalOrderBtn, sortField === 'number' && sortOrder === 'asc' ? styles.activeSortBtn : null]}
            onPress={() => onSort('number', 'asc')}
          >
            <ArrowUpIcon width={15} height={15} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SortModal;
