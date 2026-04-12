import React from 'react'
import {
  Document, Page, View, Text, StyleSheet, pdf, Image,
} from '@react-pdf/renderer'
import logoUrl from '../assets/logo.png'

// ─── Company constants ────────────────────────────────────────────────────────

const CO = {
  legal:   'MOMINS TRADING PRIVATE LIMITED',
  address: 'Office No. 13, Prajapati Gaurav, Plot No. 03,\nSector - 2, Near Cafe Coffee Day Station Road,\nKharghar, Navi Mumbai, 410210\nMaharashtra, INDIA',
  contact: '+91-8655001178',
  email:   'info@mominstrading.com',
  gstin:   '27AAOCM6058R1ZF',
  bank: {
    account: '50 2000 5914 5538',
    name:    'HDFC BANK',
    branch:  'SEC-7, KHARGHAR',
    ifsc:    'HDFC 000 1102',
  },
}

// ─── Number to words ──────────────────────────────────────────────────────────

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function inWords(n) {
  n = Math.floor(n)
  if (n === 0) return ''
  if (n < 20) return ONES[n]
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '')
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '')
  if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '')
  if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '')
  return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '')
}

function amountInWords(amount) {
  const rupees = Math.floor(amount)
  const paise  = Math.round((amount - rupees) * 100)
  let result = 'Indian Rupee ' + (inWords(rupees) || 'Zero')
  if (paise > 0) result += ' and ' + inWords(paise) + ' Paise'
  return result + ' Only'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val) {
  const n = parseFloat(val) || 0
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(str) {
  if (!str) return '—'
  const d = new Date(str)
  return [String(d.getDate()).padStart(2, '0'), String(d.getMonth() + 1).padStart(2, '0'), d.getFullYear()].join('/')
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BLUE         = '#0054a3'
const MUTED        = '#555555'
const BG           = '#f2f2f2'
const BORDER_COLOR = '#bbbbbb'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#222222',
    paddingHorizontal: 28,
    paddingVertical: 24,
  },

  // Header
  headerBox: {
    borderWidth: 1, borderColor: BORDER_COLOR,
    flexDirection: 'row', alignItems: 'center',
    padding: 10, gap: 14,
  },
  logo: { width: 110, height: 52, objectFit: 'contain' },
  coInfo: { flex: 1 },
  coDetail: { fontSize: 7.5, color: '#444444', lineHeight: 1.65 },
  docTitle: { fontSize: 22, color: BLUE, alignSelf: 'flex-end' },

  // Meta
  metaWrap: {
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: BORDER_COLOR,
    padding: 8,
  },
  metaLine: { flexDirection: 'row', marginBottom: 0 },
  metaLabel: { color: MUTED, width: 110 },
  metaValue: { fontFamily: 'Helvetica-Bold', flex: 1 },
  metaSpacer: { height: 6 },

  // Address
  addrWrap: {
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: BORDER_COLOR,
    padding: 8,
  },
  addrHead: {
    fontFamily: 'Helvetica-Bold', fontSize: 9,
    borderBottomWidth: 0.5, borderColor: '#dddddd',
    paddingBottom: 4, marginBottom: 5,
  },
  addrName: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: BLUE, marginBottom: 3 },
  addrText: { fontSize: 8.5, color: '#333333', lineHeight: 1.65 },

  // Items table
  itemsWrap: { marginTop: 8, borderWidth: 1, borderColor: BORDER_COLOR },
  tHead: { flexDirection: 'row', backgroundColor: BG, borderBottomWidth: 1, borderColor: BORDER_COLOR },
  th: { fontSize: 8, fontFamily: 'Helvetica-Bold', padding: 6 },
  tRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: BORDER_COLOR },
  td: { fontSize: 9, padding: 7 },
  cellDiv: { borderRightWidth: 1, borderColor: BORDER_COLOR },

  // Footer
  footerWrap: {
    flexDirection: 'row',
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: BORDER_COLOR,
  },
  footLeft: { flex: 1, padding: 10 },
  footRight: { width: 210, borderLeftWidth: 1, borderColor: BORDER_COLOR },

  wordsLabel: { fontSize: 8, color: MUTED, marginBottom: 2 },
  wordsText: { fontSize: 9, fontFamily: 'Helvetica-BoldOblique', lineHeight: 1.5 },

  bankWrap: { marginTop: 9 },
  bankCo: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, marginBottom: 1 },
  bankLine: { fontSize: 8, color: '#333333' },

  termsHead: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, marginTop: 10, marginBottom: 3 },
  termsLine: { fontSize: 7.5, color: '#333333', lineHeight: 1.65 },

  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 1, borderColor: '#eeeeee',
    paddingVertical: 5, paddingHorizontal: 10,
  },
  totalRowFinal: {
    flexDirection: 'row',
    borderTopWidth: 1, borderColor: BORDER_COLOR,
    backgroundColor: BG,
    paddingVertical: 7, paddingHorizontal: 10,
  },
  totalLabel: { flex: 1, color: MUTED },
  totalValue: { fontFamily: 'Helvetica-Bold', textAlign: 'right' },

  sigBox: {
    borderTopWidth: 1, borderColor: BORDER_COLOR,
    minHeight: 62, padding: 8,
    alignItems: 'center', justifyContent: 'flex-end',
  },
  sigLabel: { fontSize: 8, color: MUTED },
})

