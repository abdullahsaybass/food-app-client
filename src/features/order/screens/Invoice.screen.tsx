/**
 * Invoice.screen.tsx
 * Displays a receipt-style invoice and lets the user download it as a PDF
 * using expo-print + expo-sharing (iOS) / expo-file-system SAF (Android).
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg';
import * as Print          from 'expo-print';
import * as FileSystem     from 'expo-file-system/legacy';
import AsyncStorage        from '@react-native-async-storage/async-storage';

import { API }          from '../../../app/lib/api';
import { FontFamily }   from '../../../theme';
import {
  formatOrderDate,
  formatOrderTime,
  formatOrderPrice,
  shortOrderId,
} from '../utils/order.utils';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';

// ─── Nav types ────────────────────────────────────────────────────────────────
type Nav   = NativeStackNavigationProp<RootStackParamList, 'Invoice'>;
type Route = RouteProp<RootStackParamList, 'Invoice'>;

// ─── Constants ────────────────────────────────────────────────────────────────
const GREEN       = '#16A34A';
const GREEN_LIGHT = '#F0FDF4';
const NAVY        = '#111827';
const SAVE_DIR_URI_KEY = 'vfresh_invoice_save_dir_uri';

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoiceItem {
  product: { id: string; name: string; image: string; sku?: string };
  unit: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  id: string;
  orderNumber: string;
  paymentMethod: string;
  paymentStatus: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  couponCode?: string;
  shippingAddress: {
    fullName: string; phone: string;
    street: string; city: string; state?: string; zip?: string;
  };
  createdAt: string;
}

// ─── Backend mapper ───────────────────────────────────────────────────────────
const mapInvoice = (raw: any): InvoiceData => ({
  id:            raw._id ?? raw.id ?? '',
  orderNumber:   raw.orderNumber ?? '',
  paymentMethod: raw.paymentMethod ?? 'Cash on Delivery',
  paymentStatus: raw.paymentStatus ?? 'pending',
  items: (raw.items ?? []).map((i: any) => ({
    product: {
      id:    i.product?._id ?? i.product?.id ?? '',
      name:  i.product?.name ?? i.name ?? '',
      image: (() => { const img = i.product?.image ?? i.image; if (!img) return ''; if (typeof img === 'string') return img; return img.url ?? img.uri ?? ''; })(),
      sku:   i.product?.sku ?? i.sku ?? '',
    },
    unit:     i.unit ?? '',
    quantity: i.quantity ?? 1,
    price:    i.price ?? 0,
  })),
  subtotal:    raw.subtotal ?? raw.totalAmount ?? 0,
  discount:    raw.discount ?? 0,
  deliveryFee: raw.deliveryCharge ?? raw.deliveryFee ?? raw.shippingFee ?? 0,
  totalAmount: raw.totalAmount ?? 0,
  couponCode:  raw.couponCode ?? raw.coupon?.code ?? undefined,
  shippingAddress: {
    fullName: raw.shippingAddress?.fullName ?? '',
    phone:    raw.shippingAddress?.phone ?? '',
    street:   raw.shippingAddress?.street ?? '',
    city:     raw.shippingAddress?.city ?? '',
    state:    raw.shippingAddress?.state,
    zip:      raw.shippingAddress?.zip ?? '',
  },
  createdAt: raw.createdAt ?? '',
});

// ─── PDF HTML builder ─────────────────────────────────────────────────────────
const buildInvoiceHTML = (inv: InvoiceData): string => {
  const invNum     = `#INV-${shortOrderId(inv.id)}`;
  const ordNum     = `#ORD-${shortOrderId(inv.id)}`;
  const addr       = inv.shippingAddress;
  const addrFull   = [addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(', ');
  const subtotal   = inv.subtotal > 0 ? inv.subtotal : inv.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount   = inv.discount ?? 0;
  const delivery   = inv.deliveryFee ?? 0;
  const total      = inv.totalAmount > 0 ? inv.totalAmount : subtotal - discount + delivery;
  const payLabel   = inv.paymentMethod === 'cod' ? 'Cash on Delivery'
    : inv.paymentMethod === 'online' ? 'Online Payment'
    : inv.paymentMethod;
  const isPaid     = inv.paymentStatus === 'paid' || inv.paymentMethod?.toLowerCase().includes('online');

  const itemRows = inv.items.map(item => `
    <tr>
      <td style="padding:10px 12px;">
        <div style="font-weight:600;font-size:13px;color:#111;">${item.product.name}</div>
        <div style="font-size:11px;color:#888;margin-top:2px;">${item.unit}</div>
      </td>
      <td style="padding:10px 12px;text-align:right;font-size:13px;color:#444;">${formatOrderPrice(item.price)}</td>
      <td style="padding:10px 12px;text-align:center;font-size:13px;color:#444;">${item.quantity}</td>
      <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:700;color:#111;">${formatOrderPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const discountRow = discount > 0 ? `
    <tr>
      <td colspan="3" style="padding:6px 0;font-size:13px;color:#16A34A;">
        Discount${inv.couponCode ? ` (${inv.couponCode})` : ''}
      </td>
      <td style="padding:6px 0;text-align:right;font-size:13px;color:#EF4444;font-weight:600;">
        - ${formatOrderPrice(discount)}
      </td>
    </tr>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #ffffff;
      color: #111;
      width: 100%;
    }
    .page {
      width: 100%;
      background: #ffffff;
      overflow: hidden;
    }

    /* Header */
    .header {
      background: ${NAVY};
      padding: 28px 28px 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .logo-v    { font-size: 28px; font-weight: 900; color: ${GREEN}; letter-spacing: -1px; }
    .logo-rest { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
    .logo-tag  { font-size: 9px; font-weight: 700; color: ${GREEN}; letter-spacing: 2px; margin-top: 4px; }
    .paid-badge {
      background: ${GREEN};
      color: #fff;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.5px;
      padding: 7px 16px;
      border-radius: 20px;
    }

    /* Invoice meta */
    .meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px 28px;
      border-bottom: 1px solid #F0F0F0;
    }
    .inv-number { font-size: 20px; font-weight: 800; color: ${NAVY}; margin-bottom: 4px; }
    .inv-date   { font-size: 12px; color: #888; }
    .meta-right { text-align: right; }
    .meta-label { font-size: 11px; color: #999; margin-bottom: 2px; margin-top: 10px; }
    .meta-label:first-child { margin-top: 0; }
    .meta-value { font-size: 13px; font-weight: 700; color: ${NAVY}; }

    /* Address */
    .address-row {
      display: flex;
      gap: 0;
      padding: 20px 28px;
      border-bottom: 1px solid #F0F0F0;
    }
    .address-col { flex: 1; }
    .address-divider { width: 1px; background: #EFEFEF; margin: 0 20px; }
    .addr-title { font-size: 11px; font-weight: 700; color: #888; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
    .addr-name  { font-size: 13px; font-weight: 700; color: #111; margin-bottom: 3px; }
    .addr-line  { font-size: 12px; color: #555; line-height: 1.6; }
    .addr-phone { font-size: 12px; color: #555; margin-top: 4px; }

    /* Table */
    .table-wrap { padding: 0 28px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    thead tr { background: #F8F9FA; }
    thead th {
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      color: #888;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    thead th:not(:first-child) { text-align: right; }
    thead th:nth-child(3) { text-align: center; }
    tbody tr { border-bottom: 1px solid #F5F5F5; }
    tbody tr:last-child { border-bottom: none; }

    /* Summary */
    .summary {
      margin: 0 28px;
      padding: 16px 0 20px;
      border-top: 1px solid #EFEFEF;
    }
    .sum-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .sum-label { color: #555; }
    .sum-value { color: #111; font-weight: 500; }
    .sum-discount-label { color: ${GREEN}; font-weight: 600; }
    .sum-discount-value { color: #EF4444; font-weight: 600; }
    .total-divider { border: none; border-top: 1.5px dashed #EFEFEF; margin: 12px 0; }
    .total-row  { display: flex; justify-content: space-between; align-items: center; }
    .total-label { font-size: 15px; font-weight: 700; color: #111; }
    .total-value { font-size: 22px; font-weight: 900; color: ${GREEN}; }

    /* Savings */
    .savings {
      margin: 0 28px 20px;
      background: ${GREEN_LIGHT};
      border: 1px solid #BBF7D0;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 13px;
      color: #333;
    }
    .savings-amt { font-weight: 800; color: ${GREEN}; }

    /* Footer */
    .footer {
      background: #F8F9FA;
      padding: 18px 28px;
      text-align: center;
      font-size: 11px;
      color: #999;
      line-height: 1.7;
    }
    .footer strong { color: #555; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div>
      <div><span class="logo-v">V</span><span class="logo-rest">Fresh</span></div>
      <div class="logo-tag">FRESHNESS DELIVERED</div>
    </div>
    ${isPaid ? '<div class="paid-badge">✓ PAID</div>' : ''}
  </div>

  <!-- Invoice meta -->
  <div class="meta">
    <div>
      <div class="inv-number">Invoice ${invNum}</div>
      <div class="inv-date">${formatOrderDate(inv.createdAt)} &nbsp;·&nbsp; ${formatOrderTime(inv.createdAt)}</div>
    </div>
    <div class="meta-right">
      <div class="meta-label">Order ID</div>
      <div class="meta-value">${ordNum}</div>
      <div class="meta-label">Payment Method</div>
      <div class="meta-value">${payLabel}</div>
    </div>
  </div>

  <!-- Addresses -->
  <div class="address-row">
    <div class="address-col">
      <div class="addr-title">📍 Delivery Address</div>
      <div class="addr-name">${addr.fullName}</div>
      <div class="addr-line">${addrFull}</div>
      ${addr.phone ? `<div class="addr-phone">📞 ${addr.phone}</div>` : ''}
    </div>
    <div class="address-divider"></div>
    <div class="address-col">
      <div class="addr-title">💳 Billing Address</div>
      <div class="addr-name">${addr.fullName}</div>
      <div class="addr-line">${addrFull}</div>
      ${addr.phone ? `<div class="addr-phone">📞 ${addr.phone}</div>` : ''}
    </div>
  </div>

  <!-- Items table -->
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th style="text-align:left;">Item</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>

  <!-- Summary -->
  <div class="summary">
    <div class="sum-row">
      <span class="sum-label">Subtotal</span>
      <span class="sum-value">${formatOrderPrice(subtotal)}</span>
    </div>
    <div class="sum-row">
      <span class="sum-label">Delivery Fee</span>
      <span class="sum-value">${delivery > 0 ? formatOrderPrice(delivery) : 'FREE'}</span>
    </div>
    ${discount > 0 ? `
    <div class="sum-row">
      <span class="sum-discount-label">Discount${inv.couponCode ? ` (${inv.couponCode})` : ''}</span>
      <span class="sum-discount-value">- ${formatOrderPrice(discount)}</span>
    </div>` : ''}
    <hr class="total-divider"/>
    <div class="total-row">
      <span class="total-label">Total Amount</span>
      <span class="total-value">${formatOrderPrice(total)}</span>
    </div>
  </div>

  <!-- Savings banner -->
  ${discount > 0 ? `
  <div class="savings">
    🎉 You saved <span class="savings-amt">${formatOrderPrice(discount)}</span> on this order!
  </div>` : ''}

  <!-- Footer -->
  <div class="footer">
    <strong>Thank you for shopping with VFresh!</strong><br/>
    Questions? Contact us at <strong>support@vfresh.com</strong><br/>
    This is a computer-generated invoice and does not require a signature.
  </div>

</div>
</body>
</html>
  `;
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IcoArrowLeft = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const IcoDownload = ({ color = '#111' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Polyline points="7 10 12 15 17 10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1={12} y1={15} x2={12} y2={3} stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const IcoShare = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={18} cy={5} r={3} stroke="#111" strokeWidth={1.8}/>
    <Circle cx={6}  cy={12} r={3} stroke="#111" strokeWidth={1.8}/>
    <Circle cx={18} cy={19} r={3} stroke="#111" strokeWidth={1.8}/>
    <Line x1={8.59}  y1={13.51} x2={15.42} y2={17.49} stroke="#111" strokeWidth={1.8} strokeLinecap="round"/>
    <Line x1={15.41} y1={6.51}  x2={8.59}  y2={10.49} stroke="#111" strokeWidth={1.8} strokeLinecap="round"/>
  </Svg>
);

const IcoCheck = ({ size = 13 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const IcoRefresh = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M23 4v6h-6" stroke="#111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="#111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const IcoHeadphones = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke="#555" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" stroke="#555" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ─── VFresh Logo ──────────────────────────────────────────────────────────────
const VFreshLogo: React.FC = () => (
  <View style={logo.wrap}>
    <Text style={logo.v}>V</Text>
    <Text style={logo.fresh}>Fresh</Text>
    <View style={logo.tagWrap}>
      <Text style={logo.tagline}>FRESHNESS DELIVERED</Text>
    </View>
  </View>
);
const logo = StyleSheet.create({
  wrap:    { flexDirection: 'row', alignItems: 'flex-end' },
  v:       { fontFamily: FontFamily.extraBold, fontSize: 26, color: GREEN, letterSpacing: -1 },
  fresh:   { fontFamily: FontFamily.extraBold, fontSize: 26, color: NAVY, letterSpacing: -0.5 },
  tagWrap: { position: 'absolute', bottom: -13, left: 0 },
  tagline: { fontFamily: FontFamily.semiBold, fontSize: 8, color: GREEN, letterSpacing: 1.5 },
});

// ─── Address block ────────────────────────────────────────────────────────────
interface AddressBlockProps {
  title: string;
  name: string;
  line1: string;
  line2?: string;
  phone?: string;
}
const AddressBlock: React.FC<AddressBlockProps> = ({ title, name, line1, line2, phone }) => (
  <View style={ab.wrap}>
    <Text style={ab.title}>{title}</Text>
    <Text style={ab.name}>{name}</Text>
    <Text style={ab.line}>{line1}</Text>
    {!!line2  && <Text style={ab.line}>{line2}</Text>}
    {!!phone  && <Text style={ab.phone}>{phone}</Text>}
  </View>
);
const ab = StyleSheet.create({
  wrap:  { flex: 1 },
  title: { fontFamily: FontFamily.bold, fontSize: 11, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  name:  { fontFamily: FontFamily.bold, fontSize: 13, color: '#111', marginBottom: 2 },
  line:  { fontFamily: FontFamily.regular, fontSize: 12, color: '#555', lineHeight: 17 },
  phone: { fontFamily: FontFamily.medium, fontSize: 12, color: '#666', marginTop: 4 },
});

// ─── Table header ─────────────────────────────────────────────────────────────
const TableHeader: React.FC = () => (
  <View style={th.row}>
    <Text style={[th.cell, { flex: 1 }]}>Item</Text>
    <Text style={[th.cell, th.right, { width: 80 }]}>Price</Text>
    <Text style={[th.cell, th.center, { width: 36 }]}>Qty</Text>
    <Text style={[th.cell, th.right, { width: 80 }]}>Total</Text>
  </View>
);
const th = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F8F9FA', borderBottomWidth: 1, borderBottomColor: '#EFEFEF' },
  cell:   { fontFamily: FontFamily.semiBold, fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  right:  { textAlign: 'right' },
  center: { textAlign: 'center' },
});

// ─── Table row ────────────────────────────────────────────────────────────────
const TableRow: React.FC<{ item: InvoiceItem; isLast?: boolean }> = ({ item, isLast }) => (
  <View style={[tr.row, !isLast && tr.border]}>
    {item.product.image ? (
      <Image source={{ uri: item.product.image }} style={tr.img} resizeMode="cover" />
    ) : (
      <View style={tr.imgPlaceholder} />
    )}
    <View style={tr.info}>
      <Text style={tr.name} numberOfLines={2}>{item.product.name}</Text>
      <Text style={tr.sku}>{item.unit}</Text>
    </View>
    <Text style={[tr.cell, { width: 80 }]}>{formatOrderPrice(item.price)}</Text>
    <Text style={[tr.cell, tr.center, { width: 36 }]}>{item.quantity}</Text>
    <Text style={[tr.cell, tr.bold, { width: 80 }]}>{formatOrderPrice(item.price * item.quantity)}</Text>
  </View>
);
const tr = StyleSheet.create({
  row:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  border:         { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  img:            { width: 44, height: 44, borderRadius: 8, backgroundColor: '#F5F5F5', flexShrink: 0 },
  imgPlaceholder: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#F0F0F0', flexShrink: 0 },
  info:           { flex: 1 },
  name:           { fontFamily: FontFamily.semiBold, fontSize: 13, color: '#111', lineHeight: 17 },
  sku:            { fontFamily: FontFamily.regular, fontSize: 11, color: '#999', marginTop: 2 },
  cell:           { fontFamily: FontFamily.medium, fontSize: 12, color: '#444', textAlign: 'right' },
  center:         { textAlign: 'center' },
  bold:           { fontFamily: FontFamily.bold, color: '#111' },
});

// ─── Summary row ──────────────────────────────────────────────────────────────
const SumRow: React.FC<{ label: string; value: string; green?: boolean; red?: boolean }> =
  ({ label, value, green, red }) => (
  <View style={sr.row}>
    <Text style={[sr.label, green && { color: GREEN, fontFamily: FontFamily.semiBold }]}>{label}</Text>
    <Text style={[sr.value, red && { color: '#EF4444', fontFamily: FontFamily.semiBold }]}>{value}</Text>
  </View>
);
const sr = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontFamily: FontFamily.regular, fontSize: 14, color: '#555' },
  value: { fontFamily: FontFamily.medium, fontSize: 14, color: '#111' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const InvoiceScreen: React.FC = () => {
  const navigation  = useNavigation<Nav>();
  const route       = useRoute<Route>();
  const insets      = useSafeAreaInsets();
  const { orderId } = route.params;

  const [invoice,      setInvoice]      = useState<InvoiceData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [downloading,  setDownloading]  = useState(false);
  const [sharing,      setSharing]      = useState(false);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const { data } = await API.get(`/orders/${orderId}`);
      const raw = data.data?.order ?? data.data;
      setInvoice(mapInvoice(raw));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

  // ── Save PDF directly to device ─────────────────────────────────────────
  const handleDownload = async () => {
    if (!invoice) return;
    try {
      setDownloading(true);

      // 1. Generate PDF — expo-print writes to a temp cache file
      const html = buildInvoiceHTML(invoice);
      const { uri: pdfUri } = await Print.printToFileAsync({ html, base64: false });
      const fileName = `Invoice-INV-${shortOrderId(invoice.id)}.pdf`;

      if (Platform.OS === 'android') {
        // Try to reuse a previously granted folder (no picker shown again)
        let directoryUri = await AsyncStorage.getItem(SAVE_DIR_URI_KEY);
        const base64 = await FileSystem.readAsStringAsync(pdfUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const writeToDir = async (dirUri: string) => {
          const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
            dirUri,
            fileName,
            'application/pdf'
          );
          await FileSystem.writeAsStringAsync(destUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        };

        try {
          if (directoryUri) {
            // Reuse the saved folder permission silently
            await writeToDir(directoryUri);
          } else {
            throw new Error('no-cached-dir');
          }
        } catch {
          // No cached folder, or the saved permission was revoked — ask once
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

          if (!permissions.granted) {
            // User cancelled the folder picker — fall back to the share sheet.
            const { shareAsync } = await import('expo-sharing');
            await shareAsync(pdfUri, {
              mimeType: 'application/pdf',
              dialogTitle: fileName,
              UTI: 'com.adobe.pdf',
            });
            return;
          }

          directoryUri = permissions.directoryUri;
          await AsyncStorage.setItem(SAVE_DIR_URI_KEY, directoryUri);
          await writeToDir(directoryUri);
        }

        Alert.alert('Saved!', 'Invoice PDF saved successfully.', [{ text: 'OK' }]);

      } else {
        // iOS: the file is already saved in the app cache by expo-print.
        // Share it via expo-sharing so user can save to Files app.
        const { shareAsync } = await import('expo-sharing');
        await shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Invoice #INV-${shortOrderId(invoice.id)}`,
          UTI: 'com.adobe.pdf',
        });
      }

    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not save PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Share invoice summary ────────────────────────────────────────────────
  const handleShare = async () => {
    if (!invoice) return;
    try {
      setSharing(true);
      // Generate PDF and share the actual file
      const html = buildInvoiceHTML(invoice);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const { shareAsync } = await import('expo-sharing');
      await shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Invoice #INV-${shortOrderId(invoice.id)}`,
        UTI: 'com.adobe.pdf',
      });
    } catch {} finally {
      setSharing(false);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@vfresh.com?subject=Invoice%20Support%20-%20' + shortOrderId(invoice?.id ?? ''));
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}><IcoArrowLeft /></TouchableOpacity>
        <Text style={s.headerTitle}>Invoice</Text>
        <View style={{ width: 84 }} />
      </View>
      <View style={s.centered}><ActivityIndicator size="large" color={GREEN} /></View>
    </SafeAreaView>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !invoice) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}><IcoArrowLeft /></TouchableOpacity>
        <Text style={s.headerTitle}>Invoice</Text>
        <View style={{ width: 84 }} />
      </View>
      <View style={s.centered}>
        <Text style={{ fontSize: 42 }}>😕</Text>
        <Text style={s.errorTitle}>Couldn't load invoice</Text>
        <Text style={s.errorSub}>{error ?? 'Order not found'}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={fetchInvoice}>
          <IcoRefresh />
          <Text style={s.retryTxt}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // ── Derived values ───────────────────────────────────────────────────────
  const invNumber   = `#INV-${shortOrderId(invoice.id)}`;
  const ordNumber   = `#ORD-${shortOrderId(invoice.id)}`;
  const isPaid      = invoice.paymentStatus === 'paid' || invoice.paymentMethod?.toLowerCase().includes('online');
  const addr        = invoice.shippingAddress;
  const addrLine1   = addr.street;
  const addrLine2   = [addr.city, addr.state ? `${addr.state} ${addr.zip ?? ''}`.trim() : addr.zip].filter(Boolean).join(', ');
  const subtotal    = invoice.subtotal > 0 ? invoice.subtotal : invoice.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount    = invoice.discount ?? 0;
  const deliveryFee = invoice.deliveryFee ?? 0;
  const total       = invoice.totalAmount > 0 ? invoice.totalAmount : subtotal - discount + deliveryFee;
  const payLabel    = invoice.paymentMethod === 'cod' ? 'Cash on Delivery'
    : invoice.paymentMethod === 'online' ? 'Online Payment'
    : invoice.paymentMethod;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IcoArrowLeft />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Invoice</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={handleDownload}
            disabled={downloading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {downloading
              ? <ActivityIndicator size="small" color={GREEN} />
              : <IcoDownload color={GREEN} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={handleShare}
            disabled={sharing}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {sharing
              ? <ActivityIndicator size="small" color="#111" />
              : <IcoShare />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>

        {/* ── Invoice header card ── */}
        <View style={s.card}>
          {/* Logo + PAID badge */}
          <View style={s.logoRow}>
            <VFreshLogo />
            {isPaid && (
              <View style={s.paidBadge}>
                <IcoCheck size={12} />
                <Text style={s.paidTxt}>PAID</Text>
              </View>
            )}
          </View>

          <View style={s.divider} />

          {/* Invoice number + IDs */}
          <View style={s.invoiceMetaRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.invoiceNum}>Invoice {invNumber}</Text>
              <Text style={s.invoiceDate}>{formatOrderDate(invoice.createdAt)} · {formatOrderTime(invoice.createdAt)}</Text>
            </View>
            <View style={s.metaRight}>
              <Text style={s.metaLabel}>Order ID</Text>
              <Text style={s.metaValue}>{ordNumber}</Text>
              <Text style={[s.metaLabel, { marginTop: 8 }]}>Payment</Text>
              <Text style={s.metaValue}>{payLabel}</Text>
            </View>
          </View>
        </View>

        {/* ── Address row ── */}
        <View style={[s.card, s.addrCard]}>
          <AddressBlock
            title="📍 Delivery Address"
            name={addr.fullName}
            line1={addrLine1}
            line2={addrLine2}
            phone={addr.phone}
          />
          <View style={s.addrDivider} />
          <AddressBlock
            title="💳 Billing Address"
            name={addr.fullName}
            line1={addrLine1}
            line2={addrLine2}
            phone={addr.phone}
          />
        </View>

        {/* ── Items table ── */}
        <View style={s.card}>
          <TableHeader />
          {invoice.items.map((item, idx) => (
            <TableRow
              key={`${item.product.id}::${idx}`}
              item={item}
              isLast={idx === invoice.items.length - 1}
            />
          ))}

          {/* Summary */}
          <View style={s.summaryWrap}>
            <View style={s.summaryDivider} />
            <SumRow label="Subtotal"     value={formatOrderPrice(subtotal)} />
            <SumRow label="Delivery Fee" value={deliveryFee > 0 ? formatOrderPrice(deliveryFee) : 'FREE'} />
            {discount > 0 && (
              <SumRow
                label={invoice.couponCode ? `Discount (${invoice.couponCode})` : 'Discount'}
                value={`- ${formatOrderPrice(discount)}`}
                green
                red
              />
            )}
            <View style={s.totalDivider} />
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total Amount</Text>
              <Text style={s.totalValue}>{formatOrderPrice(total)}</Text>
            </View>
          </View>
        </View>

        {/* ── Savings banner ── */}
        {discount > 0 && (
          <View style={s.savingsBanner}>
            <Text style={s.savingsEmoji}>🎉</Text>
            <Text style={s.savingsTxt}>
              You saved{' '}
              <Text style={s.savingsAmt}>{formatOrderPrice(discount)}</Text>
              {' '}on this order!
            </Text>
          </View>
        )}

        {/* ── Download button ── */}
        <TouchableOpacity
          style={[s.downloadBtn, downloading && { opacity: 0.6 }]}
          onPress={handleDownload}
          disabled={downloading}
          activeOpacity={0.85}
        >
          {downloading
            ? <ActivityIndicator size="small" color="#fff" />
            : <IcoDownload color="#fff" />}
          <Text style={s.downloadBtnTxt}>
            {downloading ? 'Generating PDF…' : 'Download Invoice PDF'}
          </Text>
        </TouchableOpacity>

        {/* ── Need help ── */}
        <View style={s.helpCard}>
          <View style={s.helpLeft}>
            <IcoHeadphones />
            <View>
              <Text style={s.helpTitle}>Need help?</Text>
              <Text style={s.helpSub}>We're here for you</Text>
            </View>
          </View>
          <TouchableOpacity style={s.helpBtn} onPress={handleContactSupport} activeOpacity={0.8}>
            <Text style={s.helpBtnTxt}>Contact Support</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F5F6FA' },
  centered:{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  iconBtn:     { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: 18, color: '#111', letterSpacing: -0.3 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },

  logoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 20, paddingBottom: 10,
  },
  paidBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: GREEN,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  paidTxt: { fontFamily: FontFamily.extraBold, fontSize: 13, color: '#fff', letterSpacing: 1 },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 18 },

  invoiceMetaRow: { flexDirection: 'row', padding: 18, gap: 12 },
  invoiceNum:     { fontFamily: FontFamily.extraBold, fontSize: 15, color: NAVY, marginBottom: 4 },
  invoiceDate:    { fontFamily: FontFamily.regular, fontSize: 12, color: '#888' },
  metaRight:      { alignItems: 'flex-end' },
  metaLabel:      { fontFamily: FontFamily.regular, fontSize: 11, color: '#999', marginBottom: 2 },
  metaValue:      { fontFamily: FontFamily.bold, fontSize: 13, color: NAVY },

  addrCard:    { flexDirection: 'row', padding: 16 },
  addrDivider: { width: 1, backgroundColor: '#EFEFEF', marginHorizontal: 12, alignSelf: 'stretch' },

  summaryWrap:    { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 18 },
  summaryDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  totalDivider:   { height: 1, backgroundColor: '#EFEFEF', marginBottom: 14, borderStyle: 'dashed' },
  totalRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:     { fontFamily: FontFamily.bold, fontSize: 15, color: '#111' },
  totalValue:     { fontFamily: FontFamily.extraBold, fontSize: 22, color: GREEN },

  savingsBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 12,
    marginHorizontal: 16, marginTop: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  savingsEmoji: { fontSize: 20 },
  savingsTxt:   { fontFamily: FontFamily.medium, fontSize: 14, color: '#333', flex: 1 },
  savingsAmt:   { fontFamily: FontFamily.extraBold, color: GREEN },

  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: GREEN,
    borderRadius: 12,
    marginHorizontal: 16, marginTop: 12,
    paddingVertical: 16,
  },
  downloadBtnTxt: { fontFamily: FontFamily.bold, fontSize: 15, color: '#fff' },

  helpCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16, marginTop: 12,
    paddingHorizontal: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: '#EFEFEF',
  },
  helpLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  helpTitle: { fontFamily: FontFamily.bold, fontSize: 14, color: '#111' },
  helpSub:   { fontFamily: FontFamily.regular, fontSize: 12, color: '#888', marginTop: 1 },
  helpBtn: {
    borderWidth: 1.5, borderColor: GREEN, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  helpBtnTxt: { fontFamily: FontFamily.bold, fontSize: 13, color: GREEN },

  errorTitle: { fontFamily: FontFamily.bold, fontSize: 17, color: '#111', textAlign: 'center' },
  errorSub:   { fontFamily: FontFamily.regular, fontSize: 13, color: '#888', textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#111', borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 24, marginTop: 8,
  },
  retryTxt: { fontFamily: FontFamily.bold, fontSize: 14, color: '#fff' },
});