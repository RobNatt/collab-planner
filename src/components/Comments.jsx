import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { useUserProfiles } from '../hooks/useUserProfile';
import { getUserDisplayName } from '../utils/userHelpers';
import { logCommentAdded } from '../utils/activityLogger';
import toast from 'react-hot-toast';

function Comments({ itemId, itemTitle, planId, members = [] }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef(null);
  const { colors } = useTheme();
  const { profiles } = useUserProfiles(members);

  useEffect(() => {
    if (!itemId) return;

    const q = query(
      collection(db, 'comments'),
      where('itemId', '==', itemId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComments(commentsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to comments:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      // Extract mentions from comment
      const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
      const mentions = [];
      let match;
      while ((match = mentionRegex.exec(newComment)) !== null) {
        mentions.push({ name: match[1], id: match[2] });
      }

      // Convert mentions to display format for storage
      const displayText = newComment.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, '@$1');

      await addDoc(collection(db, 'comments'), {
        itemId,
        planId,
        text: displayText,
        rawText: newComment,
        mentions: mentions.map(m => m.id),
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      // Log activity
      logCommentAdded(planId, itemTitle);

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    setNewComment(value);
    setCursorPosition(position);

    // Check if user is typing a mention
    const textBeforeCursor = value.slice(0, position);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show mentions if there's no space after @
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setShowMentions(true);
        setMentionFilter(textAfterAt.toLowerCase());
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (memberId) => {
    const memberName = getUserDisplayName(memberId, profiles, auth.currentUser.uid);
    const textBeforeCursor = newComment.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = newComment.slice(cursorPosition);

    // Replace the @mention with the full mention format
    const newText =
      textBeforeCursor.slice(0, lastAtIndex) +
      `@[${memberName}](${memberId}) ` +
      textAfterCursor;

    setNewComment(newText);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const renderCommentText = (text) => {
    // Highlight @mentions in the displayed text
    return text.split(/(@\w+)/g).map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} style={{ color: colors.primary, fontWeight: '600' }}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredMembers = members.filter(memberId => {
    const name = getUserDisplayName(memberId, profiles, auth.currentUser.uid).toLowerCase();
    return name.includes(mentionFilter);
  });

  return (
    <div style={{
      backgroundColor: colors.backgroundTertiary,
      borderRadius: '12px',
      padding: '16px',
      marginTop: '12px',
    }}>
      <h4 style={{
        color: colors.text,
        margin: '0 0 12px 0',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span>💬</span> Comments ({comments.length})
      </h4>

      {/* Comments List */}
      {loading ? (
        <div style={{ color: colors.textMuted, fontSize: '13px', padding: '8px 0' }}>
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div style={{ color: colors.textMuted, fontSize: '13px', padding: '8px 0' }}>
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '12px',
          maxHeight: '300px',
          overflowY: 'auto',
        }}>
          {comments.map((comment) => {
            const isOwner = comment.userId === auth.currentUser.uid;
            return (
              <div key={comment.id} style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}>
                  {getUserDisplayName(comment.userId, profiles, auth.currentUser.uid).charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}>
                    <span style={{
                      fontWeight: '600',
                      color: colors.text,
                      fontSize: '13px',
                    }}>
                      {getUserDisplayName(comment.userId, profiles, auth.currentUser.uid)}
                    </span>
                    <span style={{
                      color: colors.textMuted,
                      fontSize: '11px',
                    }}>
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.textMuted,
                          cursor: 'pointer',
                          padding: '2px 4px',
                          fontSize: '11px',
                          marginLeft: 'auto',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = colors.danger}
                        onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <div style={{
                    color: colors.textSecondary,
                    fontSize: '13px',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}>
                    {renderCommentText(comment.text)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comment Input */}
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={newComment.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, '@$1')}
              onChange={handleInputChange}
              placeholder="Write a comment... (use @ to mention)"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.inputBg,
                color: colors.text,
                fontSize: '13px',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                // Delay hiding mentions to allow click
                setTimeout(() => setShowMentions(false), 200);
              }}
            />

            {/* Mentions Dropdown */}
            {showMentions && filteredMembers.length > 0 && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                boxShadow: `0 4px 12px ${colors.shadow}`,
                marginBottom: '4px',
                maxHeight: '150px',
                overflowY: 'auto',
                zIndex: 100,
              }}>
                {filteredMembers.map((memberId) => (
                  <button
                    key={memberId}
                    type="button"
                    onClick={() => handleMentionSelect(memberId)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: colors.text,
                      fontSize: '13px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}>
                      {getUserDisplayName(memberId, profiles, auth.currentUser.uid).charAt(0).toUpperCase()}
                    </div>
                    {getUserDisplayName(memberId, profiles, auth.currentUser.uid)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: submitting || !newComment.trim() ? colors.textMuted : colors.primary,
              color: 'white',
              cursor: submitting || !newComment.trim() ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {submitting ? (
              <>
                <div style={{
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </>
            ) : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Comments;
