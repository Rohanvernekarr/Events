import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

interface EventStats {
  totalRegistered: number;
  totalAttended: number;
  feedbackGiven: number;
}

export default function ProfileScreen() {
  const { student, logout } = useAuth();
  const [stats, setStats] = useState<EventStats>({ totalRegistered: 0, totalAttended: 0, feedbackGiven: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const events = await api.getEvents();
      const registered = events.filter((e: any) => e.isRegistered).length;
      const attended = events.filter((e: any) => e.hasAttended).length;
      const feedback = events.filter((e: any) => e.hasFeedback).length;
      
      setStats({
        totalRegistered: registered,
        totalAttended: attended,
        feedbackGiven: feedback,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  if (!student) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.email}>{student.email}</Text>
        <Text style={styles.college}>{student.college.name}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Event Statistics</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#3b82f6" />
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalRegistered}</Text>
              <Text style={styles.statLabel}>Events Registered</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalAttended}</Text>
              <Text style={styles.statLabel}>Events Attended</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.feedbackGiven}</Text>
              <Text style={styles.statLabel}>Feedback Given</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>📧 Update Email</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>🔔 Notifications</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>❓ Help & Support</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>📋 Terms & Privacy</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  college: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  actionsContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
  },
  actionArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  logoutContainer: {
    padding: 16,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
