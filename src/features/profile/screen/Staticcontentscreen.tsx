/**
 * StaticContentScreen
 * ──────────────────────────────────────────────────────────────────────────
 * A single reusable screen for all static text pages:
 *   – About Us
 *   – FAQ
 *   – Privacy Policy
 *   – Terms & Conditions
 *   – Help & Support
 *
 * Register it in your navigator for each route by passing `route.params.type`.
 *
 * Navigation example:
 *   navigation.navigate('StaticContent', { type: 'faq' })
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, LayoutAnimation,
  UIManager, Platform, Linking, TextInput,
  Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, FontFamily } from '../../../theme';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import frozen from '@/assets/images/frozen.png';
import nuts   from '@/assets/images/nuts.png';
import seeds  from '@/assets/images/seeds.png';
import powder from '@/assets/images/powder.png';
import dal    from '@/assets/images/dal.png';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ContentType = 'about' | 'faq' | 'privacy' | 'terms' | 'help';

type Props = NativeStackScreenProps<RootStackParamList, 'StaticContent'>;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconArrowLeft = ({ color = '#333', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconChevronDown = ({ color = '#333', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconChevronUp = ({ color = Colors.primary, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 15l-6-6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Static Content Definitions ───────────────────────────────────────────────
interface FaqItem {
  q: string;
  a: string;
}

interface ContentSection {
  heading?: string;
  body: string;
}

interface PageConfig {
  title: string;
  emoji: string;
  sections?: ContentSection[];
  faqs?: FaqItem[];
}

const CONTENT: Record<ContentType, PageConfig> = {

  about: {
  title: 'About Our App',
  emoji: '🛍️',
  sections: [
    {
      heading: 'Welcome to Our Store',
      body: 'Our application is designed to provide customers across Maldives with a simple, modern, and reliable shopping experience. We focus on making everyday ordering easier by offering a clean platform where users can browse products, manage orders, and receive deliveries conveniently from their mobile devices.',
    },
    {
      heading: 'Our Goal',
      body: 'Our goal is to simplify online shopping by creating a fast and user-friendly platform that helps customers save time while accessing quality products and reliable services. We continuously work to improve the application experience and provide better services for our customers.',
    },
    {
      heading: 'Quality & Reliability',
      body: 'We carefully manage products, inventory, and order processing to maintain service quality and customer satisfaction. Our system is designed to ensure smooth operations, accurate product information, and reliable order management throughout the application.',
    },
    {
      heading: 'Fast Delivery Experience',
      body: 'Orders are processed efficiently and prepared for delivery as quickly as possible. Customers receive order updates directly within the application, helping them stay informed throughout the entire process from confirmation to delivery.',
    },
    {
      heading: 'Simple & Modern Experience',
      body: 'The application interface is built with simplicity and usability in mind. Customers can easily search products, browse categories, manage addresses, view order history, and access account features without complicated steps or unnecessary complexity.',
    },
    {
      heading: 'Customer Satisfaction',
      body: 'Customer satisfaction remains one of our highest priorities. Our support team is available to assist users with delivery concerns, order updates, account issues, and general support inquiries whenever assistance is needed.',
    },
    {
      heading: 'Reliable Platform',
      body: 'We continue improving the platform by optimizing application performance, improving order management systems, and enhancing the overall customer experience to maintain a dependable and stable service environment.',
    },
    {
      heading: 'Our Commitment',
      body: 'We are committed to building a trusted digital shopping platform for customers across Maldives by providing consistent service quality, responsive customer support, and a convenient online ordering experience.',
    },
  ],
},

privacy: {
  title: 'Privacy Policy',
  emoji: '🔒',
  sections: [
    {
      heading: '1. Information We Collect',
      body: 'We collect information you provide directly to us, such as your name, phone number, email address, delivery address (including island/atoll), and payment information.',
    },
    {
      heading: '2. How We Use Your Information',
      body: 'We use your information to process orders, deliver products, provide customer support, improve our services and send important updates.',
    },
    {
      heading: '3. Information Sharing',
      body: 'We do not sell your personal information. We may share your information with trusted service providers, such as delivery partners, only to deliver our services.',
    },
    {
      heading: '4. Data Security',
      body: 'We implement appropriate security measures to protect your personal information from unauthorized access, alteration or disclosure.',
    },
    {
      heading: '5. Cookies & Tracking',
      body: 'We use cookies and similar technologies to enhance your experience, analyze usage and personalize content.',
    },
    {
      heading: '6. Your Rights',
      body: 'You have the right to access, update or delete your personal information. You can also opt out of marketing communications at any time.',
    },
    {
      heading: '7. Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Effective date: 2026.',
    },
    {
      heading: '8. Contact Us',
      body: 'If you have any questions about this Privacy Policy, contact us at vvfresh643@gmail.com or +960 942-7902.',
    },
  ],
},

terms: {
  title: 'Terms & Conditions',
  emoji: '📄',
  sections: [
    {
      heading: 'Acceptance of Terms',
      body: 'By accessing or using our app, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree with any part of these terms, you may not use our services. Effective date: 2026.',
    },
    {
      heading: 'Use of Our Services',
      body: 'You agree to use our app and services only for lawful purposes and in accordance with these Terms. You must not use our services in any way that may damage, disable, or impair our app.',
    },
    {
      heading: 'Orders & Payments',
      body: 'All orders are subject to availability. We reserve the right to refuse or cancel any order. Prices are subject to change without notice. Payment must be made at the time of placing an order through the available payment methods, including Cash on Delivery where offered.',
    },
    {
      heading: 'Delivery',
      body: 'We deliver to selected islands and atolls within the Maldives. We will make reasonable efforts to deliver your order within the estimated time. Delivery times may vary based on location, weather, sea/ferry conditions, and availability. We are not responsible for delays caused by circumstances beyond our control.',
    },
    {
      heading: 'Frozen & Perishable Items',
      body: 'Frozen, chilled, and fresh items (including fish, meat, vegetables, and fruits) are packed to maintain quality during transit. Customers must be available to receive these items promptly upon delivery to avoid spoilage.',
    },
    {
      heading: 'Returns & Refunds',
      body: 'If you are not satisfied with the products received, please contact our support within 24 hours of delivery. Refunds are processed as per our Refund Policy.',
    },
    {
      heading: 'Limitation of Liability',
      body: 'We are not liable for any indirect, incidental, or consequential damages arising from the use of our app or services.',
    },
    {
      heading: 'Changes to Terms',
      body: 'We may update these Terms & Conditions from time to time. Any changes will be posted on this page with an updated effective date.',
    },
    {
      heading: 'Contact Us',
      body: 'For questions about these Terms & Conditions, contact us at vvfresh643@gmail.com or +960 942-7902.',
    },
  ],
},

help: {
  title: 'Help & Support',
  emoji: '🎧',
  sections: [
    {
      heading: 'Customer Support',
      body: 'Our support team is available to assist customers with order management, delivery updates, account assistance, and general service-related inquiries through the application.',
    },
    {
      heading: 'Order Assistance',
      body: 'Customers experiencing order delays, missing products, incorrect deliveries, or order-related concerns may contact support directly for assistance and resolution.',
    },
    {
      heading: 'Delivery Assistance',
      body: 'Delivery-related support is available for customers who require order tracking updates, address corrections, or additional delivery information during active orders.',
    },
    {
      heading: 'Account Assistance',
      body: 'Support services are available for account-related concerns including login issues, address management, profile updates, and account access assistance.',
    },
    {
      heading: 'Technical Support',
      body: 'Customers experiencing technical issues within the application may contact support with relevant details to help identify and resolve problems efficiently.',
    },
    {
      heading: 'Application Services',
      body: 'We continuously monitor and improve application performance, operational stability, and user experience to provide reliable services for all customers.',
    },
    {
      heading: 'Support Availability',
      body: 'Customer support is available every day from 8:00 AM to 10:00 PM, including weekends and public holidays, to provide timely responses and assistance for customer concerns and service requests.',
    },
    {
      heading: 'Contact Information',
      body: 'Email: vvfresh643@gmail.com\nPhone / WhatsApp: +960 942-7902\nLocation: Maldives',
    },
  ],
},

faq: {
  title: 'FAQs',
  emoji: '❓',
  faqs: [
    {
      q: 'What are your delivery hours?',
      a: 'We deliver every day from 8:00 AM to 10:00 PM, including weekends and public holidays.',
    },
    {
      q: 'How long does delivery take?',
      a: 'Delivery times may vary depending on order volume, operational conditions, and your location within supported delivery areas. Typically orders arrive within 1–2 hours.',
    },
    {
      q: 'Which islands do you deliver to?',
      a: 'We currently deliver to selected islands and atolls. Please check the delivery coverage section in the app to confirm whether your island is supported.',
    },
    {
      q: 'Do you deliver fresh fish and produce?',
      a: 'Yes, we deliver fresh fish, vegetables, and fruits sourced daily where possible. Availability may vary by season and supply.',
    },
    {
      q: 'Do you deliver frozen products?',
      a: 'Yes, we deliver frozen products including meat, seafood, and ready-to-cook items. All frozen items are handled with care to maintain quality during transit.',
    },
    {
      q: 'How is frozen food kept cold during delivery?',
      a: 'Frozen and chilled products are packed using insulated packaging and ice packs to maintain the required temperature throughout the delivery process.',
    },
    {
      q: 'Can I cancel my order?',
      a: 'Orders may be cancelled before preparation or dispatch depending on operational status and order progress. Please contact support as soon as possible if you need to cancel.',
    },
    {
      q: 'Can I modify my order after placing it?',
      a: 'Order modifications may be possible before the order is prepared. Please contact our support team immediately after placing the order if changes are needed.',
    },
    {
      q: 'Do you offer Cash on Delivery?',
      a: 'Payment options including Cash on Delivery may be available depending on your location and order type. Available payment methods are shown at checkout.',
    },
    {
      q: 'What if an item is out of stock?',
      a: 'If an item becomes unavailable after your order is placed, our team will contact you to offer a replacement or process a refund for that item.',
    },
    {
      q: 'How can I contact support?',
      a: 'You can reach our support team via Call or WhatsApp at +960 942-7902, or Email at vvfresh643@gmail.com. You can also use the Help & Support section in the app.',
    },
    {
      q: 'Where can I read your policies?',
      a: 'Our latest Terms of Service and Privacy Policy (effective 2026) are available in the Settings section of the app.',
    },
  ],
},
};

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
const IconQuestionMark = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 17h.01" stroke={Colors.primary} strokeWidth={2.5} strokeLinecap="round" />
    <Circle cx="12" cy="12" r="10" stroke={Colors.primary} strokeWidth={1.8} />
  </Svg>
);

const IconSearch = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke={Colors.grey400} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FaqAccordion: React.FC<{ item: FaqItem }> = ({ item }) => {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(v => !v);
  };

  return (
    <TouchableOpacity style={faqStyles.item} onPress={toggle} activeOpacity={0.85}>
      <View style={faqStyles.header}>
        <View style={faqStyles.iconCircle}>
          <IconQuestionMark size={20} />
        </View>
        <Text style={faqStyles.question}>{item.q}</Text>
        {open
          ? <IconChevronUp color={Colors.primary} size={20} />
          : <IconChevronDown color={Colors.grey300} size={20} />
        }
      </View>
      {open && (
        <View style={faqStyles.answerWrap}>
          <Text style={faqStyles.answer}>{item.a}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const faqStyles = StyleSheet.create({
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1, borderColor: '#EFEFEF',
    marginBottom: 10, overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 16, gap: 12,
  },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: Colors.primary + '40',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  question:   { flex: 1, fontFamily: FontFamily.semiBold, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  answerWrap: { paddingHorizontal: 62, paddingBottom: 16, paddingTop: 0 },
  answer:     { fontFamily: FontFamily.regular, fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
});

const faqScreenStyles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.grey100,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 2,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchField: {
    flex: 1, fontFamily: FontFamily.regular,
    fontSize: 14, color: Colors.textPrimary,
    paddingVertical: 12,
  },

  empty: {
    fontFamily: FontFamily.regular, fontSize: 14,
    color: Colors.textSecondary, textAlign: 'center',
    marginTop: 32,
  },

  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    borderRadius: 14, padding: 16, marginTop: 20, gap: 12,
  },
  bannerIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: { fontFamily: FontFamily.bold, fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  bannerSub:   { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  bannerBtn: {
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  bannerBtnText: { fontFamily: FontFamily.semiBold, fontSize: 13, color: Colors.primary },
});

// ─── FAQ Screen ───────────────────────────────────────────────────────────────
const FaqScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const allFaqs = CONTENT.faq.faqs ?? [];
  const filtered = query.trim()
    ? allFaqs.filter(f => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()))
    : allFaqs;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={faqScreenStyles.scroll}>

      {/* Search bar */}
      <View style={faqScreenStyles.searchWrap}>
        <View style={faqScreenStyles.searchIcon}><IconSearch size={18} /></View>
        <TextInput
          style={faqScreenStyles.searchField}
          placeholder="Search FAQs..."
          placeholderTextColor={Colors.grey400}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* FAQ list */}
      <View style={{ marginTop: 8 }}>
        {filtered.map((faq, i) => (
          <FaqAccordion key={i} item={faq} />
        ))}
        {filtered.length === 0 && (
          <Text style={faqScreenStyles.empty}>No results for "{query}"</Text>
        )}
      </View>

      {/* Still have questions banner */}
      <View style={faqScreenStyles.banner}>
        <View style={faqScreenStyles.bannerIcon}>
          <IconHeadset color={Colors.primary} size={32} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={faqScreenStyles.bannerTitle}>Still have questions?</Text>
          <Text style={faqScreenStyles.bannerSub}>Chat with our support team. We're here to help!</Text>
        </View>
        <TouchableOpacity
          style={faqScreenStyles.bannerBtn}
          onPress={() => navigation.push('StaticContent', { type: 'help' })}
          activeOpacity={0.8}
        >
          <Text style={faqScreenStyles.bannerBtnText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

// ─── About Us Screen ──────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// About — feature icons
const AboutIconShield = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke={Colors.primary} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const AboutIconSnowflake = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);
const AboutIconBox = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke={Colors.primary} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const AboutIconHeadphones = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18v-6a9 9 0 0118 0v6" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v3z" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const AboutIconWallet = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke={Colors.primary} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M16 3H8L4 7h16l-4-4z" stroke={Colors.primary} strokeWidth={1.8} strokeLinejoin="round" />
    <Circle cx="16" cy="14" r="1.5" fill={Colors.primary} />
  </Svg>
);
const AboutIconTarget = () => (
  <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={Colors.primary} strokeWidth={1.8} />
    <Circle cx="12" cy="12" r="6"  stroke={Colors.primary} strokeWidth={1.8} />
    <Circle cx="12" cy="12" r="2"  stroke={Colors.primary} strokeWidth={1.8} />
    <Path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M16 8l2-2" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);
const AboutIconPhone = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6.5c0-.6.4-1 1-1H7.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const AboutIconMail = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6l-10 7L2 6" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const AboutIconPin = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={Colors.primary} strokeWidth={1.8} strokeLinejoin="round" />
    <Circle cx="12" cy="9" r="2.5" stroke={Colors.primary} strokeWidth={1.8} />
  </Svg>
);
const AboutIconClock = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={Colors.primary} strokeWidth={1.8} />
    <Path d="M12 6v6l4 2" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WHY_FEATURES = [
  { label: 'Premium\nQuality',        Icon: AboutIconShield },
  { label: 'Frozen Fresh\nDelivery',  Icon: AboutIconSnowflake },
  { label: 'Carefully\nPacked',       Icon: AboutIconBox },
  { label: 'Fast\nSupport',           Icon: AboutIconHeadphones },
  { label: 'Cash on\nDelivery',       Icon: AboutIconWallet },
];

