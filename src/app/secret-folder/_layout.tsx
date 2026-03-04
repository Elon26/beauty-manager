import { Stack } from 'expo-router';
import { withAuthenticationRequired } from 'expo-with-pincode';

function ProtectedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="passwords" />
    </Stack>
  );
}

export default withAuthenticationRequired(ProtectedLayout);
