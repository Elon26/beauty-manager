import '../../global.css';

import { Stack } from 'expo-router';

import app from '@/root';

function Wrapper() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="main"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="secret-folder" />
    </Stack>
  );
}

const RootWrapper = app.wrapLayout(Wrapper);

export default function RootLayout() {
  return <RootWrapper />;
}
