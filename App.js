import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import NewsDetailScreen from "./screens/NewsDetailScreen";
import StudiezoekerScreen from "./screens/StudiezoekerScreen";
import MiniGameScreen from "./screens/MiniGameScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Home" }}
        />
        <Stack.Screen
          name="NewsDetail"
          component={NewsDetailScreen}
          options={{ title: "Nieuwsbericht" }}
        />
        <Stack.Screen
          name="Studiezoeker"
          component={StudiezoekerScreen}
          options={{ title: "Studiezoeker" }}
        />
        <Stack.Screen
          name="MiniGame"
          component={MiniGameScreen}
          options={{ title: "MiniGame" }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
