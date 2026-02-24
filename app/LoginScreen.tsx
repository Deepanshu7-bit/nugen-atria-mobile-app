import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenBackground } from "../components/ScreenBackground";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getPasswordIssues, validateEmail } from "../utils/validation";
import { styles } from "../styles/app/LoginScreen.styles";

export default function LoginScreen() {
  const { signIn, loading } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);
    if (getPasswordIssues(password).length) return setError("Password is invalid.");
    try { setError(""); await signIn(email.trim(), password); } catch (err: any) { setError(err?.message || "Login failed."); }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.topBar}>
            <MaterialIcons name="arrow-back" size={22} color={colors.text} />
            <Text style={[styles.topTitle, { color: colors.text }]}>Admin Portal</Text>
            <View style={styles.topSpacer} />
          </View>

          <View style={styles.hero}>
            <View style={[styles.logoIconWrap, { backgroundColor: colors.primarySoft }]}>
              <MaterialIcons name="apartment" size={42} color={colors.primary} />
            </View>
            <Text style={[styles.brand, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Please enter your administrative credentials to access the dashboard.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text }]}>Work Email</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <MaterialIcons name="mail" size={18} color={colors.textMuted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="admin@hotelgroup.com"
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.input, { color: colors.text }]}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={[styles.passwordWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <MaterialIcons name="lock" size={18} color={colors.textMuted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={[styles.passwordInput, { color: colors.text }]}
              />
              <TouchableOpacity onPress={() => setSecure((v) => !v)}>
                <MaterialIcons name={secure ? "visibility" : "visibility-off"} size={19} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign In"}</Text>
              <MaterialIcons name="login" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={[styles.secureCard, { borderColor: colors.primarySoft, backgroundColor: `${colors.primary}12` }]}>
            <View style={[styles.secureIcon, { backgroundColor: `${colors.primary}1a` }]}>
              <MaterialIcons name="security" size={20} color={colors.primary} />
            </View>
            <View style={styles.secureDivider} />
            <Text style={[styles.secureText, { color: colors.primary }]}>Secure Admin Access</Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={[styles.footerLink, { color: colors.textMuted }]}>Privacy Policy</Text>
              <Text style={[styles.footerDot, { color: colors.textMuted }]}>•</Text>
              <Text style={[styles.footerLink, { color: colors.textMuted }]}>Terms of Service</Text>
              <Text style={[styles.footerDot, { color: colors.textMuted }]}>•</Text>
              <Text style={[styles.footerLink, { color: colors.textMuted }]}>Help Center</Text>
            </View>
            <Text style={[styles.footerCopy, { color: colors.textMuted }]}>© 2024 HOTEL GROUP SYSTEMS</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}
