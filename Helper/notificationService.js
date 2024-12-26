import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

// Request permission to send notifications
export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('You need to enable notifications to use this feature.');
  }
};

