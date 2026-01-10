import React, { useState } from 'react';
import GSTCalculator from '../components/GSTCalculator';
import Icon from '../components/ui/Icons';
import Button from '../components/ui/Button';

import InvoiceGenerator from '../components/InvoiceGenerator';

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

                {/* Invoice Generator Section */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <Icon icon="file-text" className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Smart Invoice Generator</h2>
                    </div>
                    <InvoiceGenerator />
                </div>
            </div>
        </div>
    );
};

export default FreelancerTools;
