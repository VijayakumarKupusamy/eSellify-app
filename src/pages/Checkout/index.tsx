import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

type Step = 'shipping' | 'payment' | 'confirmation';
type PayMethod = 'card' | 'upi' | 'wallet' | 'cod';
type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface ShippingForm {
  firstName: string; lastName: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string;
}
interface CardForm { number: string; name: string; expiry: string; cvv: string; }

// ─── Card Helpers ─────────────────────────────────────────────────────────────
function detectCardType(num: string): CardType {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n))                  return 'visa';
  if (/^5[1-5]/.test(n))             return 'mastercard';
  if (/^(34|37)/.test(n))            return 'amex';
  if (/^(6011|65|64[4-9])/.test(n))  return 'discover';
  return 'unknown';
}
function formatCardNumber(raw: string, type: CardType): string {
  const digits  = raw.replace(/\D/g, '');
  const maxLen  = type === 'amex' ? 15 : 16;
  const sliced  = digits.slice(0, maxLen);
  if (type === 'amex') {
    return sliced.replace(/^(.{4})(.{0,6})(.{0,5})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(' '));
  }
  return sliced.replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}
function maskCardDisplay(num: string): string {
  const clean = num.replace(/\s/g, '');
  if (!clean) return '•••• •••• •••• ••••';
  const padded = clean.padEnd(16, '•');
  return `${padded.slice(0,4)} ${padded.slice(4,8)} ${padded.slice(8,12)} ${padded.slice(12,16)}`;
}

// ─── Card Logo ────────────────────────────────────────────────────────────────
const CardLogo: React.FC<{ type: CardType; className?: string }> = ({ type, className = '' }) => {
  if (type === 'visa')
    return <span className={`font-extrabold italic text-blue-800 tracking-tight ${className}`}>VISA</span>;
  if (type === 'mastercard')
    return (
      <span className={`relative inline-flex ${className}`}>
        <span className="w-5 h-5 rounded-full bg-red-500 opacity-90 inline-block" />
        <span className="w-5 h-5 rounded-full bg-yellow-400 opacity-80 inline-block -ml-2.5" />
      </span>);
  if (type === 'amex')
    return <span className={`font-extrabold text-blue-600 tracking-widest text-xs ${className}`}>AMEX</span>;
  if (type === 'discover')
    return <span className={`font-extrabold text-orange-500 text-xs ${className}`}>DISC</span>;
  return <span className={`opacity-20 text-xs font-bold ${className}`}>CARD</span>;
};

