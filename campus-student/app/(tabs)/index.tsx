import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { AuthWrapper } from '../../components/AuthWrapper';

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  isRegistered: boolean;
  hasAttended: boolean;
}

export default function HomeScreen() {
  const { student, isAuthenticated } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUpcomingEvents();
    }
  }, [isAuthenticated]);

  const fetchUpcomingEvents = async () => {
    try {
      const events = await api.getEvents();
      const upcoming = events
        .filter((event: Event) => new Date(event.date) > new Date())
        .slice(0, 3);
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AuthWrapper>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Welcome back, {student?.name?.split(' ')[0]}! 👋
          </Text>
          <Text style={styles.college}>{student?.college?.name}</Text>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/events')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionTitle}>Browse Events</Text>
              <Text style={styles.actionSubtitle}>Find new events to join</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionTitle}>My Profile</Text>
              <Text style={styles.actionSubtitle}>View your stats</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#3b82f6" style={styles.loader} />
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDetails}>📅 {formatDate(event.date)}</Text>
                  <Text style={styles.eventDetails}>📍 {event.venue}</Text>
                </View>
                <View style={styles.eventStatus}>
                  {event.isRegistered ? (
                    <Text style={styles.registeredBadge}>✓ Registered</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.registerButton}
                      onPress={() => router.push('/(tabs)/events')}
                    >
                      <Text style={styles.registerButtonText}>Register</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No upcoming events</Text>
              <Text style={styles.emptySubtext}>Check back later for new events</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  college: {
    fontSize: 16,
    color: '#64748b',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  upcomingSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  loader: {
    paddingVertical: 20,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  eventDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  eventStatus: {
    marginLeft: 12,
  },
  registeredBadge: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  registerButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  authText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
