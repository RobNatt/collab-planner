// Helper function to get display name for a user
export function getUserDisplayName(userId, profiles, currentUserId) {
  if (userId === currentUserId) {
    return 'You';
  }

  const profile = profiles?.[userId];
  return profile?.displayName || profile?.email || userId;
}

// Helper function to format user name for "owes" statements
export function getUserOwesName(userId, profiles, currentUserId) {
  if (userId === currentUserId) {
    return 'you';
  }

  const profile = profiles?.[userId];
  return profile?.displayName || profile?.email || userId;
}
