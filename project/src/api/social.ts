// Social features for reports: likes and comments (Realtime Database)
import { rtdb, auth } from '../components/firebase/firebase';
import { ref as dbRef, get as dbGet, set as dbSet, push as dbPush, remove as dbRemove, onValue, update as dbUpdate } from 'firebase/database';

// Add a like to a report
export async function likeReport(reportId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const likeRef = dbRef(rtdb, `reportLikes/${reportId}/${user.uid}`);
  await dbSet(likeRef, true);
}

// Remove a like from a report
export async function unlikeReport(reportId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const likeRef = dbRef(rtdb, `reportLikes/${reportId}/${user.uid}`);
  await dbRemove(likeRef);
}

// Get likes for a report (returns array of user IDs)
export async function getReportLikes(reportId: string): Promise<string[]> {
  const likesRef = dbRef(rtdb, `reportLikes/${reportId}`);
  const snap = await dbGet(likesRef);
  if (!snap.exists()) return [];
  return Object.keys(snap.val());
}

// Add a comment to a report
export async function addReportComment(reportId: string, text: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const commentRef = dbRef(rtdb, `reportComments/${reportId}`);
  const newComment = {
    userId: user.uid,
    userName: user.displayName || user.email || 'Anonymous',
    text,
    createdAt: Date.now()
  };
  await dbPush(commentRef, newComment);
}

// Get comments for a report (returns array of comment objects)
export async function getReportComments(reportId: string): Promise<any[]> {
  const commentsRef = dbRef(rtdb, `reportComments/${reportId}`);
  const snap = await dbGet(commentsRef);
  if (!snap.exists()) return [];
  const val = snap.val();
  return Object.values(val);
}