// ─── Visual Credit Card ───────────────────────────────────────────────────────
const CreditCardVisual: React.FC<{ card: CardForm; flipped: boolean; type: CardType }> = ({ card, flipped, type }) => {
  const gradients: Record<CardType, string> = {
    visa:       'from-blue-600 to-blue-900',
    mastercard: 'from-gray-800 to-gray-950',
    amex:       'from-teal-600 to-teal-900',
    discover:   'from-orange-500 to-orange-700',
    unknown:    'from-indigo-600 to-purple-800',
  };
  return (
    <div className="w-full max-w-sm mx-auto h-44" style={{ perspective: '1000px' }}>
      <div className="relative w-full h-full transition-transform duration-700"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        {/* Front */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradients[type]} p-5 shadow-xl`}
          style={{ backfaceVisibility: 'hidden' }}>
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-7 bg-yellow-300/80 rounded-md" />
            <CardLogo type={type} className="text-white text-lg" />
          </div>
          <p className="text-white font-mono text-base tracking-widest mb-4 drop-shadow">
            {maskCardDisplay(card.number)}
          </p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Card Holder</p>
              <p className="text-white font-semibold text-sm truncate max-w-36">{card.name || 'YOUR NAME'}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Expires</p>
              <p className="text-white font-semibold text-sm">{card.expiry || 'MM/YY'}</p>
            </div>
          </div>
        </div>
        {/* Back */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradients[type]} shadow-xl`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <div className="h-10 bg-black/50 mt-6 w-full" />
          <div className="px-5 mt-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-8 bg-white/20 rounded" />
              <div className="px-3 h-8 bg-white rounded flex items-center">
                <span className="font-mono text-gray-900 text-sm tracking-widest">
                  {card.cvv ? '•'.repeat(card.cvv.length) : '•••'}
                </span>
              </div>
            </div>
            <p className="text-white/50 text-xs mt-3">CVV</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step Bar ─────────────────────────────────────────────────────────────────
const StepBar: React.FC<{ step: Step }> = ({ step }) => {
  const steps: { key: Step; label: string }[] = [
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment',  label: 'Payment'  },
    { key: 'confirmation', label: 'Confirmed' },
  ];
  const idx = steps.findIndex((s) => s.key === step);
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < idx  ? 'bg-green-500 text-white' :
              i === idx ? 'bg-brand text-white ring-4 ring-brand/20' :
              'bg-gray-200 text-gray-500'}`}>
              {i < idx ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === idx ? 'text-brand' : i < idx ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 max-w-16 transition-colors ${i < idx ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
const OrderSummary: React.FC<{
  shippingCost: number; tax: number; grandTotal: number;
  items: { product: { id: string; name: string; price: number; images: string[] }; quantity: number }[];
}> = ({ shippingCost, tax, grandTotal, items }) => (
  <div className="card p-5 sticky top-24">
    <h3 className="font-bold text-gray-900 mb-4 text-base">Order Summary</h3>
    <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
      {items.map(({ product, quantity }) => (
        <div key={product.id} className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white text-xs rounded-full flex items-center justify-center font-bold">{quantity}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
            <p className="text-xs text-gray-400">${product.price.toFixed(2)} × {quantity}</p>
          </div>
          <p className="text-sm font-semibold flex-shrink-0">${(product.price * quantity).toFixed(2)}</p>
        </div>
      ))}
    </div>
    <hr className="mb-4 border-gray-100" />
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span>${items.reduce((s, i) => s + i.product.price * i.quantity, 0).toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Shipping</span>
        <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
          {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
        </span>
      </div>
      <div className="flex justify-between text-gray-600"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
      <hr className="border-gray-100" />
      <div className="flex justify-between font-bold text-gray-900 text-base">
        <span>Total</span><span>${grandTotal.toFixed(2)}</span>
      </div>
    </div>
    <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5">
      {[
        { icon: '🔒', text: 'SSL encrypted checkout' },
        { icon: '💳', text: 'Multiple payment methods' },
        { icon: '↩',  text: '30-day free returns' },
      ].map((b) => (
        <p key={b.text} className="text-xs text-gray-400 flex items-center gap-1.5">{b.icon} {b.text}</p>
      ))}
    </div>
  </div>
);

// ─── Wallet & UPI Data ────────────────────────────────────────────────────────
const WALLETS = [
  { id: 'paypal',    label: 'PayPal',     color: 'bg-blue-50 border-blue-200 text-blue-700',    icon: '🅿' },
  { id: 'gpay',      label: 'Google Pay', color: 'bg-gray-50 border-gray-200 text-gray-700',    icon: 'G' },
  { id: 'applepay',  label: 'Apple Pay',  color: 'bg-gray-900 border-gray-700 text-white',       icon: '' },
  { id: 'amazonpay', label: 'Amazon Pay', color: 'bg-amber-50 border-amber-200 text-amber-700', icon: 'a' },
];
const UPI_APPS = [
  { id: 'gpay',    label: 'GPay',    icon: 'G',  color: 'text-blue-500'   },
  { id: 'phonepe', label: 'PhonePe', icon: 'P',  color: 'text-purple-600' },
  { id: 'paytm',   label: 'Paytm',   icon: 'PT', color: 'text-sky-500'   },
  { id: 'bhim',    label: 'BHIM',    icon: 'B',  color: 'text-orange-500' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
const SHIP_INIT: ShippingForm = {
  firstName: '', lastName: '', email: '', phone: '',
  address: '', city: '', state: '', zip: '',
};
const CARD_INIT: CardForm = { number: '', name: '', expiry: '', cvv: '' };

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user }            = useAuth();
  const navigate            = useNavigate();

  const [step,     setStep]     = useState<Step>('shipping');
  const [payMethod, setPay]     = useState<PayMethod>('card');
  const [sForm,    setSForm]    = useState<ShippingForm>(SHIP_INIT);
  const [card,     setCard]     = useState<CardForm>(CARD_INIT);
  const [upiId,    setUpiId]    = useState('');
  const [wallet,   setWallet]   = useState('paypal');
  const [cvvFocus, setCvvFocus] = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [busy,     setBusy]     = useState(false);
  const [orderId,  setOrderId]  = useState('');

  const shippingCost = cart.total >= 50 ? 0 : 9.99;
  const tax          = cart.total * 0.08;
  const grandTotal   = cart.total + shippingCost + tax;
  const cardType     = detectCardType(card.number);

  // Pre-fill from profile
  useEffect(() => {
    if (user) {
      setSForm((p) => ({
        ...p,
        firstName: p.firstName || user.name?.split(' ')[0] || '',
        lastName:  p.lastName  || user.name?.split(' ').slice(1).join(' ') || '',
        email:     p.email     || user.email || '',
      }));
    }
  }, [user]);

  if (cart.items.length === 0 && step !== 'confirmation') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  // ── Validators ──────────────────────────────────────────────────────────────
  const validateShipping = () => {
    const e: Record<string, string> = {};
    if (!sForm.firstName.trim()) e.firstName = 'Required';
    if (!sForm.lastName.trim())  e.lastName  = 'Required';
    if (!sForm.email.includes('@')) e.email  = 'Valid email required';
    if (!sForm.phone.trim())     e.phone     = 'Required';
    if (!sForm.address.trim())   e.address   = 'Required';
    if (!sForm.city.trim())      e.city      = 'Required';
    if (!sForm.state.trim())     e.state     = 'Required';
    if (!sForm.zip.trim())       e.zip       = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateCard = () => {
    const e: Record<string, string> = {};
    const raw = card.number.replace(/\s/g, '');
    if (raw.length < (cardType === 'amex' ? 15 : 16)) e.cardNumber = `Card number must be ${cardType === 'amex' ? 15 : 16} digits`;
    if (!card.name.trim())                             e.cardName   = 'Required';
    if (!/^\d{2}\/\d{2}$/.test(card.expiry))           e.expiry     = 'Use MM/YY format';
    if (card.cvv.length < 3)                           e.cvv        = 'CVV too short';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateUpi = () => {
    const e: Record<string, string> = {};
    if (!/^[\w.-]+@[\w]+$/.test(upiId)) e.upiId = 'Enter a valid UPI ID (e.g. name@upi)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit handlers ─────────────────────────────────────────────────────────
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateShipping()) return;
    setErrors({});
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payMethod === 'card' && !validateCard()) return;
    if (payMethod === 'upi'  && !validateUpi())  return;
    setErrors({});
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 1800));
      const newOrder = await ordersApi.create({
        userId: user?.id ?? 'guest',
        items:  cart.items,
        total:  grandTotal,
        status: 'pending',
        shippingAddress: {
          street: sForm.address, city: sForm.city,
          state: sForm.state, zip: sForm.zip, country: 'US',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setOrderId(newOrder.id);
      clearCart();
      setStep('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrors({ submit: 'Payment failed — please check your details and try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <StepBar step={step} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: Forms ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* ═══ SHIPPING ═══ */}
          {step === 'shipping' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Shipping Information</h2>
              <p className="text-sm text-gray-500 mb-6">Tell us where to send your order</p>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input name="firstName" label="First Name" placeholder="John"
                      value={sForm.firstName} onChange={(e) => setSForm((p) => ({ ...p, firstName: e.target.value }))} />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Input name="lastName" label="Last Name" placeholder="Doe"
                      value={sForm.lastName} onChange={(e) => setSForm((p) => ({ ...p, lastName: e.target.value }))} />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input name="email" label="Email Address" type="email" placeholder="john@example.com"
                      value={sForm.email} onChange={(e) => setSForm((p) => ({ ...p, email: e.target.value }))} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Input name="phone" label="Phone Number" type="tel" placeholder="+1 (555) 000-0000"
                      value={sForm.phone} onChange={(e) => setSForm((p) => ({ ...p, phone: e.target.value }))} />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
                <div>
                  <Input name="address" label="Street Address" placeholder="123 Main St, Apt 4B"
                    value={sForm.address} onChange={(e) => setSForm((p) => ({ ...p, address: e.target.value }))} />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Input name="city" label="City" placeholder="New York"
                      value={sForm.city} onChange={(e) => setSForm((p) => ({ ...p, city: e.target.value }))} />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Input name="state" label="State" placeholder="NY"
                      value={sForm.state} onChange={(e) => setSForm((p) => ({ ...p, state: e.target.value }))} />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <Input name="zip" label="ZIP Code" placeholder="10001"
                      value={sForm.zip} onChange={(e) => setSForm((p) => ({ ...p, zip: e.target.value }))} />
                    {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Link to="/cart" className="flex-1">
                    <Button variant="secondary" fullWidth type="button">← Back to Cart</Button>
                  </Link>
                  <Button type="submit" fullWidth className="flex-1">Continue to Payment →</Button>
                </div>
              </form>
            </div>
          )}

          {/* ═══ PAYMENT ═══ */}
          {step === 'payment' && (
            <div className="animate-fade-in space-y-4">
              {/* Shipping recap strip */}
              <div className="card px-4 py-3 flex items-center justify-between gap-3 bg-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm text-gray-700 truncate">
                    <span className="font-medium">{sForm.firstName} {sForm.lastName}</span>
                    {' · '}{sForm.address}, {sForm.city}, {sForm.state} {sForm.zip}
                  </p>
                </div>
                <button onClick={() => setStep('shipping')}
                  className="text-xs text-brand font-semibold hover:underline flex-shrink-0">Edit</button>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Payment</h2>
                <p className="text-sm text-gray-500 mb-5">Choose how you'd like to pay</p>

                {/* SSL notice */}
                <div className="flex items-center gap-2 mb-5 px-3 py-2.5 bg-green-50 rounded-xl text-sm text-green-700 border border-green-100">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>256-bit SSL encryption · Your payment info is always secure</span>
                </div>

                {/* Payment method tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                  {([
                    { id: 'card',   label: 'Credit / Debit',  icon: '💳' },
                    { id: 'upi',    label: 'UPI',              icon: '📱' },
                    { id: 'wallet', label: 'Wallets',          icon: '👛' },
                    { id: 'cod',    label: 'Cash on Delivery', icon: '💵' },
                  ] as { id: PayMethod; label: string; icon: string }[]).map((m) => (
                    <button key={m.id}
                      onClick={() => { setPay(m.id); setErrors({}); }}
                      className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-semibold transition-all ${
                        payMethod === m.id
                          ? 'border-brand bg-brand/5 text-brand ring-2 ring-brand/20'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                      <span className="text-xl">{m.icon}</span>{m.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  {/* ── Card form ── */}
                  {payMethod === 'card' && (
                    <div className="space-y-5">
                      <CreditCardVisual card={card} flipped={cvvFocus} type={cardType} />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
                        <div className="relative">
                          <input className="input-field w-full pr-12 font-mono tracking-widest"
                            placeholder="4242 4242 4242 4242"
                            value={card.number}
                            inputMode="numeric"
                            maxLength={cardType === 'amex' ? 17 : 19}
                            onChange={(e) => {
                              const t = detectCardType(e.target.value);
                              setCard((p) => ({ ...p, number: formatCardNumber(e.target.value, t) }));
                            }} />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CardLogo type={cardType} />
                          </div>
                        </div>
                        {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cardholder Name</label>
                        <input className="input-field w-full uppercase"
                          placeholder="JOHN M. DOE"
                          value={card.name}
                          onChange={(e) => setCard((p) => ({ ...p, name: e.target.value }))} />
                        {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
                          <input className="input-field w-full font-mono"
                            placeholder="MM/YY" value={card.expiry} inputMode="numeric" maxLength={5}
                            onChange={(e) => setCard((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))} />
                          {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            CVV
                            <span className="ml-1.5 text-gray-400 font-normal text-xs">({cardType === 'amex' ? '4 digits' : '3 digits'})</span>
                          </label>
                          <input className="input-field w-full font-mono tracking-widest"
                            placeholder={cardType === 'amex' ? '••••' : '•••'}
                            type="password"
                            value={card.cvv}
                            maxLength={cardType === 'amex' ? 4 : 3}
                            onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, cardType === 'amex' ? 4 : 3) }))}
                            onFocus={() => setCvvFocus(true)}
                            onBlur={() => setCvvFocus(false)} />
                          {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── UPI form ── */}
                  {payMethod === 'upi' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-4 gap-2">
                        {UPI_APPS.map((app) => (
                          <button key={app.id} type="button"
                            onClick={() => setUpiId(`yourname@${app.id}`)}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 hover:border-brand hover:bg-brand/5 transition-colors">
                            <span className={`text-lg font-extrabold ${app.color}`}>{app.icon}</span>
                            <span className="text-xs text-gray-600 font-medium">{app.label}</span>
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label>
                        <div className="relative">
                          <input className="input-field w-full pr-10"
                            placeholder="yourname@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">📱</span>
                        </div>
                        {errors.upiId && <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>}
                        <p className="text-xs text-gray-400 mt-1.5">Format: yourname@bankname</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700 flex items-start gap-3 border border-blue-100">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>You will receive a payment request on your UPI app. Approve within 5 minutes to complete your order.</span>
                      </div>
                    </div>
                  )}

                  {/* ── Wallets ── */}
                  {payMethod === 'wallet' && (
                    <div className="space-y-3">
                      {WALLETS.map((w) => (
                        <button key={w.id} type="button"
                          onClick={() => setWallet(w.id)}
                          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                            wallet === w.id ? 'border-brand ring-2 ring-brand/20 bg-brand/5' : 'border-gray-200 hover:border-gray-300'}`}>
                          <span className={`w-9 h-9 rounded-full border flex items-center justify-center font-extrabold text-base ${w.color}`}>{w.icon}</span>
                          <span className="font-semibold text-gray-900 text-sm">{w.label}</span>
                          {wallet === w.id && (
                            <svg className="w-5 h-5 text-brand ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                      <div className="p-4 bg-amber-50 rounded-xl text-sm text-amber-700 flex items-start gap-3 border border-amber-100">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Clicking "Pay" will redirect you to {WALLETS.find((w2) => w2.id === wallet)?.label} to complete payment securely.</span>
                      </div>
                    </div>
                  )}

                  {/* ── COD ── */}
                  {payMethod === 'cod' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">💵</div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">Pay when your order arrives</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Have the exact amount ready. Our delivery partner will collect payment on delivery.</p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {['Available for orders up to $500', 'Pay in cash to the delivery person', 'No digital payment required', 'Small COD convenience fee may apply'].map((t) => (
                          <li key={t} className="flex items-start gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Error */}
                  {errors.submit && (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm mt-4">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {errors.submit}
                    </div>
                  )}

                  {/* Submit row */}
                  <div className="flex gap-3 pt-5 mt-2 border-t border-gray-100">
                    <Button variant="secondary" type="button" className="flex-1"
                      onClick={() => { setStep('shipping'); setErrors({}); }}>← Back</Button>
                    <button type="submit" disabled={busy}
                      className="flex-1 flex items-center justify-center gap-2 bg-brand text-white font-semibold rounded-xl px-6 py-3 hover:bg-brand/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                      {busy ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing…
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {payMethod === 'cod' ? 'Confirm Order' : `Pay $${grandTotal.toFixed(2)}`}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ═══ CONFIRMATION ═══ */}
          {step === 'confirmation' && (
            <div className="card p-10 text-center animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed! 🎉</h2>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Thank you for your purchase. Your order is being processed.
              </p>
              <div className="inline-grid grid-cols-2 gap-3 text-left mb-6">
                {[
                  { label: 'Order ID',       value: orderId },
                  { label: 'Amount Paid',    value: `$${grandTotal.toFixed(2)}` },
                  { label: 'Payment Method', value:
                    payMethod === 'card'   ? `${cardType !== 'unknown' ? cardType.charAt(0).toUpperCase() + cardType.slice(1) : 'Card'} ···· ${card.number.replace(/\s/g,'').slice(-4) || '****'}` :
                    payMethod === 'upi'    ? `UPI · ${upiId}` :
                    payMethod === 'wallet' ? WALLETS.find((w) => w.id === wallet)?.label ?? 'Wallet' :
                    'Cash on Delivery' },
                  { label: 'Ship to', value: `${sForm.city}, ${sForm.state}` },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className="font-bold text-gray-900 text-sm truncate">{item.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mb-8">
                Confirmation email sent to <strong className="text-gray-700">{sForm.email}</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/dashboard')} variant="secondary">View My Orders</Button>
                <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Order Summary ── */}
        {step !== 'confirmation' && (
          <div className="lg:col-span-1">
            <OrderSummary shippingCost={shippingCost} tax={tax} grandTotal={grandTotal} items={cart.items} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
