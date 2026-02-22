import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

type Step = 'info' | 'payment' | 'confirmation';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

const INITIAL_FORM: FormData = {
  firstName: '', lastName: '', email: '', address: '', city: '', state: '', zip: '',
  cardNumber: '', expiryDate: '', cvv: '', cardName: '',
};

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('info');
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [orderId] = useState(`ORD-${Date.now().toString().slice(-6)}`);

  const shipping = cart.total >= 50 ? 0 : 9.99;
  const tax = cart.total * 0.08;
  const grandTotal = cart.total + shipping + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    clearCart();
    setStep('confirmation');
  };

  if (cart.items.length === 0 && step !== 'confirmation') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'info', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirmation', label: 'Confirmed' },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < stepIndex ? 'bg-green-500 text-white' :
                i === stepIndex ? 'bg-brand text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === stepIndex ? 'text-brand' : 'text-gray-500'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 max-w-16 ${i < stepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Forms ── */}
        <div className="lg:col-span-2">
          {/* Shipping Info */}
          {step === 'info' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Shipping Information</h2>
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input name="firstName" label="First Name" placeholder="John" value={form.firstName} onChange={handleChange} required />
                  <Input name="lastName" label="Last Name" placeholder="Doe" value={form.lastName} onChange={handleChange} required />
                </div>
                <Input name="email" label="Email Address" type="email" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
                <Input name="address" label="Street Address" placeholder="123 Main St, Apt 4B" value={form.address} onChange={handleChange} required />
                <div className="grid grid-cols-3 gap-4">
                  <Input name="city" label="City" placeholder="New York" value={form.city} onChange={handleChange} required className="col-span-1" />
                  <Input name="state" label="State" placeholder="NY" value={form.state} onChange={handleChange} required className="col-span-1" />
                  <Input name="zip" label="ZIP Code" placeholder="10001" value={form.zip} onChange={handleChange} required className="col-span-1" />
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

          {/* Payment */}
          {step === 'payment' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Payment Details</h2>
              <div className="flex items-center gap-2 mb-5 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                SSL encrypted · Your payment info is secure
              </div>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <Input name="cardName" label="Cardholder Name" placeholder="John M. Doe" value={form.cardName} onChange={handleChange} required />
                <Input name="cardNumber" label="Card Number" placeholder="4242 4242 4242 4242" value={form.cardNumber} onChange={handleChange} required
                  rightIcon={<svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="expiryDate" label="Expiry Date" placeholder="MM/YY" value={form.expiryDate} onChange={handleChange} required />
                  <Input name="cvv" label="CVV" placeholder="···" type="password" maxLength={4} value={form.cvv} onChange={handleChange} required />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="secondary" type="button" fullWidth className="flex-1" onClick={() => setStep('info')}>← Back</Button>
                  <Button type="submit" loading={loading} fullWidth className="flex-1">
                    {loading ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Confirmation */}
          {step === 'confirmation' && (
            <div className="card p-10 text-center animate-slide-up">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
              <p className="text-gray-500 mb-4">Thank you for your purchase. Your order has been placed successfully.</p>
              <div className="bg-gray-50 rounded-xl px-6 py-4 mb-6 inline-block">
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="text-lg font-bold text-gray-900">{orderId}</p>
              </div>
              <p className="text-sm text-gray-500 mb-8">A confirmation email will be sent to <strong>{form.email || 'your email'}</strong></p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/')} variant="secondary">Go to Home</Button>
                <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Order Summary ── */}
        {step !== 'confirmation' && (
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart.items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="relative">
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white text-xs rounded-full flex items-center justify-center font-bold">{quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    </div>
                    <p className="text-sm font-semibold">${(product.price * quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <hr className="mb-4 border-gray-100" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${cart.total.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                <hr className="border-gray-100" />
                <div className="flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
