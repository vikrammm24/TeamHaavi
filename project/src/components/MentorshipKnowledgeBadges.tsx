import React from 'react';
import { GraduationCap, Users, Award } from 'lucide-react';

const mentorships = [
  { id: 'm1', mentor: 'Dr. R. Singh', topic: 'Urban Planning', slots: 3 },
  { id: 'm2', mentor: 'A. Mehta', topic: 'Disaster Response', slots: 2 },
];
const knowledgeBadges = [
  { id: 'k1', badge: 'Smart City Innovator', awardedTo: 'S. Kumar' },
  { id: 'k2', badge: 'Community Educator', awardedTo: 'L. Sharma' },
];

const MentorshipKnowledgeBadges: React.FC = () => {
  return (
    <div className="bg-yellow-50 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <GraduationCap className="w-6 h-6 text-yellow-600" />
        Mentorship & Knowledge Badges
      </h2>
      <div className="mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" /> Mentorship Opportunities
        </h3>
        <table className="min-w-full text-sm mb-4">
          <thead><tr><th>Mentor</th><th>Topic</th><th>Slots</th></tr></thead>
          <tbody>
            {mentorships.map(m => (
              <tr key={m.id}>
                <td>{m.mentor}</td>
                <td>{m.topic}</td>
                <td>{m.slots}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" /> Knowledge Badges
        </h3>
        <table className="min-w-full text-sm">
          <thead><tr><th>Badge</th><th>Awarded To</th></tr></thead>
          <tbody>
            {knowledgeBadges.map(k => (
              <tr key={k.id}>
                <td>{k.badge}</td>
                <td>{k.awardedTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-gray-500 mt-2">Grow your skills and earn recognition in the professional network.</div>
      </div>
    </div>
  );
};

export default MentorshipKnowledgeBadges;
