import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking,
} from 'react-native';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';

const PRIMARY = '#2E7D32';
const PRIMARY_LIGHT = '#F1F8F1';

const IconHeadset = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18v-6a9 9 0 0118 0v6" stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z"
      stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconPhone = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 5.18 2 2 0 015 3h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 17.92v-.01z"
      stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconMail = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="22,6 12,13 2,6" stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconClock = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={PRIMARY} strokeWidth="1.8" />
    <Polyline points="12,6 12,12 16,14" stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconShield = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={PRIMARY} stroke={PRIMARY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="9,12 11,14 15,10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconLeaf = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path d="M17 8C8 10 5.9 16.17 3.82 19.34a1 1 0 001.66 1.1C7.27 18.4 10.5 16 17 16c5-8 3-14 3-14s-3 2-3 6z"
      stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.82 19.34C6 14 8 10 17 8" stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const Homefooter: React.FC = () => {
  return (
    <View style={styles.container}>

      {/* ── Need Help ── */}
      <View style={styles.helpCard}>
        <View style={styles.helpIconWrap}>
          <IconHeadset />
        </View>
        <View style={styles.helpContent}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <View style={styles.helpRow}>
            <TouchableOpacity
              style={styles.helpItem}
              onPress={() => Linking.openURL('tel:+9607XXXXXX')}
            >
              <IconPhone />
              <Text style={styles.helpItemText}>+960 7XXXXXX</Text>
            </TouchableOpacity>
            <View style={styles.helpDivider} />
            <TouchableOpacity
              style={styles.helpItem}
              onPress={() => Linking.openURL('mailto:support@yourstore.mv')}
            >
              <IconMail />
              <Text style={styles.helpItemText}>support@yourstore.mv</Text>
            </TouchableOpacity>
            <View style={styles.helpDivider} />
            <View style={styles.helpItem}>
              <IconClock />
              <Text style={styles.helpItemText}>8:00 AM - 10:00 PM{'\n'}Everyday</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Trust Banner ── */}
      <View style={styles.trustBanner}>
        <View style={styles.trustLeft}>
          <IconShield />
        </View>
        <View style={styles.trustText}>
          <Text style={styles.trustTitle}>Safe Shopping. Quality Products.</Text>
          <Text style={styles.trustSubtitle}>Your Satisfaction is Our Priority.</Text>
        </View>
        <View style={styles.trustLeaf}>
          <IconLeaf />
        </View>
      </View>

      {/* ── Made with love ── */}
      <View style={styles.madeWith}>
        <Text style={styles.madeWithText}>Made with </Text>
        <Text style={styles.heartIcon}>💚</Text>
        <Text style={styles.madeWithText}> in Maldives</Text>
      </View>
      <Text style={styles.version}>Version 1.0.0</Text>

    </View>
  );
};

export default Homefooter;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    marginTop: 24,
  },
  helpCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  helpIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpContent: { flex: 1 },
  helpTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  helpRow: {
    flexDirection: 'column',
    gap: 10,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helpItemText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  helpDivider: {
    height: 1,
    backgroundColor: '#E8F5E9',
  },
  trustBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: PRIMARY_LIGHT,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustLeft: {
    marginRight: 14,
  },
  trustText: { flex: 1 },
  trustTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  trustSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  trustLeaf: {
    opacity: 0.25,
    position: 'absolute',
    right: 8,
    bottom: -8,
  },
  madeWith: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  madeWithText: {
    fontSize: 13,
    color: '#888',
  },
  heartIcon: { fontSize: 13 },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
    marginBottom: 8,
  },
});