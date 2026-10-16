import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {Colors, Images, Spacing, Radius} from '../../constants';
import {useTabNav} from '../../contexts/TabNavContext';
import teamData from '../../mock/team.json';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  contribution: string;
}

const MEMBER_IMAGES: Record<string, any> = {
  '1': Images.devDito,
  '2': Images.devRafi,
  '3': Images.devRezi,
  '4': Images.devSurya,
};

const TEAM_MEMBERS: TeamMember[] = teamData as TeamMember[];

export default function TeamScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {setIsTabBarHidden} = useTabNav();

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      return () => {
        setIsTabBarHidden(false);
      };
    }, [setIsTabBarHidden]),
  );

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
        translucent
      />
      <View style={[styles.topBar, {paddingTop: Math.max(insets.top, 16) + Spacing.xs}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={Colors.textHeadline}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <View style={styles.topBarTitleBox}>
          <Text style={styles.topBarSubtitle}>Presentation By: IT MA</Text>
          <Text style={styles.topBarTitle}>Tentang Tim IT MA</Text>
        </View>
        <View style={styles.topBarRightSlot} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Spacing.huge + insets.bottom},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.introHeading}>Inovasi Digital PT Menara Agung</Text>
          <Text style={styles.introBody}>
            ACIAX MABPKB dikembangkan secara mandiri oleh Tim IT PT Menara Agung
            untuk menghadirkan alur kerja pemindaian dokumen BPKB yang cepat,
            presisi, dan ergonomis dengan kendali pedal kaki tanpa menyentuh layar.
          </Text>
        </View>

        <View style={styles.membersList}>
          {TEAM_MEMBERS.map(member => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberHeaderRow}>
                <View style={styles.avatarWrap}>
                  <Image
                    source={MEMBER_IMAGES[member.id] ?? Images.scannerMascot}
                    style={styles.avatarImg}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.memberMeta}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
              </View>
              <Text style={styles.memberContrib}>{member.contribution}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topBarTitleBox: {
    alignItems: 'center',
    flex: 1,
  },
  topBarSubtitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  topBarTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.textHeadline,
  },
  topBarRightSlot: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  introCard: {
    backgroundColor: Colors.secondary,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  introHeading: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: Colors.primary,
    marginBottom: 4,
  },
  introBody: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textHeadline,
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  memberHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 12,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.secondary,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  memberMeta: {
    flex: 1,
  },
  memberName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.textHeadline,
    marginBottom: 2,
  },
  memberRole: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Colors.primary,
  },
  memberContrib: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
});
