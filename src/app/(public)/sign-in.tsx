// src/features/auth/screens/sign-in-screen.tsx

import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Bolt,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Verified,
} from 'lucide-react-native';

const TOKENS = {
  light: {
    brand: '#008080',
    brandDark: '#006565',
    brandBlue: '#0294E2',

    canvas: '#F6F8FA',
    surface: '#FFFFFF',

    surfaceLow: '#F0F3FF',
    surfaceHigh: '#DDE9FF',
    surfaceHighest: '#D5E3FD',

    textStrong: '#122033',
    textMuted: '#667085',

    border: '#E4E9F0',
    outline: '#6E7979',

    success: '#14804A',
    tertiary: '#597E00',

    switchOff: '#D5E3FD',
  },

  dark: {
    brand: '#35B8B2',
    brandDark: '#35B8B2',
    brandBlue: '#55B8EC',

    canvas: '#0B1220',
    surface: '#111B2E',

    surfaceLow: '#162238',
    surfaceHigh: '#1B2940',
    surfaceHighest: '#29364B',

    textStrong: '#F5F8FC',
    textMuted: '#AAB6C8',

    border: '#29364B',
    outline: '#AAB6C8',

    success: '#43C47B',
    tertiary: '#BCEB55',

    switchOff: '#29364B',
  },
} as const;

type Tokens = (typeof TOKENS)[keyof typeof TOKENS];

const LOGO_URI =
  'https://lh3.googleusercontent.com/aida/AEtjO1WnFbnnP4SEZEOvoOw3K7VTfT8optIxOxNntqLm7gvl72w59RZv6oAsgKrZUXUkEEzCVAxEpoz7unHmeyQlRdlLQwBJB4gPBmKdJKI5OzK9J0HgoJlT_eZ4Nqry81c--AP6kUwnXr2315csuIi8V2v6YsP8vhr2q-7oawmrELeoQt4OW9v-lsA4KwtL-Tb7OEgDVerjPr7N2TesGwvNEPgtQPZML2I6Ia_BfDzqMNXo-ew3oZZiEDmhcOs';

function InviteNotice({ t }: { t: Tokens }) {
  return (
    <View
      style={{
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 9,
        backgroundColor: t.surfaceHigh,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          minWidth: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingRight: 8,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: t.tertiary,
          }}
        />

        <Mail size={18} color={t.brandBlue} />

        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontFamily: 'Figtree-Medium',
            fontSize: 13,
            color: t.textStrong,
          }}
        >
          Preserving invite from{' '}
          <Text
            style={{
              fontFamily: 'Figtree-SemiBold',
              color: t.brand,
            }}
          >
            Acme Studio Design Ops
          </Text>
        </Text>
      </View>

      <View
        style={{
          borderRadius: 999,
          paddingHorizontal: 8,
          paddingVertical: 3,
          backgroundColor: t.surface,
        }}
      >
        <Text
          style={{
            fontFamily: 'Figtree-SemiBold',
            fontSize: 11,
            color: t.textStrong,
          }}
        >
          Pending
        </Text>
      </View>
    </View>
  );
}

function BrandHero({ t }: { t: Tokens }) {
  return (
    <View
      style={{
        alignItems: 'center',
        marginTop: 14,
        marginBottom: 24,
      }}
    >
      <View
        style={{
          position: 'relative',
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: t.surfaceHigh,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
          }}
        >
          <Image
            source={{ uri: LOGO_URI }}
            resizeMode="contain"
            style={{
              width: 48,
              height: 48,
            }}
          />
        </View>

        <View
          style={{
            position: 'absolute',
            right: -4,
            bottom: -4,
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.brand,
          }}
        >
          <Bolt size={14} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      </View>

      <Text
        style={{
          fontFamily: 'Figtree-Bold',
          fontSize: 28,
          lineHeight: 34,
          letterSpacing: -0.5,
          textAlign: 'center',
          color: t.textStrong,
        }}
      >
        Sign in to Tailpoint
      </Text>

      <Text
        style={{
          marginTop: 8,
          maxWidth: 320,
          fontFamily: 'Figtree-Regular',
          fontSize: 15,
          lineHeight: 22,
          textAlign: 'center',
          color: t.textMuted,
        }}
      >
        Know what matters, move work forward from anywhere.
      </Text>
    </View>
  );
}

