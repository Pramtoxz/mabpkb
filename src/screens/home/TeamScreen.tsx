import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Svg, {Path, Rect, Line} from 'react-native-svg';
import {Colors, Fonts, Images} from '../../constants';
import {useTabNav} from '../../contexts/TabNavContext';
import {useAlert} from '../../contexts/AlertContext';
import teamData from '../../mock/team.json';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  badgeRole: string;
  tagColor: string;
  summary: string;
  points: string[];
  instagram: string;
}

const MEMBER_IMAGES: Record<string, any> = {
  '1': Images.devRezi,
  '2': Images.devSurya,
  '3': Images.devDito,
  '4': Images.devRafi,
};

const TEAM_MEMBERS: TeamMember[] = teamData as TeamMember[];

export default function TeamScreen() {
  const navigation = useNavigation<any>();
  const {setIsTabBarHidden} = useTabNav();
  const {showAlert} = useAlert();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      return () => {
        setIsTabBarHidden(false);
      };
    }, [setIsTabBarHidden]),
  );

  const handleContact = async (instagram: string) => {
    const instagramUrl = `https://www.instagram.com/${instagram}`;
    try {
      await Linking.openURL(instagramUrl);
    } catch {
      showAlert({
        title: 'Instagram',
        message: `Terjadi kesalahan saat membuka profil @${instagram}`,
        type: 'error',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={Colors.textHeadline}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang Kami</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.introSection}>
          <View style={styles.logoContainer}>
            <Image
              source={Images.maLogo}
              style={styles.logoMenaraAgung}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appTitle}>Tim Development</Text>
          <Text style={styles.appDesc}>
            Aplikasi Sistem Digitalisasi & Pemindaian Berkas BPKB Terintegrasi Pedal Bluetooth
          </Text>
          <Text style={styles.companyName}>PT Menara Agung</Text>
        </View>

        <View style={styles.cardsContainer}>
          {TEAM_MEMBERS.map(member => (
            <TouchableOpacity
              key={member.id}
              style={styles.card}
              activeOpacity={0.75}
              onPress={() => setSelectedMember(member)}>
              <View
                style={[
                  styles.avatarContainer,
                  {borderColor: member.tagColor},
                ]}>
                <Image
                  source={MEMBER_IMAGES[member.id]}
                  style={styles.avatar}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{member.name}</Text>
                  <View
                    style={[
                      styles.roleBadge,
                      {
                        backgroundColor: `${member.tagColor}15`,
                        borderColor: `${member.tagColor}35`,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.roleBadgeText,
                        {color: member.tagColor},
                      ]}>
                      {member.badgeRole}
                    </Text>
                  </View>
                </View>
                <Text style={styles.summaryText} numberOfLines={1}>
                  {member.summary}
                </Text>
              </View>

              <View style={styles.chevronBox}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 18l6-6-6-6"
                    stroke={Colors.textTertiary}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Version 1.0.0 • © 2026 PT Menara Agung
          </Text>
        </View>
      </View>

      <Modal
        visible={!!selectedMember}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMember(null)}>
        <TouchableWithoutFeedback onPress={() => setSelectedMember(null)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                {selectedMember && (
                  <>
                    <View style={styles.modalTopRow}>
                      <View
                        style={[
                          styles.modalBadge,
                          {
                            backgroundColor: `${selectedMember.tagColor}15`,
                            borderColor: `${selectedMember.tagColor}35`,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.modalBadgeText,
                            {color: selectedMember.tagColor},
                          ]}>
                          {selectedMember.badgeRole}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.modalCloseButton}
                        activeOpacity={0.7}
                        onPress={() => setSelectedMember(null)}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M18 6L6 18M6 6l12 12"
                            stroke={Colors.textSecondary}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalProfileHeader}>
                      <View
                        style={[
                          styles.modalAvatarContainer,
                          {borderColor: selectedMember.tagColor},
                        ]}>
                        <Image
                          source={MEMBER_IMAGES[selectedMember.id]}
                          style={styles.modalAvatar}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.modalName}>{selectedMember.name}</Text>
                      <Text style={styles.modalRoleTitle}>{selectedMember.role}</Text>
                    </View>

                    <View style={styles.modalDivider} />

                    <Text style={styles.modalSectionLabel}>
                      TANGGUNG JAWAB TEKNIS
                    </Text>

                    <View style={styles.modalPointsContainer}>
                      {selectedMember.points.map((point, idx) => (
                        <View key={idx} style={styles.modalPointRow}>
                          <View
                            style={[
                              styles.modalPointDot,
                              {backgroundColor: selectedMember.tagColor},
                            ]}
                          />
                          <Text style={styles.modalPointText}>{point}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.modalDivider} />

                    <TouchableOpacity
                      style={styles.modalContactButton}
                      activeOpacity={0.7}
                      onPress={() => handleContact(selectedMember.instagram)}>
                      <View style={styles.modalContactContent}>
                        <Svg
                          width={16}
                          height={16}
                          viewBox="0 0 24 24"
                          fill="none"
                          style={styles.modalContactIcon}>
                          <Rect
                            x={2}
                            y={2}
                            width={20}
                            height={20}
                            rx={5}
                            ry={5}
                            stroke={Colors.primary}
                            strokeWidth={2}
                          />
                          <Path
                            d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                            stroke={Colors.primary}
                            strokeWidth={2}
                          />
                          <Line
                            x1={17.5}
                            y1={6.5}
                            x2={17.51}
                            y2={6.5}
                            stroke={Colors.primary}
                            strokeWidth={2}
                            strokeLinecap="round"
                          />
                        </Svg>
                        <Text style={styles.modalContactText}>
                          Lihat Profil Instagram
                        </Text>
                      </View>
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                          stroke={Colors.primary}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: Fonts.heading.bold,
    fontSize: 18,
    color: Colors.textHeadline,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 16,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 16,
  },
  logoContainer: {
    width: 78,
    height: 78,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  logoMenaraAgung: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  appTitle: {
    fontFamily: Fonts.heading.bold,
    fontSize: 18,
    color: Colors.textHeadline,
    marginBottom: 2,
  },
  appDesc: {
    fontFamily: Fonts.body.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 16,
  },
  companyName: {
    fontFamily: Fonts.heading.bold,
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 3,
  },
  cardsContainer: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 48,
    height: 48,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  name: {
    fontFamily: Fonts.heading.bold,
    fontSize: 14,
    color: Colors.textHeadline,
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontFamily: Fonts.body.semiBold,
    fontSize: 9.5,
  },
  summaryText: {
    fontFamily: Fonts.body.regular,
    fontSize: 10.8,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  chevronBox: {
    marginLeft: 6,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 4,
  },
  footerText: {
    fontFamily: Fonts.body.regular,
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalBadgeText: {
    fontFamily: Fonts.body.semiBold,
    fontSize: 10,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalProfileHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalAvatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalAvatar: {
    width: 70,
    height: 70,
  },
  modalName: {
    fontFamily: Fonts.heading.bold,
    fontSize: 18,
    color: Colors.textHeadline,
    marginBottom: 2,
  },
  modalRoleTitle: {
    fontFamily: Fonts.body.medium,
    fontSize: 12.5,
    color: Colors.textSecondary,
  },
  modalDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  modalSectionLabel: {
    fontFamily: Fonts.heading.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: Colors.textTertiary,
    marginBottom: 8,
  },
  modalPointsContainer: {
    gap: 7,
  },
  modalPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  modalPointDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 5,
  },
  modalPointText: {
    flex: 1,
    fontFamily: Fonts.body.regular,
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 16.5,
  },
  modalContactButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  modalContactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContactIcon: {
    marginRight: 8,
  },
  modalContactText: {
    fontFamily: Fonts.heading.bold,
    fontSize: 13,
    color: Colors.primary,
  },
});
