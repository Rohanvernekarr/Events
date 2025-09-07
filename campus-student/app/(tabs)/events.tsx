import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { AuthWrapper } from '../../components/AuthWrapper';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  category: string;
  maxCapacity: number;
  allowOtherColleges: boolean;
  isRegistered: boolean;
  hasAttended: boolean;
  hasFeedback: boolean;
  registrationCount: number;
  canRegister: boolean;
  isOwnCollege: boolean;
  college: {
    name: string;
  };
}

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchEvents = async () => {
    try {
      const eventsData = await api.getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchEvents();
      } else {
        setLoading(false);
      }
    }, [isAuthenticated])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleRegister = async (eventId: string) => {
    try {
      await api.registerForEvent(eventId);
      Alert.alert('Success', 'Successfully registered for event!');
      fetchEvents(); // Refresh the list
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleMarkAttendance = async (eventId: string) => {
    Alert.alert(
      'Mark Attendance',
      'Are you currently at the event venue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, I\'m here',
          onPress: async () => {
            try {
              await api.markAttendance(eventId);
              Alert.alert('Success', 'Attendance marked successfully!');
              fetchEvents(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to mark attendance');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const isEventDay = eventDate.toDateString() === now.toDateString();
    const isPast = eventDate < now && !isEventDay;

    if (event.isRegistered) {
      if (event.hasAttended) {
        return { text: 'Attended', color: '#10b981', canAct: false };
      } else if (isEventDay) {
        return { text: 'Mark Attendance', color: '#f59e0b', canAct: true };
      } else if (isPast) {
        return { text: 'Missed', color: '#ef4444', canAct: false };
      } else {
        return { text: 'Registered', color: '#3b82f6', canAct: false };
      }
    } else {
      if (isPast) {
        return { text: 'Past Event', color: '#6b7280', canAct: false };
      } else if (!event.canRegister) {
        return { text: 'Not Eligible', color: '#ef4444', canAct: false };
      } else {
        return { text: 'Register', color: '#10b981', canAct: true };
      }
    }
  };

  const canTakeAction = (event: Event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const isToday = eventDate.toDateString() === now.toDateString();
    const isPast = eventDate < now;

    if (isPast && !isToday) return false;
    if (event.hasAttended) return false;
    if (event.maxCapacity && event.registrationCount >= event.maxCapacity && !event.isRegistered) return false;
    
    return true;
  };

  const getActionForEvent = (event: Event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const isToday = eventDate.toDateString() === now.toDateString();

    if (event.isRegistered && isToday && !event.hasAttended) {
      return () => handleMarkAttendance(event.id);
    }
    if (!event.isRegistered) {
      return () => handleRegister(event.id);
    }
    return null;
  };

  const renderEventItem = ({ item: event }: { item: Event }) => {
    const status = getEventStatus(event);
    const canAct = canTakeAction(event);
    const action = getActionForEvent(event);

    return (
      <View style={styles.eventCard}>
        <View style={styles.eventInfo}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventBadges}>
              {!event.isOwnCollege && (
                <View style={[styles.badge, styles.crossCollegeBadge]}>
                  <Text style={styles.badgeText}>Other College</Text>
                </View>
              )}
              {event.allowOtherColleges && (
                <View style={[styles.badge, styles.openBadge]}>
                  <Text style={styles.badgeText}>Open to All</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.eventDescription}>{event.description}</Text>
          <Text style={styles.eventDetails}>📅 {formatDate(event.date)}</Text>
          <Text style={styles.eventDetails}>📍 {event.venue}</Text>
          <Text style={styles.eventDetails}>🏫 {event.college.name}</Text>
          <Text style={styles.eventDetails}>
            👥 {event.registrationCount}/{event.maxCapacity || '∞'} registered
          </Text>
        </View>

        <View style={styles.eventActions}>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
          </View>

          {canAct && action && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: status.color }]} onPress={action}>
              <Text style={styles.actionButtonText}>{status.text}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <AuthWrapper fallbackMessage="Please sign in to view events">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Campus Events</Text>
          <Text style={styles.headerSubtitle}>Discover and join events at your college</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No events available</Text>
                <Text style={styles.emptySubtext}>Check back later for new events</Text>
              </View>
            }
          />
        )}
      </View>
    </AuthWrapper>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  listContainer: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  authMessage: {
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
  eventInfo: {
    flex: 1,
  },
  eventBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  crossCollegeBadge: {
    backgroundColor: '#fbbf24',
  },
  openBadge: {
    backgroundColor: '#10b981',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
});
