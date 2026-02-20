import React from 'react';
import { ArrowLeft, CheckCircle2, Download, Mail, Receipt, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

const FALLBACK_ORDER = {
    orderNumber: 'FB-204216',
    createdAt: new Date().toISOString(),
    totalGuests: 120,
    contactInfo: {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@globex.com',
        phone: '+91 98765 43210',
    },
    eventDetails: {
        date: '2026-02-10',
        timeSlot: '13:30',
        venue: 'Globex Tower, Embassy TechVillage, Bengaluru',
    },
    totals: {
        menuSubtotal: 320000,
        logisticsFee: 5400,
        serviceRetainer: 9600,
        taxes: 16750,
        grandTotal: 351750,
    },
    cartItems: [
        {
            id: 'royal-corporate-feast',
            name: 'The Royal Corporate Feast',
            guests: 120,
            total: 320000,
            customizations: {
                selectedItems: ['Butter Chicken', 'Paneer Butter Masala', 'Dal Makhani'],
                addedItems: [{ name: 'Espresso Tiramisu Cups', price: 140 }],
            },
        },
    ],
};

const OrderDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const confirmation = location.state?.confirmation || FALLBACK_ORDER;

    const eventDate = confirmation.eventDetails?.date
        ? new Date(confirmation.eventDetails.date)
        : new Date();
    const formattedDate = eventDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const dispatchTime = confirmation.eventDetails?.timeSlot
        ? confirmation.eventDetails.timeSlot
        : '13:30';

    const handleDownloadInvoice = () => {
        const orderId = confirmation.orderNumber || 'order';
        const items = confirmation.cartItems || [];
        const lines = items
            .map((item) => `• ${item.name} — ${item.guests || confirmation.totalGuests || 0} guests — ${formatCurrency(item.total || 0)}`)
            .join('\n');

        const invoiceText = `Catalyst Catering Invoice\nOrder: ${orderId}\nDate: ${formattedDate}\nGuests: ${confirmation.totalGuests || 'N/A'}\nVenue: ${confirmation.eventDetails?.venue || 'Not provided'}\n\nItems:\n${lines || 'No items'}\n\nTotal Payable: ${formatCurrency(confirmation.totals?.grandTotal || 0)}`;

        const blob = new Blob([invoiceText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${orderId}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#f6f3ee] text-gray-800">
            <header className="bg-white border-b border-[#e8e1d4] sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BrandLogo showWordmark={false} imgClassName="h-8 w-auto" />
                        <button
                            type="button"
                            onClick={() => navigate('/home')}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#f27f0d]"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to home
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-[#f27f0d] font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Confirmed
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 space-y-8">
                <section className="bg-white border border-[#ede5d8] rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.35em] text-gray-400">Order summary</p>
                            <h1 className="text-2xl font-semibold text-gray-900">Order {confirmation.orderNumber}</h1>
                            <p className="text-sm text-gray-600">Status: Confirmed</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fef4e8] text-[#b85e07] border border-[#f4d7ab]">
                                <CheckCircle2 className="w-4 h-4" /> Confirmed
                            </span>
                            <button
                                type="button"
                                onClick={handleDownloadInvoice}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f27f0d] text-white font-semibold shadow-sm hover:bg-[#d96f0a]"
                            >
                                <Download className="w-4 h-4" /> Download invoice
                            </button>
                        </div>
                    </div>
                    <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
                        <div className="rounded-lg bg-[#fdfbf8] border border-[#f0e7d9] p-3">
                            <dt className="uppercase text-[11px] tracking-wide text-gray-500">Service date</dt>
                            <dd className="text-base font-semibold text-gray-900">{formattedDate}</dd>
                        </div>
                        <div className="rounded-lg bg-[#fdfbf8] border border-[#f0e7d9] p-3">
                            <dt className="uppercase text-[11px] tracking-wide text-gray-500">Dispatch window</dt>
                            <dd className="text-base font-semibold text-gray-900">{dispatchTime}</dd>
                        </div>
                        <div className="rounded-lg bg-[#fdfbf8] border border-[#f0e7d9] p-3">
                            <dt className="uppercase text-[11px] tracking-wide text-gray-500">Guests</dt>
                            <dd className="text-base font-semibold text-gray-900">{confirmation.totalGuests || '—'}</dd>
                        </div>
                        <div className="rounded-lg bg-[#fdfbf8] border border-[#f0e7d9] p-3 sm:col-span-2 lg:col-span-3">
                            <dt className="uppercase text-[11px] tracking-wide text-gray-500">Venue</dt>
                            <dd className="text-base font-semibold text-gray-900">{confirmation.eventDetails?.venue || 'Venue details pending'}</dd>
                        </div>
                        <div className="rounded-lg bg-[#fdfbf8] border border-[#f0e7d9] p-3 sm:col-span-2 lg:col-span-3">
                            <dt className="uppercase text-[11px] tracking-wide text-gray-500">Total payable</dt>
                            <dd className="text-lg font-semibold text-gray-900">{formatCurrency(confirmation.totals?.grandTotal || 0)}</dd>
                        </div>
                    </dl>
                </section>

                <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
                    <section className="space-y-6">
                        <article className="bg-white border border-[#ede5d8] rounded-2xl shadow-sm p-6 space-y-6">
                            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Order items</h2>
                                    <p className="text-sm text-gray-500">Finalized meal plan and customizations.</p>
                                </div>
                            </header>
                            <div className="space-y-5">
                                {confirmation.cartItems?.map((item) => (
                                    <div key={item.id} className="border border-[#f0e7d9] rounded-xl px-4 py-3 bg-[#fdfbf8]">
                                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                                            <div className="font-semibold text-gray-900">{item.name}</div>
                                            <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                                                <Users className="w-4 h-4 text-[#f27f0d]" /> {item.guests} guests
                                            </div>
                                        </div>
                                        {item.customizations?.selectedItems?.length ? (
                                            <div className="mt-3 text-xs text-gray-600">
                                                <p className="font-semibold text-gray-500 uppercase tracking-wide">Menu highlights</p>
                                                <ul className="mt-2 grid sm:grid-cols-2 gap-2">
                                                    {item.customizations.selectedItems.map((entry, index) => (
                                                        <li key={`${item.id}-sel-${index}`} className="flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#f27f0d]"></span>
                                                            {typeof entry === 'string' ? entry : entry.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : null}
                                        {item.customizations?.addedItems?.length ? (
                                            <div className="mt-3 text-xs text-[#b85e07] bg-[#fff6ea] border border-[#f4d7ab] rounded-lg px-3 py-2">
                                                Added custom items:{' '}
                                                {item.customizations.addedItems.map((addon) => addon.name).join(', ')}
                                            </div>
                                        ) : null}
                                        <div className="mt-4 text-sm font-semibold text-gray-900 flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(item.total)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="bg-white border border-[#ede5d8] rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900">Point of contact</h2>
                            <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Lead coordinator</p>
                                    <p className="mt-1 font-semibold text-gray-900">{confirmation.contactInfo?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                                    <p className="mt-1 text-gray-900 font-medium flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-[#f27f0d]" /> {confirmation.contactInfo?.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
                                    <p className="mt-1 text-gray-900 font-medium">{confirmation.contactInfo?.phone}</p>
                                </div>
                            </div>
                        </article>
                    </section>

                    <aside className="space-y-6">
                        <section className="bg-white border border-[#ede5d8] rounded-2xl shadow-md p-6 space-y-5">
                            <header className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.35em] text-gray-400">Invoice summary</p>
                                    <h3 className="text-lg font-semibold text-gray-900">{confirmation.orderNumber}</h3>
                                </div>
                                <Receipt className="w-5 h-5 text-[#f27f0d]" />
                            </header>
                            <dl className="space-y-3 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <dt>Menu subtotal</dt>
                                    <dd className="font-semibold text-gray-900">{formatCurrency(confirmation.totals?.menuSubtotal || 0)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Logistics & dispatch</dt>
                                    <dd className="font-semibold text-gray-900">{formatCurrency(confirmation.totals?.logisticsFee || 0)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Service retainer</dt>
                                    <dd className="font-semibold text-gray-900">{formatCurrency(confirmation.totals?.serviceRetainer || 0)}</dd>
                                </div>
                                <div className="flex justify-between border-b border-[#f0e7d9] pb-3">
                                    <dt>Taxes & compliance</dt>
                                    <dd className="font-semibold text-gray-900">{formatCurrency(confirmation.totals?.taxes || 0)}</dd>
                                </div>
                                <div className="flex justify-between text-base font-semibold text-gray-900">
                                    <dt>Total payable</dt>
                                    <dd>{formatCurrency(confirmation.totals?.grandTotal || 0)}</dd>
                                </div>
                            </dl>
                            <button
                                type="button"
                                onClick={handleDownloadInvoice}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2f855a] text-white font-semibold py-3 shadow-lg shadow-emerald-100 hover:bg-[#256f49]"
                            >
                                <Download className="w-5 h-5" /> Download invoice
                            </button>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default OrderDetailsPage;
