// src/features/auth/screens/welcome-screen.tsx

import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
  type ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

const TOKENS = {
  light: {
    brand: '#008080',
    brandPressed: '#006B6B',
    canvas: '#F6F8FA',
    surface: '#FFFFFF',
    textStrong: '#122033',
    textMuted: '#667085',
    textLight: '#0E1C2F',
    border: '#E4E9F0',
  },

  dark: {
    brand: '#35B8B2',
    brandPressed: '#249C97',
    canvas: '#FFFFFF',
    // canvas: '#0B1220',
    surface: '#111B2E',
    textStrong: '#F5F8FC',
    textMuted: '#AAB6C8',
    textLight: '#0E1C2F',
    border: '#29364B',
  },
} as const;

type Tokens = (typeof TOKENS)[keyof typeof TOKENS];

type Slide = {
  key: string;
  heading: string;
  body: string;
  image: ImageSourcePropType;
};

const SLIDES: Slide[] = [
  {
    key: 'attention',
    heading: 'Know what matters.',
    body: 'See priorities, updates, and the work that needs your attention first.',
    image: require('@/assets/images/organizing-work.png'),
  },
  {
    key: 'blockers',
    heading: 'Move work forward.',
    body: 'Stay ahead of blockers and keep projects moving without losing context.',
    image: require('@/assets/images/software-engineer.png'),
  },
  {
    key: 'decide',
    heading: 'Decide faster.',
    body: 'Review updates, approve decisions, and keep your team aligned from anywhere.',
    image: require('@/assets/images/group-chat.png'),
  },
];

function PaginationDots({
  t,
  activeIndex,
}: {
  t: Tokens;
  activeIndex: number;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 7,
      }}
    >
      {SLIDES.map((slide, index) => {
        const active = activeIndex === index;

        return (
          <View
            key={slide.key}
            style={{
              width: active ? 22 : 7,
              height: 7,
              borderRadius: 999,
              backgroundColor: active ? t.brand : t.border,
            }}
          />
        );
      })}
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();

  const t = TOKENS[scheme === 'dark' ? 'dark' : 'light'];

  const { width, height } = useWindowDimensions();

  const listRef = useRef<FlatList<Slide>>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const [viewabilityConfig] = useState({
    itemVisiblePercentThreshold: 60,
  });

  const [onViewableItemsChanged] = useState(
    () =>
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        const index = viewableItems[0]?.index;

        if (index != null) {
          setActiveIndex(index);
        }
      },
  );

  const handleContinue = () => {
    if (isLastSlide) {
      router.push('/(public)/sign-up');
      return;
    }

    const nextIndex = activeIndex + 1;

    listRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  };

  const imageWidth = Math.min(width - 64, 380);
  const imageHeight = Math.min(height * 0.35, 320);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.canvas,
      }}
    >
      {/* Top */}
      <View
        style={{
          height: 52,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {!isLastSlide && (
          <Pressable
            onPress={() => router.push('/(public)/sign-up')}
            hitSlop={10}
            style={({ pressed }) => ({
              paddingVertical: 8,
              paddingHorizontal: 6,
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: 'Figtree-SemiBold',
                fontSize: 14,
                color: t.textMuted,
              }}
            >
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      {/* Carousel */}
      <View
        style={{
          flex: 1,
        }}
      >
        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          renderItem={({ item }) => (
            <View
              style={{
                width,
                paddingHorizontal: 24,
              }}
            >
              {/* Illustration */}
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={item.image}
                  resizeMode="contain"
                  style={{
                    width: imageWidth,
                    height: imageHeight,
                  }}
                />
              </View>

              {/* Text */}
              <View
                style={{
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  paddingBottom: 24,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Figtree-Bold',
                    fontSize: 30,
                    lineHeight: 36,
                    letterSpacing: -0.5,
                    color: t.textLight,
                    textAlign: 'center',
                  }}
                >
                  {item.heading}
                </Text>

                <Text
                  style={{
                    marginTop: 10,
                    maxWidth: 340,
                    fontFamily: 'Figtree-Regular',
                    fontSize: 15,
                    lineHeight: 22,
                    color: t.textLight,
                    textAlign: 'center',
                  }}
                >
                  {item.body}
                </Text>
              </View>
            </View>
          )}
        />
      </View>

      {/* Bottom section */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 20,
          backgroundColor: t.canvas,
        }}
      >
        <PaginationDots t={t} activeIndex={activeIndex} />

        {/* Main button */}
        <Pressable
          onPress={handleContinue}
          style={{
            width: '100%',
            height: 52,
            marginTop: 22,
            borderRadius: 13,
            backgroundColor: '#008080',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 15,
              fontFamily: 'Figtree-SemiBold',
            }}
          >
            {isLastSlide ? 'Get started' : 'Continue'}
          </Text>

          <ArrowRight size={19} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </Pressable>

        {/* Sign in */}
        <View
          style={{
            marginTop: 14,
            minHeight: 30,

            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

            gap: 5,
          }}
        >
          <Text
            style={{
              fontFamily: 'Figtree-Regular',
              fontSize: 14,
              lineHeight: 20,
              color: t.textMuted,
            }}
          >
            Already have an account?
          </Text>

          <Pressable onPress={() => router.push('/(app)/(tabs)')} hitSlop={8}>
            {({ pressed }) => (
              <Text
                style={{
                  fontFamily: 'Figtree-SemiBold',
                  fontSize: 14,
                  lineHeight: 20,
                  color: t.brand,
                  opacity: pressed ? 0.5 : 1,
                }}
              >
                Sign in
              </Text>
            )}
          </Pressable>
        </View>

        {/* Join Organization */}
        <View
          style={{
            marginTop: 2,
            minHeight: 30,

            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

            gap: 5,
          }}
        >
          <Text
            style={{
              fontFamily: 'Figtree-Regular',
              fontSize: 14,
              lineHeight: 20,
              color: t.textMuted,
            }}
          >
            Have an invitation?
          </Text>

          <Pressable
            onPress={() => router.push('/(public)/join-org')}
            hitSlop={8}
          >
            {({ pressed }) => (
              <Text
                style={{
                  fontFamily: 'Figtree-SemiBold',
                  fontSize: 14,
                  lineHeight: 20,
                  color: t.brand,
                  opacity: pressed ? 0.5 : 1,
                }}
              >
                Join organization
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