const ABOUT_CATEGORIES = [
  { label: 'Frozen Foods', image: frozen, bg: '#E3F2FD' },
  { label: 'Nuts',         image: nuts,   bg: '#FFF3E0' },
  { label: 'Seeds',        image: seeds,  bg: '#F3E5F5' },
  { label: 'Powders',      image: powder, bg: '#FCE4EC' },
  { label: 'Dal & Pulses', image: dal,    bg: '#FFF8E1' },
];

const AboutScreen: React.FC = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={aboutStyles.scroll}>

      {/* ── Hero banner ── */}
      <View style={aboutStyles.heroBanner}>
        <View style={aboutStyles.heroLeft}>
          <Text style={aboutStyles.heroTitle1}>Fresh Groceries,</Text>
          <Text style={aboutStyles.heroTitle2}>Delivered to You</Text>
          <View style={aboutStyles.heroDivider} />
          <Text style={aboutStyles.heroDesc}>
            We bring you premium quality groceries, frozen foods, nuts, seeds and more – delivered fresh to your doorstep.
          </Text>
        </View>
      </View>

      {/* ── Our Mission ── */}
      <View style={aboutStyles.missionCard}>
        <View style={aboutStyles.missionIcon}>
          <AboutIconTarget />
        </View>
        <View style={aboutStyles.missionText}>
          <Text style={aboutStyles.missionTitle}>Our Mission</Text>
          <Text style={aboutStyles.missionBody}>
            To make healthy and quality products accessible across Maldives with reliable delivery and excellent customer service.
          </Text>
        </View>
      </View>

      {/* ── Why Choose Us ── */}
      <Text style={aboutStyles.sectionTitle}>Why Choose Us?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={aboutStyles.featuresRow}>
        {WHY_FEATURES.map(({ label, Icon }, i) => (
          <View key={i} style={aboutStyles.featureCard}>
            <Icon />
            <Text style={aboutStyles.featureLabel}>{label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* ── Our Categories ── */}
      <Text style={aboutStyles.sectionTitle}>Our Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={aboutStyles.catsRow}>
        {ABOUT_CATEGORIES.map(({ label, image, bg }, i) => (
          <View key={i} style={aboutStyles.catItem}>
            <View style={[aboutStyles.catCircle, { backgroundColor: bg }]}>
              <Image source={image} style={aboutStyles.catImage} resizeMode="contain" />
            </View>
            <Text style={aboutStyles.catLabel}>{label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* ── Get in Touch ── */}
      <View style={aboutStyles.contactCard}>
        <View style={aboutStyles.contactLeft}>
          <Text style={aboutStyles.contactTitle}>Get in Touch</Text>
          {[
            { Icon: AboutIconPhone, text: '+960 942-7902' },
            { Icon: AboutIconMail,  text: 'vvfresh643@gmail.com' },
            { Icon: AboutIconPin,   text: 'Maldives' },
            { Icon: AboutIconClock, text: "We're available 8 AM – 10 PM" },
          ].map(({ Icon, text }, i) => (
            <View key={i} style={aboutStyles.contactRow}>
              <View style={aboutStyles.contactIconWrap}><Icon /></View>
              <Text style={aboutStyles.contactText}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Made with love ── */}
      <View style={aboutStyles.footer}>
        <Text style={aboutStyles.footerText}>Made with </Text>
        <Text style={{ color: Colors.primary, fontSize: 14 }}>♥</Text>
        <Text style={aboutStyles.footerText}> in Maldives</Text>
      </View>

    </ScrollView>
  );
};

const aboutStyles = StyleSheet.create({
  scroll: { paddingBottom: 40 },

  heroBanner: {
    backgroundColor: Colors.primarySurface,
    marginHorizontal: 20, marginBottom: 16,
    borderRadius: 16, padding: 20, minHeight: 180,
  },
  heroLeft:   { flex: 1 },
  heroTitle1: { fontFamily: FontFamily.bold, fontSize: 22, color: Colors.textPrimary, lineHeight: 28 },
  heroTitle2: { fontFamily: FontFamily.bold, fontSize: 22, color: Colors.primary, lineHeight: 30, marginBottom: 8 },
  heroDivider: { width: 36, height: 3, backgroundColor: Colors.primary, borderRadius: 2, marginBottom: 12 },
  heroDesc:   { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary, lineHeight: 20, maxWidth: '65%' },

  missionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16, borderWidth: 1, borderColor: '#EFEFEF',
    marginHorizontal: 20, marginBottom: 24,
    padding: 18, gap: 16,
  },
  missionIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center', justifyContent: 'center',
  },
  missionText:  { flex: 1 },
  missionTitle: { fontFamily: FontFamily.bold, fontSize: 16, color: Colors.textPrimary, marginBottom: 6 },
  missionBody:  { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  sectionTitle: {
    fontFamily: FontFamily.bold, fontSize: 16, color: Colors.textPrimary,
    marginHorizontal: 20, marginBottom: 14,
  },

  featuresRow: { paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  featureCard: {
    width: 100, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14, borderWidth: 1, borderColor: '#EFEFEF',
    paddingVertical: 16, paddingHorizontal: 8, gap: 10,
  },
  featureLabel: { fontFamily: FontFamily.medium, fontSize: 12, color: Colors.textPrimary, textAlign: 'center', lineHeight: 16 },

  catsRow: { paddingHorizontal: 20, gap: 14, marginBottom: 24 },
  catItem:   { alignItems: 'center', gap: 8, width: 72 },
  catCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  catImage:  { width: 52, height: 52 },
  catLabel:  { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textPrimary, textAlign: 'center' },

  contactCard: {
    backgroundColor: Colors.primarySurface,
    borderRadius: 16, marginHorizontal: 20,
    padding: 20, marginBottom: 20,
  },
  contactLeft:    { flex: 1 },
  contactTitle:   { fontFamily: FontFamily.bold, fontSize: 18, color: Colors.textPrimary, marginBottom: 14 },
  contactRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  contactIconWrap:{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  contactText:    { fontFamily: FontFamily.regular, fontSize: 14, color: Colors.textPrimary },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 8 },
  footerText: { fontFamily: FontFamily.regular, fontSize: 14, color: Colors.textSecondary },
});

// ─── Privacy Policy Screen ────────────────────────────────────────────────────
const IconPrivacyShield = ({ size = 56 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke={Colors.primary} strokeWidth={1.8} strokeLinejoin="round" fill={Colors.primary + '12'} />
    <Path d="M12 8v4M12 15h.01" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" />
    <Path d="M9 11.5a3 3 0 006 0" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const PrivacyIconPerson = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={Colors.primary} strokeWidth={1.8} />
  </Svg>
);

const PrivacyIconChart = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M18 20V10M12 20V4M6 20v-6" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PrivacyIconShare = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5" r="3" stroke={Colors.primary} strokeWidth={1.8} />
    <Circle cx="6" cy="12" r="3" stroke={Colors.primary} strokeWidth={1.8} />
    <Circle cx="18" cy="19" r="3" stroke={Colors.primary} strokeWidth={1.8} />
    <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const PrivacyIconShieldCheck = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke={Colors.primary} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PrivacyIconCookie = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={Colors.primary} strokeWidth={1.8} />
    <Path d="M8.5 8.5h.01M12 12h.01M16 10h.01M10 16h.01M15 15h.01" stroke={Colors.primary} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

const PrivacyIconDoc = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={Colors.primary} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M14 2v6h6M9 13h6M9 17h4" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const PRIVACY_ICONS = [
  <PrivacyIconPerson />,
  <PrivacyIconChart />,
  <PrivacyIconShare />,
  <PrivacyIconShieldCheck />,
  <PrivacyIconCookie />,
  <PrivacyIconPerson />,
  <PrivacyIconDoc />,
];

const PrivacyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const sections = CONTENT.privacy.sections ?? [];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={privacyStyles.scroll}>

      {/* Hero banner */}
      <View style={privacyStyles.hero}>
        <View style={privacyStyles.heroIconWrap}>
          <IconPrivacyShield size={56} />
        </View>
        <View style={privacyStyles.heroText}>
          <Text style={privacyStyles.heroTitle}>Your Privacy Matters</Text>
          <Text style={privacyStyles.heroSub}>We are committed to protecting your personal information and being transparent about how we collect, use and protect your data.</Text>
          <View style={privacyStyles.dateRow}>
            <IconCalendar size={13} />
            <Text style={privacyStyles.dateText}>Last updated: 20 May 2024</Text>
          </View>
        </View>
      </View>

      {/* Intro paragraph */}
      <Text style={privacyStyles.intro}>
        This Privacy Policy describes how we collect, use, disclose and safeguard your information when you use our app and services.
      </Text>

      {/* Section rows */}
      {sections.map((section, i) => (
        <View key={i} style={[privacyStyles.row, i < sections.length - 1 && privacyStyles.rowBorder]}>
          <View style={privacyStyles.iconCircle}>
            {PRIVACY_ICONS[i] ?? <PrivacyIconDoc />}
          </View>
          <View style={privacyStyles.rowContent}>
            <Text style={privacyStyles.rowHeading}>{section.heading}</Text>
            <Text style={privacyStyles.rowBody}>{section.body}</Text>
          </View>
          <IconChevronDown color="#CCCCCC" size={18} />
        </View>
      ))}

      {/* Footer banner */}
      <View style={privacyStyles.banner}>
        <View style={privacyStyles.bannerIcon}>
          <IconHeadset color={Colors.primary} size={30} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={privacyStyles.bannerTitle}>Questions about your privacy?</Text>
          <Text style={privacyStyles.bannerSub}>We're here to help. Contact our support team.</Text>
        </View>
        <TouchableOpacity
          style={privacyStyles.bannerBtn}
          onPress={() => navigation.push('StaticContent', { type: 'help' })}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconChat color={Colors.primary} size={14} />
            <Text style={privacyStyles.bannerBtnText}>Contact Support</Text>
          </View>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const privacyStyles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },

  hero: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.primarySurface,
    borderRadius: 16, padding: 18, marginBottom: 20, gap: 14,
  },
  heroIconWrap: {
    width: 80, height: 80, borderRadius: 16,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  heroText:  { flex: 1, paddingTop: 2 },
  heroTitle: { fontFamily: FontFamily.bold, fontSize: 17, color: Colors.textPrimary, marginBottom: 6 },
  heroSub:   { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 10 },
  dateRow:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText:  { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },

  intro: {
    fontFamily: FontFamily.regular, fontSize: 14,
    color: Colors.textPrimary, lineHeight: 22,
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, gap: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F3F3' },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center', justifyContent: 'center',
  },
  rowContent:  { flex: 1 },
  rowHeading:  { fontFamily: FontFamily.bold, fontSize: 14, color: Colors.textPrimary, marginBottom: 4 },
  rowBody:     { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    borderRadius: 14, padding: 16, marginTop: 10, gap: 12,
  },
  bannerIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: { fontFamily: FontFamily.bold, fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  bannerSub:   { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },
  bannerBtn: {
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  bannerBtnText: { fontFamily: FontFamily.semiBold, fontSize: 13, color: Colors.primary },
});

// ─── Terms & Conditions Screen ────────────────────────────────────────────────
const IconShield = ({ size = 56 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke={Colors.primary} strokeWidth={1.8} strokeLinejoin="round" fill={Colors.primary + '12'} />
    <Path d="M9 12l2 2 4-4" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconCalendar = ({ size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v3M16 2v3M3 9h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={Colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TermsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const sections = CONTENT.terms.sections ?? [];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={termsStyles.scroll}>

      {/* Hero banner */}
      <View style={termsStyles.hero}>
        <View style={termsStyles.heroIconWrap}>
          <IconShield size={56} />
        </View>
        <View style={termsStyles.heroText}>
          <Text style={termsStyles.heroTitle}>Terms & Conditions</Text>
          <Text style={termsStyles.heroSub}>Please read these terms and conditions carefully before using our app and services.</Text>
          <View style={termsStyles.dateRow}>
            <IconCalendar size={13} />
            <Text style={termsStyles.dateText}>Last updated: 20 May 2024</Text>
          </View>
        </View>
      </View>

      {/* Numbered section cards */}
      {sections.map((section, i) => (
        <View key={i} style={termsStyles.card}>
          <View style={termsStyles.numberBadge}>
            <Text style={termsStyles.numberText}>{i + 1}</Text>
          </View>
          <View style={termsStyles.cardContent}>
            <Text style={termsStyles.cardHeading}>{section.heading}</Text>
            <Text style={termsStyles.cardBody}>{section.body}</Text>
          </View>
        </View>
      ))}

      {/* Footer banner */}
      <View style={termsStyles.banner}>
        <View style={termsStyles.bannerIcon}>
          <IconHeadset color={Colors.primary} size={30} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={termsStyles.bannerTitle}>Questions about these terms?</Text>
          <Text style={termsStyles.bannerSub}>We're here to help. Contact our support team.</Text>
        </View>
        <TouchableOpacity
          style={termsStyles.bannerBtn}
          onPress={() => navigation.push('StaticContent', { type: 'help' })}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconChat color={Colors.primary} size={14} />
            <Text style={termsStyles.bannerBtnText}>Contact Support</Text>
          </View>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const termsStyles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },

  hero: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.primarySurface,
    borderRadius: 16, padding: 18, marginBottom: 20, gap: 14,
  },
  heroIconWrap: {
    width: 80, height: 80, borderRadius: 16,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  heroText:  { flex: 1, paddingTop: 2 },
  heroTitle: { fontFamily: FontFamily.bold, fontSize: 17, color: Colors.textPrimary, marginBottom: 6 },
  heroSub:   { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 10 },
  dateRow:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText:  { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },

  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12, borderWidth: 1, borderColor: '#EFEFEF',
    padding: 16, marginBottom: 10, gap: 14,
  },
  numberBadge: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  numberText:   { fontFamily: FontFamily.bold, fontSize: 14, color: Colors.primary },
  cardContent:  { flex: 1 },
  cardHeading:  { fontFamily: FontFamily.bold, fontSize: 15, color: Colors.textPrimary, marginBottom: 6 },
  cardBody:     { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    borderRadius: 14, padding: 16, marginTop: 10, gap: 12,
  },
  bannerIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: { fontFamily: FontFamily.bold, fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  bannerSub:   { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },
  bannerBtn: {
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  bannerBtnText: { fontFamily: FontFamily.semiBold, fontSize: 13, color: Colors.primary },
});

// ─── Help & Support Icons ─────────────────────────────────────────────────────
const IconPhone = ({ color = '#2E7D32', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6.5c0-.6.4-1 1-1H7.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconWhatsApp = ({ color = '#2E7D32', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M8.5 9.5c.5 1 1.5 2.5 3 3.5s2.5 1.5 3 1.5c.3-.5.5-1 .5-1s-1-.5-1.5-.8c-.3-.2-.7 0-.9.2l-.3.3c-.2.2-.5.2-.7.1C10.8 12 12 10.8 12 10.8c.1-.2.1-.5-.1-.7l-.3-.3c-.2-.2 0-.6.2-.9C12 8.5 11.5 7.5 11.5 7.5s-.5 0-1 .5C9 9 8.5 9.5 8.5 9.5z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconEmail = ({ color = '#2E7D32', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconChat = ({ color = '#2E7D32', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="9" y1="10" x2="9" y2="10" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1="12" y1="10" x2="12" y2="10" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1="15" y1="10" x2="15" y2="10" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

const IconHeadset = ({ color = '#2E7D32', size = 52 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18v-6a9 9 0 0118 0v6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v3z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Help & Support Screen ────────────────────────────────────────────────────
const PHONE    = '+9609427902';
const WHATSAPP = '+9609427902';
const EMAIL    = 'ksaybas@gmail.com';

interface ContactRow { label: string; sub: string; onPress: () => void; badge?: string; icon: React.ReactNode; }
interface MoreRow    { label: string; onPress: () => void; }

const HelpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const contacts: ContactRow[] = [
    {
      label: 'Call Us',
      sub:   PHONE,
      icon:  <IconPhone />,
      onPress: () => Linking.openURL(`tel:${PHONE}`),
    },
    {
      label: 'WhatsApp',
      sub:   'Chat with our support team',
      icon:  <IconWhatsApp />,
      onPress: () => Linking.openURL(`https://wa.me/${WHATSAPP.replace('+', '')}`),
    },
    {
      label: 'Email Us',
      sub:   EMAIL,
      icon:  <IconEmail />,
      onPress: () => Linking.openURL(`mailto:${EMAIL}`),
    },
    {
      label: 'Live Chat',
      sub:   'Chat live with our team',
      icon:  <IconChat />,
      badge: 'Online',
      onPress: () => {},
    },
  ];

  const moreLinks: MoreRow[] = [
    { label: 'Frequently Asked Questions', onPress: () => navigation.push('StaticContent', { type: 'faq' }) },
    { label: 'Terms & Conditions',          onPress: () => navigation.push('StaticContent', { type: 'terms' }) },
    { label: 'Privacy Policy',              onPress: () => navigation.push('StaticContent', { type: 'privacy' }) },
    { label: 'Report an Issue',             onPress: () => Linking.openURL(`mailto:${EMAIL}?subject=Issue Report`) },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={helpStyles.scroll}>

      {/* Hero banner */}
      <View style={helpStyles.hero}>
        <View style={helpStyles.heroIconWrap}>
          <IconHeadset color={Colors.primary} size={48} />
        </View>
        <View style={helpStyles.heroText}>
          <Text style={helpStyles.heroTitle}>Need Assistance?</Text>
          <Text style={helpStyles.heroSub}>We're here to help.{'\n'}Choose a way to connect{'\n'}with our support team.</Text>
        </View>
      </View>

      {/* Contact Us */}
      <Text style={helpStyles.sectionLabel}>Contact Us</Text>
      <View style={helpStyles.card}>
        {contacts.map((row, i) => (
          <TouchableOpacity
            key={row.label}
            style={[helpStyles.row, i < contacts.length - 1 && helpStyles.rowBorder]}
            onPress={row.onPress}
            activeOpacity={0.7}
          >
            <View style={helpStyles.iconCircle}>{row.icon}</View>
            <View style={helpStyles.rowText}>
              <Text style={helpStyles.rowLabel}>{row.label}</Text>
              <Text style={helpStyles.rowSub}>{row.sub}</Text>
            </View>
            {row.badge
              ? <View style={helpStyles.badge}><Text style={helpStyles.badgeText}>{row.badge}</Text></View>
              : <IconChevronDown color="#CCCCCC" size={18} />
            }
          </TouchableOpacity>
        ))}
      </View>

      {/* More Help */}
      <Text style={helpStyles.sectionLabel}>More Help</Text>
      <View style={helpStyles.card}>
        {moreLinks.map((row, i) => (
          <TouchableOpacity
            key={row.label}
            style={[helpStyles.row, i < moreLinks.length - 1 && helpStyles.rowBorder]}
            onPress={row.onPress}
            activeOpacity={0.7}
          >
            <Text style={helpStyles.moreLinkLabel}>{row.label}</Text>
            <IconChevronDown color="#CCCCCC" size={18} />
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
};

const helpStyles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },

  hero: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    borderRadius: 16, padding: 18, marginBottom: 24, gap: 16,
  },
  heroIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  heroText:  { flex: 1 },
  heroTitle: { fontFamily: FontFamily.bold, fontSize: 18, color: Colors.textPrimary, marginBottom: 6 },
  heroSub:   { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  sectionLabel: {
    fontFamily: FontFamily.bold, fontSize: 16, color: Colors.textPrimary,
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1, borderColor: '#EFEFEF',
    marginBottom: 24,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16, gap: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F3F3' },

  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  rowText:  { flex: 1 },
  rowLabel: { fontFamily: FontFamily.semiBold, fontSize: 15, color: Colors.textPrimary, marginBottom: 2 },
  rowSub:   { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary },

  badge: {
    backgroundColor: Colors.primary + '18',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeText: { fontFamily: FontFamily.semiBold, fontSize: 12, color: Colors.primary },

  moreLinkLabel: { flex: 1, fontFamily: FontFamily.medium, fontSize: 15, color: Colors.textPrimary },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export const StaticContentScreen: React.FC<Props> = ({ navigation, route }) => {
  const type   = (route.params as any)?.type as ContentType ?? 'about';
  const config = CONTENT[type] ?? CONTENT.about;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconArrowLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{config.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Help & Support gets its own dedicated layout */}
      {type === 'help' ? (
        <HelpScreen navigation={navigation} />
      ) : type === 'faq' ? (
        <FaqScreen navigation={navigation} />
      ) : type === 'terms' ? (
        <TermsScreen navigation={navigation} />
      ) : type === 'privacy' ? (
        <PrivacyScreen navigation={navigation} />
      ) : type === 'about' ? (
        <AboutScreen />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero emoji */}
          <View style={styles.heroWrap}>
            <Text style={styles.heroEmoji}>{config.emoji}</Text>
            <Text style={styles.heroTitle}>{config.title}</Text>
          </View>

          {/* FAQ accordion */}
          {config.faqs && (
            <View>
              {config.faqs.map((faq, i) => (
                <FaqAccordion key={i} item={faq} />
              ))}
            </View>
          )}

          {/* Static sections */}
          {config.sections?.map((section, i) => (
            <View key={i} style={styles.section}>
              {!!section.heading && (
                <Text style={styles.sectionHeading}>{section.heading}</Text>
              )}
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  topBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topTitle: { ...Typography.headingMedium, color: Colors.textPrimary },

  heroWrap: { alignItems: 'center', paddingVertical: 28 },
  heroEmoji: { fontSize: 52, marginBottom: 10 },
  heroTitle: { ...Typography.headingMedium, color: Colors.textPrimary },

  section:        { marginBottom: 22, marginLeft: 6 },

  sectionHeading: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 10,
  },

  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'justify',
  },
});