import React from 'react';
import { BadgeCheck, Layers, FileText } from 'lucide-react';

const aidPortfolio = [
  { id: 'p1', project: 'Flood Relief', verified: true, txHash: '0xabc123', amount: 5000 },
  { id: 'p2', project: 'School Renovation', verified: true, txHash: '0xdef456', amount: 3200 },
];
const certifications = [
  { id: 'c1', name: 'Disaster Response Expert', issuedBy: 'CityConnect', date: '2025-08-10', verified: true },
  { id: 'c2', name: 'Community Builder', issuedBy: 'NGO Network', date: '2025-07-22', verified: true },
];

const BlockchainPortfolioCertifications: React.FC = () => {
  return (
    <div className="bg-blue-50 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Layers className="w-6 h-6 text-blue-600" />
        Blockchain Portfolio & Certifications
      </h2>
      <div className="mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-green-600" /> Verified Aid Portfolio
        </h3>
        <table className="min-w-full text-sm mb-4">
          <thead><tr><th>Project</th><th>Verified</th><th>Tx Hash</th><th>Amount</th></tr></thead>
          <tbody>
            {aidPortfolio.map(p => (
              <tr key={p.id}>
                <td>{p.project}</td>
                <td>{p.verified ? <span className="text-green-700 font-bold">Yes</span> : <span className="text-red-700 font-bold">No</span>}</td>
                <td className="font-mono text-xs">{p.txHash}</td>
                <td>${p.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" /> Certifications
        </h3>
        <table className="min-w-full text-sm">
          <thead><tr><th>Certification</th><th>Issued By</th><th>Date</th><th>Verified</th></tr></thead>
          <tbody>
            {certifications.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.issuedBy}</td>
                <td>{c.date}</td>
                <td>{c.verified ? <span className="text-green-700 font-bold">Yes</span> : <span className="text-red-700 font-bold">No</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-gray-500 mt-2">All aid and certifications are blockchain-verified for authenticity.</div>
      </div>
    </div>
  );
};

export default BlockchainPortfolioCertifications;