function Divider({ t }: { t: Tokens }) {
  return (
    <View
      style={{
        position: 'relative',
        marginVertical: 24,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: t.surfaceHighest,
        }}
      />

      <View
        style={{
          paddingHorizontal: 12,
          backgroundColor: t.canvas,
        }}
      >
        <Text
          style={{
            fontFamily: 'Figtree-SemiBold',
            fontSize: 11,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: t.textMuted,
          }}
        >
          or continue with
        </Text>
      </View>
    </View>
  );
}

export default function SignInScreen() {
  const router = useRouter();

  const scheme = useColorScheme();
  const t = TOKENS[scheme === 'dark' ? 'dark' : 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      return;
    }

    try {
      setIsSubmitting(true);

      /**
       * TODO:
       *
       * await signIn({
       *   email: email.trim(),
       *   password,
       *   rememberDevice: trustDevice,
       * });
       */

      console.log({
        email,
        password,
        trustDevice,
      });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={{
        flex: 1,
        backgroundColor: t.canvas,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View
          style={{
            height: 64,
            paddingHorizontal: 16,
            backgroundColor: t.surface,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',

            borderBottomWidth: 1,
            borderBottomColor: t.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                marginLeft: -8,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.55 : 1,
              })}
            >
              <ArrowLeft size={24} color={t.textStrong} />
            </Pressable>

            <Image
              source={{ uri: LOGO_URI }}
              resizeMode="contain"
              style={{
                width: 32,
                height: 32,
              }}
            />

            <Text
              style={{
                fontFamily: 'Figtree-SemiBold',
                fontSize: 20,
                color: t.textStrong,
              }}
            >
              Sign In
            </Text>
          </View>

          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: t.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserRound size={17} color="#FFFFFF" />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 32,
          }}
        >
          <InviteNotice t={t} />

          <BrandHero t={t} />

          {/* Form Card */}
          <View
            style={{
              padding: 20,
              borderRadius: 16,
              gap: 18,
              backgroundColor: t.surface,

              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: scheme === 'dark' ? 0.25 : 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {/* Email */}
            <View style={{ gap: 6 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Figtree-Medium',
                    fontSize: 13,
                    color: t.textStrong,
                  }}
                >
                  Work email
                </Text>

                <Text
                  style={{
                    fontFamily: 'Figtree-SemiBold',
                    fontSize: 11,
                    color: t.textMuted,
                  }}
                >
                  Required
                </Text>
              </View>

              <View
                style={{
                  minHeight: 48,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,

                  backgroundColor: emailFocused ? t.surface : t.surfaceLow,

                  borderWidth: 1,
                  borderColor: emailFocused ? t.brand : 'transparent',
                }}
              >
                <AtSign size={20} color={emailFocused ? t.brand : t.outline} />

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="alex.chen@acmestudio.io"
                  placeholderTextColor={t.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  style={{
                    flex: 1,
                    height: 48,
                    paddingVertical: 0,

                    fontFamily: 'Figtree-Regular',
                    fontSize: 15,
                    color: t.textStrong,
                  }}
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ gap: 6 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Figtree-Medium',
                    fontSize: 13,
                    color: t.textStrong,
                  }}
                >
                  Password
                </Text>

                <Pressable
                  hitSlop={8}
                  onPress={() => {
                    // Change this path if your forgot-password route differs.
                    router.push('/(public)/forgot-password');
                  }}
                >
                  {({ pressed }) => (
                    <Text
                      style={{
                        fontFamily: 'Figtree-SemiBold',
                        fontSize: 11,
                        color: t.brand,
                        opacity: pressed ? 0.6 : 1,
                      }}
                    >
                      Forgot password?
                    </Text>
                  )}
                </Pressable>
              </View>

              <View
                style={{
                  minHeight: 48,
                  borderRadius: 12,
                  paddingLeft: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,

                  backgroundColor: passwordFocused ? t.surface : t.surfaceLow,

                  borderWidth: 1,
                  borderColor: passwordFocused ? t.brand : 'transparent',
                }}
              >
                <LockKeyhole
                  size={20}
                  color={passwordFocused ? t.brand : t.outline}
                />

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••••••"
                  placeholderTextColor={t.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                  style={{
                    flex: 1,
                    height: 48,
                    paddingVertical: 0,

                    fontFamily: 'Figtree-Regular',
                    fontSize: 15,
                    color: t.textStrong,
                  }}
                />

                <Pressable
                  onPress={() => setShowPassword((value) => !value)}
                  hitSlop={8}
                  style={({ pressed }) => ({
                    width: 44,
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.55 : 1,
                  })}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={t.outline} />
                  ) : (
                    <Eye size={20} color={t.outline} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Trust Device */}
            <View
              style={{
                minHeight: 42,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Pressable
                onPress={() => setTrustDevice((value) => !value)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Switch
                  value={trustDevice}
                  onValueChange={setTrustDevice}
                  trackColor={{
                    false: t.switchOff,
                    true: t.brand,
                  }}
                  thumbColor="#FFFFFF"
                />

                <Text
                  style={{
                    flex: 1,
                    fontFamily: 'Figtree-Medium',
                    fontSize: 13,
                    color: t.textStrong,
                  }}
                >
                  Trust this device for 30 days
                </Text>
              </Pressable>

              <Verified size={17} color={t.outline} />
            </View>

            {/* Sign In */}
            <Pressable
              onPress={handleSignIn}
              disabled={isSubmitting}
              style={({ pressed }) => ({
                minHeight: 50,
                marginTop: 2,
                borderRadius: 12,
                backgroundColor: t.brand,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,

                opacity: isSubmitting ? 0.65 : pressed ? 0.85 : 1,

                transform: [
                  {
                    scale: pressed ? 0.99 : 1,
                  },
                ],
              })}
            >
              <Text
                style={{
                  fontFamily: 'Figtree-SemiBold',
                  fontSize: 16,
                  color: '#FFFFFF',
                }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Text>

              {!isSubmitting && <ArrowRight size={20} color="#FFFFFF" />}
            </Pressable>
          </View>

          <Divider t={t} />

          {/* SSO */}
          <Pressable
            onPress={() => {
              console.log('Continue with SSO / Passkey');
            }}
            style={({ pressed }) => ({
              minHeight: 52,
              borderRadius: 12,
              paddingHorizontal: 16,

              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',

              backgroundColor: pressed ? t.surfaceHigh : t.surfaceLow,
            })}
          >
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Building2 size={22} color={t.brandBlue} />

              <Text
                numberOfLines={1}
                style={{
                  flex: 1,
                  fontFamily: 'Figtree-SemiBold',
                  fontSize: 15,
                  color: t.textStrong,
                }}
              >
                Continue with SSO / Passkey
              </Text>
            </View>

            <KeyRound size={19} color={t.outline} />
          </Pressable>

          {/* Security Badge */}
          <View
            style={{
              marginTop: 24,
              padding: 12,
              borderRadius: 12,
              backgroundColor: t.surfaceLow,

              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: t.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={19} color={t.success} />
            </View>

            <View
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Figtree-SemiBold',
                  fontSize: 13,
                  color: t.textStrong,
                }}
              >
                Enterprise-Grade Security
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  marginTop: 2,
                  fontFamily: 'Figtree-Regular',
                  fontSize: 11,
                  color: t.textMuted,
                }}
              >
                SAML 2.0 • FIDO2 WebAuthn • Encrypted at rest
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View
            style={{
              marginTop: 24,
              paddingHorizontal: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Figtree-Regular',
                fontSize: 11,
                lineHeight: 18,
                color: t.textMuted,
                textAlign: 'center',
              }}
            >
              By signing in, you agree to Tailpoint&apos;s{' '}
              <Text
                onPress={() => console.log('Open Terms of Service')}
                style={{
                  fontFamily: 'Figtree-SemiBold',
                  color: t.brand,
                  textDecorationLine: 'underline',
                }}
              >
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text
                onPress={() => console.log('Open Privacy Policy')}
                style={{
                  fontFamily: 'Figtree-SemiBold',
                  color: t.brand,
                  textDecorationLine: 'underline',
                }}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