// ─── PDF Document ─────────────────────────────────────────────────────────────

function QuotationDocument({ quotation, client, createdByUser }) {
  const items    = quotation.items || []
  const discType = quotation.discount_type || 'fixed'
  const discAmt  = parseFloat(quotation.discount_amount) || 0

  const subtotal  = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)
  const discValue = discType === 'percentage' ? subtotal * discAmt / 100 : discAmt
  const total     = Math.max(0, subtotal - discValue)

  const clientName  = client?.company_name || client?.full_name || (quotation.manual_client_name) || '—'
  const clientAddr  = client?.address || quotation.manual_client_address || ''
  const clientGstin = client?.gst_number || ''
  const termsLines  = (quotation.terms_and_conditions || '').split('\n').filter(Boolean)

  // Column widths in pt
  const cNum  = 22
  const cQty  = 52
  const cRate = 64
  const cAmt  = 66

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.headerBox}>
          <Image src={logoUrl} style={s.logo} />
          <View style={s.coInfo}>
            <Text style={s.coDetail}>
              {CO.address}{'\n'}
              {'Contact: '}{CO.contact}{'\n'}
              {'Email: '}{CO.email}{'\n'}
              {'GSTIN '}{CO.gstin}
            </Text>
          </View>
          <Text style={s.docTitle}>Quotation</Text>
        </View>

        {/* ── Meta (Quotation No. + Date only) ── */}
        <View style={s.metaWrap}>
          <View style={s.metaLine}>
            <Text style={s.metaLabel}>Quotation No.</Text>
            <Text style={s.metaValue}>: {quotation.quotation_id}</Text>
          </View>
          <View style={s.metaSpacer} />
          <View style={s.metaLine}>
            <Text style={s.metaLabel}>Quotation Date</Text>
            <Text style={s.metaValue}>: {fmtDate(quotation.date)}</Text>
          </View>
        </View>

        {/* ── Bill To (full width, no Ship To) ── */}
        <View style={s.addrWrap}>
          <Text style={s.addrHead}>Bill To</Text>
          <Text style={s.addrName}>{clientName}</Text>
          <Text style={s.addrText}>
            {clientAddr}
            {clientGstin ? '\nGSTIN ' + clientGstin : ''}
          </Text>
        </View>

        {/* ── Items table ── */}
        <View style={s.itemsWrap}>
          {/* Header row */}
          <View style={s.tHead}>
            <Text style={[s.th, s.cellDiv, { width: cNum, textAlign: 'center' }]}>#</Text>
            <Text style={[s.th, s.cellDiv, { flex: 1 }]}>Item &amp; Description</Text>
            <Text style={[s.th, s.cellDiv, { width: cQty, textAlign: 'right' }]}>Qty</Text>
            <Text style={[s.th, s.cellDiv, { width: cRate, textAlign: 'right' }]}>Rate</Text>
            <Text style={[s.th, { width: cAmt, textAlign: 'right' }]}>Amount</Text>
          </View>

          {/* Data rows */}
          {items.map((item, i) => {
            const amt = parseFloat(item.amount) || 0
            return (
              <View key={i} style={s.tRow}>
                <Text style={[s.td, s.cellDiv, { width: cNum, textAlign: 'center' }]}>{i + 1}</Text>
                <View style={[s.cellDiv, { flex: 1, padding: 7 }]}>
                  {item.item_name
                    ? <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>{item.item_name}</Text>
                    : null}
                  {item.description
                    ? <Text style={{ fontSize: 7.5, color: MUTED, marginTop: 2 }}>{item.description}</Text>
                    : null}
                </View>
                <Text style={[s.td, s.cellDiv, { width: cQty, textAlign: 'right' }]}>{fmt(item.quantity)}</Text>
                <Text style={[s.td, s.cellDiv, { width: cRate, textAlign: 'right' }]}>{fmt(item.rate)}</Text>
                <Text style={[s.td, { width: cAmt, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>{fmt(amt)}</Text>
              </View>
            )
          })}
        </View>

        {/* ── Footer ── */}
        <View style={s.footerWrap}>

          {/* Left: words + bank + terms */}
          <View style={s.footLeft}>
            {!quotation.hide_totals && (
              <>
                <Text style={s.wordsLabel}>Total In Words</Text>
                <Text style={s.wordsText}>{amountInWords(total)}</Text>
              </>
            )}

            <View style={s.bankWrap}>
              <Text style={s.bankCo}>{CO.legal}</Text>
              <Text style={s.bankLine}>{'CURRENT A/C NO. : '}{CO.bank.account}</Text>
              <Text style={s.bankLine}>{'BANK: '}{CO.bank.name}</Text>
              <Text style={s.bankLine}>{'BRANCH : '}{CO.bank.branch}</Text>
              <Text style={s.bankLine}>{'RTGS / NEFT IFSC: '}{CO.bank.ifsc}</Text>
            </View>

            {termsLines.length > 0 && (
              <View>
                <Text style={s.termsHead}>Terms &amp; Conditions</Text>
                {termsLines.map((line, i) => (
                  <Text key={i} style={s.termsLine}>{'- '}{line.replace(/^-\s*/, '')}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Right: totals + signature */}
          <View style={s.footRight}>
            {!quotation.hide_totals && (
              <>
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Sub Total</Text>
                  <Text style={s.totalValue}>{fmt(subtotal)}</Text>
                </View>
                {discValue > 0 && (
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Discount (-)</Text>
                    <Text style={s.totalValue}>{fmt(discValue)}</Text>
                  </View>
                )}
                <View style={s.totalRowFinal}>
                  <Text style={[s.totalLabel, { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#222222' }]}>Total</Text>
                  <Text style={[s.totalValue, { fontSize: 10 }]}>{'₹'}{fmt(total)}</Text>
                </View>
              </>
            )}

            <View style={s.sigBox}>
              <Text style={s.sigLabel}>Authorized Signature</Text>
            </View>
          </View>

        </View>

      </Page>
    </Document>
  )
}

// ─── Download function ────────────────────────────────────────────────────────

export async function downloadQuotationPDF(quotation, client, createdByUser) {
  const blob = await pdf(
    <QuotationDocument quotation={quotation} client={client} createdByUser={createdByUser} />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = `${quotation.quotation_id}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
