import { useState } from 'react';
import Icon from './ui/Icons';
import Button from './ui/Button';
import toast from 'react-hot-toast';

const GSTCalculator = () => {
    const [activeTab, setActiveTab] = useState('calculate'); // calculate, verify
    const [values, setValues] = useState({
        amount: '',
        rate: '18',
        type: 'exclusive', // inclusive, exclusive
        gstin: '',
    });
    const [result, setResult] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);

    const calculateGST = () => {
        const amount = parseFloat(values.amount);
        const rate = parseFloat(values.rate);

        if (isNaN(amount) || !amount) return;

        let gstAmount = 0;
        let netAmount = 0;
        let totalAmount = 0;

        if (values.type === 'exclusive') {
            gstAmount = (amount * rate) / 100;
            netAmount = amount;
            totalAmount = amount + gstAmount;
        } else {
            gstAmount = amount - (amount * (100 / (100 + rate)));
            netAmount = amount - gstAmount;
            totalAmount = amount;
        }

        setResult({
            net: netAmount.toFixed(2),
            gst: gstAmount.toFixed(2),
            total: totalAmount.toFixed(2),
            cgst: (gstAmount / 2).toFixed(2),
            sgst: (gstAmount / 2).toFixed(2),
        });
    };

    const verifyGSTIN = () => {
        // Regex for GSTIN validation (Free client-side validation)
        // Format: 22AAAAA0000A1Z5
        const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

        if (!values.gstin) {
            toast.error('Please enter a GSTIN');
            return;
        }

        const isValid = regex.test(values.gstin);

        // In a real app with paid API, we would fetch details here.
        // For now, we simulate a "Search" using free algorithmic validation and state extraction.

        if (isValid) {
            const stateCode = values.gstin.substring(0, 2);
            const pan = values.gstin.substring(2, 12);

            setVerificationResult({
                valid: true,
                message: 'Valid GSTIN Structure',
                details: {
                    stateCode: stateCode,
                    pan: pan,
                    entityType: values.gstin[5], // 4th char of PAN usually denotes status (P=Person, C=Company, etc)
                }
            });
            toast.success('GSTIN is valid!', { icon: '✅' });
        } else {
            setVerificationResult({
                valid: false,
                message: 'Invalid GSTIN Format',
            });
            toast.error('Invalid GSTIN Format');
        }
    };

    return (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab('calculate')}
                    className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'calculate'
                            ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Icon icon="zap" size={16} />
                    GST Calculator
                </button>
                <button
                    onClick={() => setActiveTab('verify')}
                    className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'verify'
                            ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Icon icon="shield" size={16} />
                    Verify GSTIN
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'calculate' ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-slate-500">₹</span>
                                    <input
                                        type="number"
                                        value={values.amount}
                                        onChange={(e) => setValues({ ...values, amount: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GST Rate (%)</label>
                                <select
                                    value={values.rate}
                                    onChange={(e) => setValues({ ...values, rate: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
                                >
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                            <button
                                onClick={() => setValues({ ...values, type: 'exclusive' })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${values.type === 'exclusive' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Exclusive (Add GST)
                            </button>
                            <button
                                onClick={() => setValues({ ...values, type: 'inclusive' })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${values.type === 'inclusive' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Inclusive (Remove GST)
                            </button>
                        </div>

                        <Button onClick={calculateGST} variant="primary" fullWidth size="lg">Calculate</Button>

                        {result && (
                            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Net Amount</p>
                                    <p className="text-lg font-mono text-white">₹{result.net}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">GST ({values.rate}%)</p>
                                    <p className="text-lg font-mono text-blue-400">₹{result.gst}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Total Amount</p>
                                    <p className="text-lg font-mono text-emerald-400 font-bold">₹{result.total}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enter GSTIN Number</label>
                            <input
                                type="text"
                                value={values.gstin}
                                onChange={(e) => setValues({ ...values, gstin: e.target.value.toUpperCase() })}
                                maxLength={15}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono uppercase tracking-widest"
                                placeholder="22AAAAA0000A1Z5"
                            />
                        </div>

                        <Button onClick={verifyGSTIN} variant="secondary" fullWidth size="lg">Verify Format</Button>

                        {verificationResult && (
                            <div className={`mt-4 p-4 rounded-xl border ${verificationResult.valid ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon icon={verificationResult.valid ? 'check' : 'zap'} size={20} className={verificationResult.valid ? 'text-emerald-500' : 'text-rose-500'} />
                                    <h3 className={`font-semibold ${verificationResult.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {verificationResult.message}
                                    </h3>
                                </div>
                                {verificationResult.valid && (
                                    <div className="text-sm text-slate-400 mt-2 space-y-1 pl-8">
                                        <p>State Code: <span className="text-white font-mono">{verificationResult.details.stateCode}</span></p>
                                        <p>PAN Card: <span className="text-white font-mono">{verificationResult.details.pan}</span></p>
                                        <p>Entity Type: <span className="text-white font-mono">{verificationResult.details.entityType}</span></p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GSTCalculator;
