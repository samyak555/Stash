import React, { useState } from 'react';
import GSTCalculator from '../components/GSTCalculator';
import Icon from '../components/ui/Icons';
import Button from '../components/ui/Button';

const FreelancerTools = () => {
    return (
        <div className="px-4 py-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3 flex items-center">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mr-4">
                        <Icon icon="briefcase" className="w-8 h-8 text-emerald-400" />
                    </div>
                    Tax & Invoicing Tools
                </h1>
                <p className="text-slate-400 text-lg ml-14">
                    Professional tools for managing your business finances and tax compliance.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* GST Calculator Section */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <Icon icon="calculator" className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-xl font-semibold text-white">GST Calculator & Validator</h2>
                    </div>
                    <GSTCalculator />
                </div>

                {/* Invoice Generator Section (Coming Soon) */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <Icon icon="file-text" className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Smart Invoicing</h2>
                    </div>

                    <div className="glass-card rounded-2xl p-8 border border-white/10 flex flex-col items-center justify-center text-center h-[500px] relative overflow-hidden group">
                        {/* Background decoration */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                            <Icon icon="file-text" size={40} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">Invoice Generator</h3>
                        <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                            Create professional, GST-compliant invoices in seconds. Export to PDF and email directly to clients.
                        </p>

                        <div className="flex flex-col gap-3 w-full max-w-xs z-10">
                            <Button variant="primary" disabled className="w-full justify-center opacity-70 cursor-not-allowed">
                                Create New Invoice
                            </Button>
                            <span className="text-xs text-emerald-400 font-medium tracking-wide uppercase bg-emerald-500/10 py-1 px-3 rounded-full self-center border border-emerald-500/20">
                                Coming Soon
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreelancerTools;
