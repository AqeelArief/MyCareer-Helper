import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#00D9FF",
        tabBarInactiveTintColor: "#555",
        headerStyle: {
          backgroundColor: "#000",
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "800",
          letterSpacing: 0.5,
        },
        // Modern floating tab bar design
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? 20 : 15,
          left: 20,
          right: 20,
          backgroundColor: "#0A0A0A",
          borderRadius: 24,
          height: Platform.OS === "ios" ? 75 : 70,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          paddingTop: 10,
          borderTopWidth: 0,
          borderWidth: 2,
          borderColor: "#1A1A1A",
          // Enhanced shadows for floating effect
          shadowColor: "#00D9FF",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 15,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.4,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        // Add background blur effect
        tabBarBackground: () => (
          <></>
        ),
      }}
    >
      <Tabs.Screen
        name="ResumeBuilder"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <>
              {/* Glow effect when active */}
              {focused && (
                <Ionicons
                  name="document-text"
                  color="#00D9FF"
                  size={32}
                  style={{
                    position: "absolute",
                    opacity: 0.3,
                    transform: [{ scale: 1.4 }],
                  }}
                />
              )}
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                color={color}
                size={28}
                style={{
                  transform: [{ scale: focused ? 1.1 : 1 }],
                }}
              />
            </>
          ),
          title: "Builder"
        }}
      />

      <Tabs.Screen
        name="MyAssistant"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <>
              {focused && (
                <Ionicons
                  name="person-circle"
                  color="#00D9FF"
                  size={34}
                  style={{
                    position: "absolute",
                    opacity: 0.3,
                    transform: [{ scale: 1.4 }],
                  }}
                />
              )}
              <Ionicons
                name={focused ? "person-circle" : "person-circle-outline"}
                color={color}
                size={30}
                style={{
                  transform: [{ scale: focused ? 1.1 : 1 }],
                }}
              />
            </>
          ),
          title: "Assistant"
        }}
      />

      <Tabs.Screen
        name="Resources"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <>
              {focused && (
                <Ionicons
                  name="briefcase"
                  color="#00D9FF"
                  size={32}
                  style={{
                    position: "absolute",
                    opacity: 0.3,
                    transform: [{ scale: 1.4 }],
                  }}
                />
              )}
              <Ionicons
                name={focused ? "briefcase" : "briefcase-outline"}
                color={color}
                size={28}
                style={{
                  transform: [{ scale: focused ? 1.1 : 1 }],
                }}
              />
            </>
          ),
          title: "Resources"
        }}
      />

      <Tabs.Screen
        name="MyCareer"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <>
              {focused && (
                <Ionicons
                  name="stats-chart"
                  color="#00D9FF"
                  size={32}
                  style={{
                    position: "absolute",
                    opacity: 0.3,
                    transform: [{ scale: 1.4 }],
                  }}
                />
              )}
              <Ionicons
                name={focused ? "stats-chart" : "stats-chart-outline"}
                color={color}
                size={28}
                style={{
                  transform: [{ scale: focused ? 1.1 : 1 }],
                }}
              />
            </>
          ),
          title: "Profile"
        }}
      />
    </Tabs>
  );
}