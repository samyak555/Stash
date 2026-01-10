import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Button from './ui/Button';
import Icon from './ui/Icons';
import toast from 'react-hot-toast';

const InvoiceGenerator = () => {
    const [formData, setFormData] = useState({
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

        // Your Details (Freelancer)
        senderName: 'Your Name / Business',
        senderEmail: 'you@example.com',
        senderAddress: '123 Freelance St, Mumbai, India',
        senderGstin: '',

        // Client Details
        clientName: '',
        clientEmail: '',
        clientAddress: '',
        clientGstin: '',
    });

    const [items, setItems] = useState([
        { id: 1, description: 'Web Development Services', quantity: 1, rate: 10000, amount: 10000 }
    ]);

    const [taxRate, setTaxRate] = useState(18); // 18% GST default

    // Calculate Totals
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (id, field, value) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'quantity' || field === 'rate') {
                    updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate);
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const addItem = () => {
        setItems(prev => [
            ...prev,
            { id: Date.now(), description: 'New Service', quantity: 1, rate: 0, amount: 0 }
        ]);
    };

    const removeItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const generatePDF = () => {
        try {
            if (!formData.clientName) {
                toast.error('Please enter client name');
                return;
            }

            const doc = new jsPDF();

            // -- HEADER --
            // Logo Placeholder (Teal Square)
            doc.setFillColor(45, 212, 191); // Teal color
            doc.rect(14, 10, 10, 10, 'F');

            // Brand Name
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59); // Slate 800
            doc.text('STASH INVOICE', 30, 18);

            // Status
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('ORIGINAL FOR RECIPIENT', 150, 18);

            // Line
            doc.setDrawColor(200);
            doc.line(14, 25, 196, 25);

            // -- DETAILS SECTION --
            doc.setFontSize(10);
            doc.setTextColor(80);

            // Left Col: Sender
            doc.setFont('helvetica', 'bold');
            doc.text('From:', 14, 35);
            doc.setFont('helvetica', 'normal');
            doc.text(formData.senderName, 14, 40);
            doc.text(formData.senderAddress, 14, 45);
            doc.text(formData.senderEmail, 14, 50);
            if (formData.senderGstin) doc.text(`GSTIN: ${formData.senderGstin}`, 14, 55);

            // Middle Col: Client
            doc.setFont('helvetica', 'bold');
            doc.text('Bill To:', 80, 35);
            doc.setFont('helvetica', 'normal');
            doc.text(formData.clientName, 80, 40);
            doc.text(formData.clientAddress, 80, 45);
            if (formData.clientEmail) doc.text(formData.clientEmail, 80, 50);
            if (formData.clientGstin) doc.text(`GSTIN: ${formData.clientGstin}`, 80, 55);

            // Right Col: Invoice Details
            doc.setFont('helvetica', 'bold');
            doc.text('Invoice #:', 140, 35);
            doc.setFont('helvetica', 'normal');
            doc.text(formData.invoiceNumber, 170, 35);

            doc.setFont('helvetica', 'bold');
            doc.text('Date:', 140, 40);
            doc.setFont('helvetica', 'normal');
            doc.text(formData.date, 170, 40);

            doc.setFont('helvetica', 'bold');
            doc.text('Due Date:', 140, 45);
            doc.setFont('helvetica', 'normal');
            doc.text(formData.dueDate, 170, 45);

            // -- TABLE --
            const tableData = items.map(item => [
                item.description,
                item.quantity,
                `Rs. ${item.rate.toLocaleString('en-IN')}`,
                `Rs. ${item.amount.toLocaleString('en-IN')}`
            ]);

            doc.autoTable({
                startY: 70,
                head: [['Description', 'Qty', 'Rate', 'Amount']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42], textColor: 255 }, // Slate 900
                styles: { fontSize: 9, cellPadding: 3 },
            });

            const finalY = doc.lastAutoTable.finalY + 10;

            // -- TOTALS --
            doc.setFontSize(10);
            doc.text('Subtotal:', 140, finalY);
            doc.text(`Rs. ${subtotal.toLocaleString('en-IN')}`, 170, finalY, { align: 'left' });

            doc.text(`Tax (${taxRate}%):`, 140, finalY + 6);
            doc.text(`Rs. ${taxAmount.toLocaleString('en-IN')}`, 170, finalY + 6, { align: 'left' });

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Total:', 140, finalY + 14);
            doc.text(`Rs. ${total.toLocaleString('en-IN')}`, 170, finalY + 14, { align: 'left' });

            // -- FOOTER --
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(150);
            doc.text('Thank you for your business.', 14, 280);
            doc.text('Generated by Stash App', 170, 280);

            doc.save(`Invoice_${formData.invoiceNumber}.pdf`);
            toast.success('Invoice downloaded successfully! 📄');

        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate PDF');
        }
    };

    return (
        <div className="animate-fade-in bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 md:p-8">
            {/* Header Inputs */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <div className="space-y-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <Icon icon="user" className="text-teal-400" size={16} />
                        Your Details (Sender)
                    </h3>
                    <input
                        name="senderName"
                        value={formData.senderName}
                        onChange={handleInputChange}
                        placeholder="Your Name / Business"
                        className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-teal-500 focus:border-teal-500"
                    />
                    <input
                        name="senderAddress"
                        value={formData.senderAddress}
                        onChange={handleInputChange}
                        placeholder="Address"
                        className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                    <input
                        name="senderGstin"
                        value={formData.senderGstin}
                        onChange={handleInputChange}
                        placeholder="Your GSTIN (Optional)"
                        className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                </div>
                <div className="space-y-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <Icon icon="briefcase" className="text-blue-400" size={16} />
                        Client Details (Billed To)
                    </h3>
                    <input
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        placeholder="Client Name"
                        className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                        name="clientAddress"
                        value={formData.clientAddress}
                        onChange={handleInputChange}
                        placeholder="Client Address"
                        className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                    <input
                        name="clientGstin"
                        value={formData.clientGstin}
                        onChange={handleInputChange}
                        placeholder="Client GSTIN (Optional)"
                        className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                </div>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-slate-800/30 p-4 rounded-xl">
                <div>
                    <label className="text-xs text-slate-400 uppercase">Invoice #</label>
                    <input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} className="w-full bg-transparent text-white font-mono border-none focus:ring-0 p-0" />
                </div>
                <div>
                    <label className="text-xs text-slate-400 uppercase">Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-transparent text-white border-none focus:ring-0 p-0" />
                </div>
                <div>
                    <label className="text-xs text-slate-400 uppercase">Due Date</label>
                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="w-full bg-transparent text-white border-none focus:ring-0 p-0" />
                </div>
                <div>
                    <label className="text-xs text-slate-400 uppercase">Tax Rate (%)</label>
                    <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full bg-transparent text-white border-none focus:ring-0 p-0" />
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Description</th>
                            <th className="px-4 py-3 w-24">Qty</th>
                            <th className="px-4 py-3 w-32">Rate (₹)</th>
                            <th className="px-4 py-3 w-32">Amount</th>
                            <th className="px-4 py-3 w-12 rounded-r-lg"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {items.map(item => (
                            <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                                <td className="px-4 py-2">
                                    <input
                                        value={item.description}
                                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                        className="w-full bg-transparent text-white border-none focus:ring-0 p-0 placeholder-slate-600"
                                        placeholder="Item description"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                        className="w-full bg-transparent text-white border-none focus:ring-0 p-0 text-center"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="number"
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                        className="w-full bg-transparent text-white border-none focus:ring-0 p-0 text-right"
                                    />
                                </td>
                                <td className="px-4 py-2 text-white font-medium text-right">
                                    ₹{item.amount.toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    {items.length > 1 && (
                                        <button onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-red-400">
                                            <Icon icon="x" size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4">
                    <Button variant="secondary" size="sm" onClick={addItem} leftIcon={<Icon icon="plus" size={14} />}>Add Item</Button>
                </div>
            </div>

            {/* Summary Footer */}
            <div className="flex justify-end border-t border-slate-700 pt-6">
                <div className="w-full max-w-sm space-y-3">
                    <div className="flex justify-between text-slate-400">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span>GST ({taxRate}%)</span>
                        <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-white text-xl font-bold pt-3 border-t border-slate-700">
                        <span>Total</span>
                        <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>

                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={generatePDF}
                        className="mt-6 shadow-lg shadow-teal-500/20"
                        leftIcon={<Icon icon="download" size={18} />}
                    >
                        Download Invoice PDF
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceGenerator;
