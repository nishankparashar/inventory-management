import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/styles';

interface LocationFilterProps {
  locations: string[];
  selectedLocation?: string;
  onLocationSelect: (location?: string) => void;
}

export default function LocationFilter({ 
  locations, 
  selectedLocation, 
  onLocationSelect 
}: LocationFilterProps) {
  if (locations.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Filter by Location</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedLocation && styles.selectedChip
          ]}
          onPress={() => onLocationSelect(undefined)}
        >
          <Text style={[
            styles.chipText,
            !selectedLocation && styles.selectedChipText
          ]}>
            All Locations
          </Text>
        </TouchableOpacity>
        
        {locations.map((location) => (
          <TouchableOpacity
            key={location}
            style={[
              styles.filterChip,
              selectedLocation === location && styles.selectedChip
            ]}
            onPress={() => onLocationSelect(location)}
          >
            <Text style={[
              styles.chipText,
              selectedLocation === location && styles.selectedChipText
            ]}>
              {location}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: 500,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: 500,
  },
  selectedChipText: {
    color: Colors.surface,
  },
}); 